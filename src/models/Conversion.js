const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Conversion = sequelize.define(
        "Conversion",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },

            campaign_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },

            influencer_user_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            influencer_commission_amount: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0,
            },

            leader_user_id: {
                type: DataTypes.UUID,
                allowNull: true,
            },
            leader_commission_amount: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0,
            },
            total_commission_amount: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0,
            },

            customer_name: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            phone_number: {
                type: DataTypes.STRING(20),
                allowNull: false,
            },

            telegram_username: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            platform: {
                type: DataTypes.ENUM(
                    "facebook",
                    "instagram",
                    "tiktok",
                    "youtube",
                    "telegram",
                    "website",
                    "other"
                ),
                allowNull: false,
            },

            paid_amount: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0,
            },



            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },

            status: {
                type: DataTypes.ENUM(
                    "pending",
                    "confirmed",
                    "rejected"
                ),
                defaultValue: "pending",
            },


            // Approved by user
            approved_by_user_id: {
                type: DataTypes.UUID,
                allowNull: true,
            },


            approved_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            rejected_by_user_id: {
                type: DataTypes.UUID,
                allowNull: true,
            },

            rejection_reason: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            tableName: "conversions",
            underscored: true,

            timestamps: true,

            createdAt: "created_at",

            updatedAt: "updated_at",


        }
    );


    Conversion.associate = (models) => {


        // Campaign
        Conversion.belongsTo(models.Campaign, {
            foreignKey: "campaign_id",
            as: "campaign",
        });


        // Influencer who created conversion
        Conversion.belongsTo(models.User, {
            foreignKey: "influencer_user_id",
            as: "influencer",
        });
        Conversion.belongsTo(models.User, {
            foreignKey: "leader_user_id",
            as: "leader",
        });


        // User who approved conversion
        Conversion.belongsTo(models.User, {
            foreignKey: "approved_by_user_id",
            as: "approvered_by",
        });

        Conversion.belongsTo(models.User, {
            foreignKey: "rejected_by_user_id",
            as: "rejected_by",
        });

        Conversion.hasMany(models.ConversionPayout, {
            foreignKey: "conversion_id",
            as: "conversions",
        });


    };


    return Conversion;
};