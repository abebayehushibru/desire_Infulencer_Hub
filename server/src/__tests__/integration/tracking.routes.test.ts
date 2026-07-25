// ─────────────────────────────────────────────────────────────────────────────
// Integration Tests — Tracking, Earnings, Analytics & Withdrawals (FR24–FR31)
// ─────────────────────────────────────────────────────────────────────────────

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_min_64_chars_long_abcdefghijklmnopqrstuvwxyz1234';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_min_64_chars_long_abcdefghijklmnopqrstuvwxyz12';
process.env.APP_ENCRYPTION_KEY = '12345678901234567890123456789012';

jest.mock('../../config/redis', () => ({
  default: {
    get: jest.fn().mockResolvedValue(null),
    setex: jest.fn().mockResolvedValue('OK'),
    ping: jest.fn().mockResolvedValue('PONG'),
    quit: jest.fn().mockResolvedValue('OK'),
  },
}));

jest.mock('../../modules/tracking/services/tracking.service', () => ({
  trackingService: {
    trackClick: jest.fn(),
    trackConversion: jest.fn(),
    trackReferral: jest.fn(),
    getEarningsDashboard: jest.fn(),
    getEarningsHistory: jest.fn(),
    getEarningsByCampaign: jest.fn(),
    getBusinessAnalytics: jest.fn(),
    getCommunityMemberPerformance: jest.fn(),
    getMemberStats: jest.fn(),
    createWithdrawal: jest.fn(),
    cancelWithdrawal: jest.fn(),
    getWithdrawalHistory: jest.fn(),
    getWithdrawalById: jest.fn(),
    getAllWithdrawals: jest.fn(),
    approveWithdrawal: jest.fn(),
    rejectWithdrawal: jest.fn(),
  },
}));

import request from 'supertest';
import app from '../../app';
import { trackingService as mockSvc } from '../../modules/tracking/services/tracking.service';
import { signAccessToken } from '../../common/utils/jwt.util';

const svc = mockSvc as jest.Mocked<typeof mockSvc>;

const influencerToken = signAccessToken({ sub: 'inf-uuid-1', email: 'inf@test.com', role: 'INFLUENCER' });
const businessToken   = signAccessToken({ sub: 'biz-uuid-1', email: 'biz@test.com', role: 'BUSINESS' });
const adminToken      = signAccessToken({ sub: 'adm-uuid-1', email: 'adm@test.com', role: 'ADMIN' });

describe('Module 5 REST API Integration Tests (FR24–FR31)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // FR24 & FR25 — Public Tracking Endpoints
  // ─────────────────────────────────────────────────────────────────────────
  describe('POST /api/v1/tracking/click', () => {
    it('201 — records click with valid code', async () => {
      svc.trackClick.mockResolvedValue({ eventId: 'evt-1', isDuplicate: false, campaignId: 'c-1' });

      const res = await request(app)
        .post('/api/v1/tracking/click')
        .send({ code: 'TRK12345678' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.eventId).toBe('evt-1');
    });

    it('422 — validation error when code missing', async () => {
      const res = await request(app)
        .post('/api/v1/tracking/click')
        .send({});

      expect(res.status).toBe(422);
    });
  });

  describe('POST /api/v1/tracking/conversion', () => {
    it('201 — records conversion with valid code', async () => {
      svc.trackConversion.mockResolvedValue({ eventId: 'evt-c-1', earningId: 'e-1', amount: 80, earnings: [] });

      const res = await request(app)
        .post('/api/v1/tracking/conversion')
        .send({ code: 'TRK12345678' });

      expect(res.status).toBe(201);
      expect(res.body.data.amount).toBe(80);
    });
  });

  describe('POST /api/v1/tracking/referral', () => {
    it('201 — records referral conversion', async () => {
      svc.trackReferral.mockResolvedValue({ eventId: 'evt-r-1', earningId: 'e-2', amount: 150, earnings: [] });

      const res = await request(app)
        .post('/api/v1/tracking/referral')
        .send({ code: 'REFCODE1' });

      expect(res.status).toBe(201);
      expect(res.body.data.eventId).toBe('evt-r-1');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // FR26 — Earnings Endpoints
  // ─────────────────────────────────────────────────────────────────────────
  describe('GET /api/v1/earnings/dashboard', () => {
    it('200 — returns earnings dashboard for influencer', async () => {
      svc.getEarningsDashboard.mockResolvedValue({
        totalEarnings: 1000,
        pendingBalance: 200,
        availableBalance: 800,
        withdrawnAmount: 0,
      } as any);

      const res = await request(app)
        .get('/api/v1/earnings/dashboard')
        .set('Authorization', `Bearer ${influencerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.totalEarnings).toBe(1000);
    });

    it('401 — unauthorized without token', async () => {
      const res = await request(app).get('/api/v1/earnings/dashboard');
      expect(res.status).toBe(401);
    });

    it('403 — forbidden for business owner', async () => {
      const res = await request(app)
        .get('/api/v1/earnings/dashboard')
        .set('Authorization', `Bearer ${businessToken}`);

      expect(res.status).toBe(403);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // FR28 — Analytics
  // ─────────────────────────────────────────────────────────────────────────
  describe('GET /api/v1/analytics/business', () => {
    it('200 — returns business analytics for business user', async () => {
      svc.getBusinessAnalytics.mockResolvedValue({ totalCampaigns: 5 } as any);

      const res = await request(app)
        .get('/api/v1/analytics/business')
        .set('Authorization', `Bearer ${businessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.totalCampaigns).toBe(5);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // FR30 & FR31 — Withdrawals
  // ─────────────────────────────────────────────────────────────────────────
  describe('Withdrawal Routes', () => {
    const validBankDetails = {
      accountName: 'John Doe',
      accountNumber: '1234567890',
      bankName: 'First Bank',
      country: 'US',
    };

    it('POST /api/v1/withdrawals — 201 creates withdrawal request', async () => {
      svc.createWithdrawal.mockResolvedValue({
        id: 'w-100',
        amount: 250,
        status: 'PENDING',
        requestedAt: new Date().toISOString(),
      } as any);

      const res = await request(app)
        .post('/api/v1/withdrawals')
        .set('Authorization', `Bearer ${influencerToken}`)
        .send({ amount: 250, bankDetails: validBankDetails });

      expect(res.status).toBe(201);
      expect(res.body.data.id).toBe('w-100');
    });

    it('GET /api/v1/withdrawals/admin/all — 200 list all withdrawals for admin', async () => {
      svc.getAllWithdrawals.mockResolvedValue({ data: [{ id: 'w-1' }], meta: { total: 1 } } as any);

      const res = await request(app)
        .get('/api/v1/withdrawals/admin/all')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('PATCH /api/v1/withdrawals/admin/:id/approve — 200 approves request', async () => {
      svc.approveWithdrawal.mockResolvedValue({ id: 'w-1', status: 'APPROVED' } as any);

      const res = await request(app)
        .patch('/api/v1/withdrawals/admin/11111111-1111-4111-a111-111111111111/approve')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ transactionRef: 'TX123' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('APPROVED');
    });

    it('PATCH /api/v1/withdrawals/admin/:id/reject — 200 rejects request', async () => {
      svc.rejectWithdrawal.mockResolvedValue({ id: 'w-1', status: 'REJECTED' } as any);

      const res = await request(app)
        .patch('/api/v1/withdrawals/admin/11111111-1111-4111-a111-111111111111/reject')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reviewNote: 'Incorrect account name' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('REJECTED');
    });
  });
});
