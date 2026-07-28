const communityService =
    require("./community.service");





exports.create = async (req, res) => {

    try {
        console.log(req.body);


        const result =
            await communityService.create(
                req.body,
                req.params.id,

            );



        res.status(201).json({

            success: true,

            message: "Community created successfully",

            data: result

        });



    } catch (error) {


        res.status(500).json({

            success: false,

            message: error.message

        });


    }

};








exports.getAll = async (req, res) => {

    try {


        const result =
            await communityService.getAll(req.query);



        res.status(200).json({

            success: true,

            data: result

        });



    } catch (error) {


        res.status(500).json({

            success: false,

            message: error.message

        });


    }

};








exports.getById = async (req, res) => {

    try {


        const result =
            await communityService.getById(
                req.params.id
            );



        res.status(200).json({

            success: true,

            data: result

        });



    } catch (error) {


        res.status(404).json({

            success: false,

            message: error.message

        });


    }

};

exports. getDetailsById=async (req, res)=> {
    try {
      const { id } = req.params;

      const community = await communityService.getDetailById(id);

      return res.status(200).json({
        success: true,
        message: "Community fetched successfully",
        data: community,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }









exports.update = async (req, res) => {

    try {


        const result =
            await communityService.update(
                req.params.id,
                req.body
            );



        res.status(200).json({

            success: true,

            message: "Community updated successfully",

            data: result

        });



    } catch (error) {


        res.status(500).json({

            success: false,

            message: error.message

        });


    }

};