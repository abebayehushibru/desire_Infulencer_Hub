// ─────────────────────────────────────────────────────────────────────────────
// Auth Validators — express-validator chains for all auth routes
// Never trust client input. Sanitize everything.
// ─────────────────────────────────────────────────────────────────────────────

import { body } from 'express-validator';

// ── Reusable field validators ─────────────────────────────────────────────────

const emailField = () =>
  body('email')
    .trim()
    .toLowerCase()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .isLength({ max: 255 }).withMessage('Email must not exceed 255 characters')
    .normalizeEmail();

const passwordField = (fieldName = 'password') =>
  body(fieldName)
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .isLength({ max: 128 }).withMessage('Password must not exceed 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-#])[A-Za-z\d@$!%*?&_\-#]/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    );

const nameField = (fieldName: string, label: string) =>
  body(fieldName)
    .trim()
    .notEmpty().withMessage(`${label} is required`)
    .isLength({ min: 2 }).withMessage(`${label} must be at least 2 characters`)
    .isLength({ max: 100 }).withMessage(`${label} must not exceed 100 characters`)
    .matches(/^[a-zA-Z\s'-]+$/).withMessage(`${label} must contain only letters, spaces, hyphens, or apostrophes`);

const otpField = () =>
  body('otp')
    .trim()
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits')
    .isNumeric().withMessage('OTP must contain only digits');

// ── FR01 Registration validator ───────────────────────────────────────────────
export const registerValidator = [
  nameField('firstName', 'First name'),
  nameField('lastName', 'Last name'),
  emailField(),
  passwordField('password'),
];

// ── Login validator ───────────────────────────────────────────────────────────
export const loginValidator = [
  emailField(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ max: 128 }).withMessage('Password too long'),
];

// ── FR02 Forgot password validator ───────────────────────────────────────────
export const forgotPasswordValidator = [
  emailField(),
];

// ── FR02 Verify reset code validator ─────────────────────────────────────────
export const verifyResetCodeValidator = [
  emailField(),
  otpField(),
];

// ── FR02 Reset password validator ────────────────────────────────────────────
export const resetPasswordValidator = [
  emailField(),
  otpField(),
  passwordField('newPassword'),
];

// ── FR05 Verify email validator ───────────────────────────────────────────────
export const verifyEmailValidator = [
  emailField(),
  otpField(),
];

// ── FR05 Resend verification validator ───────────────────────────────────────
export const resendVerificationValidator = [
  emailField(),
];

// ── Refresh token validator ───────────────────────────────────────────────────
export const refreshTokenValidator = [
  body('refreshToken')
    .optional()
    .isString().withMessage('Refresh token must be a string')
    .isLength({ max: 2048 }).withMessage('Refresh token too long'),
];
