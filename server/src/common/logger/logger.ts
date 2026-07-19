// ─────────────────────────────────────────────────────────────────────────────
// Winston Logger — Enterprise structured logging
// ─────────────────────────────────────────────────────────────────────────────

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { env } from '../../config/env';

const { combine, timestamp, errors, json, colorize, printf, splat } = winston.format;

// ── Custom format for console output ─────────────────────────────────────────
const consoleFormat = printf(({ level, message, timestamp: ts, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
  return `${ts} [${level}]: ${stack || message}${metaStr}`;
});

// ── Transports ────────────────────────────────────────────────────────────────
const transports: winston.transport[] = [];

// Console transport (always)
transports.push(
  new winston.transports.Console({
    format: combine(
      colorize({ all: true }),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      errors({ stack: true }),
      splat(),
      consoleFormat
    ),
  })
);

// File transports (production and development)
if (env.LOG_DIR) {
  const logDir = path.resolve(env.LOG_DIR);

  // Combined log (all levels)
  transports.push(
    new DailyRotateFile({
      filename: path.join(logDir, 'app-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: combine(timestamp(), errors({ stack: true }), json()),
    })
  );

  // Error log (errors only)
  transports.push(
    new DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '30d',
      format: combine(timestamp(), errors({ stack: true }), json()),
    })
  );

  // Security log (auth events)
  transports.push(
    new DailyRotateFile({
      filename: path.join(logDir, 'security-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '90d',
      format: combine(timestamp(), errors({ stack: true }), json()),
    })
  );
}

// ── Logger instance ───────────────────────────────────────────────────────────
const logger = winston.createLogger({
  level: env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'influencehub-api' },
  transports,
  exceptionHandlers: [
    new winston.transports.Console(),
    ...(env.LOG_DIR
      ? [
          new DailyRotateFile({
            filename: path.join(path.resolve(env.LOG_DIR), 'exceptions-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
          }),
        ]
      : []),
  ],
  rejectionHandlers: [
    new winston.transports.Console(),
    ...(env.LOG_DIR
      ? [
          new DailyRotateFile({
            filename: path.join(path.resolve(env.LOG_DIR), 'rejections-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
          }),
        ]
      : []),
  ],
});

// ── Security event logger helper ──────────────────────────────────────────────
export const securityLogger = {
  loginSuccess: (userId: string, ip: string, email: string) =>
    logger.info('AUTH:LOGIN_SUCCESS', { userId, ip, email, event: 'LOGIN_SUCCESS' }),

  loginFailed: (email: string, ip: string, reason: string) =>
    logger.warn('AUTH:LOGIN_FAILED', { email, ip, reason, event: 'LOGIN_FAILED' }),

  logout: (userId: string, ip: string) =>
    logger.info('AUTH:LOGOUT', { userId, ip, event: 'LOGOUT' }),

  logoutAll: (userId: string, ip: string) =>
    logger.info('AUTH:LOGOUT_ALL', { userId, ip, event: 'LOGOUT_ALL' }),

  register: (userId: string, email: string, ip: string) =>
    logger.info('AUTH:REGISTER', { userId, email, ip, event: 'REGISTER' }),

  passwordReset: (userId: string, ip: string) =>
    logger.info('AUTH:PASSWORD_RESET', { userId, ip, event: 'PASSWORD_RESET' }),

  emailVerified: (userId: string, ip: string) =>
    logger.info('AUTH:EMAIL_VERIFIED', { userId, ip, event: 'EMAIL_VERIFIED' }),

  accountLocked: (userId: string, ip: string, attempts: number) =>
    logger.warn('AUTH:ACCOUNT_LOCKED', { userId, ip, attempts, event: 'ACCOUNT_LOCKED' }),

  suspiciousActivity: (userId: string, ip: string, reason: string) =>
    logger.warn('AUTH:SUSPICIOUS_ACTIVITY', { userId, ip, reason, event: 'SUSPICIOUS_ACTIVITY' }),

  tokenRefreshed: (userId: string, ip: string) =>
    logger.info('AUTH:TOKEN_REFRESHED', { userId, ip, event: 'TOKEN_REFRESHED' }),
};

export default logger;
