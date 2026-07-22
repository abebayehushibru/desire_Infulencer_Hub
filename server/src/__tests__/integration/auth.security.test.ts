// ─────────────────────────────────────────────────────────────────────────────
// Integration Security Tests — HTTP-level security checks
// Tests: Validation edge cases, SQL injection attempts, XSS in inputs,
//        response format, CORS headers, missing auth, privilege escalation
// ─────────────────────────────────────────────────────────────────────────────

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_min_64_chars_long_abcdefghijklmnopqrstuvwxyz1234';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_min_64_chars_long_abcdefghijklmnopqrstuvwxyz12';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '30d';
process.env.BCRYPT_ROUNDS = '4';
process.env.SMTP_USER = '';
process.env.SMTP_PASS = '';

jest.mock('../../config/redis', () => ({
  default: { get: jest.fn().mockResolvedValue(null), setex: jest.fn(), on: jest.fn() },
}));

jest.mock('../../config/prisma', () => ({
  default: { $connect: jest.fn().mockResolvedValue(undefined), $disconnect: jest.fn(), $on: jest.fn() },
}));

jest.mock('../../modules/auth/repositories/auth.repository', () => ({
  authRepository: {
    findUserByEmail: jest.fn(),
    findUserById: jest.fn(),
    createUser: jest.fn(),
    updateLastLogin: jest.fn(),
    incrementFailedAttempts: jest.fn(),
    lockUserAccount: jest.fn(),
    resetFailedAttempts: jest.fn(),
    markEmailVerified: jest.fn(),
    updatePassword: jest.fn(),
    createRefreshToken: jest.fn(),
    findRefreshTokenByHash: jest.fn(),
    revokeRefreshToken: jest.fn(),
    revokeTokenFamily: jest.fn(),
    revokeAllUserRefreshTokens: jest.fn(),
    invalidatePreviousPasswordResets: jest.fn().mockResolvedValue(undefined),
    createPasswordReset: jest.fn().mockResolvedValue({}),
    findLatestPasswordReset: jest.fn(),
    markPasswordResetUsed: jest.fn(),
    invalidatePreviousVerifications: jest.fn().mockResolvedValue(undefined),
    createEmailVerification: jest.fn().mockResolvedValue({}),
    findLatestEmailVerification: jest.fn(),
    markEmailVerificationUsed: jest.fn(),
    createAuditLog: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../../common/email/email.service', () => ({
  emailService: {
    sendVerificationEmail:            jest.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail:           jest.fn().mockResolvedValue(undefined),
    sendWelcomeEmail:                 jest.fn().mockResolvedValue(undefined),
    sendPasswordChangedEmail:         jest.fn().mockResolvedValue(undefined),
    sendBusinessVerificationEmail:    jest.fn().mockResolvedValue(undefined),
    verifyConnection:                 jest.fn().mockResolvedValue(true),
  },
}));

import request from 'supertest';
import app from '../../app';

beforeEach(() => jest.clearAllMocks());

// ─────────────────────────────────────────────────────────────────────────────
// INPUT VALIDATION — SQL Injection Attempts
// ─────────────────────────────────────────────────────────────────────────────
describe('Security: SQL Injection Prevention', () => {
  const sqlPayloads = [
    "' OR '1'='1",
    "'; DROP TABLE users; --",
    "' UNION SELECT * FROM users --",
    "1; SELECT * FROM users WHERE '1'='1",
  ];

  sqlPayloads.forEach((payload) => {
    it(`rejects SQL injection in email: ${payload.slice(0, 30)}...`, async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: payload, password: 'AnyPass@123' });
      // Must return 422 (validation) — never 500 (crash) or 200 (bypass)
      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// INPUT VALIDATION — XSS Attempts
// ─────────────────────────────────────────────────────────────────────────────
describe('Security: XSS Prevention in Input', () => {
  const xssPayloads = [
    '<script>alert(1)</script>',
    '"><img src=x onerror=alert(1)>',
    'javascript:alert(1)',
    '<svg onload=alert(1)>',
  ];

  xssPayloads.forEach((payload) => {
    it(`validates and rejects XSS in firstName: ${payload.slice(0, 30)}`, async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          firstName: payload,
          lastName: 'Doe',
          email: 'test@example.com',
          password: 'MySecure@Pass1',
        });
      expect(res.status).toBe(422);
    });
  });

  it('rejects XSS in email field', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: '<script>alert(1)</script>@evil.com',
        password: 'MySecure@Pass1',
      });
    expect(res.status).toBe(422);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// INPUT VALIDATION — Oversized payloads
// ─────────────────────────────────────────────────────────────────────────────
describe('Security: Oversized Input Prevention', () => {
  it('rejects email exceeding 255 characters', async () => {
    const longEmail = 'a'.repeat(250) + '@test.com';
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: longEmail, password: 'MySecure@Pass1' });
    expect(res.status).toBe(422);
  });

  it('rejects password exceeding 128 characters', async () => {
    const longPass = 'MySecure@Pass1' + 'a'.repeat(200);
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: longPass });
    expect(res.status).toBe(422);
  });

  it('rejects firstName over 100 characters', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        firstName: 'A'.repeat(101),
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'MySecure@Pass1',
      });
    expect(res.status).toBe(422);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE FORMAT — All endpoints
