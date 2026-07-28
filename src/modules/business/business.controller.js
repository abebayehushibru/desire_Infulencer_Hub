const service = require("./business.service");

const {
  successResponse,
  errorResponse,
} = require("../../utils/response");



// =====================================
// Register Business
// =====================================

exports.register = async (req, res) => {

  try {
console.log("here");


    const result =
      await service.registerBusiness({

        body: req.body,

        files: req.files,

      });



    return successResponse(res, {

      statusCode: 201,

      message:
      "Business registered successfully",

      data: result,

    });



  } catch (error) {


    return errorResponse(res, {

      statusCode: 400,

      message:
      error.message,

    });


  }

};




// =====================================
// Get All Businesses
// =====================================

exports.getAll = async (req, res) => {

  try {


    const result =
      await service.getAllBusinesses({

        page:
        req.query.page || 1,


        limit:
        req.query.limit || 10,


        search:
        req.query.search || "",

      });



    return successResponse(res, {

      message:
      "Businesses fetched successfully",

      data: result,

    });



  } catch(error){


    return errorResponse(res, {

      statusCode: 500,

      message:
      error.message,

    });


  }

};




// =====================================
// Get Business Profile
// =====================================

exports.getProfile = async (req,res)=>{

  try {


    const result =
      await service.getBusinessProfile(
        req.params.id
      );



    return successResponse(res, {

      message:
      "Business profile fetched",

      data: result,

    });



  } catch(error){


    return errorResponse(res, {

      statusCode:404,

      message:
      error.message,

    });


  }

};




// =====================================
// Update Business Profile
// =====================================

exports.update = async(req,res)=>{


  try {


    const result =
      await service.updateBusinessProfile({

        id:
        req.params.id,


        data:
        req.body,

      });



    return successResponse(res, {

      message:
      "Business updated successfully",

      data: result,

    });



  } catch(error){


    return errorResponse(res, {

      statusCode:400,

      message:
      error.message,

    });


  }

};




// =====================================
// Delete Business
// =====================================

exports.remove = async(req,res)=>{


  try {


    const result =
      await service.deleteBusiness(
        req.params.userId
      );



    return successResponse(res, {

      message:
      result.message,

    });



  } catch(error){


    return errorResponse(res, {

      statusCode:400,

      message:
      error.message,

    });


  }

};