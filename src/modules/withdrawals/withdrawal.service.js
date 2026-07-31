const { Wallet, sequelize } = require("../../models");
const repo = require("./withdrawal.repository");
const walletRepo = require("../wallets/wallet.service");

const VALID_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "paid",
];


exports.create = async ({
  userId,
  body
}) => {


  if (!body.amount)
    throw new Error(
      "Amount required"
    );


  const wallet = await repo.getWallet(userId);



  if (!wallet)
    throw new Error(
      "Wallet not found"
    );



  if (
    Number(wallet.available_balance)
    <
    Number(body.amount)
  ) {
    throw new Error(
      "Insufficient wallet balance"
    );
  }



  return await repo.create({

    requested_by_user_id: userId,

    ...body

  });

};








exports.getAll = async ({ query }) => {
  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 10;

  // Gather structural parameters from query string
  const status = query?.status;
  const bank_type = query?.bank_type;
  const startDate = query?.startDate;
  const endDate = query?.endDate;
  const search = query?.search;

  // Request system calculations from the database repository layer
  const data = await repo.getAll({
    page,
    limit,
    status,
    bank_type,
    startDate,
    endDate,
    search
  });

  return data;
};




exports.getMy = async ({
  userId,
  query,
}) => {

  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 10;


  // Get wallet summary


  // Get paginated transactions
  const data = await repo.getMy({
    userId,
    page,
    limit,
  });


  return data;
};
exports.getById = async ({
  id,

}) => {



  // Get wallet summary

  console.log(id);

  // Get paginated transactions
  const data = await repo.getById(id);


  return data;
};
exports.update = async ({
  id,
  body,
  userId
}) => {

  const { status,
    rejection_reason,
    transaction_reference,
    note, } = body
  if (!id) {
    throw new Error("Withdrawal ID is required");
  }

  if (!status) {
    throw new Error("Status is required");
  }

console.log(status);


  if (!VALID_STATUSES.includes(String(status).toLowerCase())) {
    throw new Error(
      `Invalid withdrawal status. Allowed values: ${VALID_STATUSES.join(
        ", "
      )}`
    );
  }

  const withdrawal = await repo.getById(id);

  if (!withdrawal) {
    throw new Error("Withdrawal not found");
  }


  const transaction = await sequelize.transaction();

  try {
    const updateData = {
      status,
    };


    /*
    |--------------------------------------------------------------------------
    | REJECTED
    |--------------------------------------------------------------------------
    */

    if (status === "rejected") {
      if (!rejection_reason?.trim()) {
        throw new Error(
          "Rejection reason is required"
        );
      }

      updateData.rejected_by_user_id = userId;
      updateData.rejected_at = new Date();
      updateData.rejection_reason =
        rejection_reason.trim();

      // Clear approval information
      updateData.approved_by_user_id = null;
      updateData.approved_at = null;
    }



    if (status === "approved") {
      updateData.approved_by_user_id = userId;
      updateData.approved_at = new Date();

      // Clear rejection information
      updateData.rejected_by_user_id = null;
      updateData.rejected_at = null;
      updateData.rejection_reason = null;
    }


    if (status === "paid") {
      if (!transaction_reference?.trim()) {
        throw new Error(
          "Transaction reference is required when marking withdrawal as paid"
        );
      }

      updateData.paid_by_user_id = userId;
      updateData.paid_at = new Date();
      updateData.transaction_reference =
        transaction_reference.trim();
    }


    /*
    |--------------------------------------------------------------------------
    | PENDING
    |--------------------------------------------------------------------------
    */

    if (status === "pending") {
      updateData.approved_by_user_id = null;
      updateData.approved_at = null;
      updateData.rejected_by_user_id = null;
      updateData.rejected_at = null;
      updateData.rejection_reason = null;
      updateData.paid_by_user_id = null;
      updateData.paid_at = null;
      updateData.transaction_reference = null;
    }




    if (note !== undefined) {
      updateData.note = note;
    }



    const updatedWithdrawal =
      await repo.updateById({
        id,
        data: updateData,
        transaction,
      });


    /*
    |--------------------------------------------------------------------------
    | WALLET
    |--------------------------------------------------------------------------
    |
    | Only confirm wallet withdrawal when it becomes approved.
    |
    */

    if (status === "approved") {
      await walletRepo.withdraw({ user_id:  withdrawal.requested_by_user_id,
        withdrawal_id:  withdrawal.id,
         amount: withdrawal.amount,transaction
      });
    }


  


    await transaction.commit();

    /*
    |--------------------------------------------------------------------------
    | Return complete updated withdrawal
    |--------------------------------------------------------------------------
    */

    return await repo.getById(id);
  } catch (error) {
    await transaction.rollback();

    throw error;
  }
};