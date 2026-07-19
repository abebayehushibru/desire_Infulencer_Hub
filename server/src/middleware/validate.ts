// ─────────────────────────────────────────────────────────────────────────────
// validate() — Request validation middleware
// Runs express-validator results, formats errors, and returns 422 if invalid.
// ─────────────────────────────────────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';
import { sendError } from '../common/helpers/response.helper';

export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error: ValidationError) => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined,
    }));

    sendError({
      res,
      statusCode: 422,
      message: 'Validation failed. Please check the provided data.',
      errors: formattedErrors,
    });
    return;
  }

  next();
};
