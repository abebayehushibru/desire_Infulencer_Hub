const router = require("express").Router();

const auth = require("../../middleware/auth");
const controller = require("./withdrawal.controller");


// Create withdrawal request
router.post(
    "/",
    auth,
    controller.create
);


// Get withdrawals
router.get(
    "/",
    auth,
    controller.getAll
);


// Approve withdrawal
router.patch(
    "/:id/approve",
    auth,
    controller.approve
);


// Reject withdrawal
router.patch(
    "/:id/reject",
    auth,
    controller.reject
);


// Mark paid
router.patch(
    "/:id/pay",
    auth,
    controller.pay
);


module.exports = router;