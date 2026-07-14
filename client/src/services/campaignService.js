import api from './api';

export const campaignService = {
  getAll: (params) => api.get('/campaigns', { params }),
  getById: (id) => api.get(`/campaigns/${id}`),
  create: (data) => api.post('/campaigns', data),
  update: (id, data) => api.put(`/campaigns/${id}`, data),
  delete: (id) => api.delete(`/campaigns/${id}`),
  getClaims: (params) => api.get('/campaigns/claims', { params }),
  getClaimById: (id) => api.get(`/campaigns/claims/${id}`),
};
