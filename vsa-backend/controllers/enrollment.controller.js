const Enrollment = require("../models/Enrollment");
const Batch = require("../models/Batch");
const User = require("../models/User");
const { applyDiscount } = require("../utils/discountService");
const Discount = require("../models/Discount");

/* ======================================================
   UTIL FUNCTIONS
====================================================== */

const calculateEndDate = (startDate, months) => {
  const d = new Date(startDate);
  d.setMonth(d.getMonth() + months);
  return d;
};

const calculateEnrollmentStatus = (
  paymentStatus,
  enrollmentEndDate,
  batchEndDate
) => {
  if (paymentStatus !== "paid") return "pending";

  const today = new Date();

  const effectiveEndDate = batchEndDate
    ? new Date(
      Math.min(
        new Date(enrollmentEndDate),
        new Date(batchEndDate)
      )
    )
    : new Date(enrollmentEndDate);

  const diffDays = Math.ceil(
    (effectiveEndDate - today) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return "expired";
  if (diffDays <= 7) return "expiring";
  return "active";
};

/* ======================================================
   USER UPSERT
====================================================== */

const findOrCreatePlayerUser = async ({
  playerName,
  mobile,
  email,
  sportName,
  address,
  age,
}) => {
  const query = { role: "player", $or: [] };

  if (mobile) query.$or.push({ mobile });
  if (email) query.$or.push({ email });

  let user = await User.findOne(query);

  if (!user) {
    return await User.create({
      fullName: playerName,
      mobile,
      email,
      age,
      role: "player",
      sportsPlayed: sportName ? [sportName] : [],
      address: address || {
        country: "India",
        state: "Maharashtra",
      },
      memberSince: new Date(),
      source: "enrollment",
    });
  }

  return user;
};

/* ======================================================
   CREATE ENROLLMENT (MULTI DISCOUNT SAFE VERSION)
====================================================== */

exports.createEnrollment = async (req, res) => {
  try {
    const {
      source = "website",
      playerName,
      age,
      mobile,
      email,
      batchName,
      startDate,
      planType = "monthly",
      paymentMode = "razorpay",
      address,
      paymentStatus,
      discountCodes = [],   // website coupons
      discounts = [],       // admin direct discounts
    } = req.body;

    if (!playerName || !age || !mobile || !batchName || !startDate) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const batch = await Batch.findOne({ name: batchName }).populate(
      "sportId",
      "name endDate"
    );

    if (!batch) {
      return res.status(400).json({ message: "Invalid batch" });
    }

    if (batch.enrolledCount >= batch.capacity) {
      return res.status(400).json({ message: "Batch is full" });
    }

    const durationMonths = planType === "quarterly" ? 3 : 1;
    const endDate = calculateEndDate(startDate, durationMonths);
    const baseAmount = batch.monthlyFee * durationMonths;

    /* ================= USER UPSERT ================= */

    const user = await findOrCreatePlayerUser({
      playerName,
      mobile,
      email,
      age,
      sportName: batch.sportId?.name,
      address,
    });

    /* ================= REMOVE OLD UNPAID ================= */

    await Enrollment.deleteMany({
      userId: user._id,
      batchId: batch._id,
      paymentStatus: { $in: ["unpaid", "failed"] },
    });

    /* ================= APPLY DISCOUNTS ================= */

    let runningAmount = baseAmount;
    let totalDiscountAmount = 0;
    let appliedDiscounts = [];

    /* ========= ADMIN DIRECT DISCOUNTS ========= */

    if (source === "admin" && discounts.length > 0) {
      for (let d of discounts) {
        let discountValue =
          d.type === "percentage"
            ? (runningAmount * d.value) / 100
            : d.value;

        discountValue = Math.min(discountValue, runningAmount);

        runningAmount -= discountValue;
        totalDiscountAmount += discountValue;

        appliedDiscounts.push({
          discountId: d.discountId || null,
          title: d.title || null,
          code: d.code || null,
          type: d.type,
          value: d.value,
          discountAmount: Math.round(discountValue),
        });
      }
    }

    /* ========= WEBSITE COUPON LOGIC ========= */

    else if (discountCodes.length > 0) {
      const today = new Date();

      const discountDocs = await Discount.find({
        code: { $in: discountCodes },
        applicableFor: "enrollment",
        isActive: true,
        $or: [{ validFrom: null }, { validFrom: { $lte: today } }],
        $and: [
          {
            $or: [{ validTill: null }, { validTill: { $gte: today } }],
          },
        ],
      });

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
    }

    const finalAmount = Math.max(0, Math.round(runningAmount));

    /* ================= PAYMENT STATUS ================= */

    const finalPaymentStatus =
      paymentStatus ||
      (paymentMode === "cash" ? "paid" : "unpaid");

    const finalStatus = calculateEnrollmentStatus(
      finalPaymentStatus,
      endDate,
      batch.endDate
    );

    /* ================= CREATE ENROLLMENT ================= */

    const enrollment = await Enrollment.create({
      userId: user._id,
      playerName,
      age,
      mobile,
      email,
      address,
      batchId: batch._id,
      batchName: batch.name,
      sportName: batch.sportId?.name,
      coachName: batch.coachName,
      planType,
      durationMonths,
      startDate,
      endDate,
      monthlyFee: batch.monthlyFee,
      baseAmount,
      discounts: appliedDiscounts,
      totalDiscountAmount: Math.round(totalDiscountAmount),
      finalAmount,
      paymentMode,
      paymentStatus: finalPaymentStatus,
      status: finalStatus,
      source,
    });

    res.status(201).json(enrollment);

  } catch (err) {
    console.error("CREATE ENROLLMENT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   GET ALL ENROLLMENTS (ADMIN)
====================================================== */
exports.getEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.aggregate([
      {
        $lookup: {
          from: "batches",
          localField: "batchId",
          foreignField: "_id",
          as: "batch",
        },
      },
      { $addFields: { batch: { $first: "$batch" } } },
      { $sort: { createdAt: -1 } },
    ]);

    const final = enrollments.map((e) => {
      const status = calculateEnrollmentStatus(
        e.paymentStatus,
        e.endDate,
        e.batch?.endDate
      );

      return {
        ...e,
        status,
        batchEnded:
          e.batch?.endDate &&
          new Date(e.batch.endDate) < new Date(),
      };
    });

    res.json(final);

  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch enrollments",
    });
  }
};

