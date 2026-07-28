const router = require("express").Router();

const controller = require("./influencer.controller");

const authMiddleware = require("../../middleware/auth");
const upload = require("../../config/multer");

// Create
router.post(
  "/",
//   authMiddleware,
upload.fields([

    {
      name:"profile",
      maxCount:1,
    },


    {
      name:"id",
      maxCount:1,
    }

  ]),
  controller.create
);

// Get All
router.get(
  "/",
//   authMiddleware,
  controller.getAll
);

// Get One
router.get(
  "/:id",
  // authMiddleware,
  controller.getById
);

router.put("/:id", (req, res, next) => {
  upload.single('NationalId')(req, res, (err) => {
    // 1. Handle Multer / File Type Errors
    if (err) {
      // return res.status(400).json({ success: false, message: err.message });
    }
    
    // 2. Pass control to your controller if everything is fine
    next();
  });
}, controller.update);

router.put(
  "/:id/audience",
  // auth,
  controller.updateAudience
);

// Delete
router.delete(
  "/:id",
  authMiddleware,
  controller.delete
);

module.exports = router;