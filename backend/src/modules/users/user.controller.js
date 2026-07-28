const service = require("./user.service");
const { successResponse, errorResponse } = require("../../utils/response");

class UserController {
  async getAll(req, res, next) {
    try {
      const result = await service.getAll(req.query);

      return success(
        res,
        result,
        "Users fetched successfully."
      );
    } catch (error) {
        return errorResponse(res, {

            statusCode: 400,

            message:
                error.message,

        });
    }
  }

  async getById(req, res, next) {
    try {
      const result = await service.getById(req.params.id);

      return successResponse(
        res,{

       message: "User fetched successfully.",
        data: result,
        }
      
      );
    } catch (error) {
        return errorResponse(res, {

            statusCode: 400,

            message:
                error.message,

        });
    }
  }

  async update(req, res, next) {
    try {
      const result = await service.update(
        req.params.id,
        req.body
      );

      return successResponse(
        res,
      { message:"User updated successfully.",
          data:result,
       
      }
      );
    } catch (error) {
        return errorResponse(res, {

            statusCode: 500,

            message:
                error.message,

        });
    }
  }

  async delete(req, res, next) {
    try {
      await service.delete(req.params.id);

      return successResponse(
        res,
      { 
       message: "User deleted successfully."}
      );
    } catch (error) {
        return errorResponse(res, {

            statusCode: 500,

            message:
                error.message,

        });
    }
  }
}

module.exports = new UserController();