const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const Enrollment = require("../models/Enrollment");

(async () => {
  try {
    console.log("Connecting to MongoDB...");

    console.log("MONGO_URI loaded:", !!process.env.MONGO_URI);

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not found in .env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const result = await Enrollment.updateMany(
      {
        paymentMode: "razorpay",
        paymentStatus: "pending",
      },
      {
        $set: { status: "pending" },
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} enrollments to PENDING`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Fix failed:", err.message);
    process.exit(1);
  }
})();
