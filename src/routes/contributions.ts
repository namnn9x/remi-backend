import express from 'express';
import multer from 'multer';
import { submitContributions, getContributions, uploadMultiple } from '../controllers/contributionController';
import { AppError } from '../middleware/errorHandler';

const router = express.Router({ mergeParams: true });

// Error handler for multer in contributions
const handleMulterError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'File quá lớn. Kích thước tối đa: 10MB'
        }
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: {
          code: 'TOO_MANY_FILES',
          message: 'Tối đa 10 ảnh mỗi lần đóng góp'
        }
      });
    }
  }
  if (err.message && (err.message.includes('Only image files') || err.message.includes('Chỉ chấp nhận'))) {
    return res.status(400).json({
      error: {
        code: 'INVALID_FILE_TYPE',
        message: 'Chỉ chấp nhận file ảnh (JPEG, PNG, WebP, GIF)'
      }
    });
  }
  next(err);
};

router.route('/')
  .get(getContributions)
  .post(uploadMultiple.array('files', 10), handleMulterError, submitContributions);

export default router;
