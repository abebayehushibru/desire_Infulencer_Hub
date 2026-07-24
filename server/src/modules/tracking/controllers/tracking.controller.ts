// ─────────────────────────────────────────────────────────────────────────────
// Tracking & Earnings Controller — FR24–FR31
// ─────────────────────────────────────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import { trackingService as svc } from '../services/tracking.service';
import { sendSuccess } from '../../../common/helpers/response.helper';
import { getIpAddress, getUserAgent } from '../../../common/utils/request.util';
import { AuthenticatedRequest } from '../../../common/types';

const ctx  = (req: Request) => ({ ip: getIpAddress(req), userAgent: getUserAgent(req) });
const auth = (req: Request) => (req as AuthenticatedRequest).user;

class TrackingController {

  // ── FR24 — Track click via unique link ────────────────────────────────────
  async trackClick(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await svc.trackClick({
        code:       req.body.code,
        ipAddress:  getIpAddress(req),
        userAgent:  getUserAgent(req),
        deviceInfo: req.headers['x-device-info'] as string | undefined,
      });
      sendSuccess({ res, statusCode: 201, message: 'Click recorded', data: result });
    } catch (e) { next(e); }
  }

  // ── FR24 — Record conversion via unique link ──────────────────────────────
  async trackConversion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await svc.trackConversion({ code: req.body.code }, ctx(req));
      sendSuccess({ res, statusCode: 201, message: 'Conversion recorded', data: result });
    } catch (e) { next(e); }
  }

  // ── FR25 — Referral code usage ────────────────────────────────────────────
  async trackReferral(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await svc.trackReferral({ code: req.body.code }, ctx(req));
      sendSuccess({ res, statusCode: 201, message: 'Referral conversion recorded', data: result });
    } catch (e) { next(e); }
  }

  // ── FR26 — Earnings dashboard ─────────────────────────────────────────────
  async getEarningsDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub, role } = auth(req);
      const dashboard = await svc.getEarningsDashboard(sub, role);
      sendSuccess({ res, message: 'Earnings dashboard retrieved', data: dashboard });
    } catch (e) { next(e); }
  }

  // ── FR26 — Earnings history ───────────────────────────────────────────────
  async getEarningsHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub } = auth(req);
      const result = await svc.getEarningsHistory(sub, {
        campaignId: req.query.campaignId as string,
        status:     req.query.status     as any,
        page:       Number(req.query.page)  || 1,
        limit:      Number(req.query.limit) || 20,
        startDate:  req.query.startDate as string,
        endDate:    req.query.endDate   as string,
      });
      sendSuccess({ res, message: 'Earnings history retrieved', data: result.data, meta: result.meta });
    } catch (e) { next(e); }
  }

  // ── FR26 — Earnings by campaign ───────────────────────────────────────────
  async getEarningsByCampaign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub } = auth(req);
      const earnings = await svc.getEarningsByCampaign(sub, req.params.campaignId);
      sendSuccess({ res, message: 'Campaign earnings retrieved', data: earnings });
    } catch (e) { next(e); }
  }

  // ── FR28 — Business analytics ─────────────────────────────────────────────
  async getBusinessAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub } = auth(req);
      const analytics = await svc.getBusinessAnalytics(sub, {
        campaignId:  req.query.campaignId  as string,
        communityId: req.query.communityId as string,
        startDate:   req.query.startDate   as string,
        endDate:     req.query.endDate     as string,
        groupBy:     req.query.groupBy     as any,
      });
      sendSuccess({ res, message: 'Business analytics retrieved', data: analytics });
    } catch (e) { next(e); }
  }

  // ── FR29 — Community member performance ──────────────────────────────────
  async getCommunityMemberPerformance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub, role } = auth(req);
      const result = await svc.getCommunityMemberPerformance(req.params.communityId, {
        page:      Number(req.query.page)  || 1,
        limit:     Number(req.query.limit) || 20,
        sortBy:    req.query.sortBy    as any,
        sortOrder: req.query.sortOrder as any,
      }, sub, role);
      sendSuccess({ res, message: 'Member performance retrieved', data: result.data, meta: result.meta });
    } catch (e) { next(e); }
  }

  // ── FR29 — Individual member stats ────────────────────────────────────────
  async getMemberStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub, role } = auth(req);
      const stats = await svc.getMemberStats(
        req.params.communityId,
        req.params.memberId,
        sub,
        role,
      );
      sendSuccess({ res, message: 'Member stats retrieved', data: stats });
    } catch (e) { next(e); }
  }

  // ── FR30 — Submit withdrawal ──────────────────────────────────────────────
  async createWithdrawal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub } = auth(req);
      const withdrawal = await svc.createWithdrawal(sub, req.body, ctx(req));
      sendSuccess({ res, statusCode: 201, message: 'Withdrawal request submitted', data: withdrawal });
    } catch (e) { next(e); }
  }

  // ── FR30 — Cancel withdrawal ──────────────────────────────────────────────
  async cancelWithdrawal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub } = auth(req);
      await svc.cancelWithdrawal(req.params.id, sub, ctx(req));
      sendSuccess({ res, message: 'Withdrawal request cancelled', data: null });
    } catch (e) { next(e); }
  }

  // ── FR31 — Withdrawal history ─────────────────────────────────────────────
  async getWithdrawalHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub } = auth(req);
      const result = await svc.getWithdrawalHistory(sub, {
        status: req.query.status as any,
        page:   Number(req.query.page)  || 1,
        limit:  Number(req.query.limit) || 20,
      });
      sendSuccess({ res, message: 'Withdrawal history retrieved', data: result.data, meta: result.meta });
    } catch (e) { next(e); }
  }

  // ── FR31 — Get single withdrawal ──────────────────────────────────────────
  async getWithdrawalById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub } = auth(req);
      const withdrawal = await svc.getWithdrawalById(req.params.id, sub);
      sendSuccess({ res, message: 'Withdrawal retrieved', data: withdrawal });
    } catch (e) { next(e); }
  }
}

export const trackingController = new TrackingController();
