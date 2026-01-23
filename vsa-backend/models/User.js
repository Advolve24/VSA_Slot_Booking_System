const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },

    mobile: {
      type: String,
      unique: true,
      sparse: true,   // allows admin/staff without mobile
      default: undefined,
    },

    email: { type: String },

    role: {
      type: String,
      enum: ["player", "admin", "staff"],
      default: "player",
    },

    // Used only for admin / staff login
    password: String,

    profileImage: String,
    address: String,

    // Firebase OTP / Auth
    firebaseUID: String,

    memberSince: { type: Date, default: Date.now },

    // Player-related
    sportsPlayed: [String],
    totalSessions: { type: Number, default: 0 },

    /**
     * CHILDREN (IMPORTANT)
     * If this array has entries → user is acting as parent
     * If empty → user is individual player
     */
    children: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],

    // Notification Preferences
    notificationPreferences: {
      bookingUpdates: { type: Boolean, default: true },
      announcements: { type: Boolean, default: true },
      reminders: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
