const walletRepo = require("./wallet.repository");

exports.addPending= async ({
  datas,
  transaction,
}) => {
  return walletRepo.addPending({
    datas,
    transaction,
  });
};

exports.confirm = async ({
  datas,
  transaction,
}) => {
  return walletRepo.confirm({
    datas,
    transaction,
  });
};

exports.reject = async ({
  datas,
  transaction,
}) => {
  return walletRepo.reject({
    datas,
    transaction,
  });
};


exports.withdraw = async (datas) => {
  console.log(datas);
  
  return walletRepo.withdraw(datas);
};


exports.recharge = async (datas) => {
  console.log(datas);
  
  return walletRepo.recharge(datas);
};