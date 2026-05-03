const express = require("express");
const router = express.Router();
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

router.get("/", protect, getAllEvents);
router.get("/:id", protect, getEventById);
router.post("/", protect, rep, createEvent);
router.put("/:id", protect, rep, updateEvent);
router.delete("/:id", protect, rep, deleteEvent);
router.patch("/:id/status", protect, rep, updateEventStatus);

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

            res.status(200).json({
                message: "Banner uploaded successfully",
                bannerImageUrl: event.bannerImageUrl,
            });
        } catch (error) {
            console.error("Error uploading banner:", error);
            res.status(500).json({ message: "Server Error" });
        }
    }
);

module.exports = router;