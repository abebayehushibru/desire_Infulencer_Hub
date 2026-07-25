// ─────────────────────────────────────────────────────────────────────────────
// Unit Tests — RBAC (permission middleware + hasPermission)
// ─────────────────────────────────────────────────────────────────────────────

process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_min_64_chars_long_abcdefghijklmnopqrstuvwxyz1234';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_min_64_chars_long_abcdefghijklmnopqrstuvwxyz12';

import { Role } from '@prisma/client';
import { permission, hasPermission, hasMinRole, PERMISSIONS } from '../../middleware/permission';
import { authorizeMinRole } from '../../middleware/authorize';
import { ApiError } from '../../common/errors/ApiError';
import { AuthenticatedRequest } from '../../common/types';
import { Response, NextFunction } from 'express';

const makeAuthReq = (role: Role): AuthenticatedRequest =>
  ({
    user: { sub: 'u1', email: 'x@x.com', role, jti: 'jti-1' },
  } as AuthenticatedRequest);

const mockRes = {} as Response;

// ─────────────────────────────────────────────────────────────────────────────
describe('hasPermission() utility', () => {
  it('SUPER_ADMIN has all permissions', () => {
    (Object.keys(PERMISSIONS) as (keyof typeof PERMISSIONS)[]).forEach((p) => {
      expect(hasPermission('SUPER_ADMIN', p)).toBe(true);
    });
  });

  it('INFLUENCER can VIEW_CAMPAIGN, VIEW_INFLUENCER, VIEW_EARNINGS', () => {
    expect(hasPermission('INFLUENCER', 'VIEW_CAMPAIGN')).toBe(true);
    expect(hasPermission('INFLUENCER', 'VIEW_INFLUENCER')).toBe(true);
    expect(hasPermission('INFLUENCER', 'VIEW_EARNINGS')).toBe(true);
    expect(hasPermission('INFLUENCER', 'CREATE_CAMPAIGN')).toBe(false);
    expect(hasPermission('INFLUENCER', 'MANAGE_SYSTEM')).toBe(false);
    expect(hasPermission('INFLUENCER', 'DELETE_USER')).toBe(false);
  });

  it('BUSINESS can create campaigns and manage communities', () => {
    expect(hasPermission('BUSINESS', 'CREATE_CAMPAIGN')).toBe(true);
    expect(hasPermission('BUSINESS', 'VIEW_ANALYTICS')).toBe(true);
    expect(hasPermission('BUSINESS', 'MANAGE_SYSTEM')).toBe(false);
  });

  it('INFLUENCER can view analytics', () => {
    expect(hasPermission('INFLUENCER', 'VIEW_ANALYTICS')).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('hasMinRole() utility', () => {
  it('SUPER_ADMIN passes all minimum role checks', () => {
    const roles: Role[] = [
      'INFLUENCER',
      'BUSINESS',
      'AGENT',
      'ADMIN',
      'SUPER_ADMIN',
    ];
    roles.forEach((r) => expect(hasMinRole('SUPER_ADMIN', r)).toBe(true));
  });

  it('INFLUENCER only passes itself', () => {
    expect(hasMinRole('INFLUENCER', 'INFLUENCER')).toBe(true);
    expect(hasMinRole('INFLUENCER', 'SUPER_ADMIN')).toBe(false);
  });

  it('ADMIN passes lower roles but not SUPER_ADMIN', () => {
    expect(hasMinRole('ADMIN', 'INFLUENCER')).toBe(true);
    expect(hasMinRole('ADMIN', 'ADMIN')).toBe(true);
    expect(hasMinRole('ADMIN', 'SUPER_ADMIN')).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('permission() middleware', () => {
  it('should call next() when role has permission', () => {
    const req = makeAuthReq('SUPER_ADMIN');
    const next = jest.fn() as unknown as NextFunction;
    permission('MANAGE_SYSTEM')(req, mockRes, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('should call next(ApiError 403) when role lacks permission', () => {
    const req = makeAuthReq('INFLUENCER');
    const next = jest.fn() as unknown as NextFunction;
    permission('MANAGE_SYSTEM')(req, mockRes, next);
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect((next as jest.Mock).mock.calls[0][0].statusCode).toBe(403);
  });

  it('should call next(ApiError 401) when no user on request', () => {
    const req = {} as AuthenticatedRequest;
    const next = jest.fn() as unknown as NextFunction;
    permission('VIEW_CAMPAIGN')(req, mockRes, next);
    expect((next as jest.Mock).mock.calls[0][0].statusCode).toBe(401);
  });

  it('BUSINESS can create campaign', () => {
    const req = makeAuthReq('BUSINESS');
    const next = jest.fn() as unknown as NextFunction;
    permission('CREATE_CAMPAIGN')(req, mockRes, next);
    expect(next).toHaveBeenCalledWith();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('authorizeMinRole() middleware', () => {
  it('should pass SUPER_ADMIN for any min role', () => {
    const req = makeAuthReq('SUPER_ADMIN');
    const next = jest.fn() as unknown as NextFunction;
    authorizeMinRole('AGENT')(req, mockRes, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('should deny INFLUENCER for AGENT min role', () => {
    const req = makeAuthReq('INFLUENCER');
    const next = jest.fn() as unknown as NextFunction;
    authorizeMinRole('AGENT')(req, mockRes, next);
    expect((next as jest.Mock).mock.calls[0][0].statusCode).toBe(403);
  });
});
