const express = require("express");

const controller = require("./rechargeHistory.controller");
const auth = require("../../middleware/auth");

const router = express.Router();

/**
 * Business
 */

// Create Recharge Request
router.post(
    "/",
    auth,
    // authorize("business"),
    controller.create
);

// Logged-in Business Recharge History
router.get(
    "/my",
    auth,
    // authorize("business"),
    controller.getBusinessHistory
);

/**
 * Admin
 */

// Get All Recharge Requests
router.get(
    "/",
    // auth,
    // authorize("admin", "superadmin"),
    controller.getAll
);

// Get Recharge Detail
router.get(
    "/:id",
    // auth,
    // authorize("admin", "superadmin"),
    controller.getDetail
);

// Verify Recharge Request
router.patch(
    "/:id/verify",
    auth,
    // authorize("admin", "superadmin"),
    controller.verify
);

// Reject Recharge Request
router.patch(
    "/:id/reject",
    auth,
    // authorize("admin", "superadmin"),
    controller.reject
);

// Delete Recharge Request
router.delete(
    "/:id",
    auth,
    // authorize("superadmin"),
    controller.remove
);

module.exports = router;