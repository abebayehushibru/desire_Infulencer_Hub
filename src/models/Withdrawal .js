const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Withdrawal = sequelize.define(
    "Withdrawal",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      // Influencer requesting withdrawal
      requested_by_user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      // Amount to withdraw
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },

      // Recipient information
      full_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      account_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },

      bank_type: {
        type: DataTypes.ENUM(
          "cbe",
          "dashen"
        ),
        allowNull: false,
      },

      // Request Status
      status: {
        type: DataTypes.ENUM(
          "pending",
          "approved",
          "rejected",
          "paid"
        ),
        defaultValue: "pending",
      },

      // Approval
      approved_by_user_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      approved_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      // Rejection
      rejected_by_user_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      rejected_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      // Payment
      paid_by_user_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      paid_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      transaction_reference: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "withdrawals",
      underscored: true,
    }
  );

  Withdrawal.associate = (models) => {
    Withdrawal.belongsTo(models.User, {
      foreignKey: "requested_by_user_id",
      as: "requested_by",
    });

    Withdrawal.belongsTo(models.User, {
      foreignKey: "approved_by_user_id",
      as: "approved_by",
    });

    Withdrawal.belongsTo(models.User, {
      foreignKey: "rejected_by_user_id",
      as: "rejected_by",
    });

    Withdrawal.belongsTo(models.User, {
      foreignKey: "paid_by_user_id",
      as: "paid_by",
    });
  };

  return Withdrawal;
};