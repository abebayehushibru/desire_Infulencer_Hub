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
  it('SYSTEM_ADMIN has all permissions', () => {
    (Object.keys(PERMISSIONS) as (keyof typeof PERMISSIONS)[]).forEach((p) => {
      expect(hasPermission('SYSTEM_ADMIN', p)).toBe(true);
    });
  });

  it('SILVER_INFLUENCER can only VIEW_CAMPAIGN, VIEW_INFLUENCER, VIEW_EARNINGS', () => {
    expect(hasPermission('SILVER_INFLUENCER', 'VIEW_CAMPAIGN')).toBe(true);
    expect(hasPermission('SILVER_INFLUENCER', 'VIEW_INFLUENCER')).toBe(true);
    expect(hasPermission('SILVER_INFLUENCER', 'VIEW_EARNINGS')).toBe(true);
    expect(hasPermission('SILVER_INFLUENCER', 'CREATE_CAMPAIGN')).toBe(false);
    expect(hasPermission('SILVER_INFLUENCER', 'MANAGE_SYSTEM')).toBe(false);
    expect(hasPermission('SILVER_INFLUENCER', 'DELETE_USER')).toBe(false);
  });

  it('BUSINESS_OWNER can create campaigns and manage communities', () => {
    expect(hasPermission('BUSINESS_OWNER', 'CREATE_CAMPAIGN')).toBe(true);
    expect(hasPermission('BUSINESS_OWNER', 'CREATE_COMMUNITY')).toBe(true);
    expect(hasPermission('BUSINESS_OWNER', 'MANAGE_SYSTEM')).toBe(false);
  });

  it('DIAMOND_INFLUENCER can view analytics', () => {
    expect(hasPermission('DIAMOND_INFLUENCER', 'VIEW_ANALYTICS')).toBe(true);
    expect(hasPermission('GOLD_INFLUENCER', 'VIEW_ANALYTICS')).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('hasMinRole() utility', () => {
  it('SYSTEM_ADMIN passes all minimum role checks', () => {
    const roles: Role[] = [
      'SILVER_INFLUENCER',
      'GOLD_INFLUENCER',
      'DIAMOND_INFLUENCER',
      'AGENT',
      'BUSINESS_OWNER',
      'SYSTEM_ADMIN',
    ];
    roles.forEach((r) => expect(hasMinRole('SYSTEM_ADMIN', r)).toBe(true));
  });

  it('SILVER_INFLUENCER only passes itself', () => {
    expect(hasMinRole('SILVER_INFLUENCER', 'SILVER_INFLUENCER')).toBe(true);
    expect(hasMinRole('SILVER_INFLUENCER', 'GOLD_INFLUENCER')).toBe(false);
    expect(hasMinRole('SILVER_INFLUENCER', 'SYSTEM_ADMIN')).toBe(false);
  });

  it('GOLD_INFLUENCER passes SILVER and GOLD but not higher', () => {
    expect(hasMinRole('GOLD_INFLUENCER', 'SILVER_INFLUENCER')).toBe(true);
    expect(hasMinRole('GOLD_INFLUENCER', 'GOLD_INFLUENCER')).toBe(true);
    expect(hasMinRole('GOLD_INFLUENCER', 'DIAMOND_INFLUENCER')).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('permission() middleware', () => {
  it('should call next() when role has permission', () => {
    const req = makeAuthReq('SYSTEM_ADMIN');
    const next = jest.fn() as unknown as NextFunction;
    permission('MANAGE_SYSTEM')(req, mockRes, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('should call next(ApiError 403) when role lacks permission', () => {
    const req = makeAuthReq('SILVER_INFLUENCER');
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

  it('BUSINESS_OWNER can create campaign', () => {
    const req = makeAuthReq('BUSINESS_OWNER');
    const next = jest.fn() as unknown as NextFunction;
    permission('CREATE_CAMPAIGN')(req, mockRes, next);
    expect(next).toHaveBeenCalledWith();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('authorizeMinRole() middleware', () => {
  it('should pass SYSTEM_ADMIN for any min role', () => {
    const req = makeAuthReq('SYSTEM_ADMIN');
    const next = jest.fn() as unknown as NextFunction;
    authorizeMinRole('AGENT')(req, mockRes, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('should deny SILVER_INFLUENCER for AGENT min role', () => {
    const req = makeAuthReq('SILVER_INFLUENCER');
    const next = jest.fn() as unknown as NextFunction;
    authorizeMinRole('AGENT')(req, mockRes, next);
    expect((next as jest.Mock).mock.calls[0][0].statusCode).toBe(403);
  });
});
