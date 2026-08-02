const router = require("express").Router();

const auth = require("../../middleware/auth");
const controller = require("./conversion.controller");


// Create conversion
router.post(
    "/",
    auth,
    controller.create
);


// Get all conversions
router.get(
    "/:id",
     auth,
    controller.getAll
);


// Get single conversion



// Reject conversion
router.put(
    "/:id/status",
    auth,
    controller.updateStatus
);


module.exports = router;