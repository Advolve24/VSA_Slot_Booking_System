const turfRentalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    source: {
      type: String,
      enum: ["website", "admin"],
      default: "website",
    },

    userName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: "" },
    notes: { type: String, default: "" },

    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      required: true,
    },
    facilityName: String,
    facilityType: String,

    sportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sport",
      required: true,
    },
    sportName: String,

    rentalDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },

    /* ✅ MULTI SLOT SUPPORT */
    slots: {
      type: [String], // ["07:00", "08:00"]
      required: true,
    },

    durationHours: {
      type: Number,
      required: true,
    },

    hourlyRate: Number,
    baseAmount: Number,
    taxAmount: { type: Number, default: 0 },
    totalAmount: Number,

    paymentMode: {
      type: String,
      enum: ["razorpay", "cash", "upi"],
      default: "cash",
    },

    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "unpaid"],
      default: "pending",
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
