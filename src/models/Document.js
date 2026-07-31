const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Document = sequelize.define(
    "Document",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      uploaded_by_user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      original_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      file_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      file_url: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      mime_type: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      media_type: {
        type: DataTypes.ENUM(
          "image",
          "video",
          "pdf",
          "audio",
          "document",
          "other"
        ),
        allowNull: false,
      },

      extension: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },

      file_size: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },

      visibility: {
        type: DataTypes.ENUM(
          "public",
          "private"
        ),
        allowNull: false,
        defaultValue: "private",
      },

      status: {
        type: DataTypes.ENUM(
          "active",
          "deleted"
        ),
        allowNull: false,
        defaultValue: "active",
      },
    },
    {
      tableName: "documents",

      underscored: true,

      timestamps: true,

      createdAt: "created_at",

      updatedAt: "updated_at",

      indexes: [
        {
          fields: ["uploaded_by_user_id"],
        },
        {
          fields: ["media_type"],
        },
      ],
    }
  );

  Document.associate = (models) => {
    // Uploaded By
    Document.belongsTo(models.User, {
      foreignKey: "uploaded_by_user_id",
      as: "uploaded_by",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // User Profile Photos
    Document.hasMany(models.User, {
      foreignKey: "profile_photo_document_id",
      as: "profile_users",
    });

    // Business License Documents
    Document.hasMany(models.BusinessProfile, {
      foreignKey: "licence_document_id",
      as: "business_licenses",
    });

    // Campaign Main Document
    Document.hasMany(models.Campaign, {
      foreignKey: "campaign_document_id",
      as: "campaigns",
    });
    Document.hasMany(models.Community, {
      foreignKey: "profile_photo_document_id",
      as: "profilePhotoCommunities",
    });

    // Cover photo relationship
    Document.hasMany(models.Community, {
      foreignKey: "cover_photo_document_id",
      as: "coverPhotoCommunities",
    });

    // // Campaign Partner Agreement/Contract
    // Document.hasMany(models.CampaignPartner, {
    //   foreignKey: "campaign_document_id",
    //   as: "campaign_partners",
    // });
  };

  return Document;
};