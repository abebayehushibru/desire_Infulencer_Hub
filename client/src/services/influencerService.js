import api from './api';

export const influencerService = {
  getAll: (params) => api.get('/influencers', { params }),
  getById: (id) => api.get(`/influencers/${id}`),
  create: (data) => api.post('/influencers', data),
  update: (id, data) => api.put(`/influencers/${id}`, data),
  delete: (id) => api.delete(`/influencers/${id}`),
};
