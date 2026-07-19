// ─────────────────────────────────────────────────────────────────────────────
// Environment Configuration — validated at startup
// The application will refuse to start if required env vars are missing.
// ─────────────────────────────────────────────────────────────────────────────

import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// ── Required environment variable validator ───────────────────────────────────
const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(`[ENV] Missing required environment variable: ${key}`);
  }
  return value.trim();
};

const getEnv = (key: string, defaultValue: string): string => {
  return process.env[key]?.trim() || defaultValue;
};

const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  const parsed = value ? parseInt(value, 10) : NaN;
  return isNaN(parsed) ? defaultValue : parsed;
};

const getEnvBoolean = (key: string, defaultValue: boolean): boolean => {
  const value = process.env[key]?.toLowerCase();
  if (value === 'true') return true;
  if (value === 'false') return false;
  return defaultValue;
};

// ── Validate and export config ────────────────────────────────────────────────
export const env = {
  // Application
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  PORT: getEnvNumber('PORT', 5000),
  API_VERSION: getEnv('API_VERSION', 'v1'),
  IS_PRODUCTION: getEnv('NODE_ENV', 'development') === 'production',
  IS_DEVELOPMENT: getEnv('NODE_ENV', 'development') === 'development',
  IS_TEST: getEnv('NODE_ENV', 'development') === 'test',

  // Database
  DATABASE_URL: requireEnv('DATABASE_URL'),

  // JWT
  JWT_ACCESS_SECRET: requireEnv('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: requireEnv('JWT_REFRESH_SECRET'),
  JWT_ACCESS_EXPIRES_IN: getEnv('JWT_ACCESS_EXPIRES_IN', '15m'),
  JWT_REFRESH_EXPIRES_IN: getEnv('JWT_REFRESH_EXPIRES_IN', '30d'),

  // Redis
  REDIS_HOST: getEnv('REDIS_HOST', 'localhost'),
  REDIS_PORT: getEnvNumber('REDIS_PORT', 6379),
  REDIS_PASSWORD: getEnv('REDIS_PASSWORD', ''),
  REDIS_DB: getEnvNumber('REDIS_DB', 0),

  // Email
  SMTP_HOST: getEnv('SMTP_HOST', 'smtp.gmail.com'),
  SMTP_PORT: getEnvNumber('SMTP_PORT', 587),
  SMTP_SECURE: getEnvBoolean('SMTP_SECURE', false),
  SMTP_USER: getEnv('SMTP_USER', ''),
  SMTP_PASS: getEnv('SMTP_PASS', ''),
  SMTP_FROM_NAME: getEnv('SMTP_FROM_NAME', 'InfluenceHub'),
  SMTP_FROM_EMAIL: getEnv('SMTP_FROM_EMAIL', 'noreply@influencehub.com'),

  // Security
  BCRYPT_ROUNDS: getEnvNumber('BCRYPT_ROUNDS', 12),
  MAX_LOGIN_ATTEMPTS: getEnvNumber('MAX_LOGIN_ATTEMPTS', 5),
  LOCK_TIME_MINUTES: getEnvNumber('LOCK_TIME_MINUTES', 30),
  OTP_EXPIRES_MINUTES: getEnvNumber('OTP_EXPIRES_MINUTES', 10),
  RATE_LIMIT_WINDOW_MS: getEnvNumber('RATE_LIMIT_WINDOW_MS', 900000),
  RATE_LIMIT_MAX: getEnvNumber('RATE_LIMIT_MAX', 100),

  // CORS
  ALLOWED_ORIGINS: getEnv('ALLOWED_ORIGINS', 'http://localhost:3000').split(','),

  // Logging
  LOG_LEVEL: getEnv('LOG_LEVEL', 'info'),
  LOG_DIR: getEnv('LOG_DIR', 'logs'),
} as const;

export type Env = typeof env;
