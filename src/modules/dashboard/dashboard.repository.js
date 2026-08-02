const {
    User,
    Campaign,
    CampaignClaim,
    CampaignCommission,
    Community,
    CommunityMember,
    Conversion,
    Wallet,
    InfluencerProfile,
    Chat
} = require("../../models");

const { Op, fn, col } = require("sequelize");

exports.getAdminDashboard = async () => {
    const [
        totalBusinesses,
        totalInfluencers,
        totalAgents,
        totalCampaigns,
        activeCampaigns,
        pendingCampaigns,
        totalCommunities,
        totalClaims,
        totalConversions,
        recentCampaigns,
    ] = await Promise.all([

        User.count({ where: { role: "business" } }),

        User.count({ where: { role: "influencer" } }),

        User.count({ where: { role: "agent" } }),

        Campaign.count(),

        Campaign.count({
            where: {
                status: "active",
            },
        }),

        Campaign.count({
            where: {
                status: "pending",
            },
        }),

        Community.count(),

        CampaignClaim.count(),

        Conversion.count(),

        Campaign.findAll({
            limit: 10,
            order: [["created_at", "DESC"]],
            include: [
                {
                    model: User,
                    as: "business",
                    attributes: [
                        "id",
                        "name_or_company_name",
                    ],
                },
            ],
        }),
    ]);

    return {
        role: "admin",

        stats: {
            totalBusinesses,
            totalInfluencers,
            totalAgents,
            totalCampaigns,
            activeCampaigns,
            pendingCampaigns,
            totalCommunities,
            totalClaims,
            totalConversions,
        },

        recentCampaigns,
    };
};

exports.getBusinessDashboard = async (userId) => {

    const [
        activeCampaigns,
        totalCampaigns,
        totalConversions,
        totalEarnings,
        recentCampaigns,
        totalCommission
    ] = await Promise.all([

        Campaign.count({
            where: {
                business_user_id: userId,
                status: "active",
            },
        }),

        Campaign.count({
            where: {
                business_user_id: userId,
            },
        }),

        Conversion.count({
            include:[{
                model:Campaign,
                as:"campaign",
                where:{
                    business_user_id:userId
                }
            }]
        }),

        Conversion.sum("paid_amount", {
            include:[{
                model:Campaign,
                as:"campaign",
                where:{
                    business_user_id:userId
                }
            }]
        }),

        Campaign.findAll({
            where: {
                business_user_id: userId,
            },
            limit: 5,
            order: [["created_at", "DESC"]],
        }),
         Conversion.sum("total_commission_amount", {
            include:[{
                model:Campaign,
                as:"campaign",
                where:{
                    business_user_id:userId
                }
            }]
        }),
    ]);

    return {
        role: "business",

        stats: {
            activeCampaigns,
            totalCampaigns,
            totalConversions,
            totalEarnings: totalEarnings || 0,
            totalSpend: totalCommission || 0,
        },

        recentCampaigns,
    };
};

exports.getAgentDashboard = async (userId) => {

    const [
        activeChats,
        campaigns,
        pendingCampaigns,
        conversions,
    ] = await Promise.all([

        Chat.count({
            where: {
                agent_id: userId,
                status: "active",
            },
        }),

        Campaign.count(),

        Campaign.count({
            where: {
                status: "pending",
            },
        }),

        Conversion.count(),
    ]);

    return {

        role: "agent",

        stats: {
            activeChats,
            campaigns,
            pendingCampaigns,
            conversions,
        },
    };
};

exports.getInfluencerDashboard = async (userId) => {

    const wallet = await Wallet.findOne({
        where: {
            user_id: userId,
        },
    });

    const [
        followers,
        campaigns,
        conversions,
        recentCampaigns,
    ] = await Promise.all([

        User.findByPk(userId, {
            include: [
                {
                    model: InfluencerProfile,
                    as: "influencer_profile",
                    attributes: ["followers_count"],
                },
            ],
        }),

        CampaignClaim.count({
            where: {
                influencer_user_id: userId,
            },
        }),

        Conversion.count({
            where: {
                influencer_user_id: userId,
            },
        }),


        Campaign.findAll({
            include: [
                {
                    model: CampaignClaim,
                    as: "claims",
                    where: {
                        influencer_user_id: userId,
                    },
                },
            ],
            limit: 5,
            order: [["created_at", "DESC"]],
        }),
    ]);

    return {

        role: "influencer",

        stats: {

            followers:
                followers?.influencer_profile?.followers_count || 0,

            engagement: 0,

            campaigns,

            conversions,

            totalEarnings: wallet?.total_earned|| 0,

            availableBalance:
                wallet?.available_balance || 0,

            pendingBalance:
                wallet?.pending_balance || 0,
        },

        recentCampaigns,
    };
};