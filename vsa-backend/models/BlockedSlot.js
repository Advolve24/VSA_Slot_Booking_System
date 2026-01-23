const mongoose = require("mongoose");

const blockedSlotSchema = new mongoose.Schema(
  {
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      required: true,
    },

    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },

    startTime: {
      type: String, // "07:00 AM", "08:00 AM"
      required: true,
    },

    reason: {
  type: String,
  enum: ["coaching", "maintenance", "event", "admin"],
  default: "coaching",
}

  },
  { timestamps: true }
);

/* ✅ Prevent duplicate slot block */
blockedSlotSchema.index(
  { facilityId: 1, date: 1, startTime: 1 },
  { unique: true }
);

module.exports = mongoose.model("BlockedSlot", blockedSlotSchema);
