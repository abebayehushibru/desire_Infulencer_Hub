// ─────────────────────────────────────────────────────────────────────────────
// Integration Tests — Auth Routes
// Uses supertest to test real HTTP requests through the full Express stack.
// Database and Redis are mocked.
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

// ── Mocks ──────────────────────────────────────────────────────────────────────
jest.mock('../../config/redis', () => ({
  default: {
    get: jest.fn().mockResolvedValue(null),
    setex: jest.fn().mockResolvedValue('OK'),
    ping: jest.fn().mockResolvedValue('PONG'),
    quit: jest.fn().mockResolvedValue('OK'),
  },
}));

jest.mock('../../config/prisma', () => ({
  default: {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    emailVerification: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    passwordReset: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  },
}));

jest.mock('../../common/email/email.service', () => ({
  emailService: {
    sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
    sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
    sendPasswordChangedEmail: jest.fn().mockResolvedValue(undefined),
    verifyConnection: jest.fn().mockResolvedValue(true),
  },
}));

import request from 'supertest';
import app from '../../app';
import prisma from '../../config/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Auth Routes — Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── POST /register ────────────────────────────────────────────────────────

  describe('POST /api/v1/auth/register', () => {
    const validPayload = {
      firstName: 'aman',
      lastName: 'alex',
      email: 'aman@example.com',
      password: 'MySecure@Pass1',
    };

    it('should register successfully and return 201', async () => {
      const createdUser = {
        id: 'uuid-1',
        firstName: 'aman',
        lastName: 'alex',
        email: 'aman@example.com',
        passwordHash: '$2b$04$hash',
        role: 'SILVER_INFLUENCER',
        status: 'PENDING_VERIFICATION',
        emailVerified: false,
        lastLogin: null,
        failedLoginAttempts: 0,
        lockedUntil: null,
        profileImage: null,
        isSuspended: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (mockPrisma.user.create as jest.Mock).mockResolvedValue(createdUser);
      (mockPrisma.emailVerification.updateMany as jest.Mock).mockResolvedValue({ count: 0 });
      (mockPrisma.emailVerification.create as jest.Mock).mockResolvedValue({
        id: 'ev-1',
        userId: 'uuid-1',
        otpHash: '$2b$04$hash',
        isUsed: false,
        expiresAt: new Date(Date.now() + 600000),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
      (mockPrisma.auditLog.create as jest.Mock).mockResolvedValue({});

      const res = await request(app).post('/api/v1/auth/register').send(validPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('verification');
      expect(res.body.data.user.email).toBe('aman@example.com');
      expect(res.body.data.user.passwordHash).toBeUndefined(); // Never expose hash
    });

    it('should return 409 if email already exists', async () => {
      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue({ id: 'existing' });

      const res = await request(app).post('/api/v1/auth/register').send(validPayload);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should return 422 for missing fields', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('should return 422 for weak password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...validPayload, password: 'weakpass' });

      expect(res.status).toBe(422);
    });

    it('should return 422 for invalid email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...validPayload, email: 'not-an-email' });

      expect(res.status).toBe(422);
    });
  });

  // ── POST /login ───────────────────────────────────────────────────────────

  describe('POST /api/v1/auth/login', () => {
    it('should return 422 for missing credentials', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({});
      expect(res.status).toBe(422);
    });

    it('should return 401 for non-existent user', async () => {
      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (mockPrisma.auditLog.create as jest.Mock).mockResolvedValue({});

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'none@example.com', password: 'MySecure@Pass1' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ── POST /forgot-password ─────────────────────────────────────────────────

  describe('POST /api/v1/auth/forgot-password', () => {
    it('should always return 200 (security: email existence not revealed)', async () => {
      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 422 for invalid email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'not-email' });

      expect(res.status).toBe(422);
    });
  });

  // ── GET /me (protected) ───────────────────────────────────────────────────

  describe('GET /api/v1/auth/me', () => {
    it('should return 401 without Authorization header', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid.token.here');
      expect(res.status).toBe(401);
    });
  });

  // ── Response format ───────────────────────────────────────────────────────

  describe('Response format', () => {
    it('should always include success, message, data, timestamp fields', async () => {
      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'test@example.com' });

      expect(res.body).toHaveProperty('success');
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  // ── Health check ──────────────────────────────────────────────────────────

  describe('GET /health', () => {
    it('should return 200 OK', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
