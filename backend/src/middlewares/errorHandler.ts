import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.warn(`AppError: ${err.message} - Status: ${err.statusCode} - Path: ${req.path}`);
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Handle validation errors (e.g., from Zod or express-validator)
  if (err.name === 'ZodError' && err.errors && Array.isArray(err.errors)) {
    const errors = err.errors.map((e: any) => ({
      field: e.path?.join('.') || e.field,
      message: e.message,
    }));
    
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors,
    });
  }

  // Handle any other validation-like errors
  if (err.errors && Array.isArray(err.errors)) {
    const errors = err.errors.map((e: any) => ({
      field: e.path?.join('.') || e.field || 'unknown',
      message: e.message || String(e),
    }));
    
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors,
    });
  }

  // Log unexpected errors
  const errorMessage = err?.message || String(err);
  logger.error(`Unexpected error: ${errorMessage}`, {
    stack: err?.stack,
    path: req.path,
    method: req.method,
    body: req.body,
  });

  return res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : errorMessage,
  });
};
