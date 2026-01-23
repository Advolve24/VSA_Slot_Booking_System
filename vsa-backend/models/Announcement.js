const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: String,
    message: String,
    visibility: {
      type: String,
      enum: ["all", "players", "parents"],
      default: "all",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);
