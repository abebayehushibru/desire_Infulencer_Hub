const { User } = require("../../models");

class UserRepository {
  async findById(id) {
    return await User.findByPk(id);
  }

  async findByEmail(email) {
    return await User.findOne({
      where: { email },
    });
  }

  async findByPhone(phone) {
    return await User.findOne({
      where: { phone1: phone },
    });
  }

  async findAll({ page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;

    return await User.findAndCountAll({
      attributes: {
        exclude: ["password"],
      },
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });
  }

  async update(id, data, transaction = null) {
    await User.update(data, {
      where: { id },
      transaction,
    });

    return await this.findById(id);
  }

  async delete(id, transaction = null) {
    return await User.destroy({
      where: { id },
      transaction,
    });
  }
}

module.exports = new UserRepository();