const User = require("../../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../utils/generateToken");

exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, adminSecret } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(409)
        .json({ message: "Registration failed. Please check your details" });
    }

    // Default role is STUDENT
    let userRole = ["STUDENT"];

    // If adminSecret matches, allow setting the role to ADMIN
    if (adminSecret && adminSecret === process.env.ADMIN_REGISTRATION_SECRET) {
      if (role && ["ADMIN", "STAFF", "REP"].includes(role)) {
        userRole = [role];
      } else {
        userRole = ["ADMIN"];
      }
    }

    const savedUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: userRole,
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
        role: savedUser.role,
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
    const user = await User.findOne({ email }).select("+password");
    if (user && user.isActive === false) {
      return res.status(403).json({ message: "User account is deactivated" });
    }
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
        role: user.role,
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

exports.refreshUserToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: "User account is deactivated" });
    }

    // Compare provided raw token with the hashed token in DB
    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isMatch) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(user._id);
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};

exports.logoutUser = async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    try {
      // Ignore expiration so users can logout even if token expired
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, {
        ignoreExpiration: true,
      });
      const user = await User.findById(decoded.id);

      if (user && user.refreshToken) {
        const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
        if (isMatch) {
          user.refreshToken = null;
          await user.save();
        }
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }
  res.status(200).json({ message: "Logged out successfully" });
};
