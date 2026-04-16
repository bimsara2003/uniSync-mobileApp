const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");

// Public routes
router.post("/register", userController.registerUser);
router.post("/login", userController.authUser);
router.post("/refresh", userController.refreshUserToken);
router.post("/logout", userController.logoutUser);

// Protected routes
router.get("/profile", protect, userController.getUserProfile);
router.put("/profile", protect, userController.updateUserProfile);
router.post(
  "/profile/photo",
  protect,
  upload.single("photo"),
  userController.uploadProfilePhoto,
);

module.exports = router;
