import express from 'express';
import multer from 'multer';
import { uploadImage, getImage, deleteImage } from '../controllers/uploadController';
import { upload, fileFilter } from '../config/cloudinary';

const router = express.Router();

// Error handler for multer
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
  }
  if (err.message.includes('Only image files') || err.message.includes('Chỉ chấp nhận')) {
    return res.status(400).json({
      error: {
        code: 'INVALID_FILE_TYPE',
        message: 'Chỉ chấp nhận file ảnh (JPEG, PNG, WebP, GIF)'
      }
    });
  }
  next(err);
};

router.post('/', upload.single('file'), uploadImage);
router.get('/:filename', getImage);
router.delete('/:filename', deleteImage);

router.use(handleMulterError);

export default router;
