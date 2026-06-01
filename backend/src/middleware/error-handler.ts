// ========================================
// Error Handler — централизованная обработка ошибок
// ========================================

import { Request, Response, NextFunction } from 'express';
import { error as apiError } from '../utils/api-response.js';

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json(apiError(err.message));
    return;
  }

  console.error('[ERROR]', err);
  res.status(500).json(apiError('Внутренняя ошибка сервера'));
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json(apiError('Маршрут не найден'));
}
