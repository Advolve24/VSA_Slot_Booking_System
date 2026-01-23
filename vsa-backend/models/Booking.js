const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    /* ================= USER INFO ================= */
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
    },

    /* ================= BOOKING INFO ================= */
    bookingType: {
      type: String,
      enum: ["turf", "court", "hall", "event"],
      default: "turf",
    },

    sport: {
      type: String,
      trim: true,
    },

    bookingDate: {
      type: String, // YYYY-MM-DD (easy filtering)
      required: true,
    },

    startTime: {
      type: String, // e.g. "6:00 AM"
      required: true,
    },

    durationHours: {
      type: Number,
      required: true,
      min: 1,
    },

    /* ================= PRICING ================= */
    hourlyRate: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      default: 0,
    },

    /* ================= PAYMENT ================= */
    paymentMode: {
      type: String,
      enum: ["razorpay", "cash", "upi", "bank"],
      default: "razorpay",
    },

    paymentStatus: {
      type: String,
      enum: ["paid", "unpaid", "pending"],
      default: "pending",
    },

    /* ================= STATUS ================= */
    bookingStatus: {
      type: String,
      enum: ["confirmed", "pending", "cancelled"],
      default: "pending",
    },

    /* ================= OPTIONAL REFERENCES ================= */
    facilityName: {
      type: String, // Turf / Court name
      trim: true,
    },

    source: {
      type: String,
      enum: ["website", "admin"],
      default: "website",
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

/* ================= AUTO CALCULATE AMOUNT ================= */
bookingSchema.pre("save", function (next) {
  if (this.hourlyRate && this.durationHours) {
    this.totalAmount = this.hourlyRate * this.durationHours;
  }

  if (this.paymentStatus === "paid") {
    this.bookingStatus = "confirmed";
  }

  next();
});

module.exports = mongoose.model("Booking", bookingSchema);
