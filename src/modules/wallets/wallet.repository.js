const { Wallet, WalletTransaction, User } = require("../../models");

const findOne = async (user_id,transaction) => {
  const user =User.findOne({where:{
    id:user_id
  }})
  if (!user) {
    throw new Error("User not found");
    
  }
  let wallet = await Wallet.findOne({
    where: {
      user_id: user_id,
    },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!wallet) {
    wallet = await Wallet.create(
      {
        user_id: user_id,
        total_earned: 0,
        total_withdrawn: 0,
        available_balance: 0,
        pending_balance: 0,
      },
      {
        transaction,
      }
    );
  }

  return wallet
}
exports.findByUserId= async (user_id,transaction)=>{
  return await findOne(user_id,transaction)
}
exports.addPending = async ({
  datas,
  transaction,
}) => {
  
  const wallet = await findOne(datas.user_id,transaction)

  const before = Number(wallet.pending_balance);

  const amount = Number(
    datas.payout_amount
  );

  await wallet.update(
    {
      pending_balance: before + amount,
    },
    { transaction }
  );


};
exports.confirm = async ({
  datas,
  transaction,
}) => {

  const wallet = await findOne(
    datas.user_id,
    transaction
  );

  if (!wallet) {
    throw new Error("Wallet not found");
  }


  const amount = Number(datas.payout_amount);

  if (!amount || amount <= 0) {
    throw new Error("Invalid payout amount");
  }


  // Save old balances BEFORE update
  const balanceBefore =
    Number(wallet.available_balance);

  const pendingBefore =
    Number(wallet.pending_balance);

  const totalEarnedBefore =
    Number(wallet.total_earned);


  console.log("balance before:", balanceBefore);
  console.log("pending before:", pendingBefore);


  // Calculate new balances
  const pendingAfter =
    pendingBefore - amount;

  const availableAfter =
    balanceBefore + amount;

  const totalEarnedAfter =
    totalEarnedBefore + amount;


  // Prevent negative pending balance
  if (pendingAfter < 0) {
    throw new Error(
      "Payout amount is greater than pending balance"
    );
  }


  // Update wallet
  await wallet.update(
    {
      pending_balance: pendingAfter,
      available_balance: availableAfter,
      total_earned: totalEarnedAfter,
    },
    {
      transaction,
    }
  );


  console.log(
    "balance after:",
    wallet.available_balance
  );


  // Create wallet transaction
  await WalletTransaction.create(
    {
      wallet_id: wallet.id,

      user_id: wallet.user_id,

      type: "earning",

      direction: "credit",

      amount,

      balance_before: balanceBefore,

      balance_after: availableAfter,

      conversion_id: datas.id,

      description: "approved",
    },
    {
      transaction,
    }
  );


  return wallet;
};

exports.reject = async ({
  datas,
  transaction,
}) => {
  const wallet = await findOne(datas.user_id,transaction)


  const amount = Number(
    datas.payout_amount
  );

  await wallet.update(
    {
      pending_balance:
        Number(wallet.pending_balance) - amount,
    },
    { transaction }
  );

  await WalletTransaction.create(
    {
      wallet_id: wallet.id,
      user_id: wallet.user_id,

      type: "adjustment",
      direction: "debit",

      amount,

      balance_before: Number(
        wallet.pending_balance
      ),

      balance_after:
        Number(wallet.pending_balance) - amount,

      conversion_id: datas.id,

      description: "datas rejected ",
    },
    { transaction }
  );
};

exports.withdraw = async ({
  user_id,
  withdrawal_id,
  amount,
  transaction,
}) => {
  const wallet = await findOne(user_id, transaction);

  if (!wallet) {
    throw new Error("Wallet not found");
  }

  const withdrawAmount = Number(amount);

  if (!withdrawAmount || withdrawAmount <= 0) {
    throw new Error("Invalid withdrawal amount");
  }

  const availableBefore = Number(wallet.available_balance);

  if (availableBefore < withdrawAmount) {
    throw new Error("Insufficient available balance");
  }

  const availableAfter = availableBefore - withdrawAmount;

  const totalWithdrawnBefore = Number(wallet.total_withdrawn);

  const totalWithdrawnAfter =
    totalWithdrawnBefore + withdrawAmount;

  await wallet.update(
    {
      available_balance: availableAfter,
      total_withdrawn: totalWithdrawnAfter,
    },
    {
      transaction,
    }
  );

  await WalletTransaction.create(
    {
      wallet_id: wallet.id,
      user_id: wallet.user_id,

      type: "withdrawal",
      direction: "debit",

      amount: withdrawAmount,

      balance_before: availableBefore,
      balance_after: availableAfter,

      withdrawal_id,

      description: "Withdrawal request created",
    },
    {
      transaction,
    }
  );

  return wallet;
};

exports.recharge = async ({
  user_id,
  recharge_id,
  amount,
  transaction,
}) => {
  const wallet = await findOne(user_id, transaction);

  if (!wallet) {
    throw new Error("Wallet not found");
  }

  const rechargeAmount = Number(amount);

  if (!rechargeAmount || rechargeAmount <= 0) {
    throw new Error("Invalid recharge amount");
  }

  const availableBefore = Number(wallet.available_balance);

  const availableAfter =
    availableBefore + rechargeAmount;

  const totalRechargedBefore =
    Number(wallet.total_recharged || 0);

  const totalRechargedAfter =
    totalRechargedBefore + rechargeAmount;

  await wallet.update(
    {
      available_balance: availableAfter,
      total_recharged: totalRechargedAfter,
    },
    {
      transaction,
    }
  );

  await WalletTransaction.create(
    {
      wallet_id: wallet.id,
      user_id: wallet.user_id,

      type: "refund",
      direction: "credit",

      amount: rechargeAmount,

      balance_before: availableBefore,
      balance_after: availableAfter,

      description: `Wallet recharged successfully   recharge_id: ${  recharge_id}`,
    },
    {
      transaction,
    }
  );

  return wallet;
};

exports.holdBalance = async ({
  user_id,
  campaign_id,
  amount,
  transaction,
}) => {
  const wallet = await findOne(user_id, transaction);

  if (!wallet) {
    throw new Error("Wallet not found");
  }

  const holdAmount = Number(amount);

  if (!holdAmount || holdAmount <= 0) {
    throw new Error("Invalid amount");
  }

  const availableBefore = Number(wallet.available_balance);

  if (availableBefore < holdAmount) {
    throw new Error("Insufficient available balance");
  }

  const holdBefore = Number(wallet.holded_balance || 0);

  const availableAfter = availableBefore - holdAmount;
  const holdAfter = holdBefore + holdAmount;

  await wallet.update(
    {
      available_balance: availableAfter,
      holded_balance: holdAfter,
    },
    { transaction }
  );

  await WalletTransaction.create(
    {
      wallet_id: wallet.id,
      user_id: wallet.user_id,

      type: "campaign_hold",
      direction: "debit",

      amount: holdAmount,

      balance_before: availableBefore,
      balance_after: availableAfter,

      campaign_id,

      description: `Campaign budget reserved campaign_id: ${campaign_id}`,
    },
    { transaction }
  );

  return wallet;
};

exports.releaseHold = async ({
  user_id,
  campaign_id,
  amount,
  transaction,
}) => {
  const wallet = await findOne(user_id, transaction);

  const releaseAmount = Number(amount);

  const holdBefore = Number(wallet.holded_balance);
  const availableBefore = Number(wallet.available_balance);

  if (holdBefore < releaseAmount) {
    throw new Error("Invalid release amount");
  }

  await wallet.update(
    {
      holded_balance: holdBefore - releaseAmount,
      available_balance: availableBefore + releaseAmount,
    },
    { transaction }
  );

  await WalletTransaction.create(
    {
      wallet_id: wallet.id,
      user_id: wallet.user_id,

      type: "campaign_release",
      direction: "credit",

      amount: releaseAmount,

      balance_before: availableBefore,
      balance_after: availableBefore + releaseAmount,

   

      description: `Unused campaign budget released. campaign_id: ${   campaign_id}`,
    },
    { transaction }
  );

  return wallet;
};

exports.consumeHoldedBalance = async ({
  user_id,
  campaign_id,
  amount,
  description,
  transaction,
  conversion_id
}) => {
  const wallet = await findOne(user_id, transaction);

  if (!wallet) {
    throw new Error("Wallet not found");
  }

  const spendAmount = Number(amount);

  if (spendAmount <= 0) {
    throw new Error("Invalid amount");
  }

  const holdedBefore = Number(wallet.holded_balance || 0);

  if (holdedBefore < spendAmount) {
    throw new Error("Insufficient held balance");
  }

  const holdedAfter = holdedBefore - spendAmount;

  await wallet.update(
    {
      holded_balance: holdedAfter,
    },
    { transaction }
  );

  await WalletTransaction.create(
    {
      wallet_id: wallet.id,
      user_id,

      type: "campaign_spend",
      direction: "debit",

      amount: spendAmount,

      balance_before: holdedBefore,
      balance_after: holdedAfter,

      campaign_id,

      description:
        `Campaign payout for campaign  : conversion_${conversion_id} - ${description}`,
    },
    { transaction }
  );

  return wallet;
};