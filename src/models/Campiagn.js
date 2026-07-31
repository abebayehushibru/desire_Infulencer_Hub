const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Campaign = sequelize.define(
    "Campaign",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      business_user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      // Sales | Awareness | Growth
      type: {
        type: DataTypes.ENUM(
          "sales",
          "awareness",
          "growth"
        ),
        allowNull: false,
      },

      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      video_document_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      photo_document_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      end_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      // ["Ethiopia","USA"]
      locations: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      // ["Addis Ababa","Adama"]
      ethiopia_locations: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      // {
      //   tiktok:true,
      //   facebook:false,
      //   instagram:false
      // }
      platforms: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {
          tiktok: true,
          facebook: false,
          instagram: false,
        },
      },

      run_type: {
        type: DataTypes.ENUM(
          "manual",
          "automatic",
          "both"
        ),
        defaultValue: "manual",
      },

      // Sales only
      fund_type: {
        type: DataTypes.ENUM(
          "conversion",
          "fixed"
        ),
        allowNull: true,
      },

      conversion_rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },

      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },

      total_budget: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },

      // Awareness
      total_views: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      // Growth
      followers: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      follower_price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },

      // Tracking
      conversion_event: {
        type: DataTypes.ENUM(
          "purchase",
          "signup",
          "lead",
          "pageview"
        ),
        defaultValue: "purchase",
      },
      commission_rule_type: {
        type: DataTypes.ENUM(
          "Rate",
          "Fixed"
        ),
        allowNull: true,
      },

      commission_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },

      // Target
      target_type: {
        type: DataTypes.ENUM(
          "community",
          "influencer"
        ),
        allowNull: false,
      },

      target_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      rejected_by_user_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      rejected_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM('draft', 'pending', 'approved', 'rejected', 'accepted', 'onbudget', 'active', 'paused', 'completed', 'cancelled'

        ),
        defaultValue: "draft",
      },
    },
    {
      tableName: "campaigns",

      timestamps: true,

      underscored: true,

      createdAt: "created_at",

      updatedAt: "updated_at",

      indexes: [
        {
          fields: ["business_user_id"],
        },
        {
          fields: ["target_type"],
        },
        {
          fields: ["target_id"],
        },
        {
          fields: ["status"],
        },
        {
          fields: ["type"],
        },
      ],
    }
  );

  Campaign.associate = (models) => {
    // Business Owner
    Campaign.belongsTo(models.User, {
      foreignKey: "business_user_id",
      as: "business",
    });

    Campaign.belongsTo(models.User, {
      foreignKey: "rejected_by_user_id",
      as: "rejected_by",

    });

    // Campaign Video
    Campaign.belongsTo(models.Document, {
      foreignKey: "video_document_id",
      as: "video",
    });

    // Community Target
    Campaign.belongsTo(models.Community, {
      foreignKey: "target_id",
      constraints: false,
      as: "community",
    });

    // Influencer Target
    Campaign.belongsTo(models.User, {
      foreignKey: "target_id",
      constraints: false,
      as: "influencer",
    });
    Campaign.hasMany(models.CampaignClaim, {
      foreignKey: "campaign_id", // Must match your snake_case column
      as: "claims",      // Or whatever plural alias you prefer
    });


    Campaign.hasOne(models.Chat, {
      foreignKey: "target_id",
      as: "chat",
      constraints: false,
    });
    Campaign.hasMany(models.Conversion, {
      foreignKey: "campaign_id",
      as: "conversions",
      // constraints: false,
    });
  };

  return Campaign;
};