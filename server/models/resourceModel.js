const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Resource title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: [true, "Faculty reference is required"],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department reference is required"],
    },
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: [true, "Module reference is required"],
    },
    category: {
      type: String,
      enum: [
        "LECTURE_NOTE",
        "PAST_PAPER",
        "PROJECT",
        "TEMPLATE",
        "SUMMARY",
        "OTHER",
      ],
      required: [true, "Category is required"],
    },
    resourceType: {
      type: String,
      enum: ["OFFICIAL", "STUDENT_CONTRIBUTION"],
      required: [true, "Resource type is required"],
    },
    fileUrl: {
      type: String,
      required: true,
    },
    s3Key: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
    },
    fileSize: {
      type: Number,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    bookmarkedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Uploader reference is required"],
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

resourceSchema.index({ faculty: 1, department: 1, module: 1 });
resourceSchema.index({ status: 1 });
resourceSchema.index({ uploadedBy: 1 });

module.exports = mongoose.model("Resource", resourceSchema);
