const service = require("./withdrawal.service");



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
        next(error);
    }

};





exports.getAll = async(req,res,next)=>{

    try{

        const data =
        await service.getAll({
            userId:req.user.id,
            query:req.query
        });


        res.json({
            success:true,
            data
        });


    }catch(error){
        next(error);
    }

};






exports.approve = async(req,res,next)=>{

    try{

        const data =
        await service.approve({

            id:req.params.id,

            approvedBy:req.user.id

        });


        res.json({
            success:true,
            data
        });


    }catch(error){
        next(error);
    }

};







exports.reject = async(req,res,next)=>{

    try{

        const data =
        await service.reject({

            id:req.params.id,

            rejectedBy:req.user.id,

            reason:req.body.reason

        });


        res.json({
            success:true,
            data
        });


    }catch(error){
        next(error);
    }

};







exports.pay = async(req,res,next)=>{

    try{


        const data =
        await service.pay({

            id:req.params.id,

            paidBy:req.user.id,

            transactionReference:
            req.body.transaction_reference

        });


        res.json({
            success:true,
            data
        });


    }catch(error){
        next(error);
    }

};