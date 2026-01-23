const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    enrollmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Enrollment" },

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    amount: Number,
    method: String, // Razorpay, Cash
    razorpayPaymentId: String,

    status: {
      type: String,
      enum: ["success", "failed", "pending"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
