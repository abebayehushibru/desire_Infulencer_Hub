const { sequelize } = require("../../models");
const walletRepo = require("../wallets/wallet.service");

const repo = require("./rechargeHistory.repository");

exports.create = async ({
    userId,
    body,
}) => {

    const required = [
        "amount",
        "bank_type",
        "transaction_reference",
    ];

    for (const field of required) {
        if (!body[field]) {
            throw new Error(
                `${field} is required`
            );
        }
    }

    const exists =
        await repo.getByReference(
            body.transaction_reference
        );

    if (exists) {
        throw new Error(
            "Transaction reference already exists."
        );
    }

    const transaction =
        await sequelize.transaction();

    try {

        const recharge =
            await repo.create(
                {
                    business_user_id:
                        userId,

                    amount:
                        body.amount,

                    bank_type:
                        body.bank_type,

                    transaction_reference:
                        body.transaction_reference,

                    payment_date:
                        body.payment_date,

                    receipt_document_id:
                        body.receipt_document_id,

                    status: "pending",
                },
                transaction
            );

        await transaction.commit();

        return await repo.getById(
            recharge.id
        );

    } catch (error) {

        await transaction.rollback();

        throw error;
    }
};

exports.getAll = async ({
    query,
}) => {

    return repo.getAll({
        page:
            Number(query.page) || 1,

        limit:
            Number(query.limit) || 20,

        search:
            query.search,

        status:
            query.status,

        business_user_id:
            query.business_user_id,
    });

};

exports.getDetail = async ({
    id,
}) => {

    const recharge =
        await repo.getById(id);

    if (!recharge) {
        throw new Error(
            "Recharge request not found."
        );
    }

    return recharge;

};

exports.getBusinessHistory =
    async ({
        userId,
        query,
    }) => {

        return repo.getBusinessHistory(
            userId,
            Number(query.page) || 1,
            Number(query.limit) || 20
        );

    };

exports.verify = async ({
    id,
    adminId,
}) => {

    const recharge =
        await repo.getById(id);

    if (!recharge) {
        throw new Error(
            "Recharge request not found."
        );
    }

    if (
        recharge.status !==
        "pending"
    ) {
        throw new Error(
            "Recharge request already processed."
        );
    }

    const transaction =
        await sequelize.transaction();

    try {

        await repo.update(
            id,
            {
                status: "verified",

                verified_by_user_id:
                    adminId,

                verified_at:
                    new Date(),
            },
            transaction
        );

          await walletRepo.recharge({ user_id:  recharge.business_user_id,
                withdrawal_id:  recharge.id,
                 amount: recharge.amount,transaction
              });

        // TODO
        // Update Business Wallet
        // Wallet += recharge.amount

        await transaction.commit();

        return repo.getById(id);

    } catch (error) {

        await transaction.rollback();

        throw error;
    }

};

exports.reject = async ({
    id,
    adminId,
    reason,
}) => {

    const recharge =
        await repo.getById(id);

    if (!recharge) {
        throw new Error(
            "Recharge request not found."
        );
    }

    if (
        recharge.status !==
        "pending"
    ) {
        throw new Error(
            "Recharge request already processed."
        );
    }

    return repo.update(id, {
        status: "rejected",

        verified_by:
            adminId,

        verified_at:
            new Date(),

        rejection_reason:
            reason,
    });

};

exports.remove = async ({
    id,
}) => {

    const recharge =
        await repo.getById(id);

    if (!recharge) {
        throw new Error(
            "Recharge request not found."
        );
    }

    await repo.delete(id);

    return {
        message:
            "Recharge request deleted successfully.",
    };

};