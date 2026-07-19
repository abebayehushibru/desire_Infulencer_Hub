// ─────────────────────────────────────────────────────────────────────────────
// Global Error Handler — catches all unhandled errors
// Never exposes stack traces in production.
// ─────────────────────────────────────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../common/errors/ApiError';
import logger from '../common/logger/logger';
import { env } from '../config/env';
import { sendError } from '../common/helpers/response.helper';
import { Prisma } from '@prisma/client';

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  // ── Log the error ──────────────────────────────────────────────────────────
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  // ── Operational ApiError ───────────────────────────────────────────────────
  if (err instanceof ApiError) {
    sendError({
      res,
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  // ── Prisma errors ──────────────────────────────────────────────────────────
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (err.code === 'P2002') {
      const field = (err.meta?.target as string[])?.join(', ') || 'field';
      sendError({ res, statusCode: 409, message: `A record with this ${field} already exists` });
      return;
    }

    // Record not found
    if (err.code === 'P2025') {
      sendError({ res, statusCode: 404, message: 'Record not found' });
      return;
    }

    // Foreign key constraint
    if (err.code === 'P2003') {
      sendError({ res, statusCode: 400, message: 'Invalid reference: related record not found' });
      return;
    }

    sendError({ res, statusCode: 400, message: 'Database operation failed' });
    return;
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    sendError({ res, statusCode: 400, message: 'Invalid data provided' });
    return;
  }

  // ── JWT errors (shouldn't reach here if authenticate middleware handles them) ─
  if (err.name === 'JsonWebTokenError') {
    sendError({ res, statusCode: 401, message: 'Invalid token' });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendError({ res, statusCode: 401, message: 'Token has expired' });
    return;
  }

  // ── Unknown / non-operational errors ──────────────────────────────────────
  sendError({
    res,
    statusCode: 500,
    message: env.IS_PRODUCTION
      ? 'An unexpected error occurred. Please try again later.'
      : err.message,
  });
};

// ── 404 Handler ────────────────────────────────────────────────────────────────
export const notFoundHandler = (req: Request, res: Response): void => {
  sendError({
    res,
    statusCode: 404,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};
