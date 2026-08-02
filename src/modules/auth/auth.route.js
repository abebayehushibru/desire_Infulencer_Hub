const router =
require("express").Router();


const { authLimiter, otpLimiter } = require("../../middleware/rateLimit");
const controller =
require("./auth.controller");


// LOGIN

router.post(
 "/login",
 authLimiter,
 controller.login
);


// LOGOUT

router.post(
 "/logout",
 controller.logout
);


// FORGOT PASSWORD

router.post(
 "/forgot-password",
 otpLimiter,
 controller.forgotPassword
);


// VERIFY CODE

router.post(
 "/verify-code",
 otpLimiter,
 controller.verifyCode
);


// RESET PASSWORD

router.post(
 "/reset-password",
 controller.resetPassword
);


// UPDATE PASSWORD

router.patch(
 "/update-password",
 controller.updatePassword
);



module.exports = router;