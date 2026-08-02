const repo = require("./campaign.repository.js");
const walletRepo = require("../wallets/wallet.repository.js");

const {
    createCampaignSchema,
    updateCampaignSchema,
} = require("./campaign.validation");
const { sequelize } = require("../../models/index.js");

exports.create = async (payload) => {
    const { error, value } =
        createCampaignSchema.validate(payload);

    if (error)
        throw new Error(error.details[0].message);
    const transaction =
        await sequelize.transaction();


    try {

        const campaign = await repo.create({ ...value, locations: payload.locations.join(','), ethiopia_locations: payload.ethiopia_locations.join(','), platforms: payload.platforms }, transaction);
        await walletRepo.holdBalance({ user_id: payload.business_user_id, campaign_id: null, amount: payload.total_budget, transaction }, transaction);

        await transaction.commit();
        return campaign;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

exports.update = async (id, payload) => {
    const { error, value } =
        updateCampaignSchema.validate(payload);

    if (error)
        throw new Error(error.details[0].message);

    const campaign =
        await repo.findById(id);

    if (!campaign)
        throw new Error("Campaign not found");

    await repo.update(id, { ...value, locations: payload.locations.join(','), ethiopia_locations: payload.ethiopia_locations.join(','), platforms: payload.platforms });

    return repo.findById(id);
}
exports.updateStatus = async (id, payload, currentUser) => {
    const value = { status: payload?.status }
    // 1. Fetch the target database record
    console.log("value", value);

    const campaign = await repo.findById(id);


    if (!campaign) throw new Error("Campaign not found");
    if (campaign.target_type == "community" && value.status == "approved") {
        const community = await repo.findCommunity(campaign.target_id)
        if (!community) throw new Error("Community not found");

            console.log("community",community?.toJSON());

        value.commission_rule_type = community.commission_type
        value.commission_value = community.commission_type == "Rate" ? community?.commission_rate : community.commission_amount
    }
    // 2. Normalize status string for processing evaluation
    const targetStatus = value.status?.toLowerCase();

    // 3. Inject metadata details into the payload object
    if (targetStatus === "rejected") {
        value.rejection_reason = payload.rejection_reason || "No reason specified";
        value.rejected_by_user_id = currentUser?.id || null;
        value.rejected_at = new Date();
    }

    const transaction = await sequelize.transaction();
    try {
        // 4. Execute database transactional updates and return fresh record data
       const res= await repo.updateStatus(id, value, transaction);
        if (targetStatus == "rejected") {
            await walletRepo.releaseHold({ user_id: campaign.business_user_id, campaign_id: null, amount: campaign.total_budget, transaction }, transaction);

        }
    await transaction.commit();
    return res
        //  throw new Error("Community not found");
    } catch (error) {
        console.log(error);
        
        await transaction.rollback();
        throw error;
    }

    return await repo.findById(id);
};
exports.getAll = async (query, user) => {
    const queryFilters = { ...query };


    if (user && user.role === 'business') {

        queryFilters.business_user_id = user.id;
    }


    return await repo.findAll(queryFilters);


};

exports.getById = async (id) => {
    const campaign =
        await repo.findById(id);

    if (!campaign)
        throw new Error("Campaign not found");

    return campaign;
}

exports.delete = async (id) => {
    const campaign =
        await repo.findById(id);

    if (!campaign)
        throw new Error("Campaign not found");

    await repo.delete(id);

    return true;
}
exports.claimCampaign = async (campaignId, user) => {
    const transaction =
        await sequelize.transaction();
    try {


        await repo.claimCampaign(
            campaignId,
            user.id
        );
        repo.updateStatus(campaignId, { status: "accepted" })
        await transaction.commit();


        return { success: true }

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

exports.getClaimableCampaigns = async (query, user) => {

    const {
        userId = user.id,
        page = query.page || 1,
        limit = query.limit || 10,
        type = query.type,
    } = query
    const { rows, count } = await repo.getClaimableCampaigns({
        userId,
        page,
        limit,
        type,
    });
    return {
        items: rows?.map((campaign) => ({
            ...campaign.toJSON(),
            is_claimed: campaign.claims.length > 0,
            claim_id: campaign.claims[0]?.id || null,
        })),

        pagination: {
            page: Number(page),
            limit: Number(limit),
            total: count,
            totalPages: Math.ceil(count / limit),
            hasNext: page < Math.ceil(count / limit),
            hasPrev: page > 1,
        },
    };
};