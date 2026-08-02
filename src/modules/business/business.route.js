const router =
require("express").Router();


const controller =
require("./business.controller");


const upload =
require("../../config/multer");
const auth = require("../../middleware/auth");



// =====================================
// Register Business
// =====================================

router.post(

  "/",
  auth,

  upload.fields([

    {
      name:"company_logo",
      maxCount:1,
    },


    {
      name:"business_license",
      maxCount:1,
    }

  ]),


  controller.register

);




// =====================================
// Get All Businesses
// =====================================

router.get(

  "/",

  controller.getAll

);




// =====================================
// Get One Business
// =====================================

router.get(

  "/:id",

  controller.getProfile

);




// =====================================
// Update Business
// =====================================

router.put(

  "/:id",

  controller.update

);




// =====================================
// Delete Business
// =====================================

router.delete(

  "/:userId",

  controller.remove

);



module.exports = router;