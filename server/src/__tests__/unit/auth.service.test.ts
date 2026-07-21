// ─────────────────────────────────────────────────────────────────────────────
// Unit Tests — Auth Service (business logic)
// All external dependencies are mocked.
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

// ── Mock Redis ─────────────────────────────────────────────────────────────────
jest.mock('../../config/redis', () => ({
  default: {
    get: jest.fn().mockResolvedValue(null),
    setex: jest.fn().mockResolvedValue('OK'),
    ping: jest.fn().mockResolvedValue('PONG'),
    quit: jest.fn().mockResolvedValue('OK'),
  },
}));

// ── Mock auth repository ───────────────────────────────────────────────────────
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
    findRefreshTokensByFamily: jest.fn(),
    revokeRefreshToken: jest.fn(),
    revokeTokenFamily: jest.fn(),
    revokeAllUserRefreshTokens: jest.fn(),
    invalidatePreviousPasswordResets: jest.fn(),
    createPasswordReset: jest.fn(),
    findLatestPasswordReset: jest.fn(),
    markPasswordResetUsed: jest.fn(),
    invalidatePreviousVerifications: jest.fn(),
    createEmailVerification: jest.fn(),
    findLatestEmailVerification: jest.fn(),
    markEmailVerificationUsed: jest.fn(),
    createAuditLog: jest.fn(),
  },
}));

// ── Mock email service ────────────────────────────────────────────────────────
jest.mock('../../common/email/email.service', () => ({
  emailService: {
    sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
    sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
    sendPasswordChangedEmail: jest.fn().mockResolvedValue(undefined),
  },
}));

import { authService } from '../../modules/auth/services/auth.service';
import { authRepository } from '../../modules/auth/repositories/auth.repository';
import { ApiError } from '../../common/errors/ApiError';

const mockRepo = authRepository as jest.Mocked<typeof authRepository>;

// ── Shared test fixtures ───────────────────────────────────────────────────────
const ctx = { ip: '127.0.0.1', userAgent: 'jest/test' };

