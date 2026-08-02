const router = require("express").Router({mergeParams:true});
const auth = require("../../middleware/auth");
const controller = require("./communityMember.controller");

router.post(
  "",
  auth,
  controller.add
);

router.get(
  "",
   auth,
  controller.members
);

router.get(
  "/non-members",
   auth,
  controller.nonMembers
);

router.delete(
  "/:userId",
  auth,
  controller.remove
);

module.exports = router;