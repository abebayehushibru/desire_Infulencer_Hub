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
    "/",
    auth,
    controller.getAll
);


// Get single conversion
router.get(
    "/:id",
    auth,
    controller.getOne
);


// Confirm conversion
router.patch(
    "/:id/confirm",
    auth,
    controller.confirm
);


// Reject conversion
router.patch(
    "/:id/reject",
    auth,
    controller.reject
);


module.exports = router;