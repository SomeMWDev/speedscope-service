import type { NextFunction, Request, Response } from 'express';
import config from '../config/config.js';

export interface AppError extends Error {
  status?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err);
  const showMessage = config.nodeEnv === 'development';
  res.status(err.status || 500).json({
    message: showMessage
      ? err.message || 'Internal Server Error'
      : 'Internal Server Error',
  });
};
