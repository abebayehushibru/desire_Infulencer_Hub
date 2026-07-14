import { create } from 'zustand';
import { communityService } from '../services/communityService';

const useCommunityStore = create((set) => ({
  communities: [],
  community: null,
  loading: false,
  error: null,

  fetchCommunities: async (params) => {
    set({ loading: true, error: null });
    try {
      const { data } = await communityService.getAll(params);
      set({ communities: data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load communities', loading: false });
    }
  },

  fetchCommunity: async (id) => {
    set({ loading: true, error: null });
    try {
      const { data } = await communityService.getById(id);
      set({ community: data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load community', loading: false });
    }
  },

  clearCommunity: () => set({ community: null }),
}));

export default useCommunityStore;
