const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Session = sequelize.define(
    "Session",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      refresh_token: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      device: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      device_type: {
        type: DataTypes.ENUM(
          "web",
          "android",
          "ios",
          "other"
        ),
        allowNull: false,
        defaultValue: "web",
      },

      ip_address: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      user_agent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      last_login_time: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },

      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      is_revoked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      revoked_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "sessions",

      underscored: true,

      timestamps: true,

      createdAt: "created_at",

      updatedAt: "updated_at",

      indexes: [
        {
          fields: ["user_id"],
        },
        {
          unique: true,
          fields: ["refresh_token"],
        },
      ],
    }
  );

  Session.associate = (models) => {
    Session.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };

  return Session;
};