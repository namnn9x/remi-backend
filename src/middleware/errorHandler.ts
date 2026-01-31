import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  errorCode?: string;
  details?: any;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: {
      code: errorCode,
      message: message,
      ...(err.details && { details: err.details })
    }
  });
};

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const err: AppError = new Error('Not Found');
  err.statusCode = 404;
  err.errorCode = 'NOT_FOUND';
  next(err);
};
