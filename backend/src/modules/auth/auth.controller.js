const service =
require("./auth.service");


const {
 successResponse,
 errorResponse
} =
require("../../utils/response");




// LOGIN

exports.login = async(req,res)=>{


 try{


  const result =
  await service.login({

    email:req.body.email,

    password:req.body.password,
    ...req.body

  });



  return successResponse(res,{

    message:
    "Login successful",

    data:result

  });



 }catch(error){


  return errorResponse(res,{

    statusCode:400,

    message:
    error.message

  });


 }

};





// LOGOUT

exports.logout = async(req,res)=>{


 try{


 await service.logout(
    req.headers.authorization
 );


 return successResponse(res,{

    message:
    "Logout successful"

 });



 }catch(error){


 return errorResponse(res,{

    statusCode:400,

    message:
    error.message

 });


 }

};





// FORGOT PASSWORD

exports.forgotPassword = async(req,res)=>{


 try{


 const result =
 await service.forgotPassword(
    req.body.email
 );



 return successResponse(res,{

    message:
    result.message,
   data:result

 });



 }catch(error){


 return errorResponse(res,{

    statusCode:400,

    message:error.message

 });


 }

};





// VERIFY CODE

exports.verifyCode = async(req,res)=>{


 try{


 const result =
 await service.verifyCode({

    token:req.body.token,

    code:req.body.code

 });



 return successResponse(res,{

    data:result

 });



 }catch(error){


 return errorResponse(res,{

    statusCode:400,

    message:error.message

 });


 }

};





// RESET PASSWORD

exports.resetPassword = async(req,res)=>{


 try{


 const result =
 await service.resetPassword({

    token:req.body.token,

     newPassword:req.body.newPassword,
    confirmPassword:req.body.confirmPassword

 });



 return successResponse(res,{

    data:result

 });



 }catch(error){


 return errorResponse(res,{

    statusCode:400,

    message:error.message

 });


 }

};





// UPDATE PASSWORD

exports.updatePassword = async(req,res)=>{


 try{


 const result =
 await service.updatePassword({

    userId:req.user.id,

    oldPassword:
    req.body.old_password,
    newPassword:
    req.body.new_password

 });



 return successResponse(res,{

    data:result

 });



 }catch(error){


 return errorResponse(res,{

    statusCode:400,

    message:error.message

 });


 }

};