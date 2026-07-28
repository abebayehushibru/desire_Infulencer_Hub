const router =
require("express").Router();


const controller =
require("./auth.controller");


// LOGIN

router.post(
 "/login",
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
 controller.forgotPassword
);


// VERIFY CODE

router.post(
 "/verify-code",
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