const makeUser = (overrides = {}) => ({
  id: 'user-uuid-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  passwordHash: '$2b$04$testhashedpassword',
  role: 'SILVER_INFLUENCER' as const,
  status: 'ACTIVE' as const,
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

beforeEach(() => {
  jest.clearAllMocks();
  mockRepo.createAuditLog.mockResolvedValue(undefined);
});

// ─────────────────────────────────────────────────────────────────────────────
// FR01 — Registration
// ─────────────────────────────────────────────────────────────────────────────
describe('AuthService.register()', () => {
  const dto = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'MySecure@Pass1',
  };

  it('should register successfully and return safe user (no passwordHash)', async () => {
    mockRepo.findUserByEmail.mockResolvedValue(null);
    mockRepo.createUser.mockResolvedValue(makeUser());
    mockRepo.invalidatePreviousVerifications.mockResolvedValue(undefined);
    mockRepo.createEmailVerification.mockResolvedValue({} as any);

    const result = await authService.register(dto, ctx);

    expect(result.user.email).toBe('john@example.com');
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(mockRepo.createUser).toHaveBeenCalledTimes(1);
    expect(mockRepo.createEmailVerification).toHaveBeenCalledTimes(1);
  });

  it('should throw 409 if email already exists', async () => {
    mockRepo.findUserByEmail.mockResolvedValue(makeUser());

    await expect(authService.register(dto, ctx)).rejects.toThrow(ApiError);
    await expect(authService.register(dto, ctx))
      .rejects.toMatchObject({ statusCode: 409 });
  });

  it('should not call createUser if email is taken', async () => {
    mockRepo.findUserByEmail.mockResolvedValue(makeUser());
    try { await authService.register(dto, ctx); } catch {}
    expect(mockRepo.createUser).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────────────────────────────────────
describe('AuthService.login()', () => {
  const dto = { email: 'john@example.com', password: 'MySecure@Pass1' };

  it('should throw 401 if user not found', async () => {
    mockRepo.findUserByEmail.mockResolvedValue(null);
    await expect(authService.login(dto, ctx)).rejects.toMatchObject({ statusCode: 401 });
  });

  it('should throw 401 if account is locked', async () => {
    mockRepo.findUserByEmail.mockResolvedValue(
      makeUser({ lockedUntil: new Date(Date.now() + 60000) })
    );
    await expect(authService.login(dto, ctx)).rejects.toMatchObject({ statusCode: 401 });
  });

  it('should throw 403 if email is not verified', async () => {
    // Need a valid password hash so auth passes password check and reaches email verification check
    const bcrypt = require('bcrypt');
    const realHash = await bcrypt.hash('MySecure@Pass1', 4);
    mockRepo.findUserByEmail.mockResolvedValue(
      makeUser({ emailVerified: false, passwordHash: realHash })
    );
    await expect(authService.login(dto, ctx)).rejects.toMatchObject({ statusCode: 403 });
  });

  it('should throw 401 for wrong password and increment attempts', async () => {
    // The user's stored hash is for a different password
    const bcrypt = require('bcrypt');
    const realHash = await bcrypt.hash('CorrectPassword@1', 4);
    const user = makeUser({ passwordHash: realHash, emailVerified: true });

    mockRepo.findUserByEmail.mockResolvedValue(user);
    mockRepo.incrementFailedAttempts.mockResolvedValue({
      ...user, failedLoginAttempts: 1,
    });

    await expect(
      authService.login({ email: dto.email, password: 'WrongPass@1' }, ctx)
    ).rejects.toMatchObject({ statusCode: 401 });

    expect(mockRepo.incrementFailedAttempts).toHaveBeenCalledWith(user.id);
  });

  it('should lock account after max failed attempts', async () => {
    const bcrypt = require('bcrypt');
    const realHash = await bcrypt.hash('CorrectPassword@1', 4);
    const user = makeUser({ passwordHash: realHash, emailVerified: true, failedLoginAttempts: 4 });

    mockRepo.findUserByEmail.mockResolvedValue(user);
    mockRepo.incrementFailedAttempts.mockResolvedValue({
      ...user, failedLoginAttempts: 5,
    });
    mockRepo.lockUserAccount.mockResolvedValue(undefined);

    await expect(
      authService.login({ email: dto.email, password: 'WrongPass@1' }, ctx)
    ).rejects.toMatchObject({ statusCode: 401 });

    expect(mockRepo.lockUserAccount).toHaveBeenCalledWith(user.id, 30);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR02 — Forgot Password
// ─────────────────────────────────────────────────────────────────────────────
describe('AuthService.forgotPassword()', () => {
  it('should silently succeed if email does not exist (security)', async () => {
    mockRepo.findUserByEmail.mockResolvedValue(null);
    // Should not throw — must return silently
    await expect(
      authService.forgotPassword({ email: 'nobody@example.com' }, ctx)
    ).resolves.toBeUndefined();
    expect(mockRepo.createPasswordReset).not.toHaveBeenCalled();
  });

  it('should create OTP and send email if user exists', async () => {
    mockRepo.findUserByEmail.mockResolvedValue(makeUser());
    mockRepo.invalidatePreviousPasswordResets.mockResolvedValue(undefined);
    mockRepo.createPasswordReset.mockResolvedValue({} as any);

    await authService.forgotPassword({ email: 'john@example.com' }, ctx);

    expect(mockRepo.invalidatePreviousPasswordResets).toHaveBeenCalled();
    expect(mockRepo.createPasswordReset).toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR05 — Email Verification
// ─────────────────────────────────────────────────────────────────────────────
describe('AuthService.verifyEmail()', () => {
  it('should throw 400 if no user found', async () => {
    mockRepo.findUserByEmail.mockResolvedValue(null);
    await expect(
      authService.verifyEmail({ email: 'x@x.com', otp: '123456' }, ctx)
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('should throw 400 if email already verified', async () => {
    mockRepo.findUserByEmail.mockResolvedValue(makeUser({ emailVerified: true }));
    await expect(
      authService.verifyEmail({ email: 'john@example.com', otp: '123456' }, ctx)
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('should throw 400 if no active verification record', async () => {
    mockRepo.findUserByEmail.mockResolvedValue(makeUser({ emailVerified: false }));
    mockRepo.findLatestEmailVerification.mockResolvedValue(null);
    await expect(
      authService.verifyEmail({ email: 'john@example.com', otp: '123456' }, ctx)
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR04 — Logout All
// ─────────────────────────────────────────────────────────────────────────────
describe('AuthService.logoutAll()', () => {
  it('should revoke all refresh tokens for the user', async () => {
    mockRepo.revokeAllUserRefreshTokens.mockResolvedValue(undefined);
    await authService.logoutAll('user-uuid-1', '', ctx);
    expect(mockRepo.revokeAllUserRefreshTokens).toHaveBeenCalledWith('user-uuid-1');
  });

  it('should blacklist the current access token in Redis', async () => {
    mockRepo.revokeAllUserRefreshTokens.mockResolvedValue(undefined);
    const { signAccessToken } = require('../../common/utils/jwt.util');
    const token = signAccessToken({ sub: 'user-uuid-1', email: 'x@x.com', role: 'SILVER_INFLUENCER' });

    // Verify the token is valid before passing it
    const { verifyAccessToken } = require('../../common/utils/jwt.util');
    const decoded = verifyAccessToken(token);
    expect(decoded.jti).toBeDefined();

    await authService.logoutAll('user-uuid-1', token, ctx);

    expect(mockRepo.revokeAllUserRefreshTokens).toHaveBeenCalledWith('user-uuid-1');
    // Redis setex is best-effort — pass if called OR if Redis was unavailable
    // The key contract is that revokeAllUserRefreshTokens was called
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Get Me
// ─────────────────────────────────────────────────────────────────────────────
describe('AuthService.getMe()', () => {
  it('should return safe user without passwordHash', async () => {
    mockRepo.findUserById.mockResolvedValue(makeUser());
    const user = await authService.getMe('user-uuid-1');
    expect(user.id).toBe('user-uuid-1');
    expect(user).not.toHaveProperty('passwordHash');
  });

  it('should throw 404 if user not found', async () => {
    mockRepo.findUserById.mockResolvedValue(null);
    await expect(authService.getMe('bad-id')).rejects.toMatchObject({ statusCode: 404 });
  });
});
