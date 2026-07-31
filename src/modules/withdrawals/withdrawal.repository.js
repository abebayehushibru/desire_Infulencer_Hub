const {
    Withdrawal,
    Wallet,
    WalletTransaction,
    User
} = require("../../models");

const sequelize = require("../../models").sequelize;
const { Op, fn, col, literal } = require("sequelize"); // Added literal to the imports



exports.getWallet = async (userId) => {

    return Wallet.findOne({

        where: {
            user_id: userId
        }

    });

};

exports.create = async (data) => {
    return Withdrawal.create(data);
};

exports.getById = async (id) => {
    console.log(id);

    return await Withdrawal.findByPk(id, {
        include: [
            {
                model: User,
                as: "requested_by",
                attributes: ["id", "name_or_company_name", "email"],
            },
            {
                model: User,
                as: "approved_by",
                attributes: ["id", "name_or_company_name", "email"],
            },
            {
                model: User,
                as: "rejected_by",
                attributes: ["id", "name_or_company_name", "email"],
            },
            {
                model: User,
                as: "paid_by",
                attributes: ["id", "name_or_company_name", "email"],
            },
        ],
    });
};



exports.findById = async (id) => {
    return Withdrawal.findByPk(id, {
        include: [{
            model: User,
            as: "approved_by",
            attributes: ["id", "name_or_company_name", "email"],
        },
        {
            model: User,
            as: "rejected_by",
            attributes: ["id", "name_or_company_name", "email"],
        },
        {
            model: User,
            as: "paid_by",
            attributes: ["id", "name_or_company_name", "email"],
        },]
    });

};

exports.getAll = async ({
    page,
    limit,
    status,
    bank_type,
    startDate,
    endDate,
    search
}) => {
    const offset = (page - 1) * limit;

    // 1. Calculate Summary Totals Across ALL Withdrawals using conditional SQL metrics
    const [walletTotals, statusCounts] = await Promise.all([
        Withdrawal.findOne({
            attributes: [
                // Totals for PENDING status
                [literal(`COUNT(CASE WHEN status = 'PENDING' THEN 1 END)`), "pending_count"],
                [literal(`SUM(CASE WHEN status = 'PENDING' THEN amount ELSE 0 END)`), "pending_sum"],

                // Totals for CONFIRMED status
                [literal(`COUNT(CASE WHEN status = 'CONFIRMED' THEN 1 END)`), "confirmed_count"],
                [literal(`SUM(CASE WHEN status = 'CONFIRMED' THEN amount ELSE 0 END)`), "confirmed_sum"],

                // Totals for REJECTED status
                [literal(`COUNT(CASE WHEN status = 'REJECTED' THEN 1 END)`), "rejected_count"],
                [literal(`SUM(CASE WHEN status = 'REJECTED' THEN amount ELSE 0 END)`), "rejected_sum"],

                // Grand Global Totals across everything combined
                [fn("COUNT", col("id")), "total_count"],
                [fn("SUM", col("amount")), "total_sum"]
            ],
            raw: true
        }),

        // Dynamic breakdown grid array
        Withdrawal.findAll({
            attributes: [
                "status",
                [fn("COUNT", col("id")), "count"],
                [fn("SUM", col("amount")), "total_amount"]
            ],
            group: ["status"],
            raw: true
        })
    ]);

    // 2. Format the Structural Global Platform Summary Balance Object safely
    const summaryWithdrwal = {
        // Grand totals mapping
        total_withdrawals_count: Number(walletTotals?.total_count || 0),
        total_withdrawals_amount: Number(walletTotals?.total_sum || 0),

        // Status-specific sums mapping
        pending_amount: Number(walletTotals?.pending_sum || 0),
        confirmed_amount: Number(walletTotals?.confirmed_sum || 0),
        rejected_amount: Number(walletTotals?.rejected_sum || 0),

        // Kept your status_breakdown block for map loops on frontend charts
        status_breakdown: statusCounts.reduce((acc, current) => {
            if (current.status) {
                acc[current.status.toLowerCase()] = {
                    count: Number(current.count || 0),
                    total_value: Number(current.total_amount || 0)
                };
            }
            return acc;
        }, {})
    };

    // 3. Setup Where Filters for the Main Global Grid List
    const withdrawalWhere = {};

    if (status) {
        withdrawalWhere.status = status;
    }
    if (bank_type) {
        withdrawalWhere.bank_type = bank_type;
    }

    // Date Range Filters
    if (startDate || endDate) {
        withdrawalWhere.created_at = {};
        if (startDate) {
            withdrawalWhere.created_at[Op.gte] = new Date(startDate);
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            withdrawalWhere.created_at[Op.lte] = end;
        }
    }

    // 4. Setup User Association for Global Full-Name Search Filter
    const userInclude = {
        model: User,
        as: "requested_by",
        attributes: ["id", "name_or_company_name"],
        where: {}
    };

    if (search) {
        userInclude.where.name_or_company_name = {
            [Op.like]: `%${search}%`
        };
    }

    // 5. Query Main Paginated Record Set Across All Platform Users
    const { rows, count } = await Withdrawal.findAndCountAll({
        where: withdrawalWhere,
        include: [userInclude],
        order: [["created_at", "DESC"]],
        limit: Number(limit),
        offset: Number(offset)
    });

    return {
        summary: summaryWithdrwal,
        withdrwals: rows || [],
        count
    };
};

