const repo = require("./withdrawal.repository");



exports.create = async({
    userId,
    body
})=>{


    if(!body.amount)
        throw new Error(
            "Amount required"
        );


    const wallet =
    await repo.getWallet(userId);



    if(!wallet)
        throw new Error(
            "Wallet not found"
        );



    if(
        Number(wallet.available_balance)
        <
        Number(body.amount)
    ){
        throw new Error(
            "Insufficient wallet balance"
        );
    }



    return await repo.create({

        influencer_user_id:userId,

        ...body

    });

};








exports.getAll = async({
    userId,
    query
})=>{


    return repo.getAll({

        userId,

        page:query.page || 1,

        limit:query.limit || 10

    });

};








exports.approve = async({
    id,
    approvedBy
})=>{


    const withdrawal =
    await repo.findById(id);



    if(!withdrawal)
        throw new Error(
            "Withdrawal not found"
        );



    if(
        withdrawal.status !== "pending"
    )
        throw new Error(
            "Already processed"
        );



    return repo.updateStatus({

        id,

        status:"approved",

        approvedBy

    });

};









exports.reject = async({
    id,
    rejectedBy,
    reason
})=>{


    const withdrawal =
    await repo.findById(id);



    if(!withdrawal)
        throw new Error(
            "Withdrawal not found"
        );



    return repo.updateStatus({

        id,

        status:"rejected",

        rejectedBy,

        reason

    });

};









exports.pay = async({
    id,
    paidBy,
    transactionReference
})=>{


    const withdrawal =
    await repo.findById(id);



    if(!withdrawal)
        throw new Error(
            "Withdrawal not found"
        );



    if(
        withdrawal.status !== "approved"
    ){
        throw new Error(
            "Withdrawal must be approved first"
        );
    }



    return repo.markPaid({

        withdrawal,

        paidBy,

        transactionReference

    });

};