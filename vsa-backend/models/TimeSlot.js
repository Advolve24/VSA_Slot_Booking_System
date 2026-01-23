const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema(
  {
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Facility" },
    sport: String,

    date: String,
    slots: [
      {
        time: String, // "7:00 AM"
        status: {
          type: String,
          enum: ["available", "limited", "booked", "blocked"],
          default: "available",
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("TimeSlot", slotSchema);
