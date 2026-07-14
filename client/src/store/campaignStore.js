import { create } from 'zustand';
import { campaignService } from '../services/campaignService';

const useCampaignStore = create((set) => ({
  campaigns: [],
  campaign: null,
  loading: false,
  error: null,

  fetchCampaigns: async (params) => {
    set({ loading: true, error: null });
    try {
      const { data } = await campaignService.getAll(params);
      set({ campaigns: data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load campaigns', loading: false });
    }
  },

  fetchCampaign: async (id) => {
    set({ loading: true, error: null });
    try {
      const { data } = await campaignService.getById(id);
      set({ campaign: data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load campaign', loading: false });
    }
  },

  clearCampaign: () => set({ campaign: null }),
}));

export default useCampaignStore;
