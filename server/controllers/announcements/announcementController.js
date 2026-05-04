const Announcement = require("../../models/announcementModel");
const { deleteFromS3 } = require("../../utils/s3Delete");

// ── CREATE ────────────────────────────────────────────────
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, body, category, isPinned, eventDate, eventVenue,
            targetFaculty, targetDepartment } = req.body;

    // Cover image — uploaded by multer-s3 into req.files.coverImage
    let coverImageUrl = null;
    let coverImageKey = null;
    if (req.files?.coverImage?.[0]) {
      coverImageUrl = req.files.coverImage[0].location;
      coverImageKey = req.files.coverImage[0].key;
    }

    // Attachments — req.files.attachments is an array
    const attachments = (req.files?.attachments || []).map((f) => ({
      fileName: f.originalname,
      fileUrl: f.location,
      s3Key: f.key,
      fileType: f.mimetype,
      fileSize: f.size,
    }));

    const announcement = await Announcement.create({
      title,
      body,
      category,
      isPinned: isPinned === "true" || isPinned === true,
      eventDate: eventDate || null,
      eventVenue: eventVenue || null,
      coverImageUrl,
      coverImageKey,
      attachments,
      postedBy: req.user._id,
      targetFaculty: targetFaculty || null,
      targetDepartment: targetDepartment || null,
    });

    console.log("Announcement created with Image:", coverImageUrl);
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── GET ALL (with filters + pinned first) ─────────────────
exports.getAnnouncements = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.faculty)  filter.targetFaculty = req.query.faculty;
    if (req.query.pinned === "true") filter.isPinned = true;

    const announcements = await Announcement.find(filter)
      .populate("postedBy", "firstName lastName role")
      .populate("targetFaculty", "name")
      .populate("targetDepartment", "name")
      .sort({ isPinned: -1, createdAt: -1 });  // pinned first

    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── GET ONE ───────────────────────────────────────────────
exports.getAnnouncementById = async (req, res) => {
  try {
    const ann = await Announcement.findById(req.params.id)
      .populate("postedBy", "firstName lastName role profilePictureUrl")
      .populate("targetFaculty", "name")
      .populate("targetDepartment", "name");

    if (!ann || !ann.isActive) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    res.status(200).json(ann);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── UPDATE ────────────────────────────────────────────────
exports.updateAnnouncement = async (req, res) => {
  try {
    const ann = await Announcement.findById(req.params.id);
    if (!ann) return res.status(404).json({ message: "Announcement not found" });

    const { title, body, category, isPinned, eventDate, eventVenue,
            targetFaculty, targetDepartment } = req.body;

    if (title) ann.title = title;
    if (body)  ann.body  = body;
    if (category) ann.category = category;
    if (isPinned !== undefined) ann.isPinned = isPinned === "true" || isPinned === true;
    if (eventDate !== undefined) ann.eventDate = eventDate || null;
    if (eventVenue !== undefined) ann.eventVenue = eventVenue || null;
    if (targetFaculty !== undefined) ann.targetFaculty = targetFaculty || null;
    if (targetDepartment !== undefined) ann.targetDepartment = targetDepartment || null;

    // Replace cover image if a new one is uploaded
    if (req.files?.coverImage?.[0]) {
      if (ann.coverImageKey) {
        await deleteFromS3(ann.coverImageKey).catch(() => {});
      }
      ann.coverImageUrl = req.files.coverImage[0].location;
      ann.coverImageKey = req.files.coverImage[0].key;
    }

    // Append new attachments (do not replace existing ones)
    if (req.files?.attachments?.length) {
      const newAttachments = req.files.attachments.map((f) => ({
        fileName: f.originalname,
        fileUrl: f.location,
        s3Key: f.key,
        fileType: f.mimetype,
        fileSize: f.size,
      }));
      ann.attachments.push(...newAttachments);
    }

    await ann.save();
    res.status(200).json(ann);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── DELETE ONE ATTACHMENT ─────────────────────────────────
exports.deleteAttachment = async (req, res) => {
  try {
    const ann = await Announcement.findById(req.params.id);
    if (!ann) return res.status(404).json({ message: "Announcement not found" });

    const { attachmentId } = req.params;
    const att = ann.attachments.id(attachmentId);
    if (!att) return res.status(404).json({ message: "Attachment not found" });

    await deleteFromS3(att.s3Key).catch(() => {});
    ann.attachments.pull(attachmentId);
    await ann.save();

    res.status(200).json({ message: "Attachment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── DELETE ANNOUNCEMENT ───────────────────────────────────
exports.deleteAnnouncement = async (req, res) => {
  try {
    const ann = await Announcement.findById(req.params.id);
    if (!ann) return res.status(404).json({ message: "Announcement not found" });

    // Delete cover + all attachments from S3
    if (ann.coverImageKey) await deleteFromS3(ann.coverImageKey).catch(() => {});
    for (const att of ann.attachments) {
      await deleteFromS3(att.s3Key).catch(() => {});
    }

    await ann.deleteOne();
    res.status(200).json({ message: "Announcement deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── TOGGLE PIN ────────────────────────────────────────────
exports.togglePin = async (req, res) => {
  try {
    const ann = await Announcement.findById(req.params.id);
    if (!ann) return res.status(404).json({ message: "Announcement not found" });

    ann.isPinned = !ann.isPinned;
    await ann.save();
    res.status(200).json({ message: `Announcement ${ann.isPinned ? "pinned" : "unpinned"}`, isPinned: ann.isPinned });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};