const { sequelize } = require("../../models");

const repo = require("./business.repository.js")

const {
  hashPassword,
} = require("../../utils/hash");

const {
  deleteFile,
} = require("../../utils/file");
const userRepo= require("../users/user.repository.js");


// ===============================
// Register Business
// ===============================

exports.registerBusiness = async ({
  body,
  files,
}) => {


  const transaction =
    await sequelize.transaction();


  const uploadedFiles = [];



  try {


    /*
      Collect uploaded files
    */

    const companyLogo =
      files?.company_logo?.[0];


    const businessLicense =
      files?.business_license?.[0];



    if (companyLogo) {
      uploadedFiles.push(
        companyLogo.path
      );
    }


    if (businessLicense) {
      uploadedFiles.push(
        businessLicense.path
      );
    }



    /*
      Check duplicate email
    */

    const existingEmail =
      await repo.findUserByEmail(
        body.email,
        transaction
      );


    if (existingEmail) {

      throw new Error(
        "Email already exists"
      );

    }



    /*
      Check duplicate phone
    */

    const existingPhone =
      await repo.findUserByPhone(
        body.phone_1,
        transaction
      );


    if (existingPhone) {

      throw new Error(
        "Phone number already exists"
      );

    }




    /*
      Hash password
    */

    const password =
      await hashPassword(
        body.password
      );




    /*
      Create User
    */

    const user =
      await repo.createUser(

        {

          name_or_company_name:
            body.name_or_company_name,


          email:
            body.email,


          phone1:
            body.phone_1,


          phone2:
            body.phone_2 || null,


          password,


          role:
            "business",


          status:
            "pending",

        },

        transaction

      );





    /*
      Create Company Logo Document
    */

    let logoDocument = null;


    if (companyLogo) {


      logoDocument =
        await repo.createDocument(

          {

            file_name:
              companyLogo.filename,


            file_url:
              companyLogo.path,


            file_type:
              companyLogo.mimetype,


            media_type:
              "image",


          },

          transaction

        );

    }





    /*
      Create Business License Document
    */

    let licenseDocument = null;


    if (businessLicense) {


      licenseDocument =
        await repo.createDocument(

          {

            file_name:
              businessLicense.filename,


            file_url:
              businessLicense.path,


            file_type:
              businessLicense.mimetype,


            media_type:
              "pdf",

          },

          transaction

        );

    }






    /*
      Create Business Profile
    */


    const businessProfile =

      await repo.createBusinessProfile(

        {


          user_id:
            user.id,


          company_address:
            body.company_address,


          business_category:
            body.business_category,


          website:
            body.website || null,


          facebook:
            body.facebook || null,


          instagram:
            body.instagram || null,


          telegram:
            body.telegram || null,


          tiktok:
            body.tiktok || null,


          company_description:
            body.company_description || null,



          company_logo_document_id:
            logoDocument?.id || null,



          licence_document_id:
            licenseDocument?.id || null,



          subscription_type:
            body.subscription_type || "free",


        },

        transaction

      );





    /*
      Commit transaction
    */


    await transaction.commit();



    return {

      user,

      businessProfile,

    };



  } catch (error) {



    /*
      Rollback database
    */

    await transaction.rollback();




    /*
      Delete uploaded files
    */

    for (
      const file of uploadedFiles
    ) {

      deleteFile(file);

    }



    /*
      Handle duplicate race condition
      (another request inserted same email)
    */

    if (
      error.name ===
      "SequelizeUniqueConstraintError"
    ) {

      throw new Error(
        "Email or phone already exists"
      );

    }



    throw error;

  }

};



// ===============================
// Get All Businesses
// ===============================

exports.getAllBusinesses = async ({
  page = 1,
  limit = 10,
  search = "",
}) => {


  const result =
    await repo.findAllBusinesses(
      {
        page,
        limit,
        search,
      }
    );



  return {

    businesses:
      result.rows,


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

  };

};





// ===============================
// Get Business Profile
// ===============================

exports.getBusinessProfile = async (
  id
) => {

  console.log(id);

  const business =
    await repo.findBusinessProfileById(
      id
    );



  if (!business) {

    throw new Error(
      "Business profile not found"
    );

  }



  return business;

};





// ===============================
// Update Business Profile
// ===============================

exports.updateBusinessProfile = async ({
  id,
  data,
}) => {

  const transaction =
    await sequelize.transaction();


  const business =
    await repo.findBusinessProfileById(
      id
    );



  if (!business) {

    throw new Error(
      "Business profile not found"
    );

  }

  const businessUser = await repo.findUserById(
    business.user_id, transaction
  );

  if (!businessUser) {

    throw new Error(
      "User profile not found"
    );

  }
  try {
  await userRepo.update(businessUser.id,data,transaction)

  await repo.updateBusinessProfile(
    id,
    data,transaction
  );
 

await transaction.commit();


  return {success:true}
  
   } catch (error) {
      await transaction.rollback();
      throw error;
    }

};





// ===============================
// Delete Business
// ===============================

exports.deleteBusiness = async (
  userId
) => {


  const transaction =
    await require("../../config/database")
      .sequelize
      .transaction();



  try {


    const business =
      await repo.findBusinessProfileByUserId(
        userId,
        transaction
      );



    if (!business) {

      throw new Error(
        "Business not found"
      );

    }




    await repo.deleteBusinessProfile(
      userId,
      transaction
    );



    await repo.deleteUser(
      userId,
      transaction
    );




    await transaction.commit();



    return {

      message:
        "Business deleted successfully"

    };



  } catch (error) {


    await transaction.rollback();


    throw error;

  }


};