const { successResponse, errorResponse } = require("../../utils/response");
const service = require("./rechargeHistory.service");

exports.create = async (req, res, next) => {
    try {

        const result = await service.create({
            userId: req.user.id,
            body: req.body,
        });

        return successResponse(res,{
            success: true,
            message: "Recharge request submitted successfully.",
            data: result,
            statusCode:201
        });

    } catch (error) {
        return errorResponse(res,{
        message:error.message,
        errors:error
       })
    }
};

exports.getAll = async (req, res, next) => {
    try {

        const result = await service.getAll({
            query: req.query,
        });

        return successResponse(res,{
            success: true,
            message: "Recharge requests fetched successfully.",
            data: result,
        });

    } catch (error) {
        return errorResponse(res,{
        message:error.message,
        errors:error
       })
    }
};

exports.getDetail = async (req, res, next) => {
    try {

        const result = await service.getDetail({
            id: req.params.id,
        });

        return successResponse(res,{
            success: true,
            message: "Recharge request fetched successfully.",
            data: result,
        });

    } catch (error) {
        return errorResponse(res,{
        message:error.message,
        errors:error
       })
    }
};

exports.getBusinessHistory = async (req, res, next) => {
    try {

        const result =
            await service.getBusinessHistory({
                userId: req.user.id,
                query: req.query,
            });

        return successResponse(res,{
            success: true,
            message: "Recharge history fetched successfully.",
            data: result,
        });

    } catch (error) {
       return errorResponse(res,{
        message:error.message,
        errors:error
       })
    }
};

exports.verify = async (req, res, next) => {
    try {

        const result = await service.verify({
            id: req.params.id,
            adminId: req.user.id,
        });

        return successResponse(res,{
            success: true,
            message: "Recharge verified successfully.",
            data: result,
        });

    } catch (error) {
        return errorResponse(res,{
        message:error.message,
        errors:error
       })
    }
};

exports.reject = async (req, res, next) => {
    try {

        const result = await service.reject({
            id: req.params.id,
            adminId: req.user.id,
            reason: req.body.reason,
        });

        return successResponse(res,{
            success: true,
            message: "Recharge request rejected successfully.",
            data: result,
        });

    } catch (error) {
        return errorResponse(res,{
        message:error.message,
        errors:error
       })
    }
};

exports.remove = async (req, res, next) => {
    try {

        const result = await service.remove({
            id: req.params.id,
        });

        return successResponse(res,{
            success: true,
            message: result.message,
        });

    } catch (error) {
        return errorResponse(res,{
        message:error.message,
        errors:error
       })
    }
};