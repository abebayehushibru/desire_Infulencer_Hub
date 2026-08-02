const router =
require("express").Router({ mergeParams: true });
router.get("/", async (req, res) => {

  return res.status(200).json({

    success: true,

    message: "InfluenceHub API is running",

    timestamp: new Date(),

    environment: process.env.NODE_ENV

  });

});

router.use(
  "/auth",
  require("../modules/auth/auth.route")
);

router.use(
  "/influencers",
   require("../modules/influencers/influencer.routes")
);

router.use(
  "/business",
  require("../modules/business/business.route")
);
router.use(
  "/users",
  require("../modules/users/user.routes")
);
router.use(
  "/communities/:id/members",
  require("../modules/communityMembers/communityMember.route")
);
router.use(
  "/communities",
  require("../modules/communities/community.route")
);

router.use(
  "/campaigns",
  require("../modules/campaigns/campaign.route")
);
router.use(
  "/chats",
  require("../modules/chats/chat.route")
);
router.use(
  "/conversions",
  require("../modules/conversions/conversion.route")
);
router.use(
  "/withdrawals",
  require("../modules/withdrawals/withdrawal.route")
);
router.use(
  "/recharges",
  require("../modules/rechargeHistory/rechargeHistory.routes")
);
router.use(
  "/dashboard",
  require("../modules/dashboard/dashboard.route")
);
module.exports = router;