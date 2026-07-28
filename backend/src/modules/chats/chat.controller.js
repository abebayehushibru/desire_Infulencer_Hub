const { successResponse, errorResponse } = require("../../utils/response");
const service = require("./chat.service");
exports.createCampaignChat = async (req, res, next) => {
  try {

    const chat = await service.createCampaignChat({

      campaignId: req.params.campaignId,

      agentId: req.body.agent_id,

      userId: req.user.id,

    });


    res.status(201).json({
      success:true,
      data:chat,
    });


  } catch(error){
    next(error);
  }
};
exports.getCampaignChat = async (req, res, next) => {
  try {
    const response = await service.getCampaignChat({
      campaignId: req.params.campaignId,
      userId: req.user.id,
      page: req.query.page || 1,
      limit: req.query.limit || 20,
    });
return successResponse(res,{
    message:"success",
    data:response
}

)
   
  } catch (err) {
  errorResponse(res,{
    message:err.message||"Error on getting",
    errors
  })
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const response = await service.sendMessage({
      campaignId: req.params.campaignId,
      userId: req.user.id,
      body: req.body,
      file: req.file,
    });

successResponse(res,{
    message:"success",
    data:response
}
)
  } catch (err) {
  errorResponse(res,{
    message:err.message||"Error on getting",
    errors
  })
  }
};