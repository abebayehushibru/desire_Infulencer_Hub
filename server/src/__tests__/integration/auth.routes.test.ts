// ─────────────────────────────────────────────────────────────────────────────
// Integration Tests — Auth Routes
// Mocks: Redis, Prisma (bootstrap only), authRepository, emailService
// ─────────────────────────────────────────────────────────────────────────────

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_min_64_chars_long_abcdefghijklmnopqrstuvwxyz1234';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_min_64_chars_long_abcdefghijklmnopqrstuvwxyz12';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '30d';
process.env.BCRYPT_ROUNDS = '4';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.SMTP_USER = '';
process.env.SMTP_PASS = '';

// ── Mock Redis ────────────────────────────────────────────────────────────────
jest.mock('../../config/redis', () => ({
  default: {
    get: jest.fn().mockResolvedValue(null),
    setex: jest.fn().mockResolvedValue('OK'),
    ping: jest.fn().mockResolvedValue('PONG'),
    quit: jest.fn().mockResolvedValue('OK'),
    on: jest.fn(),
  },
}));

// ── Mock Prisma (bootstrap $connect only — real queries go via repository mock)
jest.mock('../../config/prisma', () => ({
  default: {
    $connect:    jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    $on:         jest.fn(),
  },
}));

// ── Mock authRepository — avoids all real DB calls ───────────────────────────
jest.mock('../../modules/auth/repositories/auth.repository', () => ({
  authRepository: {
    findUserByEmail:                  jest.fn(),
    findUserById:                     jest.fn(),
    createUser:                       jest.fn(),
    updateLastLogin:                  jest.fn(),
    incrementFailedAttempts:          jest.fn(),
    lockUserAccount:                  jest.fn(),
    resetFailedAttempts:              jest.fn(),
    markEmailVerified:                jest.fn(),
    updatePassword:                   jest.fn(),
    createRefreshToken:               jest.fn(),
    findRefreshTokenByHash:           jest.fn(),
    revokeRefreshToken:               jest.fn(),
    revokeTokenFamily:                jest.fn(),
    revokeAllUserRefreshTokens:       jest.fn(),
    invalidatePreviousPasswordResets: jest.fn().mockResolvedValue(undefined),
    createPasswordReset:              jest.fn().mockResolvedValue({}),
    findLatestPasswordReset:          jest.fn(),
    markPasswordResetUsed:            jest.fn(),
    invalidatePreviousVerifications:  jest.fn().mockResolvedValue(undefined),
    createEmailVerification:          jest.fn().mockResolvedValue({}),
    findLatestEmailVerification:      jest.fn(),
    markEmailVerificationUsed:        jest.fn(),
    createAuditLog:                   jest.fn().mockResolvedValue(undefined),
  },
}));

// ── Mock email service ────────────────────────────────────────────────────────
jest.mock('../../common/email/email.service', () => ({
  emailService: {
    sendVerificationEmail:    jest.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail:   jest.fn().mockResolvedValue(undefined),
    sendWelcomeEmail:         jest.fn().mockResolvedValue(undefined),
    sendPasswordChangedEmail: jest.fn().mockResolvedValue(undefined),
    verifyConnection:         jest.fn().mockResolvedValue(true),
  },
}));

import request from 'supertest';
import app from '../../app';
import { authRepository } from '../../modules/auth/repositories/auth.repository';

const mockRepo = authRepository as jest.Mocked<typeof authRepository>;

// ── Shared fixture ────────────────────────────────────────────────────────────
const makeUser = (overrides = {}) => ({
  id: 'uuid-test-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  passwordHash: '$2b$04$testhashedpassword',
  role: 'SILVER_INFLUENCER',
  status: 'ACTIVE',
  emailVerified: true,
  lastLogin: null,
  failedLoginAttempts: 0,
  lockedUntil: null,
  profileImage: null,
  isSuspended: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...overrides,
});

beforeEach(() => jest.clearAllMocks());

// ─────────────────────────────────────────────────────────────────────────────
describe('GET /health', () => {
  it('returns 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/v1/auth/register', () => {
  const valid = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'MySecure@Pass1',
  };

  it('returns 201 on successful registration', async () => {
    mockRepo.findUserByEmail.mockResolvedValue(null);
    mockRepo.createUser.mockResolvedValue(makeUser() as any);

    const res = await request(app).post('/api/v1/auth/register').send(valid);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('john@example.com');
    expect(res.body.data.user.passwordHash).toBeUndefined(); // never leak hash
  });

  it('returns 409 if email already exists', async () => {
    mockRepo.findUserByEmail.mockResolvedValue(makeUser() as any);

    const res = await request(app).post('/api/v1/auth/register').send(valid);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('returns 422 for missing required fields', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'test@example.com' });

    expect(res.status).toBe(422);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it('returns 422 for weak password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...valid, password: 'weakpass' });
    expect(res.status).toBe(422);
  });

  it('returns 422 for invalid email format', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...valid, email: 'not-an-email' });
    expect(res.status).toBe(422);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/v1/auth/login', () => {
  it('returns 422 for missing credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({});
    expect(res.status).toBe(422);
  });

  it('returns 401 for non-existent user', async () => {
    mockRepo.findUserByEmail.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@example.com', password: 'MySecure@Pass1' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/v1/auth/forgot-password', () => {
  it('always returns 200 — never reveals if email exists', async () => {
    mockRepo.findUserByEmail.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'nonexistent@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockRepo.createPasswordReset).not.toHaveBeenCalled();
  });

  it('returns 422 for invalid email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'not-email' });
    expect(res.status).toBe(422);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/v1/auth/me (protected)', () => {
  it('returns 401 without Authorization header', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('returns 401 with invalid token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Response format contract', () => {
  it('every response has success, message, data, timestamp', async () => {
    mockRepo.findUserByEmail.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'test@example.com' });

    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('404 for unknown route has correct format', async () => {
    const res = await request(app).get('/api/v1/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('not found');
  });
});
