const { User, Session } = require("../../models");

exports.findByAll = async (email) => {
  return await User.findAll();
};
// Find user by email

exports.findByEmail = async (email) => {
  console.log(email);
  
  return await User.findOne({
    where: {
      email,
    },
  });
};


// Find user by id

exports.findById = async (id) => {
  return await User.findByPk(id);
};


// Update user

exports.updateUser = async (id, data) => {
console.log(id,data);

  return await User.update(
    data,
    {
      where: {
        id,
      },
    }
  );

};


// Create session

exports.createSession = async (data) => {

  return await Session.create(data);

};


// Find session

exports.findSession = async (token) => {

  return await Session.findOne({
    where:{
      refresh_token: token
    }
  });

};


// Delete session

exports.deleteSession = async (token)=>{

  return await Session.destroy({
    where:{
      refresh_token:token
    }
  });

};