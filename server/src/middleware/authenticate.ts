// ─────────────────────────────────────────────────────────────────────────────
// authenticate() — FR03 JWT Authentication Middleware
// Verifies access token, checks blacklist, attaches user to request.
// ─────────────────────────────────────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, extractBearerToken } from '../common/utils/jwt.util';
import { ApiError } from '../common/errors/ApiError';
import redisClient from '../config/redis';
import { REDIS_KEYS } from '../common/constants';
import { AuthenticatedRequest } from '../common/types';

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      throw ApiError.unauthorized('Authentication required. Please provide a valid access token.');
    }

    // Verify token signature & expiry
    const payload = verifyAccessToken(token);

    // Check token blacklist (for logged-out tokens still within expiry)
    // If Redis is down, skip the blacklist check and allow the request
    try {
      const isBlacklisted = await redisClient.get(REDIS_KEYS.blacklistToken(payload.jti));
      if (isBlacklisted) {
        throw ApiError.unauthorized('Token has been revoked. Please log in again.');
      }
    } catch (redisErr) {
      // Only rethrow if it's our own ApiError (blacklisted token)
      if (redisErr instanceof ApiError) throw redisErr;
      // Redis unavailable — log warning and continue (degraded mode)
    }

    // Attach user payload to request
    (req as AuthenticatedRequest).user = payload;

    next();
  } catch (error) {
    next(error);
  }
};
