const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  uploadPhoto,
  createItem,
  getItems,
  getItemById,
  updateItem,
  resolveItem,
  deleteItem,
} = require("../controllers/lostfound/lostFoundController");

router.get("/",     protect, getItems);
router.post("/",    protect, uploadPhoto.single("photo"), createItem);
router.get("/:id",  protect, getItemById);
router.put("/:id",  protect, uploadPhoto.single("photo"), updateItem);
router.patch("/:id/resolve", protect, resolveItem);
router.delete("/:id", protect, deleteItem);

module.exports = router;
