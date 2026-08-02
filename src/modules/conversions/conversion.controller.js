const { errorResponse } = require("../../utils/response");
const service = require("./conversion.service");



exports.create = async(req,res,next)=>{

    try{

        const data =
        await service.create({

            userId:req.user.id,

            body:req.body

        });


        res.status(201).json({
            success:true,
            data
        });


    }catch(error){
         return errorResponse(res,{
        message:error.message,
        errors:error
       })
    }

};



exports.getAll = async(req,res,next)=>{

    try{

        const data =
        await service.getAll({
            campaign_id:req.params?.id,
            query:req.query
        });


        res.json({
            success:true,
            data
        });


    }catch(error){
         return errorResponse(res,{
        message:error.message,
        errors:error
       })
    }

};











exports.updateStatus = async(req,res,next)=>{

    try{

        const data =
        await service.updateStatus({

            id:req.params.id,

            status:req.body?.status,

            userId:req.user.id,

            reason:req.body.reason

        });


        res.json({
            success:true,
            data
        });


    }catch(error){
         return errorResponse(res,{
        message:error.message,
        errors:error
       })
    }

};