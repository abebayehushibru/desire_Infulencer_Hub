// ─────────────────────────────────────────────────────────────────────────────
// Unit Tests — Auth Middleware (authenticate, authorize)
// ─────────────────────────────────────────────────────────────────────────────

process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_min_64_chars_long_abcdefghijklmnopqrstuvwxyz1234';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_min_64_chars_long_abcdefghijklmnopqrstuvwxyz12';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '30d';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';

import { Request, Response, NextFunction } from 'express';
import { signAccessToken } from '../../common/utils/jwt.util';
import { authorize } from '../../middleware/authorize';
import { ApiError } from '../../common/errors/ApiError';
import { AuthenticatedRequest } from '../../common/types';

// ── Mock Redis ─────────────────────────────────────────────────────────────────
jest.mock('../../config/redis', () => ({
  default: {
    get: jest.fn().mockResolvedValue(null), // Not blacklisted
    setex: jest.fn().mockResolvedValue('OK'),
    ping: jest.fn().mockResolvedValue('PONG'),
    quit: jest.fn().mockResolvedValue('OK'),
  },
}));

const mockResponse = () => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
  };
  return res as Response;
};

const mockNext = jest.fn() as unknown as NextFunction;

describe('authorize() Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should allow access when user has the required role', () => {
    const req = {
      user: {
        sub: 'user-1',
        email: 'test@example.com',
        role: 'SYSTEM_ADMIN',
        jti: 'some-jti',
      },
    } as AuthenticatedRequest;

    const res = mockResponse();
    const middleware = authorize('SYSTEM_ADMIN');
    middleware(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should deny access when user lacks required role', () => {
    const req = {
      user: {
        sub: 'user-1',
        email: 'test@example.com',
        role: 'SILVER_INFLUENCER',
        jti: 'some-jti',
      },
    } as AuthenticatedRequest;

    const res = mockResponse();
    const next = jest.fn();
    const middleware = authorize('SYSTEM_ADMIN');
    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    const error = (next as jest.Mock).mock.calls[0][0] as ApiError;
    expect(error.statusCode).toBe(403);
  });

  it('should allow access when user has one of multiple allowed roles', () => {
    const req = {
      user: {
        sub: 'user-1',
        email: 'test@example.com',
        role: 'BUSINESS_OWNER',
        jti: 'some-jti',
      },
    } as AuthenticatedRequest;

    const res = mockResponse();
    const middleware = authorize('SYSTEM_ADMIN', 'BUSINESS_OWNER', 'AGENT');
    middleware(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should call next with ApiError when no user on request', () => {
    const req = {} as AuthenticatedRequest;
    const res = mockResponse();
    const next = jest.fn();
    const middleware = authorize('SYSTEM_ADMIN');
    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    const error = (next as jest.Mock).mock.calls[0][0] as ApiError;
    expect(error.statusCode).toBe(401);
  });
});
