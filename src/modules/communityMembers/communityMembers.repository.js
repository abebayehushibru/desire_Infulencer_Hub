const { Op } = require("sequelize");
const {
  CommunityMember,
  User,
  InfluencerProfile,
} = require("../../models");

class CommunityMemberRepository {
  // Add member
  async create(data) {
    return await CommunityMember.create(data);
  }

  // Find existing member
  async findMember(communityId, userId) {
    return await CommunityMember.findOne({
      where: {
        community_id: communityId,
        user_id: userId,
      },
    });
  }

  // Remove member
  async remove(communityId, userId) {
    return await CommunityMember.destroy({
      where: {
        community_id: communityId,
        user_id: userId,
      },
    });
  }

  // Community members
  async getMembers(communityId) {
    return await CommunityMember.findAll({
      where: {
        community_id: communityId,
        is_active: true,
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: [
            "id",
            "name_or_company_name",
            "email",
            "phone1",
            "status",
          ],
          include: [
            {
              model: InfluencerProfile,
              as: "influencer_profile",
              attributes: [
                "main_platform",
                "followers_count",
                "level",
                "profile_link",
              ],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });
  }

  // Influencers NOT already in community
  async getNonMembers(communityId, search = "", page = 1) {
    const limit = 10;
    const offset = (page - 1) * limit;

    // existing users
    const members = await CommunityMember.findAll({
      where: {
        community_id: communityId,
      },
      attributes: ["user_id"],
    });

    const memberIds = members.map((x) => x.user_id);

    const where = {
      role: "influencer",
    };

    if (memberIds.length) {
      where.id = {
        [Op.notIn]: memberIds,
      };
    }

    if (search) {
      where[Op.or] = [
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
      ];
    }

    return await User.findAndCountAll({
      where,
        attributes: ["name_or_company_name", "email", "phone1", "status","id"],
      include: [
        {
          model: InfluencerProfile,
          as: "influencer_profile",
          attributes: [
            "main_platform",
            "followers_count",
            "level",
            "profile_link",
          ],
        },
      ],
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });
  }
}

module.exports = new CommunityMemberRepository();