const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const InfluencerAudienceLocation = sequelize.define(
    "InfluencerAudienceLocation",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      influencer_profile_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      country: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      city: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      audience_percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: "influencer_audience_locations",

      underscored: true,

      timestamps: true,

      createdAt: "created_at",

      updatedAt: "updated_at",
    }
  );

  InfluencerAudienceLocation.associate = (models) => {
    InfluencerAudienceLocation.belongsTo(models.InfluencerProfile, {
      foreignKey: "influencer_profile_id",
      as: "influencer_profile",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };

  return InfluencerAudienceLocation;
};