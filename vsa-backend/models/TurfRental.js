const mongoose = require("mongoose");

const turfRentalSchema = new mongoose.Schema(
  {
    /* ================= USER LINK ================= */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    source: {
      type: String,
      enum: ["website", "admin"],
      default: "website",
    },

    /* ================= USER SNAPSHOT ================= */
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
      lowercase: true,
      default: "",
    },

    notes: {
      type: String,
      default: "",
    },

    /* ================= ADDRESS SNAPSHOT ================= */
    address: {
      country: { type: String, default: "India" },
      state: { type: String, default: "Maharashtra" },
      city: { type: String, trim: true },
      localAddress: { type: String, trim: true },
    },

    /* ================= FACILITY ================= */
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      required: true,
    },

    facilityName: { type: String, required: true },
    facilityType: { type: String },

    /* ================= SPORT ================= */
    sportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sport",
      required: true,
    },

    sportName: { type: String, required: true },

    /* ================= BOOKING ================= */
    rentalDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },

    /* MULTI SLOT SUPPORT */
    slots: {
      type: [String], // ["07:00", "08:00"]
      required: true,
    },

    durationHours: {
      type: Number,
      required: true,
    },

    hourlyRate: {
      type: Number,
      required: true,
    },

    /* ================= AMOUNT STRUCTURE ================= */

    baseAmount: {
      type: Number,
      required: true,
    },

    /* ================= DISCOUNT STRUCTURE (UPDATED LIKE ENROLLMENT) ================= */

    discounts: [
      {
        discountId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Discount",
        },
        title: String, // Store title for invoice reference
        code: String,  // Can be null (for auto discount)
        type: {
          type: String,
          enum: ["percentage", "flat"],
        },
        value: Number,
        discountAmount: Number,
      },
    ],

    totalDiscountAmount: {
      type: Number,
      default: 0,
    },

    finalAmount: {
      type: Number,
      required: true,
    },

    /* ================= PAYMENT ================= */

    paymentMode: {
      type: String,
      enum: ["razorpay", "cash", "upi", "bank", "online"],
      default: "cash",
    },

    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "unpaid"],
      default: "unpaid",
    },

    bookingStatus: {
      type: String,
      enum: ["confirmed", "pending", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TurfRental", turfRentalSchema);
