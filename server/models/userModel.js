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
    refreshToken: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    role: {
      type: [String],
      enum: ["STUDENT", "STAFF", "ADMIN", "REP"],
      default: ["STUDENT"],
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Also hash refresh token if it's being added or updated
  if (this.isModified("refreshToken") && this.refreshToken) {
    const salt = await bcrypt.genSalt(10);
    this.refreshToken = await bcrypt.hash(this.refreshToken, salt);
  }
});

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function () {
  // Generate token - Since it's for mobile, a 6 digit code is highly user friendly
  // Let's use a 6-digit OTP for ease of testing in Postman / typing on mobile
  const resetToken = Math.floor(100000 + Math.random() * 900000).toString();

  // We hash it to store securely in database
  const crypto = require("crypto");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire to 10 minutes
  this.resetPasswordExpire = Date.now() + 1000 * 60 * 10;

  return resetToken; // Return the raw token to send via email
};

module.exports = mongoose.model("User", userSchema);
