import { create } from 'zustand';
import { authService } from '../services/authService';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authService.login(credentials);
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Login failed', loading: false });
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, token: null });
  },

  setUser: (user) => set({ user }),
}));

export default useAuthStore;
