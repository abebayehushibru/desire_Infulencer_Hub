// ─────────────────────────────────────────────────────────────────────────────
// ApiError — Reusable application error class
// All thrown errors in services/repositories should use this class.
// Global error handler catches it and formats the response.
// ─────────────────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: Record<string, unknown>[];

  constructor(
    statusCode: number,
    message: string,
    isOperational = true,
    errors?: Record<string, unknown>[]
  ) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype); // Restore prototype chain

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }

  // ── Static factory methods ────────────────────────────────────────────────

  static badRequest(message: string, errors?: Record<string, unknown>[]): ApiError {
    return new ApiError(400, message, true, errors);
  }

  static unauthorized(message = 'Unauthorized'): ApiError {
    return new ApiError(401, message, true);
  }

  static forbidden(message = 'Forbidden'): ApiError {
    return new ApiError(403, message, true);
  }

  static notFound(message = 'Resource not found'): ApiError {
    return new ApiError(404, message, true);
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, message, true);
  }

  static unprocessable(message: string, errors?: Record<string, unknown>[]): ApiError {
    return new ApiError(422, message, true, errors);
  }

  static tooManyRequests(message = 'Too many requests'): ApiError {
    return new ApiError(429, message, true);
  }

  static internal(message = 'Internal server error'): ApiError {
    return new ApiError(500, message, false);
  }
}
