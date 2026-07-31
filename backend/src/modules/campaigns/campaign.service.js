const repo = require("./campaign.repository.js");

const {
    createCampaignSchema,
    updateCampaignSchema,
} = require("./campaign.validation");

exports.create = async (payload) => {
    const { error, value } =
        createCampaignSchema.validate(payload);

    if (error)
        throw new Error(error.details[0].message);

    return repo.create(value);
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
    console.log(value);

    await repo.update(id, value);

    return repo.findById(id);
}
exports.updateStatus = async (id, payload, currentUser) => {
 const value={status:payload?.status}
  // 1. Fetch the target database record
   
  const campaign = await repo.findById(id);
  if (!campaign) throw new Error("Campaign not found");

  // 2. Normalize status string for processing evaluation
  const targetStatus = value.status?.toLowerCase();

  // 3. Inject metadata details into the payload object
  if (targetStatus === "rejected") {
    value.rejection_reason = payload.rejection_reason || "No reason specified";
    value.rejected_by_user_id = currentUser?.id || null;
    value.rejected_at = new Date();
  }

  // 4. Execute database transactional updates and return fresh record data
await repo.updateStatus(id, value);
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

    const overview = await repo.getOverviewMetrics(id);

    return {
        ...campaign.toJSON(),
        overview,
    };
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
    try{

   
  await repo.claimCampaign(
    campaignId,
    user.id
  );
  repo.updateStatus(campaignId,{status:"accepted"})
  await transaction.commit();


  return {success:true}
  
   } catch (error) {
      await transaction.rollback();
      throw error;
    }
};

exports.getClaimableCampaigns = async (query, user) => {

    const {
    userId= user.id,
    page= query.page || 1,
    limit= query.limit || 10,
    type= query.type,
  }=query
  const {rows,count}= await repo.getClaimableCampaigns({
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