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
  campaignId,
  userId,
  body,
  file,
}) => {

  let documentId = null;

  if (file) {
    // const doc = await documentService.upload(file);
    // documentId = doc.id;
  }

  return await repo.sendMessage({
    campaignId,
    userId,
    body,
    documentId,
  });

};