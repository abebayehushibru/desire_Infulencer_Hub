const { Op, where } = require("sequelize");
const {
  User,
  InfluencerProfile,
  InfluencerAudienceLocation,
} = require("../../models");

class InfluencerRepository {
  // ===========================
  // Duplicate Checks
  // ===========================

  async findByEmail(email) {
    return await User.findOne({
      where: { email },
    });
  }

  async findByPhone(phone) {
    return await User.findOne({
      where: {
        phone1: phone,
      },
    });
  }

  async findByPhone2(phone) {
    return await User.findOne({
      where: {
        phone2: phone,
      },
    });
  }

  async findByProfileLink(profileLink) {
    return await InfluencerProfile.findOne({
      where: {
        profile_link: profileLink,
      },
    });
  }

  // ===========================
  // Create
  // ===========================

  async createUser(data, transaction) {
    return await User.create(data, {
      transaction,
    });
  }

  async createProfile(data, transaction) {
    return await InfluencerProfile.create(data, {
      transaction,
    });
  }

  async createAudienceLocations(data, transaction) {
    return await InfluencerAudienceLocation.bulkCreate(data, {
      transaction,
    });
  }

  // ===========================
  // Find
  // ===========================

  async findById(id) {
   console.log(id);
   
    return await InfluencerProfile.findOne( {
      where:{id},
      include: [
        {
          model: User,
          as: "user",
          attributes: ["name_or_company_name", "email", "phone1", "status", "phone2", "id"]
        },
        {
          model: InfluencerAudienceLocation,
          as: "audience_locations",
          attributes: ["audience_percentage", "country", "city"]
        },
      ],
    });
  }

  async findByUserId(userId) {
    return await InfluencerProfile.findOne({
      where: {
        user_id: userId,
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["name_or_company_name", "email", "phone1", "status", "phone2", "id"]
        },
        {
          model: InfluencerAudienceLocation,
          as: "audience_locations",
          attributes: ["audience_percentage", "country", "city"]
        },
      ],
    });
  }

  async findAll(query) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const offset = (page - 1) * limit;

    const { search, platform, level } = query;

    const influencerWhere = {};

    if (platform) {
      influencerWhere.main_platform = platform;
    }

    if (level) {
      influencerWhere.level = level;
    }

    const userInclude = {
      model: User,
      as: "user",
      attributes: ["name_or_company_name", "email", "phone1", "status","id"]
    };

    if (search) {
      userInclude.where = {
        [Op.or]: [
          {
            name_or_company_name: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            email: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            phone1: {
              [Op.like]: `%${search}%`,
            },
          },
        ],
      };
      userInclude.required = true;
    }

    return await InfluencerProfile.findAndCountAll({
      where: influencerWhere,

      include: [
        userInclude,

      ],

      order: [["created_at", "DESC"]],

      limit,

      offset,

      distinct: true,
    });
  }
  // ===========================
  // Update
  // ===========================

  async updateUser(userId, data, transaction) {
    return await User.update(data, {
      where: {
        id: userId,
      },
      transaction,
    });
  }

  async updateProfile(profileId, data, transaction) {
    return await InfluencerProfile.update(data, {
      where: {
        id: profileId,
      },
      transaction,
    });
  }

  async deleteAudienceLocations(profileId, transaction) {
    return await InfluencerAudienceLocation.destroy({
      where: {
        influencer_profile_id: profileId,
      },
      transaction,
    });
  }

  async replaceAudienceLocations(data, transaction) {
    return await InfluencerAudienceLocation.bulkCreate(data, {
      transaction,
    });
  }

  // ===========================
  // Delete
  // ===========================

  async deleteProfile(profileId, transaction) {
    return await InfluencerProfile.destroy({
      where: {
        id: profileId,
      },
      transaction,
    });
  }

  async deleteUser(userId, transaction) {
    return await User.destroy({
      where: {
        id: userId,
      },
      transaction,
    });
  }
  async findAudience(profileId) {
    return await InfluencerAudienceLocation.findAll({
      where: {
        influencer_profile_id: profileId,
      },
      order: [
        ["country", "ASC"],
        ["city", "ASC"],
      ],
    });
  }

  async deleteAudience(profileId, transaction) {
    return await InfluencerAudienceLocation.destroy({
      where: {
        influencer_profile_id: profileId,
      },
      transaction,
    });
  }

  async createAudience(profileId, locations, transaction) {
    if (!locations.length) return [];

    const payload = locations.map((item) => ({
      influencer_profile_id: profileId,
      country: item.country,
      city: item.city || null,
      audience_percentage:
        item.audience_percentage || 0,
    }));

    return await InfluencerAudienceLocation.bulkCreate(
      payload,
      {
        transaction,
      }
    );
  }
}

module.exports = new InfluencerRepository();