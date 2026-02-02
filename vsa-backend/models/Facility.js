const mongoose = require("mongoose");

const facilitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String, // Turf / Court / Hall / Arena
      required: true,
    },

    hourlyRate: {
      type: Number,
      required: true,
    },

    sports: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sport",
        required: true,
      },
    ],

    images: [
      {
        type: String, // stored file path
      },
    ],

    status: {
      type: String,
      enum: ["active", "maintenance", "disabled"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Facility", facilitySchema);
