import { CommunityModel } from '../models/community.js';

export const CommunityRepository = {
  /**
   * Get paginated list of communities with optional filters.
   * @param {{ search, status, page, limit }} options
   * @returns {{ data: Community[] }}
   */
  findAll: async ({ search = '', status = '', page = 1, limit = 20 }) => {
    const offset = (Number(page) - 1) * Number(limit);

    const data = await CommunityModel.findAll({
      search,
      status,
      limit: Number(limit),
      offset,
    });

    return { data };
  },

  /**
   * Get a single community by ID.
   * @param {string} id
   * @returns {Community | null}
   */
  findById: async (id) => {
    return await CommunityModel.findById(id);
  },

  /**
   * Create a new community.
   * @param {object} data
   * @returns {Community}
   */
  create: async (data) => {
    return await CommunityModel.create(data);
  },

  /**
   * Update an existing community.
   * @param {string} id
   * @param {object} data
   * @returns {Community | null}
   */
  update: async (id, data) => {
    return await CommunityModel.update(id, data);
  },

  /**
   * Delete a community by ID.
   * @param {string} id
   */
  delete: async (id) => {
    return await CommunityModel.delete(id);
  },

  /**
   * Get all members of a community.
   * @param {string} communityId
   * @returns {{ data: Member[] }}
   */
  getMembers: async (communityId) => {
    const data = await CommunityModel.getMembers(communityId);
    return { data };
  },

  /**
   * Add a member to a community.
   * @param {string} communityId
   * @param {string} userId
   * @param {string} role
   * @returns {Member}
   */
  addMember: async (communityId, userId, role = 'member') => {
    return await CommunityModel.addMember(communityId, userId, role);
  },
};
