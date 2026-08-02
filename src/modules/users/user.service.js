const repository = require("./user.repository");
const { sequelize } = require("../../models");
const { hashPassword } = require("../../utils/hash");

class UserService {
   // Ensure you import operators at the top of your file
async create  (payload)  {
  const email = await repository.findByEmail(payload.email);

  if (email) {
    throw new Error("Email already exists.");
  }

  const phone = await repository.findByPhone(payload.phone1);

  if (phone) {
    throw new Error("Phone number already exists.");
  }

  payload.password = await hashPassword(payload.password);

  return repository.create(payload);
};
async getAll(query) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
   

    // If 'search' is present, search across both name OR company_name
  
    return await repository.findAll({
        page,
        limit,
        query 
    });
}


  async getById(id) {
    const user = await repository.findById(id);

    if (!user) {
      throw new Error("User not found.", 404);
    }

    return user;
  }

  async update(id, body) {
    const transaction = await sequelize.transaction();

    try {
      const user = await repository.findById(id);

      if (!user) {
        throw new Error("User not found.", 404);
      }

      if (
        body.email &&
        body.email !== user.email
      ) {
        const emailExists =
          await repository.findByEmail(body.email);

        if (emailExists) {
          throw new Error(
            "Email already exists.",
            409
          );
        }
      }

      if (
        body.phone1 &&
        body.phone1 !== user.phone1
      ) {
        const phoneExists =
          await repository.findByPhone(body.phone1);

        if (phoneExists) {
          throw new Error(
            "Phone already exists.",
            409
          );
        }
      }

      const updated =
        await repository.update(
          id,
          body,
          transaction
        );

      await transaction.commit();

      return updated;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async delete(id) {
    const transaction =
      await sequelize.transaction();

    try {
      const user =
        await repository.findById(id);

      if (!user) {
        throw new Error(
          "User not found.",
          404
        );
      }

      await repository.delete(
        id,
        transaction
      );

      await transaction.commit();

      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = new UserService();