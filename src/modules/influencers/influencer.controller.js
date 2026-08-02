const influencerService = require("./influencer.service");
const { successResponse, errorResponse } = require("../../utils/response.js");


// ==========================
// Create Influencer
// ==========================
exports.create = async (req, res, next) => {
    try {
        console.log(req.body);

        const result = await influencerService.create(req.body);


        return successResponse(
            res,
            result,
            "Influencer created successfully.",
            201
        );
    } catch (error) {
        return errorResponse(res, {

            statusCode: 400,

            message:
                error.message,

        });
    }
}

// ==========================
// Get All
// ==========================
exports.getAll = async (req, res) => {
    try {

        const result = await influencerService.getAll({
            ...req.query
        });

        console.log("result");

        return await successResponse(
            res,
            {
                message: "Influencer fetched successfully.",
                data: { data: result },

                statusCode: 200,
            }
        );
    } catch (error) {
        console.log("error", error);

        return errorResponse(res, {

            statusCode: 500,

            message:
                error.message,
            errors: error

        });
    }
}

// ==========================
// Get By Id
// ==========================
exports.getById = async (req, res, next) => {
    try {

        const result = await influencerService.getById(
            req.params.id
        );

        return successResponse(
            res,
            {

                message: "Influencer fetched successfully.",
                data: result,
                statusCode: 201
            }
        );
    } catch (error) {
        return errorResponse(res, {

            statusCode: 400,

            message:
                error.message,

        });

    }
}

// ==========================
// Update
// ==========================
exports.update = async (req, res, next) => {
    try {
        const result = await influencerService.update(
            req.params.id,
            req.body
        );

        return successResponse(
            res,
            result,
            "Influencer updated successfully."
        );
    } catch (error) {
        return errorResponse(res, {

            statusCode: 500,

            message:
                error.message,
            errors: error

        });
    }
}

exports.updateAudience = async (req, res, next) => {
    try {

        const result = await influencerService.updateAudience(
            req.params.id,
            req.body?.audience_locations
        );


        return successResponse(
            res, {
            message: "Audience updated successfully.",
            data: result,
        }


        );
    } catch (error) {
        return errorResponse(res, {

            statusCode: 500,

            message:
                error.message,
            errors: error

        });
    }
}

// ==========================
// Delete
// ==========================
exports.delete = async (req, res, next) => {
    try {
        await influencerService.delete(req.params.id);

        return successResponse(
            res,
            null,
            "Influencer deleted successfully."
        );
    } catch (error) {
        return errorResponse(res, {

            statusCode: 500,

            message:
                error.message,
            errors: error

        });
    }
}

