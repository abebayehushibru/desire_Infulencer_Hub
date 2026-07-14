import { UserModel } from '../models/user.js';

export const AuthRepository = {
  findByEmail: async (email) => {
    return await UserModel.findByEmail(email);
  },

  findById: async (id) => {
    return await UserModel.findById(id);
  },
};
