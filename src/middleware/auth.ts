import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AppError } from './errorHandler';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const err: AppError = new Error('Không có token xác thực');
      err.statusCode = 401;
      err.errorCode = 'UNAUTHORIZED';
      return next(err);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      const err: AppError = new Error('Token không hợp lệ hoặc đã hết hạn');
      err.statusCode = 401;
      err.errorCode = 'INVALID_TOKEN';
      return next(err);
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      const err: AppError = new Error('Người dùng không tồn tại');
      err.statusCode = 401;
      err.errorCode = 'USER_NOT_FOUND';
      return next(err);
    }

    // Attach user to request
    (req as AuthRequest).user = user;
    next();
  } catch (error) {
    next(error);
  }
};
