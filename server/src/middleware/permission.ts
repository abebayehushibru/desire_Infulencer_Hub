// ─────────────────────────────────────────────────────────────────────────────
// permission() — Fine-grained permission middleware
// FR03: Reusable across the entire project for feature-level access control.
// Roles come ONLY from JWT — never from client body.
// ─────────────────────────────────────────────────────────────────────────────

import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { ApiError } from '../common/errors/ApiError';
import { AuthenticatedRequest } from '../common/types';
import { ROLE_HIERARCHY } from '../common/constants';

// ── Permission definitions ────────────────────────────────────────────────────
export const PERMISSIONS = {
  // User management
  READ_USERS:      ['SUPER_ADMIN', 'ADMIN', 'AGENT'] as Role[],
  CREATE_USER:     ['SUPER_ADMIN'] as Role[],
  DELETE_USER:     ['SUPER_ADMIN'] as Role[],
  SUSPEND_USER:    ['SUPER_ADMIN'] as Role[],

  // Campaign management
  CREATE_CAMPAIGN: ['SUPER_ADMIN', 'ADMIN', 'BUSINESS', 'AGENT'] as Role[],
  MANAGE_CAMPAIGN: ['SUPER_ADMIN', 'ADMIN', 'BUSINESS', 'AGENT'] as Role[],
  VIEW_CAMPAIGN:   ['SUPER_ADMIN', 'ADMIN', 'BUSINESS', 'AGENT', 'INFLUENCER'] as Role[],

  // Community management
  CREATE_COMMUNITY: ['SUPER_ADMIN'] as Role[],
  MANAGE_COMMUNITY: ['SUPER_ADMIN', 'ADMIN', 'AGENT'] as Role[],

  // Influencer management
  MANAGE_INFLUENCER: ['SUPER_ADMIN', 'ADMIN', 'AGENT'] as Role[],
  VIEW_INFLUENCER:   ['SUPER_ADMIN', 'ADMIN', 'BUSINESS', 'AGENT', 'INFLUENCER'] as Role[],

  // Analytics
  VIEW_ANALYTICS:  ['SUPER_ADMIN', 'ADMIN', 'BUSINESS', 'AGENT', 'INFLUENCER'] as Role[],
  VIEW_EARNINGS:   ['SUPER_ADMIN', 'INFLUENCER'] as Role[],

  // Admin only
  MANAGE_SYSTEM:   ['SUPER_ADMIN'] as Role[],
  VIEW_AUDIT_LOGS: ['SUPER_ADMIN', 'ADMIN'] as Role[],
} as const;

export type Permission = keyof typeof PERMISSIONS;

// ── permission(permissionName) middleware ─────────────────────────────────────
// Usage: router.get('/users', authenticate, permission('READ_USERS'), handler)
export const permission = (requiredPermission: Permission) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;

    if (!userRole) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    const allowedRoles = PERMISSIONS[requiredPermission];

    if (!allowedRoles.includes(userRole as Role)) {
      return next(
        ApiError.forbidden(
          `Insufficient permissions. Required permission: ${requiredPermission}. Your role: ${userRole}`
        )
      );
    }

    next();
  };
};

// ── hasPermission() — utility for service-layer checks (no middleware) ────────
export const hasPermission = (role: Role, requiredPermission: Permission): boolean => {
  return PERMISSIONS[requiredPermission].includes(role);
};

// ── hasMinRole() — check role hierarchy without middleware ────────────────────
export const hasMinRole = (userRole: Role, minRole: Role): boolean => {
  const userIdx = ROLE_HIERARCHY.indexOf(userRole as typeof ROLE_HIERARCHY[number]);
  const minIdx  = ROLE_HIERARCHY.indexOf(minRole  as typeof ROLE_HIERARCHY[number]);
  return userIdx >= minIdx;
};
