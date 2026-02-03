const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema(
  {
    startTime: {
      type: String, // "07:00"
      required: true,
    },
    endTime: {
      type: String, // "08:00"
      required: true,
    },
    label: {
      type: String, // "7:00 AM – 8:00 AM"
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }
);

const facilitySlotSchema = new mongoose.Schema(
  {
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      required: true,
      unique: true, // ⭐ ONE DOC PER FACILITY
    },

    slots: [slotSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("FacilitySlot", facilitySlotSchema);
