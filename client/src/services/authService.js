import api from './api';

export const authService = {
  // POST /api/v1/auth/login
  // Backend returns: { data: { user, accessToken, accessTokenExpiresAt } }
  login: (credentials) => api.post('/auth/login', credentials),

  // POST /api/v1/auth/register
  register: (userData) => api.post('/auth/register', userData),

  // POST /api/v1/auth/logout — requires auth token
  logout: () => api.post('/auth/logout'),

  // POST /api/v1/auth/logout-all — requires auth token
  logoutAll: () => api.post('/auth/logout-all'),

  // GET /api/v1/auth/me — requires auth token
  me: () => api.get('/auth/me'),

  // POST /api/v1/auth/refresh — uses HttpOnly cookie
  refresh: () => api.post('/auth/refresh'),

  // POST /api/v1/auth/forgot-password
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),

  // POST /api/v1/auth/verify-reset-code
  verifyResetCode: (email, otp) => api.post('/auth/verify-reset-code', { email, otp }),

  // POST /api/v1/auth/reset-password
  resetPassword: (email, otp, newPassword) =>
    api.post('/auth/reset-password', { email, otp, newPassword }),

  // POST /api/v1/auth/verify-email
  verifyEmail: (email, otp) => api.post('/auth/verify-email', { email, otp }),

  // POST /api/v1/auth/resend-verification
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
};
