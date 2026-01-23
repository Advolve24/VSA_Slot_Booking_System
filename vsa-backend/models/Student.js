const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    // PLAYER NAME
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    age: {
      type: Number,
      required: true,
      min: 3,
      max: 80,
    },

    // 🔗 LINK TO PLAYER ACCOUNT
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one student profile per user
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
