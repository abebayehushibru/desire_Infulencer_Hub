// ─────────────────────────────────────────────────────────────────────────────
// Unit Tests — JWT Utility
// ─────────────────────────────────────────────────────────────────────────────

// Set env vars before importing modules
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_min_64_chars_long_abcdefghijklmnopqrstuvwxyz1234';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_min_64_chars_long_abcdefghijklmnopqrstuvwxyz12';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '30d';

import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
  hashRefreshToken,
  extractBearerToken,
} from '../../common/utils/jwt.util';
import { ApiError } from '../../common/errors/ApiError';

const mockPayload = {
  sub: 'user-uuid-123',
  email: 'test@example.com',
  role: 'SILVER_INFLUENCER' as const,
};

describe('JWT Utility', () => {
  describe('signAccessToken()', () => {
    it('should return a valid JWT string', () => {
      const token = signAccessToken(mockPayload);
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyAccessToken()', () => {
    it('should verify a valid access token', () => {
      const token = signAccessToken(mockPayload);
      const decoded = verifyAccessToken(token);

      expect(decoded.sub).toBe(mockPayload.sub);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.role).toBe(mockPayload.role);
      expect(decoded.jti).toBeDefined();
    });

    it('should throw ApiError for invalid token', () => {
      expect(() => verifyAccessToken('invalid.token.here')).toThrow(ApiError);
    });

    it('should throw ApiError for tampered token', () => {
      const token = signAccessToken(mockPayload);
      const tampered = token.slice(0, -5) + 'XXXXX';
      expect(() => verifyAccessToken(tampered)).toThrow(ApiError);
    });
  });

  describe('signRefreshToken() and verifyRefreshToken()', () => {
    it('should sign and verify a refresh token', () => {
      const token = signRefreshToken(mockPayload, 'test-family');
      const decoded = verifyRefreshToken(token);

      expect(decoded.sub).toBe(mockPayload.sub);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.jti).toBeDefined();
    });
  });

  describe('generateTokenPair()', () => {
    it('should return both access and refresh tokens with expiry dates', () => {
      const pair = generateTokenPair(
        mockPayload.sub,
        mockPayload.email,
        mockPayload.role as any
      );

      expect(pair.accessToken).toBeDefined();
      expect(pair.refreshToken).toBeDefined();
      expect(pair.accessTokenExpiresAt).toBeInstanceOf(Date);
      expect(pair.refreshTokenExpiresAt).toBeInstanceOf(Date);
      expect(pair.refreshTokenExpiresAt.getTime()).toBeGreaterThan(
        pair.accessTokenExpiresAt.getTime()
      );
    });
  });

  describe('hashRefreshToken()', () => {
    it('should produce a consistent hash', () => {
      const token = 'some-refresh-token';
      const hash1 = hashRefreshToken(token);
      const hash2 = hashRefreshToken(token);
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different tokens', () => {
      const h1 = hashRefreshToken('token-a');
      const h2 = hashRefreshToken('token-b');
      expect(h1).not.toBe(h2);
    });
  });

  describe('extractBearerToken()', () => {
    it('should extract token from valid Bearer header', () => {
      const token = extractBearerToken('Bearer mytoken123');
      expect(token).toBe('mytoken123');
    });

    it('should return null for missing header', () => {
      expect(extractBearerToken(undefined)).toBeNull();
    });

    it('should return null for non-Bearer header', () => {
      expect(extractBearerToken('Basic credentials')).toBeNull();
    });

    it('should return null for "Bearer " with no token', () => {
      expect(extractBearerToken('Bearer ')).toBeNull();
    });
  });
});
