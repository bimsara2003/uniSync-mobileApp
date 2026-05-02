const express = require("express");
const router = express.Router();
const { protect, staff } = require("../middleware/authMiddleware");
const ctrl = require("../controllers/announcements/announcementController");
const { uploadCoverImage, uploadAttachments } = require("../utils/announcementUpload");
const multer = require("multer");

// Combine cover image + attachments in one multipart request
const uploadFields = multer({
  storage: uploadCoverImage.storage, // shared S3 storage config is fine
}).fields([
  { name: "coverImage",   maxCount: 1 },
  { name: "attachments",  maxCount: 5 },
]);

// Students: read-only
router.get("/",      protect, ctrl.getAnnouncements);
router.get("/:id",   protect, ctrl.getAnnouncementById);

// Staff + Admin: write
router.post("/",            protect, staff, uploadFields, ctrl.createAnnouncement);
router.put("/:id",          protect, staff, uploadFields, ctrl.updateAnnouncement);
router.delete("/:id",       protect, staff, ctrl.deleteAnnouncement);
router.patch("/:id/pin",    protect, staff, ctrl.togglePin);
router.delete("/:id/attachments/:attachmentId", protect, staff, ctrl.deleteAttachment);

module.exports = router;