// ─────────────────────────────────────────────────────────────────────────────
// authorize() — FR03 Role-Based Access Control Middleware
// Roles are sourced from JWT ONLY — never from the client body.
// ─────────────────────────────────────────────────────────────────────────────

import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { ApiError } from '../common/errors/ApiError';
import { AuthenticatedRequest } from '../common/types';
import { ROLE_HIERARCHY } from '../common/constants';

// ── authorize(...roles) — user must have one of the specified roles ────────────
export const authorize = (...roles: Role[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;

    if (!userRole) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!roles.includes(userRole)) {
      return next(
        ApiError.forbidden(
          `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${userRole}`
        )
      );
    }

    next();
  };
};

// ── authorizeMinRole() — user must have this role or higher in hierarchy ──────
export const authorizeMinRole = (minRole: Role) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;

    if (!userRole) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    const userRoleIndex = ROLE_HIERARCHY.indexOf(userRole as typeof ROLE_HIERARCHY[number]);
    const minRoleIndex = ROLE_HIERARCHY.indexOf(minRole as typeof ROLE_HIERARCHY[number]);

    if (userRoleIndex < minRoleIndex) {
      return next(
        ApiError.forbidden(
          `Access denied. Minimum required role: ${minRole}. Your role: ${userRole}`
        )
      );
    }

    next();
  };
};

// ── authorizeOwnerOrAdmin() — user can only access their own resource ─────────
export const authorizeOwnerOrAdmin = (getResourceUserId: (req: AuthenticatedRequest) => string) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    const userId = req.user?.sub;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    const resourceUserId = getResourceUserId(req);
    const isAdmin = userRole === 'SYSTEM_ADMIN';
    const isOwner = userId === resourceUserId;

    if (!isAdmin && !isOwner) {
      return next(ApiError.forbidden('Access denied. You can only access your own resources.'));
    }

    next();
  };
};
