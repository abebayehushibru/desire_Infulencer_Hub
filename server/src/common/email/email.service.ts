// ─────────────────────────────────────────────────────────────────────────────
// Email Service — Nodemailer with HTML templates
// Supports: Verification, Password Reset, Welcome, Password Changed
// ─────────────────────────────────────────────────────────────────────────────

import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';
import { env } from '../../config/env';
import logger from '../logger/logger';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth:
        env.SMTP_USER && env.SMTP_PASS
          ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
          : undefined,
    });
  }

  // ── Sanitize inputs to prevent SMTP injection via CRLF ──────────────────────
  private sanitize(input: string): string {
    // Strip CRLF and other control characters that could enable header injection
    return input.replace(/[\r\n\t\0\x08\x0B\x0C\x1F\x7F]/g, ' ').trim();
  }

  // ── Core send method ────────────────────────────────────────────────────────
  private async send(options: SendEmailOptions): Promise<void> {
    const mailOptions: SendMailOptions = {
      from: `"${this.sanitize(env.SMTP_FROM_NAME)}" <${this.sanitize(env.SMTP_FROM_EMAIL)}>`,
      to: this.sanitize(options.to),
      subject: this.sanitize(options.subject),
      html: options.html,
      text: options.text || this.htmlToText(options.html),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info('Email sent', {
        to: options.to,
        subject: options.subject,
        messageId: info.messageId,
      });
    } catch (error) {
      logger.error('Email send failed', {
        to: options.to,
        subject: options.subject,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      // Don't throw — email failure should not block the main flow
      // Log and continue. Implement retry queue in production.
    }
  }

  // ── Strip HTML tags for plain text fallback ─────────────────────────────────
  private htmlToText(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  // ── Base HTML wrapper ────────────────────────────────────────────────────────
  private baseTemplate(content: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>InfluenceHub</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f4f5; color: #111827; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.1); }
    .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px; text-align: center; }
    .header h1 { color: #fff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { color: rgba(255,255,255,.8); margin-top: 4px; font-size: 14px; }
    .body { padding: 40px 32px; }
    .otp-box { background: #f9fafb; border: 2px dashed #e5e7eb; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
    .otp-code { font-size: 42px; font-weight: 700; letter-spacing: 12px; color: #6366f1; font-family: monospace; }
    .otp-expiry { color: #6b7280; font-size: 13px; margin-top: 8px; }
    .btn { display: inline-block; padding: 14px 32px; background: #6366f1; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 16px 0; }
    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #92400e; margin-top: 16px; }
    .footer { background: #f9fafb; padding: 20px 32px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; }
    p { line-height: 1.6; color: #374151; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>InfluenceHub</h1>
      <p>Enterprise Influencer Marketing Platform</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} InfluenceHub. All rights reserved.</p>
      <p>This is an automated message. Please do not reply.</p>
    </div>
  </div>
</body>
</html>`;
  }

  // ── Escape HTML to prevent XSS in email templates ───────────────────────────
  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  // ── FR05 Email Verification ──────────────────────────────────────────────────
  async sendVerificationEmail(params: {
    to: string;
    firstName: string;
    otp: string;
  }): Promise<void> {
    const safeName = this.escapeHtml(this.sanitize(params.firstName));
    const safeOtp  = this.escapeHtml(params.otp.replace(/\D/g, '').slice(0, 6)); // digits only
    const content = `
      <p>Hi <strong>${safeName}</strong>,</p>
      <p>Welcome to InfluenceHub! To activate your account, please use the verification code below:</p>
      <div class="otp-box">
        <div class="otp-code">${safeOtp}</div>
        <div class="otp-expiry">⏱ This code expires in 10 minutes</div>
      </div>
      <p>Enter this code in the app to verify your email address.</p>
      <div class="warning">
        <strong>Security Notice:</strong> If you did not create an account on InfluenceHub, please ignore this email. Do not share this code with anyone.
      </div>
    `;

    await this.send({
      to: params.to,
      subject: 'Verify your InfluenceHub account',
      html: this.baseTemplate(content),
    });
  }

  // ── FR02 Password Reset OTP ──────────────────────────────────────────────────
  async sendPasswordResetEmail(params: {
    to: string;
    firstName: string;
    otp: string;
  }): Promise<void> {
    const safeName = this.escapeHtml(this.sanitize(params.firstName));
    const safeOtp  = this.escapeHtml(params.otp.replace(/\D/g, '').slice(0, 6));
    const content = `
      <p>Hi <strong>${safeName}</strong>,</p>
      <p>We received a request to reset your InfluenceHub password. Use the code below:</p>
      <div class="otp-box">
        <div class="otp-code">${safeOtp}</div>
        <div class="otp-expiry">⏱ This code expires in 10 minutes</div>
      </div>
      <p>This code can only be used once. If you request another reset, a new code will be generated.</p>
      <div class="warning">
        <strong>Security Notice:</strong> If you did not request a password reset, please secure your account immediately. Do not share this code with anyone — InfluenceHub staff will never ask for it.
      </div>
    `;

    await this.send({
      to: params.to,
      subject: 'Reset your InfluenceHub password',
      html: this.baseTemplate(content),
    });
  }

  // ── Welcome email (after verification) ──────────────────────────────────────
  async sendWelcomeEmail(params: {
    to: string;
    firstName: string;
    role: string;
  }): Promise<void> {
    const content = `
      <p>Hi <strong>${params.firstName}</strong>,</p>
      <p>Your InfluenceHub account has been verified and is ready to use!</p>
      <p>You are registered as: <strong>${params.role.replace('_', ' ')}</strong></p>
      <p>You can now log in and start using the platform.</p>
      <a href="${env.IS_PRODUCTION ? 'https://app.influencehub.com' : 'http://localhost:3000'}/login" class="btn">
        Go to Dashboard →
      </a>
    `;

    await this.send({
      to: params.to,
      subject: 'Welcome to InfluenceHub — Account Activated',
      html: this.baseTemplate(content),
    });
  }

  // ── Password changed notification ────────────────────────────────────────────
  async sendPasswordChangedEmail(params: {
    to: string;
    firstName: string;
    ip: string;
  }): Promise<void> {
    const content = `
      <p>Hi <strong>${params.firstName}</strong>,</p>
      <p>Your InfluenceHub password was successfully changed.</p>
      <p><strong>Time:</strong> ${new Date().toUTCString()}<br/>
      <strong>IP Address:</strong> ${params.ip}</p>
      <div class="warning">
        <strong>Security Notice:</strong> If you did not change your password, your account may be compromised. Please contact support immediately and change your password now.
      </div>
    `;

    await this.send({
      to: params.to,
      subject: 'Your InfluenceHub password was changed',
      html: this.baseTemplate(content),
    });
  }

  // ── Verify SMTP connection ────────────────────────────────────────────────────
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      logger.info('SMTP connection verified successfully');
      return true;
    } catch (error) {
      logger.warn('SMTP connection verification failed', {
        error: error instanceof Error ? error.message : 'Unknown',
      });
      return false;
    }
  }
}

export const emailService = new EmailService();
