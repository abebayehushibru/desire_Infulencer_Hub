/**
 * Success Response
 */
const successResponse = (
  res,
  {
    message = "Success",
    data = null,
    statusCode = 200,
  }
) => {

  return res.status(statusCode).json({

    success: true,

    message,

    data,

  });

};



/**
 * Error Response
 */
const errorResponse = (
  res,
  {
    message = "Something went wrong",
    errors = null,
    statusCode = 500,
  }
) => {
console.log(errors);

  return res.status(statusCode).json({

    success: false,

    message,

    errors,

  });

};



module.exports = {
  successResponse,
  errorResponse,
};