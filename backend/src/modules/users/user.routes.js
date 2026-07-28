const router = require("express").Router();

const controller = require("./user.controller");

const auth = require("../../middleware/auth");
// const authorize = require("../../middleware/roles");

// Get all users (Admin)
router.get(
  "/",
  auth,
//   authorize("admin", "super_admin"),
  controller.getAll
);

// Get user by ID
router.get(
  "/:id",
  auth,
  controller.getById
);

// Update user
router.put(
  "/:id",
//   auth,
  controller.update
);

// Delete user
router.delete(
  "/:id",
  auth,
//  s authorize("super_admin"),
  controller.delete
);

module.exports = router;