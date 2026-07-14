import { CommunityRepository } from '../repositories/communityRepository.js';

export const getCommunities = async (req, res, next) => {
  try {
    const { search, status, page, limit } = req.query;
    const result = await CommunityRepository.findAll({ search, status, page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getCommunityById = async (req, res, next) => {
  try {
    const community = await CommunityRepository.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    res.json(community);
  } catch (err) {
    next(err);
  }
};

export const createCommunity = async (req, res, next) => {
  try {
    const community = await CommunityRepository.create(req.body);
    res.status(201).json(community);
  } catch (err) {
    next(err);
  }
};

export const updateCommunity = async (req, res, next) => {
  try {
    const community = await CommunityRepository.update(req.params.id, req.body);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    res.json(community);
  } catch (err) {
    next(err);
  }
};

export const deleteCommunity = async (req, res, next) => {
  try {
    await CommunityRepository.delete(req.params.id);
    res.json({ message: 'Community deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export const getCommunityMembers = async (req, res, next) => {
  try {
    const result = await CommunityRepository.getMembers(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const addCommunityMember = async (req, res, next) => {
  try {
    const { user_id, role } = req.body;
    const member = await CommunityRepository.addMember(req.params.id, user_id, role);
    res.status(201).json(member);
  } catch (err) {
    next(err);
  }
};
