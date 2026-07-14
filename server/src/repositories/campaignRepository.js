import { CampaignModel } from '../models/campaign.js';

export const CampaignRepository = {
  /**
   * Get paginated list of campaigns with optional filters.
   * @param {{ search, status, page, limit }} options
   * @returns {{ data: Campaign[], pagination: object }}
   */
  findAll: async ({ search = '', status = '', page = 1, limit = 20 }) => {
    const offset = (Number(page) - 1) * Number(limit);

    const [data, total] = await Promise.all([
      CampaignModel.findAll({ search, status, limit: Number(limit), offset }),
      CampaignModel.count({ search, status }),
    ]);

    return {
      data,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  },

  /**
   * Get a single campaign by ID.
   * @param {string} id
   * @returns {Campaign | null}
   */
  findById: async (id) => {
    return await CampaignModel.findById(id);
  },

  /**
   * Create a new campaign.
   * @param {object} data
   * @returns {Campaign}
   */
  create: async (data) => {
    return await CampaignModel.create(data);
  },

  /**
   * Update an existing campaign.
   * @param {string} id
   * @param {object} data
   * @returns {Campaign | null}
   */
  update: async (id, data) => {
    return await CampaignModel.update(id, data);
  },

  /**
   * Delete a campaign by ID.
   * @param {string} id
   */
  delete: async (id) => {
    return await CampaignModel.delete(id);
  },
};
