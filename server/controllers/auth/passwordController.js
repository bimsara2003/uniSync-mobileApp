const User = require("../../models/userModel");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../../utils/sendEmail");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../utils/generateToken");

exports.forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res
      .status(404)
      .json({ message: "There is no user with that email" });
  }
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const message = `You are receiving this email because you (or someone else) has requested a password reset for your UniSync account.\n\nYour password reset OTP code is: ${resetToken}\n\nEnter this code into the app. It will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset OTP",
      message,
    });
    res.status(200).json({ message: "Email sent with reset instructions" });
  } catch (error) {
    console.error(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500).json({ message: "Email could not be sent" });
  }
};

exports.resetPassword = async (req, res) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.body.otp)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.refreshToken = undefined;
  await user.save();
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save();
  res
    .status(200)
    .json({
      message: "Password updated successfully",
      accessToken,
      refreshToken,
    });
};

exports.changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");
    if (!req.body.currentPassword || !req.body.newPassword) {
      return res
        .status(400)
        .json({ message: "Please provide your current and new password" });
    }
    if (!(await bcrypt.compare(req.body.currentPassword, user.password))) {
      return res.status(401).json({ message: "Password incorrect" });
    }
    user.password = req.body.newPassword;
    user.refreshToken = undefined;
    await user.save();
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();
    res
      .status(200)
      .json({
        message: "Password changed successfully",
        accessToken,
        refreshToken,
      });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
