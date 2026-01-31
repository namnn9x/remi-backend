import { Request, Response, NextFunction } from 'express';
import { MemoryBook, IMemoryBook } from '../models/MemoryBook';
import { AppError } from '../middleware/errorHandler';
import { generatePublicIds } from '../utils/idGenerator';
import fs from 'fs';
import path from 'path';

// Helper function to transform memory book to API response format
const transformMemoryBook = (book: IMemoryBook) => {
  const bookObj = book.toObject();
  return {
    id: bookObj._id.toString(),
    name: bookObj.name,
    type: bookObj.type,
    pages: bookObj.pages,
    createdAt: bookObj.createdAt,
    updatedAt: bookObj.updatedAt,
    shareId: bookObj.shareId,
    contributeId: bookObj.contributeId
  };
};

// Get all memory books with pagination
export const getAllMemoryBooks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const [data, total] = await Promise.all([
      MemoryBook.find()
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean(),
      MemoryBook.countDocuments()
    ]);

    const transformedData = data.map((book: any) => ({
      id: book._id.toString(),
      name: book.name,
      type: book.type,
      pages: book.pages,
      createdAt: book.createdAt,
      shareId: book.shareId,
      contributeId: book.contributeId
    }));

    res.status(200).json({
      data: transformedData,
      total,
      limit,
      offset
    });
  } catch (error) {
    next(error);
  }
};

// Get single memory book by ID
export const getMemoryBookById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const memoryBook = await MemoryBook.findById(id);

    if (!memoryBook) {
      const err: AppError = new Error('Không tìm thấy memory book');
      err.statusCode = 404;
      err.errorCode = 'MEMORY_BOOK_NOT_FOUND';
      return next(err);
    }

    res.status(200).json(transformMemoryBook(memoryBook));
  } catch (error) {
    next(error);
  }
};

// Get memory book by shareId
export const getMemoryBookByShareId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { shareId } = req.params;
    const memoryBook = await MemoryBook.findOne({ shareId });

    if (!memoryBook) {
      const err: AppError = new Error('Không tìm thấy memory book với share ID này');
      err.statusCode = 404;
      err.errorCode = 'SHARE_NOT_FOUND';
      return next(err);
    }

    res.status(200).json(transformMemoryBook(memoryBook));
  } catch (error) {
    next(error);
  }
};

// Get memory book info by contributeId (without pages)
export const getMemoryBookByContributeId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { contributeId } = req.params;
    const memoryBook = await MemoryBook.findOne({ contributeId }).lean();

    if (!memoryBook) {
      const err: AppError = new Error('Không tìm thấy memory book với contribute ID này');
      err.statusCode = 404;
      err.errorCode = 'CONTRIBUTE_NOT_FOUND';
      return next(err);
    }

    res.status(200).json({
      id: memoryBook._id.toString(),
      name: memoryBook.name,
      type: memoryBook.type,
      contributeId: memoryBook.contributeId
    });
  } catch (error) {
    next(error);
  }
};

// Create new memory book
export const createMemoryBook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, type } = req.body;

    if (!name || !type) {
      const err: AppError = new Error('Name and type are required');
      err.statusCode = 400;
      err.errorCode = 'VALIDATION_ERROR';
      return next(err);
    }

    // Generate shareId and contributeId
    const { shareId, contributeId } = generatePublicIds();

    const memoryBook = new MemoryBook({
      name,
      type,
      pages: [],
      shareId,
      contributeId
    });

    const savedMemoryBook = await memoryBook.save();

    res.status(201).json(transformMemoryBook(savedMemoryBook));
  } catch (error: any) {
    // Handle duplicate shareId/contributeId (very rare but possible)
    if (error.code === 11000) {
      // Retry with new IDs
      try {
        const { name, type } = req.body;
        const { shareId, contributeId } = generatePublicIds();
        const memoryBook = new MemoryBook({
          name,
          type,
          pages: [],
          shareId,
          contributeId
        });
        const savedMemoryBook = await memoryBook.save();
        res.status(201).json(transformMemoryBook(savedMemoryBook));
      } catch (retryError) {
        next(retryError);
      }
    } else {
      next(error);
    }
  }
};

// Update memory book
export const updateMemoryBook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, type, pages } = req.body;

    const memoryBook = await MemoryBook.findById(id);

    if (!memoryBook) {
      const err: AppError = new Error('Không tìm thấy memory book');
      err.statusCode = 404;
      err.errorCode = 'MEMORY_BOOK_NOT_FOUND';
      return next(err);
    }

    if (name !== undefined) memoryBook.name = name;
    if (type !== undefined) memoryBook.type = type;
    if (pages !== undefined) memoryBook.pages = pages;

    const updatedMemoryBook = await memoryBook.save();

    res.status(200).json(transformMemoryBook(updatedMemoryBook));
  } catch (error) {
    next(error);
  }
};

// Delete memory book and associated images
export const deleteMemoryBook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const memoryBook = await MemoryBook.findById(id);

    if (!memoryBook) {
      const err: AppError = new Error('Không tìm thấy memory book');
      err.statusCode = 404;
      err.errorCode = 'MEMORY_BOOK_NOT_FOUND';
      return next(err);
    }

    // Extract all image filenames from pages
    const imageFilenames: string[] = [];
    memoryBook.pages.forEach(page => {
      page.photos.forEach(photo => {
        // Extract filename from URL like /api/images/filename.jpg
        const urlParts = photo.url.split('/');
        const filename = urlParts[urlParts.length - 1];
        if (filename) {
          imageFilenames.push(filename);
        }
      });
    });

    // Delete associated images
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    imageFilenames.forEach(filename => {
      const filePath = path.join(uploadDir, filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error(`Failed to delete image ${filename}:`, err);
        }
      }
    });

    // Delete memory book
    await MemoryBook.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Memory book deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
