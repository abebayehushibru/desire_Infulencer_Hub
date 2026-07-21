// ─────────────────────────────────────────────────────────────────────────────
// Admin Controller — System Admin user management
// ─────────────────────────────────────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service';
import { sendSuccess } from '../../../common/helpers/response.helper';
import { getIpAddress, getUserAgent } from '../../../common/utils/request.util';
import { AuthenticatedRequest } from '../../../common/types';

const ctx = (req: Request) => ({
  ip: getIpAddress(req),
  userAgent: getUserAgent(req),
});

class AdminController {
  // ── POST /api/v1/admin/users/:id/unlock ─────────────────────────────────
  async unlockUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const { id } = req.params;

      const user = await adminService.unlockUser(id, authReq.user.sub, ctx(req));

      sendSuccess({
        res,
        message: `Account unlocked successfully for ${user.email}`,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  // ── GET /api/v1/admin/users ─────────────────────────────────────────────
  async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const users = await adminService.listUsers(authReq.user.sub, ctx(req));

      sendSuccess({
        res,
        message: 'Users retrieved successfully',
        data: { users, total: users.length },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
