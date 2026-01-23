const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    type: String, // "booking", "payment", "enrollment"
    description: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);