// ─────────────────────────────────────────────────────────────────────────────
describe('Response Format Contract', () => {
  const endpoints = [
    { method: 'post', path: '/api/v1/auth/register', body: {} },
    { method: 'post', path: '/api/v1/auth/login', body: {} },
    { method: 'post', path: '/api/v1/auth/forgot-password', body: { email: 'x@x.com' } },
    { method: 'get',  path: '/api/v1/auth/me', body: {} },
    { method: 'get',  path: '/api/v1/nonexistent', body: {} },
  ];

  endpoints.forEach(({ method, path, body }) => {
    it(`${method.toUpperCase()} ${path} returns {success, message, data, timestamp}`, async () => {
      const req = (request(app) as any)[method](path);
      if (Object.keys(body).length) req.send(body);
      const res = await req;
      expect(res.body).toHaveProperty('success');
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('timestamp');
      expect(typeof res.body.success).toBe('boolean');
      expect(typeof res.body.message).toBe('string');
      expect(typeof res.body.timestamp).toBe('string');
    });
  });

  it('response never contains stack trace', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@test.com', password: 'MyPass@123' });
    const body = JSON.stringify(res.body);
    expect(body).not.toContain('at Object.');
    expect(body).not.toContain('Error:');
    expect(body).not.toContain('node_modules');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AUTHENTICATION — Missing/invalid token scenarios
// ─────────────────────────────────────────────────────────────────────────────
describe('Authentication: Token Security', () => {
  it('401 with no Authorization header', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('401 with empty Bearer token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer ');
    expect(res.status).toBe(401);
  });

  it('401 with Basic auth instead of Bearer', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Basic dXNlcjpwYXNz');
    expect(res.status).toBe(401);
  });

  it('401 with malformed JWT (only 2 parts)', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer header.payload');
    expect(res.status).toBe(401);
  });

  it('401 with JWT signed by wrong secret', async () => {
    const jwt = require('jsonwebtoken');
    const fakeToken = jwt.sign(
      { sub: 'uid', email: 'x@x.com', role: 'SYSTEM_ADMIN' },
      'wrong-secret-key',
      { expiresIn: '15m' }
    );
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${fakeToken}`);
    expect(res.status).toBe(401);
  });

  it('401 with "none" algorithm token (algorithm confusion)', async () => {
    const noneToken = [
      Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url'),
      Buffer.from(JSON.stringify({ sub: 'admin', role: 'SYSTEM_ADMIN', email: 'h@h.com' })).toString('base64url'),
      '',
    ].join('.');
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${noneToken}`);
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION — OTP field
// ─────────────────────────────────────────────────────────────────────────────
describe('Validation: OTP Field', () => {
  it('rejects non-numeric OTP', async () => {
    const res = await request(app)
      .post('/api/v1/auth/verify-email')
      .send({ email: 'test@test.com', otp: 'abcdef' });
    expect(res.status).toBe(422);
  });

  it('rejects OTP shorter than 6 digits', async () => {
    const res = await request(app)
      .post('/api/v1/auth/verify-email')
      .send({ email: 'test@test.com', otp: '12345' });
    expect(res.status).toBe(422);
  });

  it('rejects OTP longer than 6 digits', async () => {
    const res = await request(app)
      .post('/api/v1/auth/verify-email')
      .send({ email: 'test@test.com', otp: '1234567' });
    expect(res.status).toBe(422);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FORGOT PASSWORD — Security: Email enumeration prevention
// ─────────────────────────────────────────────────────────────────────────────
describe('Security: Email Enumeration Prevention', () => {
  it('forgot-password returns same response regardless of whether email exists', async () => {
    const { authRepository } = require('../../modules/auth/repositories/auth.repository');

    // Non-existent email
    authRepository.findUserByEmail.mockResolvedValue(null);
    const res1 = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'nonexistent@example.com' });

    // Existing email
    authRepository.findUserByEmail.mockResolvedValue({
      id: 'uid', email: 'existing@example.com', firstName: 'John',
    });
    authRepository.invalidatePreviousPasswordResets.mockResolvedValue(undefined);
    authRepository.createPasswordReset.mockResolvedValue({});
    const res2 = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'existing@example.com' });

    // Both must return 200 with identical message
    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(res1.body.message).toBe(res2.body.message);
  });
});
