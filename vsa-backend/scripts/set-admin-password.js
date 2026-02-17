const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcryptjs");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const User = require("../models/User");

(async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not found in .env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    /* ================= CONFIG ================= */
    const ADMIN_EMAIL = "admin@vsa.com";   // 👈 change if needed
    const NEW_PASSWORD = "admin@123";      // 👈 set new password
    /* ========================================== */

    const admin = await User.findOne({
      email: ADMIN_EMAIL.toLowerCase(),
      role: "admin",
    }).select("+password");

    if (!admin) {
      throw new Error("Admin user not found");
    }

    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);

    admin.password = hashedPassword;
    await admin.save();

    console.log("✅ Admin password updated successfully");
    console.log("📧 Email:", ADMIN_EMAIL);
    console.log("🔑 Password:", NEW_PASSWORD);

    process.exit(0);
  } catch (err) {
    console.error("❌ Script failed:", err.message);
    process.exit(1);
  }
})();
