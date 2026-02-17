// models/Batch.js
const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },

    sportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sport",
      required: true,
    },

    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      required: true,
    },

    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },

    coachName: { 
      type: String, 
      required: true 
    },

    schedule: { 
      type: String, 
      required: true 
    },

    startDate: { 
      type: Date, 
      required: true 
    },

    endDate: { 
      type: Date, 
      required: true 
    },

    /* ================= PRICING ================= */

    monthlyFee: { 
      type: Number, 
      required: true 
    },

    // 🔥 NEW: Allow quarterly plan
    hasQuarterly: {
      type: Boolean,
      default: false,
    },

    // 🔥 NEW: Custom quarterly multiplier (optional)
    quarterlyMultiplier: {
      type: Number,
      default: 3, // monthly * 3
    },

    capacity: { 
      type: Number, 
      required: true 
    },

    enrolledCount: { 
      type: Number, 
      default: 0 
    },

    status: {
      type: String,
      enum: ["active", "full", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

/* ================= AUTO UPDATE STATUS ================= */

batchSchema.pre("save", function (next) {
  if (this.enrolledCount >= this.capacity) {
    this.status = "full";
  } else if (this.status !== "inactive") {
    this.status = "active";
  }
  next();
});

module.exports = mongoose.model("Batch", batchSchema);
