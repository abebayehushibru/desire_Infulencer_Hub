const { errorResponse, successResponse } = require("../../utils/response");
const service = require("./campaign.service");

exports.create = async (req, res, next) => {
    try {
        console.log( req.body?.locations?.split(", "));
        
        const platforms = JSON.parse(req.body.platforms);
        const campaign =
            await service.create({
                ...req.body,
                business_user_id: req.user.id,
                locations: req.body?.locations?.split(","),
                ethiopia_locations: req.body?.ethiopia_locations ? req.body?.ethiopia_locations?.split(",") : [],
                platforms: platforms,
               
            }, req.user.id);

        res.status(201).json({
            success: true,
            message: "Campaign created successfully",
            data: campaign,
        });
    } catch (err) {
        errorResponse(res, {
            message: err.message,
            errors: err
        })
    }
};

exports.update = async (req, res, next) => {
    try {
              
        const platforms = JSON.parse(req.body.platforms);
          const campaign =
            await service.update(
                req.params.id,
                {
                    ...req.body,
                    business_user_id: req.user.id,
                    locations: req.body?.locations?.split(","),
                    ethiopia_locations: req.body?.ethiopia_locations ? req.body?.ethiopia_locations?.split(",") : [],
                    platforms: platforms
                }
            );

        res.json({
            success: true,
            message: "Campaign updated successfully",
            data: campaign,
        });
    } catch (err) {
        errorResponse(res, {
            message: err.message,
            errors: err
        })
    }
};
exports.updateStatus = async (req, res, next) => {
    try {
    
        // Pass only status data and the user context to the service layer
        const campaign = await service.updateStatus(
            req.params.id,
            {
                status: req.body.status,
                rejection_reason: req.body.rejection_reason
            },
            req.user // For tracking roles and rejection metadata
        );
        return successResponse(res, {
            message: "",
            message: "Campaign status updated successfully",
            data: campaign,
        })

    } catch (err) {
        errorResponse(res, {
            message: err.message,
            errors: err
        });
    }
};

exports.getAll = async (req, res, next) => {
    try {
        const campaigns =
            await service.getAll(req.query, req.user);
        successResponse(res, {
            message: "",
            success: true,
            data: campaigns,
        })
    } catch (err) {
        errorResponse(res, {
            message: err.message,
            errors: err
        })
    }
};

exports.getById = async (req, res, next) => {
    try {
        const campaign =
            await service.getById(
                req.params.id
            );

        res.json({
            success: true,
            data: campaign,
        });
    } catch (err) {
        errorResponse(res, {
            message: err.message,
            errors: err
        })
    }
};

exports.delete = async (req, res, next) => {
    try {
        await service.delete(req.params.id);

        res.json({
            success: true,
            message: "Campaign deleted successfully",
        });
    } catch (err) {
        errorResponse(res, {
            message: err.message,
            errors: err
        })
    }
};
exports.claimCampaign = async (req, res, next) => {
  try {
    const data = await service.claimCampaign(
      req.params.id,
      req.user
    );

    res.status(201).json({
      success: true,
      message: "Campaign claimed successfully.",
      data,
    });
  } catch (err) {
    next(err);
  }
};
exports.getClaimableCampaigns = async (req, res, next) => {
  try {
    const data = await service.getClaimableCampaigns(
      req.query,
      req.user
    );

   return  successResponse(res, {
            message: "",
            success: true,
            data: data,
        })
  } catch (err) {
     errorResponse(res, {
            message: err.message,
            errors: err
        })
  }
};