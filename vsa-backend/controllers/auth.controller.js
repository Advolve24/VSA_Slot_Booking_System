
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../config/jwt");

/* ======================================================
   ADMIN LOGIN (EMAIL + PASSWORD)
====================================================== */
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      role: "admin",
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.password) {
      return res.status(401).json({ message: "Admin password not set" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.json({
      message: "Admin login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Admin Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   GET LOGGED-IN PROFILE
====================================================== */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("children")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Profile Fetch Error:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

/* ======================================================
   CREATE FIRST ADMIN (USE ONCE)
====================================================== */
exports.createInitialAdmin = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const adminUser = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: hashed,
      role: "admin",
      // ⚠️ DO NOT ADD mobile
    });

    res.json({
      message: "Admin created successfully",
      admin: {
        id: adminUser._id,
        email: adminUser.email,
        role: adminUser.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating admin" });
  }
};