/* ======================================================
   GET SINGLE ENROLLMENT
====================================================== */
/* ======================================================
   GET SINGLE ENROLLMENT (UPDATED WITH DISCOUNT DETAILS)
====================================================== */

exports.getEnrollmentById = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate("batchId", "endDate capacity enrolledCount")
      .lean();

    if (!enrollment) {
      return res.status(404).json({ message: "Not found" });
    }

    /* ================= RECALCULATE LIVE STATUS ================= */

    const status = calculateEnrollmentStatus(
      enrollment.paymentStatus,
      enrollment.endDate,
      enrollment.batchId?.endDate
    );

    /* ================= FORMAT RESPONSE ================= */

    const response = {
      ...enrollment,

      // Ensure amounts are consistent
      baseAmount: enrollment.baseAmount || 0,
      totalDiscountAmount: enrollment.totalDiscountAmount || 0,
      finalAmount: enrollment.finalAmount || 0,

      // Return discount breakdown safely
      discounts: enrollment.discounts || [],

      // Live computed status
      status,

      batchEnded:
        enrollment.batchId?.endDate &&
        new Date(enrollment.batchId.endDate) < new Date(),
    };

    res.json(response);

  } catch (err) {
    console.error("GET ENROLLMENT ERROR:", err);
    res.status(500).json({ message: "Error fetching enrollment" });
  }
};


