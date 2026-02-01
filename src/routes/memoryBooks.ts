import express from 'express';
import {
  getAllMemoryBooks,
  getMemoryBookById,
  getMemoryBookByShareId,
  getMemoryBookByContributeId,
  createMemoryBook,
  updateMemoryBook,
  deleteMemoryBook
} from '../controllers/memoryBookController';
import { authenticate } from '../middleware/auth';
import contributionRoutes from './contributions';

const router = express.Router();

// Public routes (no auth required)
router.get('/share/:shareId', getMemoryBookByShareId);
router.get('/contribute/:contributeId', getMemoryBookByContributeId);

// Protected routes (require authentication)
router.use(authenticate); // Apply auth middleware to all routes below

// Main CRUD routes
router.route('/')
  .get(getAllMemoryBooks)
  .post(createMemoryBook);

router.route('/:id')
  .get(getMemoryBookById)
  .put(updateMemoryBook)
  .delete(deleteMemoryBook);

// Contribution routes
router.use('/:id/contributions', contributionRoutes);

export default router;
