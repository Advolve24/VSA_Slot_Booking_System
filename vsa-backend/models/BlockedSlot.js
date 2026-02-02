const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema(
  {
    startTime: {
      type: String, // "07:00"
      required: true,
    },
    reason: {
      type: String,
      enum: ["coaching", "maintenance", "event", "admin"],
      default: "coaching",
    },
  },
  { _id: false }
);

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

    slots: {
      type: [slotSchema],
      required: true,
      default: [],
    },
  },
  { timestamps: true }
);

/* ✅ One document per facility per date */
blockedSlotSchema.index(
  { facilityId: 1, date: 1 },
  { unique: true }
);

module.exports = mongoose.model("BlockedSlot", blockedSlotSchema);
