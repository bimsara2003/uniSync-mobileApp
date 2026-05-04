const express = require("express");
const router = express.Router();
const adminController = require("../controllers/auth/adminController");
const { protect, admin } = require("../middleware/authMiddleware");

// All admin routes require authentication + admin role
router.use(protect, admin);

router.get("/users", adminController.getAllUsers);
router.put("/users/:id/deactivate", adminController.deactivateUser);
router.put("/users/:id/reactivate", adminController.reactivateUser);
router.put("/users/:id/role", adminController.updateUserRole);
router.delete("/users/:id", adminController.deleteUser);

module.exports = router;
