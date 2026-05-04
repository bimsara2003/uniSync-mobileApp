const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const Resource = require("../../models/resourceModel");
const { createS3Uploader, s3 } = require("../../utils/s3Upload");
const { deleteFromS3 } = require("../../utils/s3Delete");

// Multer middleware for resource file uploads (25 MB)
const uploadResource = createS3Uploader({
  keyPrefix: "resources",
  allowedTypes: /pdf|doc|docx|ppt|pptx|zip|jpeg|jpg|png/,
  maxSizeMB: 25,
  fieldName: "file",
});

//CREATE

const createResource = async (req, res) => {
  try {
    const { title, description, faculty, department, module, category } =
      req.body;

    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const userRole = req.user.role;
    const isStaffOrAdmin =
      userRole.includes("STAFF") || userRole.includes("ADMIN");

    const resource = await Resource.create({
      title,
      description,
      faculty,
      department,
      module,
      category,
      resourceType: isStaffOrAdmin ? "OFFICIAL" : "STUDENT_CONTRIBUTION",
      fileUrl: req.file.location,
      s3Key: req.file.key,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedBy: req.user._id,
      status: isStaffOrAdmin ? "APPROVED" : "PENDING",
      approvedBy: isStaffOrAdmin ? req.user._id : null,
      approvedAt: isStaffOrAdmin ? new Date() : null,
    });

    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//READ

const getResources = async (req, res) => {
  try {
    const filter = {};

    if (req.query.faculty) filter.faculty = req.query.faculty;
    if (req.query.department) filter.department = req.query.department;
    if (req.query.module) filter.module = req.query.module;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.resourceType) filter.resourceType = req.query.resourceType;

    // Students only see approved resources
    const isStaffOrAdmin =
      req.user.role.includes("STAFF") || req.user.role.includes("ADMIN");
    if (!isStaffOrAdmin) {
      filter.status = "APPROVED";
    }

    const resources = await Resource.find(filter)
      .populate("uploadedBy", "firstName lastName")
      .populate("faculty", "name")
      .populate("department", "name")
      .populate("module", "name code")
      .sort({ createdAt: -1 });

    res.status(200).json(resources);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getPendingResources = async (req, res) => {
  try {
    const isStaffOrAdmin =
      req.user.role.includes("STAFF") || req.user.role.includes("ADMIN");
    if (!isStaffOrAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const resources = await Resource.find({ status: "PENDING" })
      .populate("uploadedBy", "firstName lastName")
      .populate("faculty", "name")
      .populate("department", "name")
      .populate("module", "name code")
      .sort({ createdAt: 1 });

    res.status(200).json(resources);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate("uploadedBy", "firstName lastName")
      .populate("faculty", "name")
      .populate("department", "name")
      .populate("module", "name code")
      .populate("approvedBy", "firstName lastName");

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    // Students can only see approved resources (unless they are the owner)
    const isStaffOrAdmin =
      req.user.role.includes("STAFF") || req.user.role.includes("ADMIN");
    const isOwner =
      resource.uploadedBy._id.toString() === req.user._id.toString();

    if (!isStaffOrAdmin && !isOwner && resource.status !== "APPROVED") {
      return res.status(403).json({ message: "Resource not available" });
    }

    res.status(200).json(resource);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//DOWNLOAD

const downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    if (resource.status !== "APPROVED") {
      return res.status(403).json({ message: "Resource not yet approved" });
    }

    // Increment download count
    resource.downloadCount += 1;
    await resource.save();

    // Generate pre-signed URL (15 min expiry)
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: resource.s3Key,
    });
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 900 });

    res.status(200).json({ downloadUrl: presignedUrl });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// UPDATE

const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const isAdmin = req.user.role.includes("ADMIN");
    const isOwner = resource.uploadedBy.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this resource" });
    }

    const { title, description, category } = req.body;
    if (title) resource.title = title;
    if (description !== undefined) resource.description = description;
    if (category) resource.category = category;

    await resource.save();
    res.status(200).json(resource);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//DELETE

const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const isAdmin = req.user.role.includes("ADMIN");
    const isOwner = resource.uploadedBy.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this resource" });
    }

    // Delete file from S3
    await deleteFromS3(resource.s3Key);

    await resource.deleteOne();
    res.status(200).json({ message: "Resource deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//APPROVAL WORKFLOW

const approveResource = async (req, res) => {
  try {
    const isStaffOrAdmin =
      req.user.role.includes("STAFF") || req.user.role.includes("ADMIN");
    if (!isStaffOrAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    if (resource.status === "APPROVED") {
      return res.status(400).json({ message: "Resource is already approved" });
    }

    resource.status = "APPROVED";
    resource.approvedBy = req.user._id;
    resource.approvedAt = new Date();
    resource.rejectionReason = null;
    await resource.save();

    res.status(200).json({ message: "Resource approved", resource });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const rejectResource = async (req, res) => {
  try {
    const isStaffOrAdmin =
      req.user.role.includes("STAFF") || req.user.role.includes("ADMIN");
    if (!isStaffOrAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    resource.status = "REJECTED";
    resource.rejectionReason = reason;
    resource.approvedBy = null;
    resource.approvedAt = null;
    await resource.save();

    res.status(200).json({ message: "Resource rejected", resource });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//BOOKMARKS 

const toggleBookmark = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const userId = req.user._id;
    const index = resource.bookmarkedBy.indexOf(userId);

    if (index === -1) {
      resource.bookmarkedBy.push(userId);
      await resource.save();
      res.status(200).json({ message: "Resource bookmarked" });
    } else {
      resource.bookmarkedBy.splice(index, 1);
      await resource.save();
      res.status(200).json({ message: "Bookmark removed" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getBookmarks = async (req, res) => {
  try {
    const resources = await Resource.find({
      bookmarkedBy: req.user._id,
      status: "APPROVED",
    })
      .populate("uploadedBy", "firstName lastName")
      .populate("faculty", "name")
      .populate("department", "name")
      .populate("module", "name code")
      .sort({ createdAt: -1 });

    res.status(200).json(resources);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
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
};
