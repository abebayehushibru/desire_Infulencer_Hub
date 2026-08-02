const { User, Session, BusinessProfile, InfluencerProfile, CommunityMember, Document } = require("../../models");

exports.findByAll = async (email) => {
  return await User.findAll();
};
// Find user by email

exports. findByEmail = async (email) => {
  return await User.findOne({
    where: { email },
    include: [
      {
        model: BusinessProfile,
        as: "business_profile",

        attributes:["subscription_start_date","subscription_end_date","is_verified"]
      },
      {
        model: InfluencerProfile,
        as: "influencer_profile",
        attributes:["is_verified","main_platform","followers_count","level"]
      },
      {
        model: CommunityMember,
        as: "community_memberships",
        attributes:["community_id"]
        
      },
      {
        model: Document,
        as: "profile_photo",
    attributes:["file_url"]
      },
    ],
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