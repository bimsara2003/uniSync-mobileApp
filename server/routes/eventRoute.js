const express = require("express");
const router = express.Router();
const { getPresignedUrl } = require("../utils/s3Upload");
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  updateEventStatus,
} = require("../controllers/eventController");
const { protect, rep } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");
const Event = require("../models/eventModel");
const registrationRoute = require("./registrationRoute");

router.get("/", protect, getAllEvents);
router.get("/:id", protect, getEventById);
router.post("/", protect, rep, createEvent);
router.put("/:id", protect, rep, updateEvent);
router.delete("/:id", protect, rep, deleteEvent);
router.patch("/:id/status", protect, rep, updateEventStatus);
router.use("/:id/registrations", registrationRoute);

router.post(
  "/:id/banner",
  protect,
  rep,
  upload.single("photo"),
  async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);

      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const isCreator = event.createdBy.toString() === req.user._id.toString();
      const isAdmin = req.user.role.includes("ADMIN");

      if (!isCreator && !isAdmin) {
        return res.status(403).json({
          message: "Not authorized to update this event banner",
        });
      }

      event.bannerImageUrl = req.file.location;
      await event.save();

      let presignedUrl = event.bannerImageUrl;
      try {
        const key = new URL(event.bannerImageUrl).pathname.slice(1);
        presignedUrl = await getPresignedUrl(key, 3600);
      } catch (e) {
        console.error("Error generating presigned URL:", e);
      }

      res.status(200).json({
        message: "Banner uploaded successfully",
        bannerImageUrl: presignedUrl,
      });
    } catch (error) {
      console.error("Error uploading banner:", error);
      res.status(500).json({ message: "Server Error" });
    }
  },
);

module.exports = router;
