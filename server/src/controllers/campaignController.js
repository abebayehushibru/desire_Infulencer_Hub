import { CampaignRepository } from '../repositories/campaignRepository.js';

export const getCampaigns = async (req, res, next) => {
  try {
    const { search, status, page, limit } = req.query;
    const result = await CampaignRepository.findAll({ search, status, page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getCampaignById = async (req, res, next) => {
  try {
    const campaign = await CampaignRepository.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    res.json(campaign);
  } catch (err) {
    next(err);
  }
};

export const createCampaign = async (req, res, next) => {
  try {
    const campaign = await CampaignRepository.create(req.body);
    res.status(201).json(campaign);
  } catch (err) {
    next(err);
  }
};

export const updateCampaign = async (req, res, next) => {
  try {
    const campaign = await CampaignRepository.update(req.params.id, req.body);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    res.json(campaign);
  } catch (err) {
    next(err);
  }
};

export const deleteCampaign = async (req, res, next) => {
  try {
    await CampaignRepository.delete(req.params.id);
    res.json({ message: 'Campaign deleted successfully' });
  } catch (err) {
    next(err);
  }
};
