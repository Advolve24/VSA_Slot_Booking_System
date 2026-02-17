const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,

    amount: Number,
    currency: { type: String, default: "INR" },

    purpose: {
      type: String,
      enum: ["enrollment", "turf"],
      required: true,
    },

    enrollmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enrollment",
    },

    turfRentalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TurfRental",
    },

    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
