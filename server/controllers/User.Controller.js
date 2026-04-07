const User = require("../models/User.Model");

exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const savedUser = await User.create({
      firstName,
      lastName,
      email,
      password,
    });
    if (savedUser) {
      res.status(201).json({
        _id: savedUser._id,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        email: savedUser.email,
      });
    }
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(400).json({ message: "Unable to register user" });
  }
};
