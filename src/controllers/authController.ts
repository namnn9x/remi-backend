import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN: StringValue = (process.env.JWT_EXPIRES_IN || '7d') as StringValue;

// Generate JWT token
const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Register new user
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      const err: AppError = new Error('Email, password và name là bắt buộc');
      err.statusCode = 400;
      err.errorCode = 'VALIDATION_ERROR';
      return next(err);
    }

    if (password.length < 6) {
      const err: AppError = new Error('Mật khẩu phải có ít nhất 6 ký tự');
      err.statusCode = 400;
      err.errorCode = 'VALIDATION_ERROR';
      return next(err);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const err: AppError = new Error('Email đã được sử dụng');
      err.statusCode = 409;
      err.errorCode = 'USER_EXISTS';
      return next(err);
    }

    // Create new user
    const user = new User({ email, password, name });
    await user.save();

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(201).json({
      message: 'Đăng ký thành công',
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      const err: AppError = new Error('Email và password là bắt buộc');
      err.statusCode = 400;
      err.errorCode = 'VALIDATION_ERROR';
      return next(err);
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      const err: AppError = new Error('Email hoặc mật khẩu không đúng');
      err.statusCode = 401;
      err.errorCode = 'INVALID_CREDENTIALS';
      return next(err);
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      const err: AppError = new Error('Email hoặc mật khẩu không đúng');
      err.statusCode = 401;
      err.errorCode = 'INVALID_CREDENTIALS';
      return next(err);
    }

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(200).json({
      message: 'Đăng nhập thành công',
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // User is attached to req by auth middleware
    const user = (req as any).user;
    
    res.status(200).json({
      data: {
        id: user._id.toString(),
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    next(error);
  }
};
