const router = require("express").Router();

const upload = require("../../config/multer");
const auth = require("../../middleware/auth");
const { chatLimiter } = require("../../middleware/rateLimit");
const controller = require("./chat.controller");

router.get(
  "/",
  auth,
  chatLimiter,
  controller.getChats
);
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
  "/:chatId/message",
  auth,
  upload.single("file"),
  controller.sendMessage
);

module.exports = router;