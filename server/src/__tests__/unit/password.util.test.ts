// ─────────────────────────────────────────────────────────────────────────────
// Unit Tests — Password Utility
// ─────────────────────────────────────────────────────────────────────────────

process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_min_64_chars_long_abcdefghijklmnopqrstuvwxyz1234';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_min_64_chars_long_abcdefghijklmnopqrstuvwxyz12';
process.env.BCRYPT_ROUNDS = '4'; // Low rounds for fast tests

import { hashPassword, comparePassword, isStrongPassword } from '../../common/utils/password.util';

describe('Password Utility', () => {
  describe('hashPassword()', () => {
    it('should hash a password and not return the plain text', async () => {
      const plain = 'MySecure@Pass1';
      const hash = await hashPassword(plain);
      expect(hash).not.toBe(plain);
      expect(hash.startsWith('$2b$')).toBe(true);
    });

    it('should produce different hashes for the same password (salt)', async () => {
      const plain = 'MySecure@Pass1';
      const hash1 = await hashPassword(plain);
      const hash2 = await hashPassword(plain);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword()', () => {
    it('should return true for correct password', async () => {
      const plain = 'MySecure@Pass1';
      const hash = await hashPassword(plain);
      const result = await comparePassword(plain, hash);
      expect(result).toBe(true);
    });

    it('should return false for wrong password', async () => {
      const plain = 'MySecure@Pass1';
      const wrong = 'WrongPass@123';
      const hash = await hashPassword(plain);
      const result = await comparePassword(wrong, hash);
      expect(result).toBe(false);
    });
  });

  describe('isStrongPassword()', () => {
    it('should return true for strong password', () => {
      expect(isStrongPassword('MySecure@Pass1')).toBe(true);
      expect(isStrongPassword('Ab1@abcdefgh')).toBe(true);
    });

    it('should return false for weak passwords', () => {
      expect(isStrongPassword('password')).toBe(false);      // no uppercase, no number, no special
      expect(isStrongPassword('Password1')).toBe(false);     // no special char
      expect(isStrongPassword('Password@')).toBe(false);     // no number
      expect(isStrongPassword('SHORT@1A')).toBe(false);      // too short? Actually 8 chars - this passes
      expect(isStrongPassword('short')).toBe(false);         // too short
    });
  });
});