exports.getMy = async ({
    userId,
    page,
    limit
}) => {


    const offset =
        (page - 1) * limit;
    const wallet = await Wallet.findOne({
        where: {
            user_id: userId,
        },

        attributes: [
            "id",
            "total_earned",
            "total_withdrawn",
            "available_balance",
            "pending_balance",
            "holded_balance",
            "total_recharged",
        ],
    });




    const summary = {
        total_earned: Number(
            wallet?.total_earned || 0
        ),

        total_withdrawn: Number(
            wallet?.total_withdrawn || 0
        ),

        available_balance: Number(
            wallet?.available_balance || 0
        ),

        pending_balance: Number(
            wallet?.pending_balance || 0
        ),
        holded_balance: Number(
            wallet?.holded_balance || 0
        ),
        total_recharged: Number(
            wallet?.total_recharged || 0
        ),
    };


    const { rows, count } = await Withdrawal.findAndCountAll({

        where: {
            requested_by_user_id: userId
        },


        include: [

            {
                model: User,
                as: "requested_by",
                attributes: [
                    "id",
                    "name_or_company_name"
                ]
            }

        ],


        order: [
            ["created_at", "DESC"]
        ],


        limit: Number(limit),

        offset

    });


    return { summary, withdrwals: rows || [], count }
};


exports.updateById = async ({
    id,
    data,
    transaction,
}) => {
    const withdrawal = await Withdrawal.findByPk(id, {
        transaction,
    });

    if (!withdrawal) {
        throw new Error("Withdrawal not found");
    }

    await withdrawal.update(data, {
        transaction,
    });

    return withdrawal;
};







exports.markPaid = async ({
    withdrawal,
    paidBy,
    transactionReference
}) => {


    return sequelize.transaction(async (t) => {


        const wallet =
            await Wallet.findOne({

                where: {
                    user_id:
                        withdrawal.influencer_user_id
                },

                transaction: t,

                lock: true

            });



        if (
            Number(wallet.available_balance)
            <
            Number(withdrawal.amount)
        ) {

            throw new Error(
                "Insufficient balance"
            );

        }




        const before =
            Number(wallet.available_balance);



        const after =
            before -
            Number(withdrawal.amount);





        await wallet.update({

            available_balance: after,

            total_withdrawn:
                Number(wallet.total_withdrawn)
                +
                Number(withdrawal.amount)

        }, {
            transaction: t
        });






        await WalletTransaction.create({

            wallet_id: wallet.id,

            user_id:
                withdrawal.influencer_user_id,


            type: "withdrawal",

            direction: "debit",


            amount:
                withdrawal.amount,


            balance_before: before,


            balance_after: after,


            withdrawal_id:
                withdrawal.id,


            description:
                "Withdrawal payment"

        }, {
            transaction: t
        });






        await withdrawal.update({

            status: "paid",

            paid_by: paidBy,

            paid_at: new Date(),

            transaction_reference:
                transactionReference

        }, {
            transaction: t
        });




        return withdrawal;


    });


};