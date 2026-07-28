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



exports.getOne = async(req,res,next)=>{

    try{

        const data =
        await service.getOne(req.params.id);


        res.json({
            success:true,
            data
        });


    }catch(error){
        next(error);
    }

};





exports.confirm = async(req,res,next)=>{

    try{

        const data =
        await service.updateStatus({

            id:req.params.id,

            status:"confimed",

            userId:req.user.id

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
        await service.updateStatus({

            id:req.params.id,

            status:"rejected",

            userId:req.user.id,

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