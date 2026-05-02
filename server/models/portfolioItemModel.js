const mongoose = require("mongoose");

const portfolioItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    portfolioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Portfolio",
      required: true,
    },
    type: {
      type: String,
      enum: ["PROJECT", "ACHIEVEMENT", "CERTIFICATION", "EXPERIENCE", "EXTRACURRICULAR"],
      required: [true, "Item type is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    organization: {
      type: String,
      trim: true,
      default: "",
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    isOngoing: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
    githubLink: {
      type: String,
      trim: true,
      default: "",
    },
    liveLink: {
      type: String,
      trim: true,
      default: "",
    },
    imageUrl: {
      type: String,
      default: null,
    },
    s3Key: {
      type: String,
      default: null,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

portfolioItemSchema.index({ userId: 1 });
portfolioItemSchema.index({ portfolioId: 1 });
portfolioItemSchema.index({ type: 1 });

module.exports = mongoose.model("PortfolioItem", portfolioItemSchema);
