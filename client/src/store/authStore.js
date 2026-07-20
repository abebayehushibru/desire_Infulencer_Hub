import { create } from 'zustand';
import { authService } from '../services/authService';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  // ── Login ───────────────────────────────────────────────────────────────────
  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const { data: res } = await authService.login(credentials);
      // Backend: { success, message, data: { user, accessToken, accessTokenExpiresAt } }
      const { user, accessToken } = res.data;
      localStorage.setItem('token', accessToken);
      set({ user, token: accessToken, loading: false, error: null });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  // ── Register ────────────────────────────────────────────────────────────────
  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      await authService.register(userData);
      set({ loading: false, error: null });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  // ── Verify Email ────────────────────────────────────────────────────────────
  verifyEmail: async (email, otp) => {
    set({ loading: true, error: null });
    try {
      await authService.verifyEmail(email, otp);
      set({ loading: false, error: null });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Verification failed. Please try again.';
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  // ── Resend Verification ─────────────────────────────────────────────────────
  resendVerification: async (email) => {
    try {
      await authService.resendVerification(email);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Could not resend code.';
      return { success: false, message };
    }
  },

  // ── Forgot Password ─────────────────────────────────────────────────────────
  forgotPassword: async (email) => {
    set({ loading: true, error: null });
    try {
      await authService.forgotPassword(email);
      set({ loading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Something went wrong.';
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  // ── Verify Reset Code ───────────────────────────────────────────────────────
  verifyResetCode: async (email, otp) => {
    set({ loading: true, error: null });
    try {
      await authService.verifyResetCode(email, otp);
      set({ loading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid or expired code.';
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  // ── Reset Password ──────────────────────────────────────────────────────────
  resetPassword: async (email, otp, newPassword) => {
    set({ loading: true, error: null });
    try {
      await authService.resetPassword(email, otp, newPassword);
      set({ loading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Password reset failed.';
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  // ── Logout ──────────────────────────────────────────────────────────────────
  logout: async () => {
    try {
      await authService.logout();
    } catch {
      // Still clear local state even if server call fails
    } finally {
      localStorage.removeItem('token');
      set({ user: null, token: null, error: null });
    }
  },

  // ── Fetch current user (session restore on page refresh) ───────────────────
  fetchMe: async () => {
    const token = get().token;
    if (!token) return;
    set({ loading: true });
    try {
      const { data: res } = await authService.me();
      set({ user: res.data, loading: false });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null, loading: false });
    }
  },

  clearError: () => set({ error: null }),
  setUser: (user) => set({ user }),
}));

export default useAuthStore;
