// ─────────────────────────────────────────────────────────────────────────────
// Application Constants
// ─────────────────────────────────────────────────────────────────────────────

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL: 500,
} as const;

export const AUTH = {
  get BCRYPT_ROUNDS() { return parseInt(process.env.BCRYPT_ROUNDS || '12', 10); },
  OTP_LENGTH: 6,
  OTP_EXPIRES_MINUTES: 10,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCK_TIME_MINUTES: 30,
  ACCESS_TOKEN_EXPIRES: '15m',
  REFRESH_TOKEN_EXPIRES: '30d',
  REFRESH_TOKEN_EXPIRES_MS: 30 * 24 * 60 * 60 * 1000,
} as const;

export const REDIS_KEYS = {
  blacklistToken: (jti: string) => `blacklist:token:${jti}`,
  userSession: (userId: string) => `session:user:${userId}`,
  rateLimitLogin: (ip: string) => `ratelimit:login:${ip}`,
  rateLimitOtp: (email: string) => `ratelimit:otp:${email}`,
  passwordResetOtp: (userId: string) => `otp:reset:${userId}`,
  emailVerifyOtp: (userId: string) => `otp:verify:${userId}`,
} as const;

export const COOKIE = {
  REFRESH_TOKEN: 'refresh_token',
  ACCESS_TOKEN: 'access_token',
  OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
  },
} as const;

export const ROLES = {
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  BUSINESS_OWNER: 'BUSINESS_OWNER',
  AGENT: 'AGENT',
  DIAMOND_INFLUENCER: 'DIAMOND_INFLUENCER',
  GOLD_INFLUENCER: 'GOLD_INFLUENCER',
  SILVER_INFLUENCER: 'SILVER_INFLUENCER',
} as const;

// Role hierarchy — higher index = more permissions
export const ROLE_HIERARCHY = [
  'SILVER_INFLUENCER',
  'GOLD_INFLUENCER',
  'DIAMOND_INFLUENCER',
  'AGENT',
  'BUSINESS_OWNER',
  'SYSTEM_ADMIN',
] as const;

export const EMAIL_TEMPLATES = {
  VERIFICATION: 'email-verification',
  PASSWORD_RESET: 'password-reset',
  WELCOME: 'welcome',
  PASSWORD_CHANGED: 'password-changed',
} as const;
