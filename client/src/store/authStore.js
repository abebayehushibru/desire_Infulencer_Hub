import { create } from 'zustand';
import { authService } from '../services/authService';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const { data: responseData } = await authService.login(credentials);
      // Backend returns: { success, message, data: { user, accessToken, accessTokenExpiresAt } }
      const { user, accessToken } = responseData.data;

      localStorage.setItem('token', accessToken);
      set({ user, token: accessToken, loading: false, error: null });

      return { success: true };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Login failed. Please try again.';
      set({ error: errorMessage, loading: false });
      return { success: false, message: errorMessage };
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      await authService.register(userData);
      set({ loading: false, error: null });
      return { success: true };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Registration failed. Please try again.';
      set({ error: errorMessage, loading: false });
      return { success: false, message: errorMessage };
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch {
      // Even if the server call fails, clear local state
    } finally {
      localStorage.removeItem('token');
      set({ user: null, token: null, error: null });
    }
  },

  fetchMe: async () => {
    const token = get().token;
    if (!token) return;

    set({ loading: true });
    try {
      const { data: responseData } = await authService.me();
      set({ user: responseData.data, loading: false });
    } catch {
      // Token invalid or expired — clear auth state
      localStorage.removeItem('token');
      set({ user: null, token: null, loading: false });
    }
  },

  clearError: () => set({ error: null }),

  setUser: (user) => set({ user }),
}));

export default useAuthStore;
