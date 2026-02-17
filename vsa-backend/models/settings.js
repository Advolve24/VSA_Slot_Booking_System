const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    academyName: String,
    shortName: String,
    address: String,
    contactEmail: String,
    contactPhone: String,
    operatingHours: String,
    workingDays: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
