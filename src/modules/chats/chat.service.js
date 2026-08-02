const documentService = require("../documents/document.service");
const repo = require("./chat.repository");


exports.createCampaignChat = async ({
  campaignId,
  agentId,
  userId,
}) => {


  // check existing chat
  const existing =
    await repo.findCampaignChat(campaignId);


  if(existing){
    throw new Error(
      "Campaign chat already exists"
    );
  }


  return await repo.createCampaignChat({

    campaignId,

    agentId,

    userId,

  });

};
exports.getCampaignChat = async ({
  campaignId,
  userId,
  page,
  limit,
}) => {

  return await repo.getCampaignChat({
    campaignId,
    userId,
    page,
    limit,
  });

};

exports.sendMessage = async ({
  chatId,
  userId,
  body,
  file,
}) => {

  let documentId = null;

  if (file) {
    const doc = await documentService.createDocument({file,userId,visibility:"private"});
     documentId = doc.id;

     console.log(doc.id,doc.file_url);
     
  }

  return await repo.sendMessage({
    chatId,
    userId,
    body,
    documentId,
  });

};


exports.getChats = async ({
  user,
  query,
}) => {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 20);
 const status =query.status

  const result = await repo.getAll({
    user,
    page,
    limit,
    status

  });

  return {
    success: true,
    message: "Chats fetched successfully.",
    data: result.rows,
    pagination: {
      total: result.count,
      page,
      limit,
      totalPages: Math.ceil(result.count / limit),
    },
  };
};