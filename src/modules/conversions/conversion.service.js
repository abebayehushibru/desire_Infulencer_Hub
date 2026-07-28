const repo = require("./conversion.repository");


exports.create = async({
    userId,
    body
})=>{


    const required=[
        "campaign_id",
        "customer_name",
        "phone_number",
        "platform",
        "paid_amount"
    ];


    for(const field of required){

        if(!body[field]){
            throw new Error(
                `${field} is required`
            );
        }

    }



    const campaign =
    await repo.getCampaign(
        body.campaign_id
    );


    if(!campaign){
        throw new Error(
            "Campaign not found"
        );
    }



    return await repo.create({

        ...body,

        influencer_user_id:userId,

        business_user_id:
        campaign.business_user_id

    });

};





exports.getAll = async({
    userId,
    query
})=>{


    return await repo.getAll({
        userId,
        page:query.page || 1,
        limit:query.limit || 10
    });

};





exports.getOne = async(id)=>{


    const conversion =
    await repo.getOne(id);


    if(!conversion)
        throw new Error(
            "Conversion not found"
        );


    return conversion;

};







exports.updateStatus = async({
    id,
    status,
    userId,
    reason
})=>{


    const conversion =
    await repo.getOne(id);



    if(!conversion)
        throw new Error(
            "Conversion not found"
        );



    if(
        conversion.status !== "pending"
    ){
        throw new Error(
            "Already processed"
        );
    }



    return await repo.updateStatus({

        id,

        status,

        userId,

        reason

    });


};