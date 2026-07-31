const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const ConversionnPayout = sequelize.define(
        "ConversionnPayout",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },

            conversion_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },

            user_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },

            payout_reason: {
                type: DataTypes.ENUM(
                    "influencer",
                    "leader"
                ),
                allowNull: false,
            },

            payout_type: {
                type: DataTypes.ENUM(
                    "percentage",
                    "fixed"
                ),
                allowNull: false,
            },

            payout_rate: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0,
            },

            payout_amount: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0,
            },

            currency: {
                type: DataTypes.ENUM(
                    "ETB"
                ),
                allowNull: false,
                defaultValue: "ETB",
            },
        },
        {
            tableName: "campaign_payouts",

            underscored: true,

            timestamps: true,

            createdAt: "created_at",
            updatedAt: "updated_at",

            indexes: [
                {
                    fields: ["conversion_id"],
                },
                {
                    fields: ["user_id"],
                },
                {
                    fields: ["payout_reason"],
                },
                {
                    fields: ["payout_type"],
                },
            ],
        }
    );

    ConversionnPayout.associate = (models) => {

        // Campaign Conversion
        ConversionnPayout.belongsTo(models.Conversion, {
            foreignKey: "conversion_id",
            as: "conversion",
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        });


        // User receiving the payout
        ConversionnPayout.belongsTo(models.User, {
            foreignKey: "user_id",
            as: "user",
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        });

    };

    return ConversionnPayout;
};