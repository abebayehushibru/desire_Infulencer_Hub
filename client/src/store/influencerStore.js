import { create } from 'zustand';
import { influencerService } from '../services/influencerService';

const useInfluencerStore = create((set) => ({
  influencers: [],
  influencer: null,
  loading: false,
  error: null,

  fetchInfluencers: async (params) => {
    set({ loading: true, error: null });
    try {
      const { data } = await influencerService.getAll(params);
      set({ influencers: data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load influencers', loading: false });
    }
  },

  fetchInfluencer: async (id) => {
    set({ loading: true, error: null });
    try {
      const { data } = await influencerService.getById(id);
      set({ influencer: data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load influencer', loading: false });
    }
  },

  clearInfluencer: () => set({ influencer: null }),
}));

export default useInfluencerStore;
