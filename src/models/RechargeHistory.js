const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const RechargeHistory = sequelize.define(
    "RechargeHistory",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      // Business User
      business_user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },

      currency: {
        type: DataTypes.ENUM("ETB"),
        defaultValue: "ETB",
      },

      bank_type: {
        type: DataTypes.ENUM(
          "CBE",
          "Telebirr",
          "Awash",
          "Dashen",
          "Abyssinia",
          "BOA",
          "Other"
        ),
        allowNull: false,
      },

      transaction_reference: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },

      payment_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      receipt_document_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM(
          "pending",
          "verified",
          "rejected"
        ),
        defaultValue: "pending",
      },

      verified_by_user_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      verified_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "recharge_histories",
      underscored: true,
      timestamps: true,
    }
  );

  RechargeHistory.associate = (models) => {
    RechargeHistory.belongsTo(models.User, {
      foreignKey: "business_user_id",
      as: "business",
    });

    RechargeHistory.belongsTo(models.User, {
      foreignKey: "verified_by_user_id",
      as: "verified_by",
    });

    RechargeHistory.belongsTo(models.Document, {
      foreignKey: "receipt_document_id",
      as: "receipt",
    });
  };

  return RechargeHistory;
};