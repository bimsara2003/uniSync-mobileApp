const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// Register a new user
router.post("/register", userController.registerUser);

// Authenticate a user
router.post("/login", userController.authUser);

// Get logged-in user profile (Protected route)
router.get("/profile", protect, userController.getUserProfile);

module.exports = router;
