// ─────────────────────────────────────────────────────────────────────────────
// Campaign Controller — FR16–FR23
// Thin controllers: validate → service → respond
// ─────────────────────────────────────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import { campaignService as svc } from '../services/campaign.service';
import { sendSuccess } from '../../../common/helpers/response.helper';
import { getIpAddress, getUserAgent } from '../../../common/utils/request.util';
import { AuthenticatedRequest } from '../../../common/types';

const ctx  = (req: Request) => ({ ip: getIpAddress(req), userAgent: getUserAgent(req) });
const auth = (req: Request) => (req as AuthenticatedRequest).user;

class CampaignController {

  async createCampaign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub: ownerId } = auth(req);
      const campaign = await svc.createCampaign(req.body, ownerId, ctx(req));
      sendSuccess({ res, statusCode: 201, message: 'Campaign created', data: campaign });
    } catch (e) { next(e); }
  }

  async getCampaign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub, role } = auth(req);
      const campaign = await svc.getCampaign(req.params.id, sub, role);
      sendSuccess({ res, message: 'Campaign retrieved', data: campaign });
    } catch (e) { next(e); }
  }

  async listCampaigns(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub, role } = auth(req);
      const result = await svc.listCampaigns({
        status:      req.query.status      as any,
        type:        req.query.type        as any,
        communityId: req.query.communityId as string,
        search:      req.query.search      as string,
        page:        Number(req.query.page)  || 1,
        limit:       Number(req.query.limit) || 20,
        sortBy:      req.query.sortBy      as any,
        sortOrder:   req.query.sortOrder   as any,
      }, sub, role);
      sendSuccess({ res, message: 'Campaigns retrieved', data: result.data, meta: result.meta });
    } catch (e) { next(e); }
  }

  async updateCampaign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub, role } = auth(req);
      const campaign = await svc.updateCampaign(req.params.id, req.body, sub, role, ctx(req));
      sendSuccess({ res, message: 'Campaign updated', data: campaign });
    } catch (e) { next(e); }
  }

  async deleteCampaign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub, role } = auth(req);
      await svc.deleteCampaign(req.params.id, sub, role, ctx(req));
      sendSuccess({ res, message: 'Campaign deleted', data: null });
    } catch (e) { next(e); }
  }

  async submitCampaign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub: ownerId } = auth(req);
      const campaign = await svc.submitCampaign(req.params.id, req.body.communityId, ownerId, ctx(req));
      sendSuccess({ res, message: 'Campaign submitted for admin approval', data: campaign });
    } catch (e) { next(e); }
  }

  async adminReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub: adminId } = auth(req);
      const campaign = await svc.adminReview(req.params.id, req.body, adminId, ctx(req));
      sendSuccess({ res, message: `Campaign ${req.body.action}d by admin`, data: campaign });
    } catch (e) { next(e); }
  }

  async leaderReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub: leaderId } = auth(req);
      const campaign = await svc.leaderReview(req.params.id, req.body, leaderId, ctx(req));
      sendSuccess({ res, message: `Campaign ${req.body.action}ed by leader`, data: campaign });
    } catch (e) { next(e); }
  }

  async pauseCampaign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub, role } = auth(req);
      const campaign = await svc.pauseCampaign(req.params.id, sub, role, ctx(req));
      sendSuccess({ res, message: 'Campaign paused', data: campaign });
    } catch (e) { next(e); }
  }

  async completeCampaign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub, role } = auth(req);
      const campaign = await svc.completeCampaign(req.params.id, sub, role, ctx(req));
      sendSuccess({ res, message: 'Campaign completed', data: campaign });
    } catch (e) { next(e); }
  }

  async getCampaignTracking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub, role } = auth(req);
      const tracking = await svc.getCampaignTracking(req.params.id, sub, role);
      sendSuccess({ res, message: 'Campaign tracking retrieved', data: tracking });
    } catch (e) { next(e); }
  }

  async addConversion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub: ownerId } = auth(req);
      const conversion = await svc.addConversion(req.params.id, req.body, ownerId, ctx(req));
      sendSuccess({ res, statusCode: 201, message: 'Conversion recorded', data: conversion });
    } catch (e) { next(e); }
  }

  async updateConversion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub: ownerId } = auth(req);
      const conversion = await svc.updateConversion(req.params.id, req.params.conversionId, req.body, ownerId, ctx(req));
      sendSuccess({ res, message: 'Conversion updated', data: conversion });
    } catch (e) { next(e); }
  }

  async deleteConversion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub: ownerId } = auth(req);
      await svc.deleteConversion(req.params.id, req.params.conversionId, ownerId, ctx(req));
      sendSuccess({ res, message: 'Conversion deleted', data: null });
    } catch (e) { next(e); }
  }

  async listConversions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub, role } = auth(req);
      const conversions = await svc.listConversions(req.params.id, sub, role);
      sendSuccess({ res, message: 'Conversions retrieved', data: conversions });
    } catch (e) { next(e); }
  }
}

export const campaignController = new CampaignController();
