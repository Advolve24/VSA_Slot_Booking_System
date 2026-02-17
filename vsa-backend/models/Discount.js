const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema(
  {
    sportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sport",
      default: null,
    },

    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null,
    },

    code: {
      type: String,
      uppercase: true,
      trim: true,
      default: null, // null means auto discount
    },

    title: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["percentage", "flat"],
      required: true,
    },

    value: {
      type: Number,
      required: true,
    },

    applicableFor: {
      type: String,
      enum: ["enrollment", "turf"],
      required: true,
    },

    // A → Plan based (for enrollment)
    planType: {
      type: String,
      enum: ["monthly", "quarterly", null],
      default: null,
    },

    // C → Slot based (for turf)
    minSlots: {
      type: Number,
      default: 0,
    },

    validFrom: Date,
    validTill: Date,

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Discount", discountSchema);
