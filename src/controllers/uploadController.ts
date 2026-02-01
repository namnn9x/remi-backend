import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { AppError } from '../middleware/errorHandler';
import cloudinary from '../config/cloudinary';

// Helper function to extract public_id from Cloudinary URL
const extractPublicId = (url: string): string | null => {
  try {
    // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{ext}
    // or: https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}.{ext}
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
};

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

    // With multer-storage-cloudinary, req.file will have Cloudinary info
    const file = req.file as any;
    const cloudinaryUrl = file.path || file.secure_url || file.url;
    
    if (!cloudinaryUrl) {
      const err: AppError = new Error('Failed to upload image to Cloudinary');
      err.statusCode = 500;
      err.errorCode = 'UPLOAD_ERROR';
      return next(err);
    }

    // Generate unique photo ID
    const photoId = crypto.randomBytes(16).toString('hex');

    res.status(200).json({
      id: photoId,
      filename: file.filename || file.public_id,
      url: cloudinaryUrl,
      originalName: file.originalname || req.file.originalname,
      size: file.size || req.file.size,
      mimeType: file.mimetype || req.file.mimetype,
      uploadedAt: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

// Get image by filename (redirect to Cloudinary URL if available)
// This endpoint is kept for backward compatibility but images are now served directly from Cloudinary
export const getImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { filename } = req.params;
    
    // If filename looks like a Cloudinary public_id or URL, try to construct Cloudinary URL
    // Otherwise, return 404 as we can't serve local files anymore
    const err: AppError = new Error('Images are now served directly from Cloudinary. Please use the Cloudinary URL returned from upload.');
    err.statusCode = 404;
    err.errorCode = 'IMAGE_NOT_FOUND';
    return next(err);
  } catch (error) {
    next(error);
  }
};

// Delete image from Cloudinary
export const deleteImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { filename } = req.params;
    
    // Try to extract public_id from filename or use filename as public_id
    // If filename is a URL, extract public_id from it
    let publicId = filename;
    
    // Check if filename is a Cloudinary URL
    if (filename.startsWith('http')) {
      const extractedId = extractPublicId(filename);
      if (!extractedId) {
        const err: AppError = new Error('Invalid Cloudinary URL');
        err.statusCode = 400;
        err.errorCode = 'INVALID_URL';
        return next(err);
      }
      publicId = extractedId;
    }

    // Delete from Cloudinary
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      
      if (result.result === 'not found') {
        const err: AppError = new Error('Không tìm thấy ảnh');
        err.statusCode = 404;
        err.errorCode = 'IMAGE_NOT_FOUND';
        return next(err);
      }

      res.status(200).json({
        message: 'Image deleted successfully',
        result: result.result
      });
    } catch (cloudinaryError: any) {
      const err: AppError = new Error('Failed to delete image from Cloudinary');
      err.statusCode = 500;
      err.errorCode = 'DELETE_ERROR';
      return next(err);
    }
  } catch (error) {
    next(error);
  }
};
