const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  uploadResource,
  createResource,
  getResources,
  getPendingResources,
  getResourceById,
  downloadResource,
  updateResource,
  deleteResource,
  approveResource,
  rejectResource,
  toggleBookmark,
  getBookmarks,
} = require("../controllers/resources/resourceController");

// Static paths MUST come before /:id to avoid param conflict
router.get("/bookmarks", protect, getBookmarks);
router.get("/pending", protect, getPendingResources);

// CRUD
router.post("/", protect, uploadResource.single("file"), createResource);
router.get("/", protect, getResources);
router.get("/:id", protect, getResourceById);
router.get("/:id/download", protect, downloadResource);
router.put("/:id", protect, updateResource);
router.delete("/:id", protect, deleteResource);

// Approval workflow
router.put("/:id/approve", protect, approveResource);
router.put("/:id/reject", protect, rejectResource);

// Bookmarks
router.post("/:id/bookmark", protect, toggleBookmark);

module.exports = router;
