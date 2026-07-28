const router = require("express").Router();

const upload = require("../../config/multer");
const auth = require("../../middleware/auth");
const controller =
require("./community.controller");






// Create
router.post(
    "/",
    auth,
    upload.fields([

    {
      name:"profile_photo",
      maxCount:1,
    },


    {
      name:"cover_photo",
      maxCount:1,
    }

  ]),
    controller.create
);



// Get all
router.get(
    "/",
    // auth,
    controller.getAll
);



// Get by id
router.get(
    "/:id",
    // auth,
    controller.getById
);
router.get(
    "/:id/details",
    // auth,
    controller.getDetailsById
);



// Update
router.put(
    "/:id",
    auth,
    controller.update
);



module.exports = router;