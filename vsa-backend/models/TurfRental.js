const mongoose = require("mongoose");

const turfRentalSchema = new mongoose.Schema(
  {
    /* ================= SOURCE ================= */
    source: {
      type: String,
      enum: ["website", "admin"],
      default: "website",
    },

    /* ================= USER ================= */
    userName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      default: "",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    /* ================= FACILITY ================= */
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      required: true,
    },

    facilityName: {
      type: String,
      required: true,
    },

    facilityType: {
      type: String,
      required: true,
    },

    /* ================= BOOKING TIME ================= */
    sport: {
      type: String,
      required: true,
    },

    rentalDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },

    startTime: {
      type: String, // "07:00"
      required: true,
    },

    endTime: {
      type: String, // "09:00"
      required: true,
    },

    durationHours: {
      type: Number,
      required: true,
      min: 1,
    },

    /* ================= PRICE ================= */
    hourlyRate: {
      type: Number,
      required: true,
    },

    baseAmount: {
      type: Number,
      required: true,
    },

    taxAmount: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    /* ================= PAYMENT ================= */
    paymentMode: {
      type: String,
      enum: ["razorpay", "cash", "upi"],
      default: "razorpay",
    },

    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "unpaid"],
      default: "pending",
    },

    /* ================= BOOKING STATE ================= */
    bookingStatus: {
      type: String,
      enum: ["confirmed", "pending", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TurfRental", turfRentalSchema);
