// ─────────────────────────────────────────────────────────────────────────────
// Request Utility — Extract metadata from Express requests
// ─────────────────────────────────────────────────────────────────────────────

import { Request } from 'express';
import { RequestContext } from '../types';

// ── Validate IP address format ─────────────────────────────────────────────────
const isValidIp = (ip: string): boolean => {
  // IPv4
  const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
  // IPv6 (simplified)
  const ipv6 = /^[0-9a-fA-F:]+$/;
  return ipv4.test(ip) || ipv6.test(ip);
};

// ── Extract IP address (supports proxies, validates to prevent spoofing) ──────
export const getIpAddress = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    // Take the first IP (client IP) and validate it
    const candidate = forwarded.split(',')[0].trim();
    if (isValidIp(candidate)) return candidate;
  }
  const remoteAddr = req.socket?.remoteAddress || req.ip || 'unknown';
  // Strip IPv6 prefix (::ffff:) for IPv4-mapped addresses
  return remoteAddr.replace(/^::ffff:/, '');
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
