const { Op } = require("sequelize");
const {
    Conversion,
    User,
    Campaign,
    sequelize,
    Community,
} = require("../../models");


exports.create = async (data, transaction) => {

    console.log(data);

    return await Conversion.create(data, { transaction });

};

exports.findCommunity = async (id) => {
    return Community.findByPk(id, {
        attributes: ["id", "commission_type", "commission_rate", "commission_amount"]
    });
}


exports.getCampaign = async (id) => {


    return await Campaign.findByPk(id, {
        include: [{
            model: Community,
            as: "community",
            attributes: ["id", "commission_type", "commission_rate", "commission_amount", "manager_user_id"]
        }]
    });

};
exports.updateCampaign = async (id, data,transaction) => {
  return Campaign.update(data, {
    where: { id },
    transaction
  });
}

exports.getConversions = async ({
    campaign_id = null,
    influencer_user_id = null,
    limit = 10,
    offset = 0,
    query
}) => {
    const where = {};

    if (query.status&&query.status!="All") {

        where.status = query.status.toLowerCase();
    }

    if (query.search) {
        where.customer_name = { [Op.like]: `%${query.search}%` };
    }

    if (campaign_id) {
        where.campaign_id = campaign_id;
    }

    if (influencer_user_id) {
        where.influencer_user_id = influencer_user_id;
    }


    /*
    |--------------------------------------------------------------------------
    | 1. Summary - count all conversions by status
    |--------------------------------------------------------------------------
    */



    const summaryRows = await Conversion.findAll({

        where,

        attributes: [
            "status",
            [
                sequelize.fn(
                    "COUNT",
                    sequelize.col("id")
                ),
                "count",
            ],
        ],

        group: ["status"],

        raw: true,

    });


    /*
    |--------------------------------------------------------------------------
    | 2. Format summary
    |--------------------------------------------------------------------------
    */

    const summary = {
        total: 0,
        pending: 0,
        confirmed: 0,
        rejected: 0,
    };


    summaryRows.forEach((row) => {

        const count =
            Number(row.count) || 0;

        summary[row.status] = count;

        summary.total += count;

    });


    /*
    |--------------------------------------------------------------------------
    | 3. Get pending conversions first
    |--------------------------------------------------------------------------
    */

    if (query?.status == "") {

        const pendingConversions =
            await Conversion.findAll({

                where: {
                    ...where,
                    status: "pending",
                },

                include: [
                    {
                        model: Campaign,
                        as: "campaign",
                        attributes: [
                            "id",
                            "title",
                        ],
                    },

                    {
                        model: User,
                        as: "influencer",
                        attributes: [
                            "id",
                            "name_or_company_name",
                            "email",
                        ],
                    },
                ],

                order: [
                    ["created_at", "DESC"],
                ],

                limit,

                offset,

            });


        /*
        |--------------------------------------------------------------------------
        | 4. If pending records fill the page
        |--------------------------------------------------------------------------
        */

        if (pendingConversions.length >= limit) {

            return {
                conversions: pendingConversions,
                summary,
            };

        }


        /*
        |--------------------------------------------------------------------------
        | 5. Calculate remaining slots
        |--------------------------------------------------------------------------
        */

        const remaining =
            limit - pendingConversions.length;


        /*
        |--------------------------------------------------------------------------
        | 6. Get confirmed/rejected records
        |--------------------------------------------------------------------------
        */

        const otherConversions =
            await Conversion.findAll({

                where: {
                    ...where,

                    status: {
                        [Op.in]: [
                            "confirmed",
                            "rejected",
                        ],
                    },
                },

                include: [
                    {
                        model: Campaign,
                        as: "campaign",
                        attributes: [
                            "id",
                            "title",
                        ],
                    },

                    {
                        model: User,
                        as: "influencer",
                        attributes: [
                            "id",
                            "name_or_company_name",
                            "email",
                        ],
                    },
                ],

                order: [
                    ["created_at", "DESC"],
                ],

                limit: remaining,

            });


        /*
        |--------------------------------------------------------------------------
        | 7. Pending first + other statuses
        |--------------------------------------------------------------------------
        */

        const conversions = [
            ...pendingConversions,
            ...otherConversions,
        ];


        /*
        |--------------------------------------------------------------------------
        | 8. Return conversions + summary
        |--------------------------------------------------------------------------
        */

        return {
            conversions,
            summary,
        };

    }

    else {
        const conversions =
            await Conversion.findAll({

                where: {
                    ...where,

                },

                include: [
                    {
                        model: Campaign,
                        as: "campaign",
                        attributes: [
                            "id",
                            "title",
                        ],
                    },

                    {
                        model: User,
                        as: "influencer",
                        attributes: [
                            "id",
                            "name_or_company_name",
                            "email",
                        ],
                    },
                ],

                order: [
                    ["created_at", "DESC"],
                ],

                limit,

                offset,

            });

        return {
            conversions,
            summary,
        };
    }

};



exports.getAll = async ({
    userId,
    page,
    limit
}) => {


    const offset =
        (page - 1) * limit;


    return await Conversion.findAndCountAll({

        where: {
            influencer_user_id: userId
        },


        include: [

            {
                model: Campaign,
                as: "campaign"
            },

            {
                model: User,
                as: "influencer",
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


};






exports.getOne = async (id) => {


    return await Conversion.findByPk(
        id,
        {
            include: [
                {
                    model: Campaign,
                    as: "campaign"
                }
            ]
        }
    );

};







exports.updateStatus = async ({
    id,
    status,
    userId,
    reason
}, transaction) => {
    const update = {
        status,
    };
    if (status === "confimed") {
        update.approved_by = userId;
        update.approved_at = new Date();

    }
    if (status === "rejected") {
        update.rejection_reason = reason;
        update.approved_by = userId;
    }
    await Conversion.update(

        update,

        {
            where: {
                id
            },
            transaction
        },

    );


    return await Conversion.findByPk(id);

};