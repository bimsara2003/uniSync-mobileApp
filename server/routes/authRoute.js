const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth/authController");
const profileController = require("../controllers/auth/profileController");
const passwordController = require("../controllers/auth/passwordController");
const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");

// Auth routes (public)
router.post("/register", authController.registerUser);
router.post("/login", authController.authUser);
router.post("/refresh", authController.refreshUserToken);
router.post("/logout", authController.logoutUser);

// Password routes (public)
router.post("/forgotpassword", passwordController.forgotPassword);
router.put("/resetpassword", passwordController.resetPassword);

// Profile routes (protected)
router.get("/profile", protect, profileController.getUserProfile);
router.put("/profile", protect, profileController.updateUserProfile);
router.post("/profile/photo", protect, upload.single("photo"), profileController.uploadProfilePhoto);

// Password routes (protected)
router.put("/change-password", protect, passwordController.changePassword);

module.exports = router;
