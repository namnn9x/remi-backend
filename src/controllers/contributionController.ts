import { Request, Response, NextFunction } from 'express';
import { Contribution } from '../models/Contribution';
import { MemoryBook } from '../models/MemoryBook';
import { AppError } from '../middleware/errorHandler';
import crypto from 'crypto';
import multer from 'multer';
import { cloudinaryStorage, fileFilter } from '../config/cloudinary';

// Configure multer for multiple files with Cloudinary
export const uploadMultiple = multer({
  storage: cloudinaryStorage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Submit contributions
export const submitContributions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];
    const notes = req.body.notes ? (Array.isArray(req.body.notes) ? req.body.notes : [req.body.notes]) : [];
    const prompts = req.body.prompts ? (Array.isArray(req.body.prompts) ? req.body.prompts : [req.body.prompts]) : [];
    const user = (req as any).user;

    if (!user) {
      const err: AppError = new Error('Unauthorized');
      err.statusCode = 401;
      err.errorCode = 'UNAUTHORIZED';
      return next(err);
    }

    // Validate memory book exists
    const memoryBook = await MemoryBook.findById(id);
    if (!memoryBook) {
      const err: AppError = new Error('Không tìm thấy memory book');
      err.statusCode = 404;
      err.errorCode = 'MEMORY_BOOK_NOT_FOUND';
      return next(err);
    }

    // Validate number of files
    if (!files || files.length === 0) {
      const err: AppError = new Error('Vui lòng chọn ít nhất một ảnh');
      err.statusCode = 400;
      err.errorCode = 'VALIDATION_ERROR';
      return next(err);
    }

    if (files.length > 10) {
      const err: AppError = new Error('Tối đa 10 ảnh mỗi lần đóng góp');
      err.statusCode = 400;
      err.errorCode = 'TOO_MANY_FILES';
      return next(err);
    }

    // Validate notes and prompts arrays match file count
    if (notes.length > 0 && notes.length !== files.length) {
      const err: AppError = new Error('Số lượng notes phải khớp với số lượng ảnh');
      err.statusCode = 400;
      err.errorCode = 'VALIDATION_ERROR';
      return next(err);
    }

    if (prompts.length > 0 && prompts.length !== files.length) {
      const err: AppError = new Error('Số lượng prompts phải khớp với số lượng ảnh');
      err.statusCode = 400;
      err.errorCode = 'VALIDATION_ERROR';
      return next(err);
    }

    // Create contributions
    const contributions = await Promise.all(
      files.map(async (file, index) => {
        const photoId = crypto.randomBytes(16).toString('hex');
        
        // Get Cloudinary URL from file object
        const fileWithCloudinary = file as any;
        const cloudinaryUrl = fileWithCloudinary.path || fileWithCloudinary.secure_url || fileWithCloudinary.url;
        
        if (!cloudinaryUrl) {
          throw new Error('Failed to get Cloudinary URL for uploaded file');
        }
        
        const contribution = new Contribution({
          memoryBookId: id,
          userId: user._id,
          photoId,
          url: cloudinaryUrl,
          note: notes[index] || '',
          prompt: prompts[index] || '',
          contributedAt: new Date()
        });
        return await contribution.save();
      })
    );

    const responseData = contributions.map(contrib => ({
      id: contrib._id.toString(),
      photoId: contrib.photoId,
      url: contrib.url,
      note: contrib.note,
      prompt: contrib.prompt,
      contributedAt: contrib.contributedAt.toISOString()
    }));

    res.status(200).json({
      message: 'Contributions submitted successfully',
      contributions: responseData
    });
  } catch (error) {
    next(error);
  }
};

// Get contributions for a memory book
export const getContributions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    // Validate memory book exists
    const memoryBook = await MemoryBook.findById(id);
    if (!memoryBook) {
      const err: AppError = new Error('Không tìm thấy memory book');
      err.statusCode = 404;
      err.errorCode = 'MEMORY_BOOK_NOT_FOUND';
      return next(err);
    }

    const [data, total] = await Promise.all([
      Contribution.find({ memoryBookId: id })
        .sort({ contributedAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean(),
      Contribution.countDocuments({ memoryBookId: id })
    ]);

    const responseData = data.map((contrib: any) => ({
      id: contrib._id.toString(),
      photoId: contrib.photoId,
      url: contrib.url,
      note: contrib.note,
      prompt: contrib.prompt,
      contributedAt: contrib.contributedAt.toISOString()
    }));

    res.status(200).json({
      data: responseData,
      total,
      limit,
      offset
    });
  } catch (error) {
    next(error);
  }
};
