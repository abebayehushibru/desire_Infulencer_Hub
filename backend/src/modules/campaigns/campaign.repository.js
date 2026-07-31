
const { Op } = require("sequelize");
const {
  Campaign,
  Community,
  Document,
  CommunityMember,
  CampaignClaim,
  Conversion,
  User,
} = require("../../models");

const toNumber = (value) => Number.parseFloat(value || 0) || 0;

exports.create = async (data) => {
  return Campaign.create(data);
}

exports.update = async (id, data) => {
  return Campaign.update(data, {
    where: { id },
  });
}

exports.findById = async (id) => {
  return Campaign.findByPk(id, {
    include: [
      {
        model: User,
        as: "business",
        attributes: ["id", "name_or_company_name", "email"],
      },
      {
        model: User,
        as: "rejected_by",
        attributes: ["id", "name_or_company_name", "email", "role"],
      },
      {
        model: Document,
        as: "video",
      },
      {
        model: Community,
        as: "community",
        attributes: ["id", "name"],
      },
      {
        model: User,
        as: "influencer",
        attributes: ["id", "name_or_company_name", "email"],
      },
    ],
  });
}

exports.getOverviewMetrics = async (campaignId) => {
  const campaign = await Campaign.findByPk(campaignId, {
    attributes: ["id", "title", "type", "status", "start_date", "end_date", "total_budget", "total_views", "platforms", "target_type"],
    include: [
      {
        model: Community,
        as: "community",
        attributes: ["id", "name"],
      },
      {
        model: User,
        as: "influencer",
        attributes: ["id", "name_or_company_name", "email"],
      },
    ],
  });

  if (!campaign) {
    return null;
  }

  const overviewBaseUrl = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");

  const [claimsCount, conversionsCount, revenueTotal, budgetUsedTotal, processedConversionsCount] = await Promise.all([
    CampaignClaim.count({ where: { campaign_id: campaignId } }),
    Conversion.count({ where: { campaign_id: campaignId } }),
    Conversion.sum("paid_amount", {
      where: { campaign_id: campaignId },
    }),
    Conversion.sum("campiagn_payout_amount", {
      where: { campaign_id: campaignId },
    }),
    Conversion.count({
      where: {
        campaign_id: campaignId,
        status: {
          [Op.in]: ["confimed", "confirmed", "approved"],
        },
      },
    }),
  ]);

  const totalBudget = toNumber(campaign.total_budget || campaign.amount || campaign.conversion_rate || campaign.follower_price);
  const budgetUsed = toNumber(budgetUsedTotal);
  const budgetRemaining = Math.max(totalBudget - budgetUsed, 0);
  const budgetUsedPercent = totalBudget > 0 ? Math.min((budgetUsed / totalBudget) * 100, 100) : 0;
  const startDate = campaign.start_date ? new Date(campaign.start_date) : null;
  const endDate = campaign.end_date ? new Date(campaign.end_date) : null;
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysRemaining = endDate ? Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / msPerDay)) : null;

  const activePlatforms = Object.entries(campaign.platforms || {})
    .filter(([, enabled]) => Boolean(enabled))
    .map(([platform]) => platform.charAt(0).toUpperCase() + platform.slice(1));

  const trackingLink = `${overviewBaseUrl}/campaigns/${campaignId}/overview`;

  return {
    campaign: campaign.toJSON(),
    summary: {
      views: toNumber(campaign.total_views),
      clicks: claimsCount,
      conversions: conversionsCount,
      revenue: toNumber(revenueTotal),
    },
    details: {
      campaignType: campaign.type,
      platform: activePlatforms.length ? activePlatforms.join(", ") : (campaign.target_type === "community" ? "Community" : campaign.target_type === "influencer" ? "Influencer" : "Unknown"),
      startDate,
      endDate,
      budget: totalBudget,
      creators: claimsCount,
      targetLabel:
        campaign.community?.name ||
        campaign.influencer?.name_or_company_name ||
        campaign.target_id,
      status: campaign.status,
      budgetUsed,
      budgetRemaining,
      budgetUsedPercent,
      daysRemaining,
      trackingLink,
      processedConversionsCount,
    },
  };
};

