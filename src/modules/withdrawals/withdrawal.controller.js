const { successResponse, errorResponse } = require("../../utils/response");
const service = require("./withdrawal.service");



exports.create = async (req, res, next) => {

    try {

        const data =
            await service.create({

                userId: req.user?.id || "fe661437-92a6-4ca4-aeb8-572d299b0d2b",

                body: req.body

            });

        return successResponse(res, {
            success: true,
            data
        })


    } catch (error) {
       errorResponse(res,{
        message:error?.message,
        errors:error
       })
    }

};





exports.getAll = async (req, res, next) => {

    try {

        const data =
            await service.getAll({
                query: req.query
            });


        return successResponse(res, {
            success: true,
            data
        })


    } catch (error) {
       errorResponse(res,{
        message:error?.message,
        errors:error
       })
    }

};

exports.getMy = async (req, res, next) => {

    try {

        const data =
            await service.getMy({
                userId: req.user?.id || "fe661437-92a6-4ca4-aeb8-572d299b0d2b",
                query: req.query
            });


        return successResponse(res, {
            success: true,
            data
        })


    } catch (error) {
       errorResponse(res,{
        message:error?.message,
        errors:error
       })
    }

};
exports.getByID = async (req, res, next) => {

    try {
        console.log(req?.params);
        

        const data =
            await service.getById({id:req?.params?.id});


        return successResponse(res, {
            success: true,
            data
        })


    } catch (error) {
       errorResponse(res,{
        message:error?.message,
        errors:error
       })
    }

};

exports.update = async (req, res, next) => {

    try {
        console.log(req?.params);
        

        const data =
            await service.update({id:req?.params?.id,body:req.body,userId:req.user.id});


        return successResponse(res, {
            success: true,
            data
        })


    } catch (error) {
       errorResponse(res,{
        message:error?.message,
        errors:error
       })
    }

};


