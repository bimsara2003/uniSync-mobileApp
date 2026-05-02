const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    body: {
      type: String,
      required: [true, "Body content is required"],
    },
    category: {
      type: String,
      enum: ["GENERAL", "EXAM", "EVENT", "URGENT"],
      default: "GENERAL",
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    // If this announcement is for a specific event, set the event date
    // The frontend uses this to render the live countdown
    eventDate: {
      type: Date,
      default: null,
    },
    eventVenue: {
      type: String,
      trim: true,
      default: null,
    },
    // Cover image (uploaded to S3, same pattern as profilePictureUrl)
    coverImageUrl: {
      type: String,
      default: null,
    },
    coverImageKey: {
      type: String,
      default: null,
    },
    // Attached files (PDFs, xlsx, etc.) — array so multiple files are allowed
    attachments: [
      {
        fileName: String,    // original name shown in UI
        fileUrl: String,     // S3 URL
        s3Key: String,       // for deletion
        fileType: String,
        fileSize: Number,
      },
    ],
    // Who posted it
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Optional: target only a specific faculty / department
    targetFaculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      default: null,
    },
    targetDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

announcementSchema.index({ isPinned: -1, createdAt: -1 });
announcementSchema.index({ category: 1 });

module.exports = mongoose.model("Announcement", announcementSchema);