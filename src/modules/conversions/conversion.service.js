const { sequelize } = require("../../models");
const walletService = require("../wallets/wallet.service");
const repo = require("./conversion.repository");

function calculateCampaignSplit(campaign, paidAmount,) {
    // 1. Setup unified decimal percentage rate & variables
    const ruleType = campaign?.commission_rule_type || ""; // 'Rate' or 'Fixed'
    const commValue = parseFloat(campaign?.commission_value || 0);

    const campaignRate = parseFloat(campaign?.commission_rate || 0) / 100;
    const campaignAmount = parseFloat(campaign?.amount || 0);
    const actualPaid = parseFloat(paidAmount || 0);

    // 3. Initialize pools
    let totalPool = 0;
    let leaderCommission = 0;
    let influencerCommission = 0;

    // 4. Determine the Total Pool base
    if (campaignAmount > 0) {
        totalPool = campaignAmount;
    } else {
        totalPool = actualPaid;
    }

    // 4b. Calculate Leader Share based on community rule
    if (ruleType === 'Fixed') {
        leaderCommission = commValue;
    } else if (ruleType === 'Rate') {
        const ratePercentage = commValue / 100;
        leaderCommission = totalPool * ratePercentage;
    }

    // Influencer gets the remainder of the pool
    influencerCommission = totalPool - leaderCommission;

    // Prevent negative balances if Fixed fee exceeds total pool
    if (influencerCommission < 0) {
        influencerCommission = 0;
        leaderCommission = totalPool;
    }

    // 5. Build output object
    const results = {
        leader: Number(leaderCommission.toFixed(2)) || 0,
        influencer: Number(influencerCommission.toFixed(2)) || 0,
        totalPool: Number(totalPool.toFixed(2)) || 0
    };


    return results; // Returning full object allows access to all calculated pieces
}
exports.create = async ({
    userId,
    body
}) => {
    const value = body

    const required = [
        "campaign_id",
        "customer_name",
        "phone_number",
        "platform",
        "paid_amount"
    ];


    for (const field of required) {

        if (!value[field]) {
            throw new Error(
                `${field} is required`
            );
        }

    }



    const campaign =
        await repo.getCampaign(
            body.campaign_id
        );


    if (!campaign) {
        throw new Error(
            "Campaign not found"
        );
    }


    const transaction =
        await sequelize.transaction();
    const canculationOfSplit = calculateCampaignSplit(campaign, body.paid_amount)

    try {


        const conversions = await repo.create({

            ...body,

            influencer_user_id: body.influencer_id,
            business_user_id: campaign.business_user_id,
            leader_user_id: campaign?.community?.manager_user_id,
            influencer_commission_amount: canculationOfSplit?.influencer,
            leader_commission_amount: canculationOfSplit?.leader,
            total_commission_amount: canculationOfSplit?.totalPool


        }, transaction);


        const resInflluncerWalet = await walletService?.addPending({ datas: { user_id: body.influencer_id, id: conversions?.id, payout_amount: canculationOfSplit.influencer }, transaction },)
        if (campaign?.community?.manager_user_id) {
            const resInflluncerWalet = await walletService?.addPending({ datas: { user_id: campaign?.community?.manager_user_id, id: conversions?.id, payout_amount: canculationOfSplit.leader }, transaction },)
        }


        await transaction.commit()
        return conversions

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};





exports.getAll = async ({
    campaign_id,
    query
}) => {
    const search = "yy"

    return await repo.getConversions({
        campaign_id,
        influencer_user_id: query.influencer_user_id,
        limit: query.limit || 10,
        offset: 0,
        query
    });



};





exports.getOne = async (id) => {


    const conversion =
        await repo.getOne(id);


    if (!conversion)
        throw new Error(
            "Conversion not found"
        );





    return conversion;

};







exports.updateStatus = async ({
    id,
    status,
    userId,
    reason
}) => {
console.log(status);


    const conversion =
        await repo.getOne(id);

    const value = {}

    if (!conversion)
        throw new Error(
            "Conversion not found"
        );



    if (
        conversion.status !== "pending"
    ) {
        throw new Error(
            "Already processed"
        );
    }
    const campaign =
        await repo.getCampaign(
            conversion.campaign_id
        );


    if (!campaign) {
        throw new Error(
            "Campaign not found"
        );
    }


    const transaction = await sequelize.transaction();

    try {
        if (status == "confirmed") {
            const infWallet =await walletService?.confirm({ datas: { user_id: conversion.influencer_user_id, id: conversion?.id, payout_amount: conversion.influencer_commission_amount }, transaction })
            if (conversion?.leader_user_id) {

                const ledWallet =await  walletService?.confirm({ datas: { user_id: conversion.leader_user_id, id: conversion?.id, payout_amount: conversion.leader_commission_amount }, transaction })
            }
        }

        if (status == "rejected") {
            const infWallet = await walletService?.reject({ datas: { user_id: conversion.influencer_user_id, id: conversion?.id, payout_amount: conversion.influencer_commission_amount }, transaction })
            if (conversion?.leader_user_id) {

                const ledWallet = await walletService?.reject({ datas: { user_id: conversion.leader_user_id, id: conversion?.id, payout_amount: conversion.leader_commission_amount }, transaction })
            }
        }

        const convupdate = await repo.updateStatus({

            id,

            status,

            userId,

            reason

        }, transaction);
        await transaction.commit()
        return conversion
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};