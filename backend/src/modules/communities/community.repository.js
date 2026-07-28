const { Op } = require("sequelize");
const { Community, sequelize, User, Document, CommunityMember, InfluencerProfile } = require("../../models");


class CommunityRepository {


  async create(data) {

    return await Community.create(data);

  }



 async findAll(query) {
  // Parse and provide defaults to prevent NaN
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const offset = (page - 1) * limit;

  const { search, status, category, isVerifed } = query;

  const communityWhere = {};
  if (status) {
    communityWhere.status = status;
  }
  if (isVerifed) {
    // Fixed typo: changed status to isVerifed
    communityWhere.is_verifed = isVerifed; 
  }
  if (category) {
    communityWhere.categories = { [Op.like]: `%${category}%` };
  }
  if (search) {
    communityWhere.name = { [Op.like]: `%${search}%` };
  }

  return await Community.findAndCountAll({
  where: communityWhere,
  limit: limit,
  offset: offset,
   subQuery: false, // You can likely remove or keep this depending on preference
  attributes: {
    include: [
      [
        // Subquery counts members without needing a global GROUP BY
        sequelize.literal(`(
          SELECT COUNT(*) 
          FROM community_members AS m 
          WHERE m.community_id = Community.id
        )`),
        "members_count"
      ]
    ]
  },
  include: [
    {
      association: "manager",
      attributes: ["id", "name_or_company_name", "email"],
      required: false
    }
    // Removed the "members" association entirely since it is handled by the subquery above
  ],
  // group: ["Community.id", "manager.id"], // REMOVED THIS LINE
  order: [["created_at", "DESC"]]
});

}





  async findById(id) {

    return await Community.findByPk(id, {

      include: [
        {
          association: "business",
          attributes: [
            "id",
            "name_or_company_name",
            "email",
            "phone1"
          ]
        },

        {
          association: "manager",
          attributes: [
            "id",
            "name_or_company_name",
            "email"
          ],
          required: false
        },

        {
          association: "members"
        },

        {
          association: "profile_photo"
        },

        {
          association: "cover_photo"
        }
      ]

    });

  }

async findDetailById(id) {
  const community = await Community.findByPk(id, {
    include: [
      {
        model: User,
        as: "business",
        attributes: ["id", "name_or_company_name", "email", "phone1"],
      },
      {
        model: User,
        as: "manager",
        attributes: ["id", "name_or_company_name", "email", "phone1"],
      },
      {
        model: Document,
        as: "profile_photo",
        attributes: ["id", "file_url", "media_type"],
      },
      {
        model: Document,
        as: "cover_photo",
        attributes: ["id", "file_url", "media_type"],
      },
      {
        model: CommunityMember,
        as: "members",
        attributes: ["id", "user_id", "role", "status", "joined_at"],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name_or_company_name", "email", "phone1"],
            include: [
              {
                model: InfluencerProfile,
                as: "influencer_profile",
                attributes: ["main_platform", "followers_count", "level", "profile_link"],
              },
            ],
          },
        ],
      },
    ],
  });

  if (!community)  throw new Error("Not found");

  // Convert Sequelize instance to plain JSON object
  const communityJson = community.get({ plain: true });
  const members = communityJson.members || [];

  // Calculate Metrics
  const memberCount = members.length;
  
  let userProfileCount = 0;
  let totalInfluencerFollowers = 0;

  members.forEach(member => {
    if (member.user) {
      userProfileCount++;
      
      const influencer = member.user.influencer_profile;
      if (influencer && influencer.followers_count) {
        // Coerce string numbers if stored as strings in DB
        totalInfluencerFollowers += Number(influencer.followers_count) || 0;
      }
    }
  });

  // Attach metrics directly to the response object
  return {
    ...communityJson,
    metrics: {
      memberCount,
      userProfileCount,
      totalInfluencerFollowers
    }
  };
}





  async update(id, data) {

    const community =
      await Community.findByPk(id);


    if (!community)
      return null;


    await community.update(data);


    return community;

  }



}


module.exports = new CommunityRepository();