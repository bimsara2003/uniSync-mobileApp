const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ message: "User not found or deleted" });
      }
      if (req.user.isActive === false) {
        return res.status(403).json({ message: "User account is deactivated" });
      }
      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }
  if (!token) {
    return res.status(401).json({ message: "You are not authorized" });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role.includes("ADMIN")) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};

const staff = (req, res, next) => {
  if (req.user && (req.user.role.includes("STAFF") || req.user.role.includes("ADMIN"))) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as staff" });
  }
};

const rep = (req, res, next) => {
  if (req.user && (req.user.role.includes("REP") || req.user.role.includes("STAFF") || req.user.role.includes("ADMIN"))) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized" });
  }
};

module.exports = { protect, admin, staff, rep };
