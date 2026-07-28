const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CommunityMember = sequelize.define(
    "CommunityMember",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      community_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      role: {
        type: DataTypes.ENUM(
          "leader",
          "agent",
          "member"
        ),
        defaultValue: "member",
      },

      status: {
        type: DataTypes.ENUM(
          "pending",
          "approved",
          "rejected",
          "removed",
          "left"
        ),
        defaultValue: "approved",
      },

      joined_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },

      left_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      invited_by_user_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      approved_by_user_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "community_members",

      underscored: true,

      timestamps: true,

      createdAt: "created_at",

      updatedAt: "updated_at",

      indexes: [
        {
          unique: true,
          fields: [
            "community_id",
            "user_id",
          ],
        },
        {
          fields: ["role"],
        },
        {
          fields: ["status"],
        },
      ],
    }
  );

  CommunityMember.associate = (models) => {
    CommunityMember.belongsTo(models.Community, {
      foreignKey: "community_id",
      as: "community",
    });

    CommunityMember.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });

    CommunityMember.belongsTo(models.User, {
      foreignKey: "invited_by_user_id",
      as: "invited_by",
    });

    CommunityMember.belongsTo(models.User, {
      foreignKey: "approved_by_user_id",
      as: "approved_by",
    });
  };

  return CommunityMember;
};