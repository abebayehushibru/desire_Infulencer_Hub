const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CampaignClaim = sequelize.define(
    "CampaignClaim",
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
     
    },
    {
      tableName: "campaign_claims",

      timestamps: true,

      underscored: true,

      createdAt: "created_at",

      updatedAt: "updated_at",

      indexes: [
        {
          fields: ["campaign_id"],
        },
        {
          fields: ["influencer_user_id"],
        },
       
        {
          unique: true,
          fields: [
            "campaign_id",
            "influencer_user_id",
          ],
        },
      ],
    }
  );

  CampaignClaim.associate = (models) => {
    CampaignClaim.belongsTo(models.Campaign, {
      foreignKey: "campaign_id",
      as: "campaign",
    });

    CampaignClaim.belongsTo(models.User, {
      foreignKey: "influencer_user_id",
      as: "influencer",
    });

    CampaignClaim.belongsTo(models.User, {
      foreignKey: "reviewed_by_user_id",
      as: "reviewed_by",
    });
  };

  return CampaignClaim;
};