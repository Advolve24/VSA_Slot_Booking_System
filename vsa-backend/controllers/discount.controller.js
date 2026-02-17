const Discount = require("../models/Discount");
/* ======================================================
   CREATE DISCOUNT
====================================================== */
exports.createDiscount = async (req, res) => {
  try {
    const {
      title,
      code,
      type,
      value,
      applicableFor,
      planType,
      minSlots,
      validFrom,
      validTill,
      sportId,
      batchId,
    } = req.body;

    if (!title || !type || !value || !applicableFor) {
      return res.status(400).json({
        message: "Required fields missing",
      });
    }

    if (type === "percentage" && value > 100) {
      return res.status(400).json({
        message: "Percentage cannot exceed 100%",
      });
    }

    if (code) {
      const existing = await Discount.findOne({ code });
      if (existing) {
        return res.status(400).json({
          message: "Discount code already exists",
        });
      }
    }

    const discount = await Discount.create({
      title,
      code: code || null,
      type,
      value,
      applicableFor,

      // 🔥 Only for enrollment
      planType:
        applicableFor === "enrollment" ? planType || null : null,

      // 🔥 Only for turf
      minSlots:
        applicableFor === "turf" ? minSlots || 0 : 0,

      sportId: sportId || null,
      batchId: batchId || null,

      validFrom: validFrom || null,
      validTill: validTill || null,
    });

    res.status(201).json(discount);

  } catch (err) {
    console.error("CREATE DISCOUNT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   GET ALL DISCOUNTS
====================================================== */
exports.getDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.find()
      .populate("sportId", "name")
      .populate("batchId", "name")
      .sort({ createdAt: -1 });

    res.json(discounts);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   GET SINGLE DISCOUNT (FOR EDIT)
====================================================== */
exports.getDiscountById = async (req, res) => {
  try {
    const discount = await Discount.findById(req.params.id)
      .populate("sportId", "name")
      .populate("batchId", "name");

    if (!discount) {
      return res.status(404).json({
        message: "Discount not found",
      });
    }

    res.json(discount);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ======================================================
   UPDATE DISCOUNT
====================================================== */
exports.updateDiscount = async (req, res) => {
  try {
    const {
      title,
      code,
      type,
      value,
      applicableFor,
      planType,
      minSlots,
      validFrom,
      validTill,
      isActive,
      sportId,
      batchId,
    } = req.body;

    const discount = await Discount.findById(req.params.id);

    if (!discount) {
      return res.status(404).json({
        message: "Discount not found",
      });
    }

    if (type === "percentage" && value > 100) {
      return res.status(400).json({
        message: "Percentage cannot exceed 100%",
      });
    }

    if (code && code !== discount.code) {
      const existing = await Discount.findOne({ code });
      if (existing) {
        return res.status(400).json({
          message: "Discount code already exists",
        });
      }
    }

    discount.title = title ?? discount.title;
    discount.code = code || null;
    discount.type = type ?? discount.type;
    discount.value = value ?? discount.value;
    discount.applicableFor =
      applicableFor ?? discount.applicableFor;

    discount.planType =
      discount.applicableFor === "enrollment"
        ? planType || null
        : null;

    discount.minSlots =
      discount.applicableFor === "turf"
        ? minSlots || 0
        : 0;

    discount.sportId = sportId || null;
    discount.batchId = batchId || null;

    discount.validFrom = validFrom || null;
    discount.validTill = validTill || null;

    if (isActive !== undefined) {
      discount.isActive = isActive;
    }

    await discount.save();

    res.json(discount);

  } catch (err) {
    console.error("UPDATE DISCOUNT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};


/* ======================================================
   DELETE DISCOUNT
====================================================== */
exports.deleteDiscount = async (req, res) => {
  try {
    const discount = await Discount.findById(req.params.id);

    if (!discount) {
      return res.status(404).json({
        message: "Discount not found",
      });
    }

    await discount.deleteOne();

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.previewDiscount = async (req, res) => {
  try {
    const { type, amount, discountCodes = [] } = req.body;

    if (!amount || !discountCodes.length) {
      return res.status(400).json({ message: "Invalid request" });
    }

    let runningAmount = amount;
    let totalDiscountAmount = 0;
    let appliedDiscounts = [];

    const today = new Date();

    const discountDocs = await Discount.find({
      code: { $in: discountCodes },
      applicableFor: type,
      isActive: true,
      $or: [{ validFrom: null }, { validFrom: { $lte: today } }],
      $and: [
        {
          $or: [{ validTill: null }, { validTill: { $gte: today } }],
        },
      ],
    });

    if (!discountDocs.length) {
      return res.status(400).json({ message: "Invalid discount code" });
    }

    for (let discount of discountDocs) {
      let discountValue =
        discount.type === "percentage"
          ? (runningAmount * discount.value) / 100
          : discount.value;

      discountValue = Math.min(discountValue, runningAmount);

      runningAmount -= discountValue;
      totalDiscountAmount += discountValue;

      appliedDiscounts.push({
        discountId: discount._id,
        title: discount.title,
        code: discount.code,
        type: discount.type,
        value: discount.value,
        discountAmount: Math.round(discountValue),
      });
    }

    const finalAmount = Math.max(0, Math.round(runningAmount));

    res.json({
      baseAmount: amount,
      discounts: appliedDiscounts,
      totalDiscountAmount: Math.round(totalDiscountAmount),
      finalAmount,
    });

  } catch (err) {
    console.error("Preview Discount Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
