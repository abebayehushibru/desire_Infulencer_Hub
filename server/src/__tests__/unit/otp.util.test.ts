// ─────────────────────────────────────────────────────────────────────────────
// Unit Tests — OTP Utility
// ─────────────────────────────────────────────────────────────────────────────

import {
  generateOtp,
  hashOtp,
  verifyOtp,
  getOtpExpiry,
  isOtpExpired,
} from '../../common/utils/otp.util';

describe('OTP Utility', () => {
  describe('generateOtp()', () => {
    it('should generate a 6-digit numeric string', () => {
      const otp = generateOtp();
      expect(otp).toMatch(/^\d{6}$/);
    });

    it('should generate unique OTPs', () => {
      const otps = new Set(Array.from({ length: 100 }, () => generateOtp()));
      // With 900000 possible values, 100 should be unique (extremely high probability)
      expect(otps.size).toBeGreaterThan(90);
    });

    it('should always be exactly 6 characters', () => {
      for (let i = 0; i < 20; i++) {
        expect(generateOtp()).toHaveLength(6);
      }
    });
  });

  describe('hashOtp() and verifyOtp()', () => {
    it('should hash and verify OTP correctly', async () => {
      const otp = generateOtp();
      const hash = await hashOtp(otp);

      expect(hash).not.toBe(otp);
      expect(hash.length).toBeGreaterThan(20);

      const valid = await verifyOtp(otp, hash);
      expect(valid).toBe(true);
    });

    it('should reject wrong OTP', async () => {
      const otp = '123456';
      const wrongOtp = '654321';
      const hash = await hashOtp(otp);

      const valid = await verifyOtp(wrongOtp, hash);
      expect(valid).toBe(false);
    });

    it('should produce different hashes for same OTP (bcrypt salt)', async () => {
      const otp = '123456';
      const hash1 = await hashOtp(otp);
      const hash2 = await hashOtp(otp);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('getOtpExpiry()', () => {
    it('should return a date in the future', () => {
      const expiry = getOtpExpiry(10);
      expect(expiry.getTime()).toBeGreaterThan(Date.now());
    });

    it('should be approximately 10 minutes in the future', () => {
      const now = Date.now();
      const expiry = getOtpExpiry(10);
      const diff = expiry.getTime() - now;
      expect(diff).toBeGreaterThanOrEqual(9 * 60 * 1000);
      expect(diff).toBeLessThanOrEqual(11 * 60 * 1000);
    });
  });

  describe('isOtpExpired()', () => {
    it('should return true for past date', () => {
      const past = new Date(Date.now() - 1000);
      expect(isOtpExpired(past)).toBe(true);
    });

    it('should return false for future date', () => {
      const future = new Date(Date.now() + 60000);
      expect(isOtpExpired(future)).toBe(false);
    });
  });
});
