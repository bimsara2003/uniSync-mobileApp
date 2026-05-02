const User = require("../../models/userModel");
const { deleteFromS3 } = require("../../utils/s3Delete");

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.status(200).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePictureUrl: user.profilePictureUrl,
        role: user.role,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    if (req.body.email) user.email = req.body.email;
    if (req.body.password) user.password = req.body.password;
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      profilePictureUrl: updatedUser.profilePictureUrl,
      role: updatedUser.role,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete old photo from S3 before saving the new one
    if (user.profilePictureUrl) {
      try {
        const oldKey = new URL(user.profilePictureUrl).pathname.slice(1);
        await deleteFromS3(oldKey);
      } catch (_) {
        // Old file missing from S3 — not blocking, continue
      }
    }

    user.profilePictureUrl = req.file.location;
    await user.save();
    res.json({
      message: "Profile photo uploaded successfully",
      profilePictureUrl: user.profilePictureUrl,
    });
  } catch (error) {
    console.error("Error uploading profile photo:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteProfilePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.profilePictureUrl) {
      return res.status(400).json({ message: "No profile photo to delete" });
    }

    const key = new URL(user.profilePictureUrl).pathname.slice(1);
    await deleteFromS3(key);

    user.profilePictureUrl = null;
    await user.save();

    res.status(200).json({ message: "Profile photo deleted" });
  } catch (error) {
    console.error("Error deleting profile photo:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();

    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Error deleting user profile:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
