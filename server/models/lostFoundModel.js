const mongoose = require("mongoose");

const lostFoundSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["LOST", "FOUND"],
      required: [true, "Type (LOST or FOUND) is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ["ELECTRONICS", "DOCUMENTS", "CLOTHING", "KEYS", "BOOKS", "OTHER"],
      required: [true, "Category is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    dateLostFound: {
      type: Date,
      required: [true, "Date is required"],
    },
    photoUrl: {
      type: String,
      default: null,
    },
    photoS3Key: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "RESOLVED"],
      default: "ACTIVE",
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

lostFoundSchema.index({ type: 1, status: 1, createdAt: -1 });
lostFoundSchema.index({ category: 1 });

module.exports = mongoose.model("LostFound", lostFoundSchema);