exports.findAll = async (query) => {
  // 1. Separate pagination and raw user payloads from the filters
  const { page = 1, limit = 10, user, status, ...rawFilters } = query;

  // 2. Clean out empty keys or unexpected nested objects
  const cleanFilters = {};
  Object.keys(rawFilters).forEach((key) => {
    if (rawFilters[key] !== undefined && rawFilters[key] !== '') {
      cleanFilters[key] = rawFilters[key];
    }
  });

  const parsedLimit = parseInt(limit, 10) || 10;
  const offset = (parseInt(page, 10) - 1) * parsedLimit;
  // 3. Return query with identical relation handling to findById
  const res = await Campaign.findAndCountAll({
    ...cleanFilters, offset
  });

  return {
    data: res.rows,
    pagination: {
      page,
      totals: res?.count,
      totalPages: res?.count / limit,

      limit:
        Number(limit),
    }
  }
}

exports.delete = async (id) => {
  return Campaign.destroy({
    where: { id },
  });
}
exports.updateStatus = async (id, data) => {

  // Execute the Sequelize update query using the payload
  return Campaign.update(data, {
    where: { id },
  });
};



// campiagn claims

exports.claimCampaign = async (campaignId, userId) => {
  const campaign = await Campaign.findByPk(campaignId);

  if (!campaign) {
    throw new Error("Campaign not found.");
  }

  const exists = await CampaignClaim.findOne({
    where: {
      campaign_id: campaignId,
      influencer_user_id: userId,
    },
  });

  if (exists) {
    throw new Error("Campaign already claimed.");
  }

  return CampaignClaim.create({
    campaign_id: campaignId,
    influencer_user_id: userId,
  });
};



exports.getClaimableCampaigns = async ({
  userId,
  page = 1,
  limit = 10,
  type,
}) => {
  const offset = (page - 1) * limit;

  // Communities where influencer is approved member
  const memberships = await CommunityMember.findAll({
    where: {
      user_id: userId,
      status: "approved",
      is_active: true,
    },
    attributes: ["community_id", "role"],
  });


  const communityIdsWithRole =
    memberships
      ?.filter((m) => m.role === "leader")
      .map((m) => m.community_id) || [];


  const communityIdsWithOutRoleLeadeing =
    memberships
      ?.filter((m) => m.role !== "leader")
      .map((m) => m.community_id) || [];


  // Statuses considered visible
  const COMMUNITY_VISIBLE_STATUSES = [
    "active",
    "ongoing",
    "completed",
  ];


  const COMMUNITY_VISIBLE_STATUSESWithRole = [
    "approved",
    "active",
    "ongoing",
    "completed",
  ];


  const where = {
    [Op.and]: [

      {
        status: {
          [Op.notIn]: [
            "draft",
            "pending",
            "cancelled",
          ],
        },
      },


      {
        [Op.not]: {
          status: "rejected",
          rejected_by_user_id: userId,
        },
      },


      {
        [Op.or]: [

          // Direct influencer campaign
          {
            target_type: "influencer",
            target_id: userId,
            status: "approved",
          },


          // Community leader campaigns
          {
            target_type: "community",
            target_id: {
              [Op.in]: communityIdsWithRole.length
                ? communityIdsWithRole
                : [null],
            },
            status: {
              [Op.in]: COMMUNITY_VISIBLE_STATUSESWithRole,
            },
          },


          // Community member campaigns
          {
            target_type: "community",
            target_id: {
              [Op.in]: communityIdsWithOutRoleLeadeing.length
                ? communityIdsWithOutRoleLeadeing
                : [null],
            },
            status: {
              [Op.in]: COMMUNITY_VISIBLE_STATUSES,
            },
          },

        ],
      },

    ],

    ...(type && { type }),
  };


  const response = await Campaign.findAndCountAll({
    where,

    distinct: true,

    include: [

      {
        model: User,
        as: "business",
        attributes: [
          "id",
          "name_or_company_name",
          "email",
        ],
      },


      {
        model: Community,
        as: "community",
        required: false,
        attributes: [
          "id",
          "name",
          "profile_photo_document_id",
        ],
      },


      {
        model: CampaignClaim,
        as: "claims",
        required: false,
        where: {
          influencer_user_id: userId,
        },
        attributes: ["id"],
      },

    ],

    order: [
      ["created_at", "DESC"],
    ],

    limit: Number(limit),

    offset,
  });


  return response;
};