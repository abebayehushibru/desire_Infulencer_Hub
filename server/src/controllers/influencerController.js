import { InfluencerRepository } from '../repositories/influencerRepository.js';

export const getInfluencers = async (req, res, next) => {
  try {
    const { search, platform, level, page, limit } = req.query;
    const result = await InfluencerRepository.findAll({ search, platform, level, page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getInfluencerById = async (req, res, next) => {
  try {
    const influencer = await InfluencerRepository.findById(req.params.id);
    if (!influencer) {
      return res.status(404).json({ message: 'Influencer not found' });
    }
    res.json(influencer);
  } catch (err) {
    next(err);
  }
};

export const createInfluencer = async (req, res, next) => {
  try {
    const { user, influencer_profile } = req.body;
    const result = await InfluencerRepository.create(user, influencer_profile);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const updateInfluencer = async (req, res, next) => {
  try {
    const { user = {}, influencer_profile = {} } = req.body;
    const influencer = await InfluencerRepository.update(req.params.id, user, influencer_profile);
    if (!influencer) {
      return res.status(404).json({ message: 'Influencer not found' });
    }
    res.json(influencer);
  } catch (err) {
    next(err);
  }
};

export const deleteInfluencer = async (req, res, next) => {
  try {
    await InfluencerRepository.delete(req.params.id);
    res.json({ message: 'Influencer deleted successfully' });
  } catch (err) {
    next(err);
  }
};
