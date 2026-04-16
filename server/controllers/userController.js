const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "15m", // Access token lives for 15 minutes
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "30d", // Refresh token lives for 30 days
  });
};

exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(409)
        .json({ message: "Registration failed. Please check your details" });
    }
    const savedUser = await User.create({
      firstName,
      lastName,
      email,
      password,
    });
    if (savedUser) {
      const accessToken = generateAccessToken(savedUser._id);
      const refreshToken = generateRefreshToken(savedUser._id);

      savedUser.refreshToken = refreshToken;
      await savedUser.save();

      res.status(201).json({
        _id: savedUser._id,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        email: savedUser.email,
        accessToken,
        refreshToken,
      });
    }
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(400).json({ message: "Unable to register user" });
  }
};

exports.authUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Use .select('+password') because password has select: false in the schema
    const user = await User.findOne({ email }).select("+password");

    if (user && (await bcrypt.compare(password, user.password))) {
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      user.refreshToken = refreshToken;
      await user.save();

      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accessToken,
        refreshToken,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Error authenticating user:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
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

    if (req.body.email) {
      user.email = req.body.email;
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

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

    user.profilePictureUrl = req.file.location; // S3 URL from multer-s3
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

exports.refreshUserToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    // Verify the provided refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret",
    );

    // Ensure the token exists in the DB for that user
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // Assign a new short-lived access token
    const newAccessToken = generateAccessToken(user._id);

    res.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};

exports.logoutUser = async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    try {
      // Decode without fully verifying expiration to easily drop it if possible,
      // but it's safer to find the user that holds this token and unset it.
      const user = await User.findOne({ refreshToken });

      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }

  res.status(200).json({ message: "Logged out successfully" });
};
