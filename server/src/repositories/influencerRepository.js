import bcrypt from 'bcryptjs';
import { InfluencerModel } from '../models/influencer.js';

export const InfluencerRepository = {
  /**
   * Get paginated list of influencers with optional filters.
   * @param {{ search, platform, level, page, limit }} options
   * @returns {{ data: Influencer[] }}
   */
  findAll: async ({ search = '', platform = '', level = '', page = 1, limit = 20 }) => {
    const offset = (Number(page) - 1) * Number(limit);

    const data = await InfluencerModel.findAll({
      search,
      platform,
      level,
      limit: Number(limit),
      offset,
    });

    return { data };
  },

  /**
   * Get a single influencer by ID.
   * @param {string} id
   * @returns {Influencer | null}
   */
  findById: async (id) => {
    return await InfluencerModel.findById(id);
  },

  /**
   * Create a new influencer — hashes password before saving.
   * @param {object} userData
   * @param {object} profileData
   * @returns {Influencer}
   */
  create: async (userData, profileData) => {
    const passwordHash = await bcrypt.hash(userData.password, 10);
    return await InfluencerModel.create(
      { ...userData, passwordHash },
      profileData
    );
  },

  /**
   * Update an influencer — optionally rehashes password if changed.
   * @param {string} id
   * @param {object} userData
   * @param {object} profileData
   * @returns {Influencer | null}
   */
  update: async (id, userData, profileData) => {
    const updatedUser = { ...userData };

    if (updatedUser.password) {
      updatedUser.password_hash = await bcrypt.hash(updatedUser.password, 10);
      delete updatedUser.password;
    }

    return await InfluencerModel.update(id, updatedUser, profileData);
  },

  /**
   * Delete an influencer by ID.
   * @param {string} id
   */
  delete: async (id) => {
    return await InfluencerModel.delete(id);
  },
};
