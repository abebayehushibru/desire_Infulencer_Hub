const { Op } = require("sequelize");
const { User } = require("../../models");

class UserRepository {

  async create  (data) {
  return User.create(data);
};

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

  async findAll({ page = 1, limit = 10 ,query}) {
    const offset = (page - 1) * limit;
 const where = {
  role: {
    [Op.ne]: "super_admin",
  },

 };

    console.log(query);
  if (query.search) {
        where[Op.or] = [
            { name_or_company_name: { [Op.like]: `%${query.search}%` } }, // Case-insensitive partial match
            { email: { [Op.like]: `%${query.search}%` } }
        ];
    }
    // If 'role' exists in the query, apply it directly to the filters
   if (query.role) {
  where.role = {
    [Op.and]: [
      { [Op.ne]: "super_admin" },
      { [Op.eq]: query.role }
    ]
  };
}
    return await User.findAndCountAll({
      where,
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