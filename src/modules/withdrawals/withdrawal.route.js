const router = require("express").Router();

const auth = require("../../middleware/auth");
const controller = require("./withdrawal.controller");


// Create withdrawal request
router.post(
    "/",
    // auth,
    controller.create
);


// Get withdrawals
router.get(
    "/",
    // auth,
    controller.getAll
);
router.get(
    "/my",
    // auth,
    controller.getMy
);

router.get(
    "/:id",
    // auth,
    controller.getByID
);

// Approve withdrawal


// update withdrawal
router.patch(
    "/:id",
    auth,
    controller.update
);


// Mark paid
// router.patch(
//     "/:id/pay",
//     auth,
//     controller.pay
// );


module.exports = router;