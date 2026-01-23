const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    /* ================= PLAYER SNAPSHOT ================= */
    playerName: {
      type: String,
      required: true,
      trim: true,
    },

    age: {
      type: Number,
      required: true,
    },

    mobile: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    /* ================= BATCH SNAPSHOT ================= */
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },

    batchName: {
      type: String,
      required: true,
    },

    sportName: {
      type: String,
      required: true,
    },

    coachName: {
      type: String,
      required: true,
    },

    /* ================= PLAN ================= */
    planType: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },

    durationMonths: {
      type: Number,
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    /* ================= PAYMENT ================= */
    monthlyFee: {
      type: Number,
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    paymentMode: {
      type: String,
      enum: ["cash", "upi", "bank", "razorpay", "online"],
    },

    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "unpaid"],
      default: "unpaid",
    },

    /* ================= STATUS ================= */
    status: {
      type: String,
      enum: ["active", "pending", "expiring", "expired", "renewed"],
      default: "active",
    },

    renewedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enrollment",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Enrollment", enrollmentSchema);
