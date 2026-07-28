const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      name_or_company_name: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },

      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },

      phone1: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },

      phone2: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },

      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      role: {
        type: DataTypes.ENUM(
          "super_admin",
          "admin",
          "business",
          "influencer",
          "agent"
        ),
        allowNull: false,
        defaultValue: "influencer",
      },

      status: {
        type: DataTypes.ENUM(
          "pending",
          "active",
          "inactive",
          "blocked"
        ),
        allowNull: false,
        defaultValue: "pending",
      },

      email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      phone_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      last_login_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      profile_photo_document_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
    },
    {
      tableName: "users",

      underscored: true,

      timestamps: true,

      createdAt: "created_at",

      updatedAt: "updated_at",
    }
  );

  User.associate = (models) => {
    // Sessions
    User.hasMany(models.Session, {
      foreignKey: "user_id",
      as: "sessions",
    });

    // Business Profile
    User.hasOne(models.BusinessProfile, {
      foreignKey: "user_id",
      as: "business_profile",
    });

    // Influencer Profile
    User.hasOne(models.InfluencerProfile, {
      foreignKey: "user_id",
      as: "influencer_profile",
    });

    // Profile Image
    User.belongsTo(models.Document, {
      foreignKey: "profile_photo_document_id",
      as: "profile_photo",
    });

    // // Communities
    User.hasMany(models.CommunityMember, {
      foreignKey: "user_id",
      as: "community_memberships",
    });

    // // Messages
    // User.hasMany(models.Message, {
    //   foreignKey: "user_id",
    //   as: "messages",
    // });

    // // Payments
    // User.hasMany(models.Payment, {
    //   foreignKey: "user_id",
    //   as: "payments",
    // });

    // // Commission Summary
    // User.hasOne(models.CommissionSummary, {
    //   foreignKey: "user_id",
    //   as: "commission_summary",
    // });

    // // Campaign Commission Records
    // User.hasMany(models.CampaignCommission, {
    //   foreignKey: "influencer_user_id",
    //   as: "campaign_commissions",
    // });

    // User.hasMany(models.CampaignCommission, {
    //   foreignKey: "recorded_by_business_user_id",
    //   as: "recorded_commissions",
    // });

    // // Campaign Partners
    // User.hasMany(models.CampaignPartner, {
    //   foreignKey: "influencer_user_id",
    //   as: "campaign_partnerships",
    // });

    // // Notifications
    // User.hasMany(models.Notification, {
    //   foreignKey: "user_id",
    //   as: "notifications",
    // });

    // // Wallet
    // User.hasOne(models.Wallet, {
    //   foreignKey: "user_id",
    //   as: "wallet",
    // });

    // // Applications
    // User.hasMany(models.CampaignApplication, {
    //   foreignKey: "user_id",
    //   as: "campaign_applications",
    // });

    // // Audit Logs
    // User.hasMany(models.AuditLog, {
    //   foreignKey: "admin_user_id",
    //   as: "audit_logs",
    // });

    // // Commission Transactions
    // User.hasMany(models.CommissionTransaction, {
    //   foreignKey: "user_id",
    //   as: "commission_transactions",
    // });
  };

  return User;
};