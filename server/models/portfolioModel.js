const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    headline: {
      type: String,
      trim: true,
      default: "",
    },
    bio: {
      type: String,
      trim: true,
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
    linkedIn: {
      type: String,
      trim: true,
      default: "",
    },
    gitHub: {
      type: String,
      trim: true,
      default: "",
    },
    website: {
      type: String,
      trim: true,
      default: "",
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);



module.exports = mongoose.model("Portfolio", portfolioSchema);
