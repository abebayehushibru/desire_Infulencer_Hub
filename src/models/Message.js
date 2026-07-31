const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Message = sequelize.define(
    "Message",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      chat_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      sender_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      // text | image | voice
      type: {
        type: DataTypes.ENUM(
          "text",
          "image",
          "voice",
          'document',
          'video'
        ),
        allowNull: false,
      },

      // Used only for text
      message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      // Used for image or voice
      document_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      is_deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "messages",
      underscored: true,
    }
  );
Message.associate = (models) => {
  Message.belongsTo(models.Chat, {
    foreignKey: "chat_id",
    as: "chat",
  });

  Message.belongsTo(models.User, {
    foreignKey: "sender_id",
    as: "sender",
  });

  Message.belongsTo(models.Document, {
    foreignKey: "document_id",
    as: "document",
  });
};
  return Message;
};