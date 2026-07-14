import api from './api';

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => {
    localStorage.removeItem('token');
  },
  me: () => api.get('/auth/me'),
};
