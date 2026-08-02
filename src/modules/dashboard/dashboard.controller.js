const service = require("./dashboard.service");
const { successResponse, errorResponse } = require("../../utils/response");

exports.getDashboard = async (req, res, next) => {
  try {
    const data = await service.getDashboard({
      userId: req.user.id,
      role: req.user.role,
    });

    return successResponse(res, {
      success: true,
      message: "Dashboard fetched successfully",
      data,
    });
  } catch (err) {
    return errorResponse(res, {
      statusCode: 500,
      message: err.message,
      errors: err,
    });
  }
};