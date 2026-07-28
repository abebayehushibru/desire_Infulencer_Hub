const communityRepo =
    require("./community.repository");



class CommunityService {



    async create(payload, userId) {


        const data = {

            ...payload,

            // business_user_id: userId

        };


        return await communityRepo.create(data);

    }
    async getById(id) {
        const community = await communityRepo.findById(id);

        if (!community) {
            throw new Error("Community not found");
        }

        return community;
    }



    async getAll({ search,
        status,
        category, page,
        limit, }) {



        const result = await communityRepo.findAll({
            search,
            status,
            category,
            page,
            limit,
        });
        return {
            communities: result.rows,

            pagination: {

                total:
                    result.count,


                page:
                    Number(page),


                limit:
                    Number(limit),


                totalPages:
                    Math.ceil(
                        result.count / limit
                    ),

            },
        }


    }




    async getDetailById(id) {


        const community =
            await communityRepo.findDetailById(id);



        if (!community) {

            throw new Error(
                "Community not found"
            );

        }


        return community;

    }




    async update(id, payload) {


        const community =
            await communityRepo.update(
                id,
                payload
            );



        if (!community) {

            throw new Error(
                "Community not found"
            );

        }


        return community;


    }



}



module.exports =
    new CommunityService();