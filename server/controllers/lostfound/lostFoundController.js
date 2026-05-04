const LostFound = require("../../models/lostFoundModel");
const { deleteFromS3 } = require("../../utils/s3Delete");
const { createS3Uploader, getPresignedUrl } = require("../../utils/s3Upload");

// Attach a presigned photoUrl to a Mongoose doc or plain object
async function signItem(item) {
  const obj = item.toObject ? item.toObject() : { ...item };
  if (obj.photoS3Key) {
    obj.photoUrl = await getPresignedUrl(obj.photoS3Key);
  }
  return obj;
}

// Multer upload — images only, max 10 MB
const uploadPhoto = createS3Uploader({
  keyPrefix: "lost-found",
  allowedTypes: /jpeg|jpg|png|webp/,
  maxSizeMB: 10,
  fieldName: "photo",
});

exports.uploadPhoto = uploadPhoto;

// ── CREATE ────────────────────────────────────────────────
exports.createItem = async (req, res) => {
  try {
    const { type, title, description, category, location, dateLostFound } =
      req.body;

    let photoUrl = null;
    let photoS3Key = null;
    if (req.file) {
      photoUrl = req.file.location; // S3 public URL
      photoS3Key = req.file.key;
    }

    const item = await LostFound.create({
      type,
      title,
      description,
      category,
      location,
      dateLostFound,
      photoUrl,
      photoS3Key,
      postedBy: req.user._id,
    });

    const populated = await item.populate(
      "postedBy",
      "firstName lastName email",
    );
    res.status(201).json(await signItem(populated));
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── GET ALL (filter: type, category, status) ──────────────
exports.getItems = async (req, res) => {
  try {
    const filter = {};

    if (req.query.type) filter.type = req.query.type;
    if (req.query.category) filter.category = req.query.category;
    // default to ACTIVE only; pass ?status=ALL to get everything
    if (req.query.status && req.query.status !== "ALL") {
      filter.status = req.query.status;
    } else if (!req.query.status) {
      filter.status = "ACTIVE";
    }

    const items = await LostFound.find(filter)
      .populate("postedBy", "firstName lastName email profilePictureUrl")
      .sort({ createdAt: -1 });

    const signed = await Promise.all(items.map(signItem));
    res.status(200).json(signed);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── GET ONE ───────────────────────────────────────────────
exports.getItemById = async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.id).populate(
      "postedBy",
      "firstName lastName email profilePictureUrl",
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json(await signItem(item));
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── UPDATE ────────────────────────────────────────────────
exports.updateItem = async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const isOwner = item.postedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role.includes("ADMIN");
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { title, description, category, location, dateLostFound } = req.body;
    if (title) item.title = title;
    if (description !== undefined) item.description = description;
    if (category) item.category = category;
    if (location) item.location = location;
    if (dateLostFound) item.dateLostFound = dateLostFound;

    // Replace photo if a new one was uploaded
    if (req.file) {
      if (item.photoS3Key) await deleteFromS3(item.photoS3Key).catch(() => {});
      item.photoUrl = req.file.location;
      item.photoS3Key = req.file.key;
    }

    await item.save();
    const populated = await item.populate(
      "postedBy",
      "firstName lastName email",
    );
    res.status(200).json(await signItem(populated));
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── RESOLVE ───────────────────────────────────────────────
exports.resolveItem = async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const isOwner = item.postedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role.includes("ADMIN");
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    item.status = "RESOLVED";
    await item.save();
    res.status(200).json({ message: "Marked as resolved", item });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── DELETE ────────────────────────────────────────────────
exports.deleteItem = async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const isOwner = item.postedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role.includes("ADMIN");
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (item.photoS3Key) await deleteFromS3(item.photoS3Key).catch(() => {});
    await item.deleteOne();
    res.status(200).json({ message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
