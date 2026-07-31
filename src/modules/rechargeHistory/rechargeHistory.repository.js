const {
    RechargeHistory,
    User,
    Document,
} = require("../../models");

const { Op, fn, col, literal } = require("sequelize");

/**
 * Create Recharge Request
 */
exports.create = async (payload, transaction = null) => {
    return RechargeHistory.create(payload, { transaction });
};

/**
 * Get By ID
 */
exports.getById = async (id) => {
    return RechargeHistory.findByPk(id, {
        include: [
            {
                model: User,
                as: "business",
                attributes: [
                    "id",
                    "name_or_company_name",
                    "email",
                    "phone1",
                ],
            },
            {
                model: User,
                as: "verified_by",
                attributes: [
                    "id",
                    "name_or_company_name",
                ],
                required: false,
            },
            {
                model: Document,
                as: "receipt",
                required: false,
            },
        ],
    });
};

/**
 * Update
 */
exports.update = async (
    id,
    payload,
    transaction = null
) => {
    await RechargeHistory.update(payload, {
        where: { id },
        transaction,
    });

    return exports.getById(id);
};

/**
 * Delete
 */
exports.delete = async (
    id,
    transaction = null
) => {
    return RechargeHistory.destroy({
        where: { id },
        transaction,
    });
};

/**
 * Get All
 */
exports.getAll = async ({
    page = 1,
    limit = 20,
    search,
    status,
    business_user_id,
}) => {

    const offset = (page - 1) * limit;

    const where = {};

    if (status)
        where.status = status;

    if (business_user_id)
        where.business_user_id =
            business_user_id;

    const businessWhere = {};

    if (search) {
        businessWhere[Op.or] = [
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
// 1. Calculate Summary Totals Across ALL Withdrawals using conditional SQL metrics
    const [rechargeTotals, statusCounts] = await Promise.all([
        RechargeHistory.findOne({
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
        RechargeHistory.findAll({
            attributes: [
                "status",
                [fn("COUNT", col("id")), "count"],
                [fn("SUM", col("amount")), "total_amount"] 
            ],
            group: ["status"],
            raw: true
        })
    ]);
     const summaryWithdrwal = {
        // Grand totals mapping
        total_recharges_count: Number(rechargeTotals?.total_count || 0),
        total_recharges_amount: Number(rechargeTotals?.total_sum || 0),

        // Status-specific sums mapping
        pending_amount: Number(rechargeTotals?.pending_sum || 0),
        confirmed_amount: Number(rechargeTotals?.confirmed_sum || 0),
        rejected_amount: Number(rechargeTotals?.rejected_sum || 0),

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

    const { rows, count } =
        await RechargeHistory.findAndCountAll({
            where,
            offset,
            limit,
            distinct: true,
            order: [
                ["created_at", "DESC"],
            ],
            include: [
                {
                    model: User,
                    as: "business",
                    where: businessWhere,
                    required: !!search,
                    attributes: [
                        "id",
                        "name_or_company_name",
                        "email",
                        "phone1",
                    ],
                },
            ],
        });

    return {
       summary: summaryWithdrwal,
        recharges:rows,
        count,
        page,
        limit,
        totalPages: Math.ceil(
            count / limit
        ),
    };
};

/**
 * Get By Transaction Reference
 */
exports.getByReference =
    async (reference) => {
        return RechargeHistory.findOne({
            where: {
                transaction_reference:
                    reference,
            },
        });
    };

/**
 * Pending Recharge Requests
 */
exports.getPending = async () => {
    return RechargeHistory.findAll({
        where: {
            status: "pending",
        },
        order: [
            ["created_at", "DESC"],
        ],
    });
};

/**
 * Business Recharge History
 */
exports.getBusinessHistory =
    async (
        business_user_id,
        page = 1,
        limit = 20
    ) => {

        const offset =
            (page - 1) * limit;

        return RechargeHistory.findAndCountAll({
            where: {
                business_user_id,
            },
            offset,
            limit,
            order: [
                ["created_at", "DESC"],
            ],
        });
    };