const { Op } = require("sequelize");

const {
  Chat,
  Message,
  User,
  Campaign,
} = require("../../models");
exports.findCampaignChat = async (
  campaignId
)=>{

  return await Chat.findOne({

    where:{
      type:"campaign",
      target_id:campaignId,
    }

  });

};

exports.createCampaignChat = async ({
  campaignId,
  agentId,
  userId,
})=>{


  const campaign =
    await Campaign.findByPk(campaignId);


  if(!campaign){
    throw new Error(
      "Campaign not found"
    );
  }



  const chat =
    await Chat.create({

      type:"campaign",

      target_id:campaignId,

      agent_id:agentId,

      created_by_user_id:userId,

      status:"active",

      is_allowed:true,

    });



  return await Chat.findByPk(chat.id,{

    include:[

      {
        model:User,
        as:"agent",
        attributes:[
          "id",
          "name_or_company_name",
          "email"
        ]
      },

      {
        model:Campaign,
        as:"campaign",
      }

    ]

  });


};
exports.getCampaignChat = async ({
  campaignId,
  userId,
  page,
  limit,
}) => {

  const offset = (page - 1) * limit;

  const chat = await Chat.findOne({
    where: {
      type: "campaign",
      target_id: campaignId,
    },
  });

  if (!chat)
    throw new Error("Chat not found.");

  const messages =
    await Message.findAndCountAll({

      where: {
        chat_id: chat.id,
      },

      include: [
        {
          model: User,
          as: "sender",
          attributes: [
            "id",
            "name_or_company_name",
            "profile_photo_document_id",
          ],
        },
      ],

      order: [["created_at", "DESC"]],

      limit: Number(limit),

      offset,
    });

  return {
    chat,
    ...messages,
  };
};

exports.sendMessage = async ({
  campaignId,
  userId,
  body,
  documentId,
}) => {

  let chat = await Chat.findOne({
    where: {
      type: "campaign",
      target_id: campaignId,
    },
  });

  if (!chat) {

    throw new Error("Chat not created for this campiagn")

  }

  const message = await Message.create({

    chat_id: chat.id,

    sender_id: userId,

    type: body.type,

    message: body.message || null,

    document_id: documentId,

  });

  return await Message.findByPk(message.id, {

    include: [
      {
        model: User,
        as: "sender",
        attributes: [
          "id",
          "name_or_company_name",
          "profile_photo_document_id",
        ],
      },
    ],

  });

};