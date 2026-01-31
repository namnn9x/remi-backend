import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { AppError } from '../middleware/errorHandler';

// Upload single image
export const uploadImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      const err: AppError = new Error('No file uploaded');
      err.statusCode = 400;
      err.errorCode = 'VALIDATION_ERROR';
      return next(err);
    }

    // Generate unique photo ID
    const photoId = crypto.randomBytes(16).toString('hex');

    res.status(200).json({
      id: photoId,
      filename: req.file.filename,
      url: `/api/images/${req.file.filename}`,
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

// Get image by filename
export const getImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { filename } = req.params;
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const filePath = path.join(uploadDir, filename);

    if (!fs.existsSync(filePath)) {
      const err: AppError = new Error('Không tìm thấy ảnh');
      err.statusCode = 404;
      err.errorCode = 'IMAGE_NOT_FOUND';
      return next(err);
    }

    // Set appropriate content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    const contentTypeMap: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    
    const contentType = contentTypeMap[ext] || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    
    // Cache headers for performance
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
    
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    next(error);
  }
};

// Delete image
export const deleteImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { filename } = req.params;
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const filePath = path.join(uploadDir, filename);

    if (!fs.existsSync(filePath)) {
      const err: AppError = new Error('Không tìm thấy ảnh');
      err.statusCode = 404;
      err.errorCode = 'IMAGE_NOT_FOUND';
      return next(err);
    }

    fs.unlinkSync(filePath);

    res.status(200).json({
      message: 'Image deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