/* ======================================================
   UPDATE ENROLLMENT
====================================================== */
/* ======================================================
   UPDATE ENROLLMENT (FULLY UPDATED WITH MULTI DISCOUNT)
====================================================== */

exports.updateEnrollment = async (req, res) => {
  try {
    const old = await Enrollment.findById(req.params.id);
    if (!old) return res.status(404).json({ message: "Not found" });

    let batch = await Batch.findById(old.batchId);

    /* ======================================================
       BATCH CHANGE
    ====================================================== */
    if (
      req.body.batchId &&
      req.body.batchId !== old.batchId.toString()
    ) {
      const newBatch = await Batch.findById(req.body.batchId);
      if (!newBatch)
        return res.status(400).json({ message: "Invalid batch" });

      // Decrease old batch count
      await Batch.findByIdAndUpdate(old.batchId, {
        $inc: { enrolledCount: -1 },
      });

      // Increase new batch count
      await Batch.findByIdAndUpdate(req.body.batchId, {
        $inc: { enrolledCount: 1 },
      });

      batch = newBatch;

      req.body.batchName = newBatch.name;
      req.body.coachName = newBatch.coachName;
      req.body.sportName = newBatch.sportName;
    }

    /* ======================================================
       PLAN / DATE UPDATE
    ====================================================== */

    const planType = req.body.planType || old.planType;
    const startDate = req.body.startDate || old.startDate;

    const months = planType === "quarterly" ? 3 : 1;

    const endDate = calculateEndDate(startDate, months);

    req.body.planType = planType;
    req.body.durationMonths = months;
    req.body.startDate = startDate;
    req.body.endDate = endDate;

    /* ======================================================
       RECALCULATE BASE AMOUNT
    ====================================================== */

    const monthlyFee = batch?.monthlyFee || old.monthlyFee;
    const baseAmount = monthlyFee * months;

    req.body.monthlyFee = monthlyFee;
    req.body.baseAmount = baseAmount;

    /* ======================================================
       HANDLE MULTIPLE DISCOUNTS
    ====================================================== */

    let discounts = req.body.discounts || old.discounts || [];

    let runningTotal = baseAmount;
    let totalDiscountAmount = 0;

    discounts.forEach((d) => {
      if (d.type === "percentage") {
        const discountValue = (runningTotal * d.value) / 100;
        runningTotal -= discountValue;
        totalDiscountAmount += discountValue;
      } else {
        runningTotal -= d.value;
        totalDiscountAmount += d.value;
      }
    });

    runningTotal = Math.max(0, Math.round(runningTotal));

    req.body.discounts = discounts;
    req.body.totalDiscountAmount = Math.round(totalDiscountAmount);
    req.body.finalAmount = runningTotal;

    /* ======================================================
       PAYMENT STATUS
    ====================================================== */

    const updatedPaymentStatus =
      req.body.paymentStatus !== undefined
        ? req.body.paymentStatus
        : old.paymentStatus;

    req.body.paymentStatus = updatedPaymentStatus;

    /* ======================================================
       STATUS RECALCULATION
    ====================================================== */

    req.body.status = calculateEnrollmentStatus(
      updatedPaymentStatus,
      endDate,
      batch?.endDate
    );

    /* ======================================================
       SYNC USER ADDRESS
    ====================================================== */

    if (req.body.address && old.userId) {
      await User.findByIdAndUpdate(old.userId, {
        address: req.body.address,
      });
    }

    /* ======================================================
       SAVE UPDATE
    ====================================================== */

    const updated = await Enrollment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);

  } catch (err) {
    console.error("UPDATE ENROLLMENT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   DELETE ENROLLMENT
====================================================== */
exports.deleteEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ message: "Not found" });
    }

    if (enrollment.status === "active") {
      await Batch.findByIdAndUpdate(enrollment.batchId, {
        $inc: { enrolledCount: -1 },
      });
    }

    await enrollment.deleteOne();

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
