// ─────────────────────────────────────────────────────────────────────────────
// Chat & Collaboration Controller — Module 6 (FR32–FR37)
// ─────────────────────────────────────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import { chatService as svc } from '../services/chat.service';
import { sendSuccess } from '../../../common/helpers/response.helper';
import { getIpAddress, getUserAgent } from '../../../common/utils/request.util';
import { AuthenticatedRequest } from '../../../common/types';

const ctx  = (req: Request) => ({ ip: getIpAddress(req), userAgent: getUserAgent(req) });
const auth = (req: Request) => (req as AuthenticatedRequest).user;

class ChatController {

  // ── FR32 — Community Chat ──────────────────────────────────────────────────

  async getCommunityMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub, role } = auth(req);
      const result = await svc.listCommunityMessages(req.params.communityId, req.query as any, sub, role);
      sendSuccess({ res, message: 'Community messages retrieved', data: result.data, meta: result.meta });
    } catch (e) { next(e); }
  }

  async sendCommunityMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub, role } = auth(req);
      const result = await svc.sendCommunityMessage(req.params.communityId, req.body, sub, role, ctx(req));
      sendSuccess({ res, statusCode: 201, message: 'Message sent', data: result });
    } catch (e) { next(e); }
  }

  // ── FR33 — Direct Messages ─────────────────────────────────────────────────

  async getDirectConversations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub } = auth(req);
      const result = await svc.listDirectConversations(req.query as any, sub);
      sendSuccess({ res, message: 'Direct conversations retrieved', data: result.data, meta: result.meta });
    } catch (e) { next(e); }
  }

  async startOrSendDirectMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub, role } = auth(req);
      const result = await svc.startOrSendDirectMessage(req.body, sub, role, ctx(req));
      sendSuccess({ res, statusCode: 201, message: 'Direct message sent', data: result });
    } catch (e) { next(e); }
  }

  async markMessageRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub } = auth(req);
      const result = await svc.markMessageRead(req.params.id, sub);
      sendSuccess({ res, message: 'Message marked as read', data: result });
    } catch (e) { next(e); }
  }

  async softDeleteMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub, role } = auth(req);
      const result = await svc.softDeleteMessage(req.params.id, sub, role, ctx(req));
      sendSuccess({ res, message: 'Message deleted', data: result });
    } catch (e) { next(e); }
  }

  // ── FR34 — Voice Messages ──────────────────────────────────────────────────

  async uploadVoiceMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub } = auth(req);
      const result = await svc.uploadVoiceMessage(req.body, sub, ctx(req));
      sendSuccess({ res, statusCode: 201, message: 'Voice message uploaded', data: result });
    } catch (e) { next(e); }
  }

  // ── FR35 — Community Videos ────────────────────────────────────────────────

  async uploadCommunityVideo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub, role } = auth(req);
      const result = await svc.uploadCommunityVideo(req.body, sub, role, ctx(req));
      sendSuccess({ res, statusCode: 201, message: 'Community video uploaded', data: result });
    } catch (e) { next(e); }
  }

  async getCommunityVideos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub, role } = auth(req);
      const result = await svc.listCommunityVideos(req.query as any, sub, role);
      sendSuccess({ res, message: 'Community videos retrieved', data: result.data, meta: result.meta });
    } catch (e) { next(e); }
  }

  // ── FR36 — Meeting Links ───────────────────────────────────────────────────

  async createMeetingLink(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub, role } = auth(req);
      const result = await svc.createMeetingLink(req.body, sub, role, ctx(req));
      sendSuccess({ res, statusCode: 201, message: 'Meeting link created', data: result });
    } catch (e) { next(e); }
  }

  async getMeetingLinks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub, role } = auth(req);
      const result = await svc.listMeetingLinks(req.query as any, sub, role);
      sendSuccess({ res, message: 'Meeting links retrieved', data: result.data, meta: result.meta });
    } catch (e) { next(e); }
  }

  // ── FR37 — Campaign Content ────────────────────────────────────────────────

  async uploadCampaignContent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub, role } = auth(req);
      const result = await svc.uploadCampaignContent(req.body, sub, role, ctx(req));
      sendSuccess({ res, statusCode: 201, message: 'Campaign content submitted', data: result });
    } catch (e) { next(e); }
  }

  async getCampaignContent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub, role } = auth(req);
      const result = await svc.listCampaignContent(req.query as any, sub, role);
      sendSuccess({ res, message: 'Campaign content retrieved', data: result.data, meta: result.meta });
    } catch (e) { next(e); }
  }

  async reviewCampaignContent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sub, role } = auth(req);
      const result = await svc.reviewCampaignContent(req.params.id, req.body, sub, role, ctx(req));
      sendSuccess({ res, message: `Campaign content ${req.body.status.toLowerCase()}`, data: result });
    } catch (e) { next(e); }
  }
}

export const chatController = new ChatController();
