const {
  User,
  BusinessProfile,
  Document,
} = require("../../models");



// ===============================
// User
// ===============================

exports.findUserById = async (id, transaction = null) => {
  return await User.findByPk(id, {
    transaction,
  });
};

exports.findUserByEmail = async (email, transaction = null) => {
  return await User.findOne({
    where: {
      email,
    },
    transaction,
  });
};

exports.findUserByPhone = async (phone, transaction = null) => {
  return await User.findOne({
    where: {
      phone1: phone,
    },
    transaction,
  });
};

exports.createUser = async (data, transaction) => {
  return await User.create(data, {
    transaction,
  });
};



// ===============================
// Documents
// ===============================

exports.createDocument = async (data, transaction) => {
  return await Document.create(data, {
    transaction,
  });
};

exports.findDocumentById = async (id, transaction = null) => {
  return await Document.findByPk(id, {
    transaction,
  });
};



// ===============================
// Business Profile
// ===============================

exports.createBusinessProfile = async (
  data,
  transaction
) => {
  return await BusinessProfile.create(data, {
    transaction,
  });
};

exports.findBusinessProfileByUserId = async (
  userId,
  transaction = null
) => {
  return await BusinessProfile.findOne({
    where: {
      user_id: userId,
    },
    transaction,
  });
};
exports.findBusinessProfileById = async (
  id,

) => {
  return await BusinessProfile.findByPk(id, {
  include: [
    {
      model: User,
      as: "user",
      attributes: [
        "id",
        "name_or_company_name",
        "email",
        "phone1",
        "phone2",
        "status",
        "attempts",
        "created_at",
        "updated_at",
      ],
    },
  ],
});
};
exports.updateBusinessProfile = async (
  id,
  data,
  transaction
) => {
  return await BusinessProfile.update(
    data,
    {
      where: {
        id: id,
      },
      transaction,
    }
  );
};



// ===============================
// List Businesses
// ===============================

exports.findAllBusinesses = async (
  {
    page = 1,
    limit = 10,
    search = "",
  },
  transaction = null
) => {

  const offset =
    (page - 1) * limit;

  return await BusinessProfile.findAndCountAll({

    include: [
      {
        model: User,
        as: "user",
      },
      {
        model: Document,
        as: "company_logo",
      },
      {
        model: Document,
        as: "business_license",
      },
    ],

    limit,

    offset,

    distinct: true,

    order: [
      ["created_at", "DESC"],
    ],

    transaction,

  });

};



// ===============================
// Delete
// ===============================

exports.deleteBusinessProfile = async (
  userId,
  transaction
) => {

  return await BusinessProfile.destroy({

    where: {
      user_id: userId,
    },

    transaction,

  });

};

exports.deleteUser = async (
  userId,
  transaction
) => {

  return await User.destroy({

    where: {
      id: userId,
    },

    transaction,

  });

};

exports.deleteDocument = async (
  id,
  transaction
) => {

  return await Document.destroy({

    where: {
      id,
    },

    transaction,

  });

};