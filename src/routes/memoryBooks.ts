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
import contributionRoutes from './contributions';

const router = express.Router();

// Public routes (no auth required)
router.get('/share/:shareId', getMemoryBookByShareId);
router.get('/contribute/:contributeId', getMemoryBookByContributeId);

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
