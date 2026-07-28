const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const BusinessProfile = sequelize.define(
    "BusinessProfile",
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

      company_address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      business_category: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      website: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      facebook: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      instagram: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      telegram: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      tiktok: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      company_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      company_logo_document_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      licence_document_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      subscription_type: {
        type: DataTypes.ENUM(
          "free",
          "basic",
          "premium",
          "enterprise"
        ),
        allowNull: false,
        defaultValue: "free",
      },

      subscription_start_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      subscription_end_date: {
        type: DataTypes.DATE,
        allowNull: true,
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
      tableName: "business_profiles",

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
          fields: ["business_category"],
        },
        {
          fields: ["subscription_type"],
        },
      ],
    }
  );

  BusinessProfile.associate = (models) => {
    // Owner
    BusinessProfile.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // Company Logo
    BusinessProfile.belongsTo(models.Document, {
      foreignKey: "company_logo_document_id",
      as: "company_logo",
    });

    // Business License
    BusinessProfile.belongsTo(models.Document, {
      foreignKey: "licence_document_id",
      as: "business_license",
    });
  };

  return BusinessProfile;
};