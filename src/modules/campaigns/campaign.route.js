const router = require("express").Router();

const upload = require("../../config/multer");
const auth = require("../../middleware/auth");
const authorize = require("../../middleware/authorize");
const { actionLimiter } = require("../../middleware/rateLimit");
const controller = require("./campaign.controller");

// Upload middleware
const uploadFiles = upload.fields([
  {
    name: "video",
    maxCount: 1,
  },
  {
    name: "photo",
    maxCount: 1,
  },
]);

/**
 * Campaign Claims
 */

// Get claimable campaigns
router.get(
  "/claims",
  auth,
  controller.getClaimableCampaigns
);

// Claim campaign
router.post(
  "/claim/:id",
  auth,
  actionLimiter,
  controller.claimCampaign
);

/**
 * Campaign CRUD
 */

// Create
router.post(
  "/",
  auth,
  authorize("business"),
  uploadFiles,
  controller.create
);

// Get all
router.get(
  "/",
   auth,
  controller.getAll
);

// Update status
router.put(
  "/:id/status",
  auth,
  controller.updateStatus
);

// Get by id
router.get(
  "/:id",
  auth,
  controller.getById
);

// Update
router.put(
  "/:id",
  auth,
  uploadFiles,
  controller.update
);

// Delete
router.delete(
  "/:id",
  auth,
  controller.delete
);

module.exports = router;