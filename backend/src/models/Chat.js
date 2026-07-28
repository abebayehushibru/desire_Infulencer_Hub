const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Chat = sequelize.define(
    "Chat",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      // campaign | community
      type: {
        type: DataTypes.ENUM("campaign", "community"),
        allowNull: false,
      },

      // Campaign ID or Community ID
      target_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },


      // Agent assigned to this chat
      agent_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      // Whether chatting is allowed
      is_allowed: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },

      status: {
        type: DataTypes.ENUM(
          "pending",
          "active",
          "closed",
          "archived"
        ),
        defaultValue: "active",
      },

      created_by_user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      tableName: "chats",
      underscored: true,
    }
  );

  Chat.associate = (models) => {
  // Agent
  Chat.belongsTo(models.User, {
    foreignKey: "agent_id",
    as: "agent",
  });

  // Creator
  Chat.belongsTo(models.User, {
    foreignKey: "created_by_user_id",
    as: "created_by",
  });

  // Campaign Chat
  Chat.belongsTo(models.Campaign, {
    foreignKey: "target_id",
    as: "campaign",
    constraints: false,
  });

  // Community Chat
  Chat.belongsTo(models.Community, {
    foreignKey: "target_id",
    as: "community",
    constraints: false,
  });

  // Messages
  Chat.hasMany(models.Message, {
    foreignKey: "chat_id",
    as: "messages",
    onDelete: "CASCADE",
  });
};

  return Chat;
};