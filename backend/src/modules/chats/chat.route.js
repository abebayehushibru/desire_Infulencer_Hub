const router = require("express").Router();

const upload = require("../../config/multer");
const auth = require("../../middleware/auth");
const controller = require("./chat.controller");


router.post(
  "/campaign/:campaignId",
  auth,
  controller.createCampaignChat
);
// Get campaign chat
router.get(
  "/campaign/:campaignId",
  auth,
  controller.getCampaignChat
);

// Send message
router.post(
  "/campaign/:campaignId/message",
  auth,
  upload.single("file"),
  controller.sendMessage
);

module.exports = router;