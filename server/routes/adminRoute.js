const express = require("express");
const router = express.Router();
const adminController = require("../controllers/auth/adminController");
const { protect, admin } = require("../middleware/authMiddleware");

// All admin routes require authentication + admin role
router.use(protect, admin);

router.get("/users", adminController.getAllUsers);
router.put("/users/:id/deactivate", adminController.deactivateUser);
router.delete("/users/:id", adminController.deleteUser);

module.exports = router;
