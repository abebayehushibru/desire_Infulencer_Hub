// ─────────────────────────────────────────────────────────────────────────────
// Response Helper — Standardized API response format
// Every endpoint MUST use this helper to maintain consistency.
//
// Format:
// {
//   "success": true/false,
//   "message": "...",
//   "data": {},
//   "meta": {},        // optional (pagination, etc.)
//   "timestamp": "..."
// }
// ─────────────────────────────────────────────────────────────────────────────

import { Response } from 'express';

interface ApiResponseOptions<T> {
  res: Response;
  statusCode?: number;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
}

interface ErrorResponseOptions {
  res: Response;
  statusCode?: number;
  message: string;
  errors?: Record<string, unknown>[];
}

export const sendSuccess = <T>({
  res,
  statusCode = 200,
  message,
  data,
  meta,
}: ApiResponseOptions<T>): void => {
  const response: Record<string, unknown> = {
    success: true,
    message,
    data: data ?? null,
    timestamp: new Date().toISOString(),
  };

  if (meta) {
    response.meta = meta;
  }

  res.status(statusCode).json(response);
};

export const sendError = ({
  res,
  statusCode = 500,
  message,
  errors,
}: ErrorResponseOptions): void => {
  const response: Record<string, unknown> = {
    success: false,
    message,
    data: null,
    timestamp: new Date().toISOString(),
  };

  if (errors && errors.length > 0) {
    response.errors = errors;
  }

  res.status(statusCode).json(response);
};
