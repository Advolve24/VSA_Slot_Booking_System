const mongoose = require("mongoose");

const facilitySlotSchema = new mongoose.Schema(
  {
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      required: true,
    },

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
  { timestamps: true }
);

/* One slot once per facility */
facilitySlotSchema.index(
  { facilityId: 1, startTime: 1 },
  { unique: true }
);

module.exports = mongoose.model("FacilitySlot", facilitySlotSchema);
