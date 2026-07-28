const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const InfluencerProfile = sequelize.define(
    "InfluencerProfile",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
      },

      main_platform: {
        type: DataTypes.ENUM(
          "tiktok",
          "facebook",
          "instagram",
          "youtube",
          "telegram",
          "other"
        ),
        allowNull: false,
      },

      profile_link: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },

      followers_count: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
      },

      level: {
        type: DataTypes.ENUM(
          "bronze",
          "silver",
          "gold",
          "diamond"
        ),
        allowNull: true,
      },

      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      address: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      languages: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },

      is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      verified_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "influencer_profiles",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",

      indexes: [
        {
          unique: true,
          fields: ["user_id"],
        },
        {
          fields: ["main_platform"],
        },
        {
          fields: ["followers_count"],
        },
      ],
    }
  );

  InfluencerProfile.associate = (models) => {
    InfluencerProfile.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    InfluencerProfile.hasMany(models.InfluencerAudienceLocation, {
      foreignKey: "influencer_profile_id",
      as: "audience_locations",
    });
  };

  return InfluencerProfile;
};