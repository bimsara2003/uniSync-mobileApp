const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Module name is required"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Module code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department reference is required"],
    },
    yearOfStudy: {
      type: Number,
      required: [true, "Year of study is required"],
      min: 1,
      max: 4,
    },
    semester: {
      type: Number,
      required: [true, "Semester is required"],
      min: 1,
      max: 2,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Module", moduleSchema);
