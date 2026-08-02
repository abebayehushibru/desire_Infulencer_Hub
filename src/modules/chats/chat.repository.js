const { Op } = require("sequelize");

const {
  Chat,
  Message,
  User,
  Campaign,
  ChatMember,
  Community,
  Document,
} = require("../../models");
exports.findCampaignChat = async (
  campaignId
) => {

  return await Chat.findOne({

    where: {
      type: "campaign",
      target_id: campaignId,
    }

  });

};

exports.createCampaignChat = async ({
  campaignId,
  agentId,
  userId,
}) => {


  const campaign =
    await Campaign.findByPk(campaignId);


  if (!campaign) {
    throw new Error(
      "Campaign not found"
    );
  }



  const chat =
    await Chat.create({

      type: "campaign",

      target_id: campaignId,

      agent_id: agentId,

      created_by_user_id: userId,

      status: "active",

      is_allowed: true,

    });



  return await Chat.findByPk(chat.id, {

    include: [

      {
        model: User,
        as: "agent",
        attributes: [
          "id",
          "name_or_company_name",
          "email"
        ]
      },

      {
        model: Campaign,
        as: "campaign",
      }

    ]

  });


};

exports.getCampaignChat = async ({
  campaignId,
  userId,
  page = 1,
  limit = 20,
}) => {
  const offset = (page - 1) * limit;

  // Find campaign chat
  const chat = await Chat.findOne({
    where: {
      type: "campaign",
      target_id: campaignId,
    },
    include: [
      {
        model: User,
        as: "agent",
        attributes: [
          "id",
          "name_or_company_name",
          "email",
          "profile_photo_document_id",
        ],
      },
      {
        model: User,
        as: "created_by",
        attributes: [
          "id",
          "name_or_company_name",
          "email",
        ],
      },
      {
        model: Campaign,
        as: "campaign",
        required: false,
        attributes: [
          "id",
          "title",
          "description",
          "type",
          "status",
          "target_type",
          "target_id",
          "start_date",
          "end_date",
          "fund_type",
          "conversion_rate",
          "amount",
          "total_budget",
          "platforms",
          "locations",
          "ethiopia_locations",
        ],
        include: [
          {
            model: User,
            as: "business",
            attributes: [
              "id",
              "name_or_company_name",
              "email",
            ],
          },
          {
            model: Community,
            as: "community",
            required: false,
            attributes: [
              "id",
              "name",
            ],
          },
          {
            model: User,
            as: "influencer",
            required: false,
            attributes: [
              "id",
              "name_or_company_name",
              "email",
            ],
          },
        ],
      }
    ],
  });
  if (!chat) {
   return null
  }

  // Check membership
  // const member = await ChatMember.findOne({
  //   where: {
  //     chat_id: chat.id,
  //     user_id: userId,
  //     is_active: true,
  //   },
  // });

  // if (!member) {
  //   throw new Error("You are not a member of this chat.");
  // }

  // Messages
  const { rows, count } = await Message.findAndCountAll({
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
      {
        model: Document,
        as: "document",
        attributes: ["file_url", "media_type", "original_name"]
      }
    ],
    order: [["created_at", "DESC"]],
    limit: Number(limit),
    offset,
  });
  const chatPlain = chat.toJSON();

  return {
    chat: {
      ...chatPlain,


      messages: rows.reverse(), // oldest -> newest
    },
    pagination: {
      total: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / limit),
      hasNext: offset + rows.length < count,
      hasPrevious: page > 1,
    },
  };
};

exports.sendMessage = async ({
  chatId,
  userId,
  body,
  documentId,
}) => {

  let chat = await Chat.findOne({
    where: {
      id: chatId,
      //  status:"active"
    },
  });

  if (!chat) {

    throw new Error("Chat not created for this campiagn")

  }

  const message = await Message.create({

    chat_id: chat.id,

    sender_id: userId,

    type: body.type,

    message: body.message || body.content || null,

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
      {
        model: Document,
        as: "document",
        attributes: ["file_url", "media_type", "original_name", "mime_type"]
      }
    ],

  });

};

exports.getAll = async ({
  user,
  page = 1,
  limit = 20,
  status
}) => {

  const where = {};

 if (status) {
  where.status=status
 }
  const include = [];

  switch (user.role) {
    case "super_admin":
    case "admin":
      break;

    case "agent":
      where.agent_id = user.id;
      break;

    case "business":
      where.type = "campaign";

      include.push({
        association: "campaign",
         attributes: ["id", "title", "status"],
        required: true,
        where: {
          business_user_id: user.id,
        },
      });
      break;

    case "influencer":
      where.type = "campaign";

      include.push({
        association: "campaign",
         attributes: ["id", "title", "status"],
        required: true,
        include: [
          {
            association: "claims",
            required: true,
            where: {
              influencer_user_id: user.id,
            },
          },
        ],
      });
      break;

    default:
      throw new Error("Unauthorized");
  }

  return await Chat.findAndCountAll({
    where,
    include: [
      {
        association: "campaign",
        attributes: ["id", "title", "status"],
      },
      ...include,
      {
        association: "agent",
        attributes: ["id", "name_or_company_name", "email"],
      },
      {
        association: "created_by",
        attributes: ["id", "name_or_company_name"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });


};