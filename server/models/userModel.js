const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@my\.campus\.lk$/,
        "Please add a valid email address",
      ],
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
      trim: true,
    },
    profilePictureUrl: {
      type: String,
      default: null,
    },
    role: {
      type: [String],
      enum: ["STUDENT", "STAFF", "ADMIN", "REP"],
      default: ["STUDENT"],
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model("User", userSchema);
