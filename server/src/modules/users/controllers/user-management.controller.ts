// ─────────────────────────────────────────────────────────────────────────────
// User Management Controller — FR06–FR10
// Thin controllers: validate → service → respond
// ─────────────────────────────────────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import { userManagementService as svc } from '../services/user-management.service';
import { sendSuccess } from '../../../common/helpers/response.helper';
import { getIpAddress, getUserAgent } from '../../../common/utils/request.util';
import { AuthenticatedRequest } from '../../../common/types';

const ctx = (req: Request) => ({ ip: getIpAddress(req), userAgent: getUserAgent(req) });

class UserManagementController {

  // ── FR06 Admin: Create Business Owner ─────────────────────────────────────
  async createBusinessOwner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminId = (req as AuthenticatedRequest).user.sub;
      const user = await svc.createBusinessOwner(req.body, adminId, ctx(req));
      sendSuccess({ res, statusCode: 201, message: 'Business Owner account created', data: { user } });
    } catch (e) { next(e); }
  }

  // ── FR06 Admin: Get user with full profile ────────────────────────────────
  async getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await svc.getUserWithProfile(req.params.id);
      sendSuccess({ res, message: 'User retrieved', data });
    } catch (e) { next(e); }
  }

  // ── FR06 Admin: List users ────────────────────────────────────────────────
  async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await svc.listUsers({
        role:   req.query.role   as any,
        status: req.query.status as any,
        search: req.query.search as string,
        page:   Number(req.query.page)  || 1,
        limit:  Number(req.query.limit) || 20,
      });
      sendSuccess({ res, message: 'Users retrieved', data: result.data, meta: result.meta });
    } catch (e) { next(e); }
  }

  // ── FR06 Admin: Update user ───────────────────────────────────────────────
  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await svc.updateUser(req.params.id, req.body);
      sendSuccess({ res, message: 'User updated', data: { user } });
    } catch (e) { next(e); }
  }

  // ── FR06 Admin: Deactivate user ───────────────────────────────────────────
  async deactivateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminId = (req as AuthenticatedRequest).user.sub;
      const user = await svc.deactivateUser(req.params.id, adminId);
      sendSuccess({ res, message: 'User deactivated', data: { user } });
    } catch (e) { next(e); }
  }

  // ── FR06 Admin: Reactivate user ───────────────────────────────────────────
  async reactivateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminId = (req as AuthenticatedRequest).user.sub;
      const user = await svc.reactivateUser(req.params.id, adminId);
      sendSuccess({ res, message: 'User reactivated', data: { user } });
    } catch (e) { next(e); }
  }

  // ── FR06/FR09 Admin: Assign influencer tier ───────────────────────────────
  async assignTier(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminId = (req as AuthenticatedRequest).user.sub;
      await svc.assignTier(req.params.id, adminId, req.body);
      sendSuccess({ res, message: `Tier ${req.body.tier} assigned successfully`, data: null });
    } catch (e) { next(e); }
  }

  // ── FR09 Admin: Set community leader ─────────────────────────────────────
  async setCommunityLeader(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminId = (req as AuthenticatedRequest).user.sub;
      await svc.setCommunityLeader(req.params.id, adminId, req.body.value === true);
      sendSuccess({ res, message: 'Community leader status updated', data: null });
    } catch (e) { next(e); }
  }

  // ── FR09 Get tier history ─────────────────────────────────────────────────
  async getTierHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const history = await svc.getTierHistory(req.params.id);
      sendSuccess({ res, message: 'Tier history retrieved', data: { history } });
    } catch (e) { next(e); }
  }

  // ── FR08 Admin: List business profiles ────────────────────────────────────
  async listBusinessProfiles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profiles = await svc.listBusinessProfiles(req.query.status as string);
      sendSuccess({ res, message: 'Business profiles retrieved', data: { profiles, total: profiles.length } });
    } catch (e) { next(e); }
  }

  // ── FR08 Admin: Review business ───────────────────────────────────────────
  async reviewBusiness(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminId = (req as AuthenticatedRequest).user.sub;
      const result = await svc.reviewBusiness(req.params.id, adminId, req.body);
      const action = req.body.action;
      sendSuccess({ res, message: `Business ${action}d successfully`, data: result });
    } catch (e) { next(e); }
  }

  // ── FR07 Business Owner: Create profile ───────────────────────────────────
  async createBusinessProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user.sub;
      const profile = await svc.createBusinessProfile(userId, req.body);
      sendSuccess({ res, statusCode: 201, message: 'Business profile created. Pending verification.', data: profile });
    } catch (e) { next(e); }
  }

  // ── FR07 Business Owner: Update profile ───────────────────────────────────
  async updateMyBusinessProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user.sub;
      const profile = await svc.updateBusinessProfile(userId, req.body);
      sendSuccess({ res, message: 'Business profile updated', data: profile });
    } catch (e) { next(e); }
  }

  // ── FR07 Business Owner: Get own profile ─────────────────────────────────
  async getMyBusinessProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user.sub;
      const profile = await svc.getMyBusinessProfile(userId);
      sendSuccess({ res, message: 'Business profile retrieved', data: profile });
    } catch (e) { next(e); }
  }

  // ── FR07 Business Owner: Upload document ─────────────────────────────────
  async uploadDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user.sub;
      const doc = await svc.uploadDocument(userId, req.body);
      sendSuccess({ res, statusCode: 201, message: 'Document uploaded', data: doc });
    } catch (e) { next(e); }
  }

  // ── FR09 Influencer: Get own profile ─────────────────────────────────────
  async getMyInfluencerProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user.sub;
      const profile = await svc.getInfluencerProfile(userId);
      sendSuccess({ res, message: 'Influencer profile retrieved', data: profile });
    } catch (e) { next(e); }
  }

  // ── FR09 Influencer: Create/Update own profile ───────────────────────────
  async createInfluencerProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user.sub;
      const profile = await svc.createInfluencerProfile(userId, req.body);
      sendSuccess({ res, statusCode: 201, message: 'Influencer profile created', data: profile });
    } catch (e) { next(e); }
  }

  async updateMyInfluencerProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user.sub;
      const profile = await svc.updateInfluencerProfile(userId, req.body);
      sendSuccess({ res, message: 'Influencer profile updated', data: profile });
    } catch (e) { next(e); }
  }

  // ── FR10 Agent: Profile management ───────────────────────────────────────
  async createAgentProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user.sub;
      const profile = await svc.createAgentProfile(userId, req.body);
      sendSuccess({ res, statusCode: 201, message: 'Agent profile created', data: profile });
    } catch (e) { next(e); }
  }

  async updateMyAgentProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user.sub;
      const profile = await svc.updateAgentProfile(userId, req.body);
      sendSuccess({ res, message: 'Agent profile updated', data: profile });
    } catch (e) { next(e); }
  }

  async getMyAgentProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user.sub;
      const profile = await svc.getAgentProfile(userId);
      sendSuccess({ res, message: 'Agent profile retrieved', data: profile });
    } catch (e) { next(e); }
  }

  // ── Notifications ─────────────────────────────────────────────────────────
  async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user.sub;
      const notifications = await svc.getNotifications(userId);
      sendSuccess({ res, message: 'Notifications retrieved', data: { notifications } });
    } catch (e) { next(e); }
  }

  async markNotificationRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user.sub;
      await svc.markNotificationRead(req.params.id, userId);
      sendSuccess({ res, message: 'Notification marked as read', data: null });
    } catch (e) { next(e); }
  }

  async markAllNotificationsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user.sub;
      await svc.markAllNotificationsRead(userId);
      sendSuccess({ res, message: 'All notifications marked as read', data: null });
    } catch (e) { next(e); }
  }
}

export const userManagementController = new UserManagementController();
