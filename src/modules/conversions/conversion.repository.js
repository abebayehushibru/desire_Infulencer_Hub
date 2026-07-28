const {
    Conversion,
    Campaign,
    User
}=require("../../models");



exports.create = async(data)=>{


    return await Conversion.create(data);

};




exports.getCampaign = async(id)=>{


    return await Campaign.findByPk(id);

};





exports.getAll = async({
    userId,
    page,
    limit
})=>{


    const offset =
    (page-1)*limit;


    return await Conversion.findAndCountAll({

        where:{
            influencer_user_id:userId
        },


        include:[

            {
                model:Campaign,
                as:"campaign"
            },

            {
                model:User,
                as:"influencer",
                attributes:[
                    "id",
                    "name_or_company_name"
                ]
            }

        ],


        order:[
            ["created_at","DESC"]
        ],


        limit:Number(limit),

        offset

    });


};






exports.getOne = async(id)=>{


    return await Conversion.findByPk(
        id,
        {
            include:[
                {
                    model:Campaign,
                    as:"campaign"
                }
            ]
        }
    );

};







exports.updateStatus = async({
    id,
    status,
    userId,
    reason
})=>{


    const update={

        status,

    };


    if(status==="confimed"){

        update.approved_by=userId;

        update.approved_at=new Date();

    }



    if(status==="rejected"){

        update.rejection_reason=reason;

        update.approved_by=userId;

    }



    await Conversion.update(

        update,

        {
            where:{
                id
            }
        }

    );


    return await Conversion.findByPk(id);

};