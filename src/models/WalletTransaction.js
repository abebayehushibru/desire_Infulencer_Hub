const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const WalletTransaction = sequelize.define(
    "WalletTransaction",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      wallet_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      type: {
        type: DataTypes.ENUM(
          "earning",
          "withdrawal",
          "refund",
          "adjustment",
          "campaign_hold",
          "campaign_release"
        ),
        allowNull: false,
      },

      direction: {
        type: DataTypes.ENUM(
          "credit",
          "debit"
        ),
        allowNull: false,
      },

      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },

      balance_before: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },

      balance_after: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },

      conversion_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      withdrawal_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "wallet_transactions",
      underscored: true,
    }
  );

  WalletTransaction.associate = (models) => {
    WalletTransaction.hasOne(models.Wallet, {
      foreignKey: "wallet_id",
      as: "wallet",
    });

  

    WalletTransaction.belongsTo(models.Conversion, {
      foreignKey: "conversion_id",
      as: "conversion",
    });

    WalletTransaction.belongsTo(models.Withdrawal, {
      foreignKey: "withdrawal_id",
      as: "withdrawal",
    });
  };

  return WalletTransaction;
};

