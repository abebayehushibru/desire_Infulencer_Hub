// ─────────────────────────────────────────────────────────────────────────────
// Community Controller — FR11–FR15
// Thin controllers: validate → service → respond
// ─────────────────────────────────────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import { communityService as svc } from '../services/community.service';
import { sendSuccess } from '../../../common/helpers/response.helper';
import { getIpAddress, getUserAgent } from '../../../common/utils/request.util';
import { AuthenticatedRequest } from '../../../common/types';

const ctx  = (req: Request) => ({ ip: getIpAddress(req), userAgent: getUserAgent(req) });
const auth = (req: Request) => (req as AuthenticatedRequest).user;

class CommunityController {

  // ── FR11 — Create community ───────────────────────────────────────────────
  async createCommunity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub: adminId } = auth(req);
      const community = await svc.createCommunity(req.body, adminId, ctx(req));
      sendSuccess({ res, statusCode: 201, message: 'Community created', data: community });
    } catch (e) { next(e); }
  }

  // ── FR11 — Get community by id ────────────────────────────────────────────
  async getCommunity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const community = await svc.getCommunity(req.params.id);
      sendSuccess({ res, message: 'Community retrieved', data: community });
    } catch (e) { next(e); }
  }

  // ── FR11 — List communities ───────────────────────────────────────────────
  async listCommunities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await svc.listCommunities({
        status:    req.query.status    as any,
        search:    req.query.search    as string,
        page:      Number(req.query.page)  || 1,
        limit:     Number(req.query.limit) || 20,
        sortBy:    req.query.sortBy    as any,
        sortOrder: req.query.sortOrder as any,
      });
      sendSuccess({ res, message: 'Communities retrieved', data: result.data, meta: result.meta });
    } catch (e) { next(e); }
  }

  // ── FR11 — Update community ───────────────────────────────────────────────
  async updateCommunity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub: adminId } = auth(req);
      const community = await svc.updateCommunity(req.params.id, req.body, adminId, ctx(req));
      sendSuccess({ res, message: 'Community updated', data: community });
    } catch (e) { next(e); }
  }

  // ── FR11 — Deactivate community ───────────────────────────────────────────
  async deactivateCommunity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub: adminId } = auth(req);
      const community = await svc.deactivateCommunity(req.params.id, adminId, ctx(req));
      sendSuccess({ res, message: 'Community deactivated', data: community });
    } catch (e) { next(e); }
  }

  // ── FR11 — Delete community ───────────────────────────────────────────────
  async deleteCommunity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub: adminId } = auth(req);
      await svc.deleteCommunity(req.params.id, adminId, ctx(req));
      sendSuccess({ res, message: 'Community deleted', data: null });
    } catch (e) { next(e); }
  }

  // ── FR12 — Set commission rules ───────────────────────────────────────────
  async setCommission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub: adminId } = auth(req);
      const commission = await svc.setCommission(req.params.id, req.body, adminId, ctx(req));
      sendSuccess({ res, message: 'Commission rules updated', data: commission });
    } catch (e) { next(e); }
  }

  // ── FR12 — Get commission rules ───────────────────────────────────────────
  async getCommission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub: requesterId, role } = auth(req);
      const commission = await svc.getCommission(req.params.id, requesterId, role);
      sendSuccess({ res, message: 'Commission rules retrieved', data: commission });
    } catch (e) { next(e); }
  }

  // ── FR12 — Get commission history ─────────────────────────────────────────
  async getCommissionHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const history = await svc.getCommissionHistory(req.params.id);
      sendSuccess({ res, message: 'Commission history retrieved', data: { history } });
    } catch (e) { next(e); }
  }

  // ── FR13 — Add member ─────────────────────────────────────────────────────
  async addMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub: requesterId, role } = auth(req);
      const member = await svc.addMember(req.params.id, req.body, requesterId, role, ctx(req));
      sendSuccess({ res, statusCode: 201, message: 'Member added to community', data: member });
    } catch (e) { next(e); }
  }

  // ── FR13 — Remove member ──────────────────────────────────────────────────
  async removeMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub: requesterId, role } = auth(req);
      const result = await svc.removeMember(req.params.id, req.params.memberId, requesterId, role, ctx(req));
      sendSuccess({ res, message: 'Member removed from community', data: result });
    } catch (e) { next(e); }
  }

  // ── FR13 — List members ───────────────────────────────────────────────────
  async listMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub: requesterId, role } = auth(req);
      const result = await svc.listMembers(req.params.id, {
        status: req.query.status as any,
        page:   Number(req.query.page)  || 1,
        limit:  Number(req.query.limit) || 20,
      }, requesterId, role);
      sendSuccess({ res, message: 'Community members retrieved', data: result.data, meta: result.meta });
    } catch (e) { next(e); }
  }

  // ── FR14 — Community leaderboard ─────────────────────────────────────────
  async getLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub: requesterId, role } = auth(req);
      const result = await svc.getLeaderboard(req.params.id, {
        page:      Number(req.query.page)  || 1,
        limit:     Number(req.query.limit) || 20,
        sortBy:    req.query.sortBy    as any,
        sortOrder: req.query.sortOrder as any,
      }, requesterId, role);
      sendSuccess({ res, message: 'Leaderboard retrieved', data: result.data, meta: result.meta });
    } catch (e) { next(e); }
  }

  // ── FR15 — Cross-community rankings ──────────────────────────────────────
  async getCommunityRankings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await svc.getCommunityRankings({
        page:      Number(req.query.page)  || 1,
        limit:     Number(req.query.limit) || 20,
        sortBy:    req.query.sortBy    as any,
        sortOrder: req.query.sortOrder as any,
        status:    req.query.status    as any,
      });
      sendSuccess({ res, message: 'Community rankings retrieved', data: result.data, meta: result.meta });
    } catch (e) { next(e); }
  }
}

export const communityController = new CommunityController();
