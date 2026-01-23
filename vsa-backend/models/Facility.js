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

    capacity: {
      type: Number,
      required: true,
    },

    hourlyRate: {
      type: Number,
      required: true,
    },
    
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
