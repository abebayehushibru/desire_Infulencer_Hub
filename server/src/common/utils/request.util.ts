// ─────────────────────────────────────────────────────────────────────────────
// Request Utility — Extract metadata from Express requests
// ─────────────────────────────────────────────────────────────────────────────

import { Request } from 'express';
import { RequestContext } from '../types';

// ── Extract IP address (supports proxies) ────────────────────────────────────
export const getIpAddress = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || req.ip || 'unknown';
};

// ── Extract User-Agent ────────────────────────────────────────────────────────
export const getUserAgent = (req: Request): string => {
  return (req.headers['user-agent'] || 'unknown').substring(0, 500);
};

// ── Build request context ─────────────────────────────────────────────────────
export const buildRequestContext = (req: Request, userId?: string): RequestContext => ({
  ip: getIpAddress(req),
  userAgent: getUserAgent(req),
  userId,
});

// ── Normalize email ───────────────────────────────────────────────────────────
export const normalizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};
