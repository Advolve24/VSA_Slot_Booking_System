// models/Batch.js
const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    sportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sport",
      required: true,
    },

    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },

    coachName: { type: String, required: true },

    schedule: { type: String, required: true },
    time: { type: String, required: true },

    /** 🆕 DATES */
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    monthlyFee: { type: Number, required: true },
    capacity: { type: Number, required: true },

    enrolledCount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["active", "full", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Batch", batchSchema);
