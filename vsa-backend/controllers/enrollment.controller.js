const Enrollment = require("../models/Enrollment");
const Batch = require("../models/Batch");
const User = require("../models/User");


/* ================= UTIL ================= */
const calculateEndDate = (startDate, months) => {
  const d = new Date(startDate);
  d.setMonth(d.getMonth() + months);
  return d;
};

const calculateEnrollmentStatus = (paymentStatus, endDate) => {
  // Payment not completed → Pending enrollment
  if (paymentStatus !== "paid") {
    return "pending";
  }

  if (!endDate) {
    return "active";
  }

  const today = new Date();
  const end = new Date(endDate);

  const diffDays = Math.ceil(
    (end - today) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return "expired";
  if (diffDays <= 7) return "expiring";

  return "active";
};

/* ================= USER SYNC ================= */
const createOrUpdateUserFromEnrollment = async ({
  playerName,
  mobile,
  email,
  sportName,
}) => {
  try {
    if (!mobile && !email) return null;

    const query = [];
    if (mobile) query.push({ mobile });
    if (email) query.push({ email });

    let user = await User.findOne({ $or: query });

    if (!user) {
      user = await User.create({
        fullName: playerName,
        mobile,
        email,
        role: "player",
        sportsPlayed: sportName ? [sportName] : [],
        memberSince: new Date(),
      });

      console.log("✅ User created:", user._id);
      return user;
    }

    const updates = {};

    if (!user.fullName && playerName) {
      updates.fullName = playerName;
    }

    if (
      sportName &&
      (!user.sportsPlayed || !user.sportsPlayed.includes(sportName))
    ) {
      updates.$addToSet = { sportsPlayed: sportName };
    }

    if (Object.keys(updates).length > 0) {
      user = await User.findByIdAndUpdate(user._id, updates, {
        new: true,
      });
      console.log("🔁 User updated:", user._id);
    }

    return user;
  } catch (err) {
    console.error("❌ USER SYNC ERROR:", err.message);
    return null;
  }
};


/* ======================================================
   CREATE ENROLLMENT
   - Website (PUBLIC)
   - Admin
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

      paymentMode,
      paymentStatus,
    } = req.body;

    if (!playerName || !age || !mobile || !batchName || !startDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    /* ================= FIND BATCH ================= */
    const batch = await Batch.findOne({ name: batchName }).populate(
      "sportId",
      "name"
    );

    if (!batch) {
      return res.status(400).json({ message: "Invalid batch selected" });
    }

    if (batch.enrolledCount >= batch.capacity) {
      return res.status(400).json({ message: "Batch is full" });
    }

    /* ================= DATES ================= */
    const durationMonths = planType === "yearly" ? 12 : 1;
    const endDate = calculateEndDate(startDate, durationMonths);
    const totalAmount = batch.monthlyFee * durationMonths;

    /* ================= PAYMENT ================= */
    let finalPaymentStatus = "unpaid";
    let finalPaymentMode = paymentMode || null;

    if (source === "website") {
      finalPaymentStatus =
        paymentMode === "razorpay" ? "pending" : "unpaid";
    }

    if (source === "admin") {
      finalPaymentStatus = paymentStatus || "unpaid";
    }

    /* ================= ENROLLMENT STATUS ================= */
    let enrollmentStatus = "active";

    if (finalPaymentStatus === "pending") {
      enrollmentStatus = "pending";
    }

    /* ================= CREATE ================= */
    const enrollment = await Enrollment.create({
      playerName,
      age,
      mobile,
      email,

      batchId: batch._id,
      batchName: batch.name,
      sportName: batch.sportId?.name,
      coachName: batch.coachName,

      planType,
      durationMonths,
      startDate,
      endDate,

      monthlyFee: batch.monthlyFee,
      totalAmount,

      paymentMode: finalPaymentMode,
      paymentStatus: finalPaymentStatus,

      status: enrollmentStatus,
    });

    /* ================= CREATE USER PROFILE (AFTER SUCCESS) ================= */
    await createOrUpdateUserFromEnrollment({
      playerName,
      mobile,
      email,
      sportName: batch.sportId?.name,
    });

    /* INCREMENT BATCH COUNT */
    if (enrollmentStatus === "active") {
      await Batch.findByIdAndUpdate(batch._id, {
        $inc: { enrolledCount: 1 },
      });
    }


    res.status(201).json(enrollment);
  } catch (err) {
    console.error("Create Enrollment Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   GET ALL ENROLLMENTS (ADMIN)
====================================================== */
exports.getEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch enrollments" });
  }
};

/* ======================================================
   GET SINGLE ENROLLMENT (ADMIN)
====================================================== */
exports.getEnrollmentById = async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.id).lean();
  if (!enrollment) {
    return res.status(404).json({ message: "Enrollment not found" });
  }
  res.json(enrollment);
};

/* ======================================================
   UPDATE ENROLLMENT (ADMIN)
   - Handles batch change safely
====================================================== */
exports.updateEnrollment = async (req, res) => {
  try {
    const old = await Enrollment.findById(req.params.id);
    if (!old) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    /* ================= BATCH CHANGE ================= */
    if (
      req.body.batchId &&
      req.body.batchId.toString() !== old.batchId.toString()
    ) {
      const newBatch = await Batch.findById(req.body.batchId);
      if (!newBatch) {
        return res.status(400).json({ message: "Invalid new batch" });
      }

      if (newBatch.enrolledCount >= newBatch.capacity) {
        return res.status(400).json({ message: "New batch is full" });
      }

      await Batch.findByIdAndUpdate(old.batchId, {
        $inc: { enrolledCount: -1 },
      });

      await Batch.findByIdAndUpdate(req.body.batchId, {
        $inc: { enrolledCount: 1 },
      });

      req.body.batchName = newBatch.name;
      req.body.coachName = newBatch.coachName;
    }

    /* ================= RE-CALCULATE DATES ================= */
    let endDate = old.endDate;

    if (req.body.startDate || req.body.planType) {
      const planType = req.body.planType || old.planType;
      const startDate = req.body.startDate || old.startDate;

      const durationMonths = planType === "yearly" ? 12 : 1;
      endDate = calculateEndDate(startDate, durationMonths);

      req.body.endDate = endDate;
      req.body.durationMonths = durationMonths;
    }

    /* ================= PAYMENT STATUS ================= */
    const paymentStatus =
      req.body.paymentStatus || old.paymentStatus;

    req.body.status = calculateEnrollmentStatus(
      paymentStatus,
      endDate
    );

    /* ================= UPDATE ================= */
    const updated = await Enrollment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error("Update Enrollment Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   RENEW ENROLLMENT (ADMIN)
   - DOES NOT affect batch count
====================================================== */
exports.renewEnrollment = async (req, res) => {
  try {
    const old = await Enrollment.findById(req.params.id);
    if (!old) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    const durationMonths =
      req.body.planType === "yearly" ? 12 : 1;

    const startDate = old.endDate;
    const endDate = calculateEndDate(startDate, durationMonths);

    const renewed = await Enrollment.create({
      ...old.toObject(),
      _id: undefined,

      planType: req.body.planType || "monthly",
      durationMonths,
      startDate,
      endDate,
      totalAmount: old.monthlyFee * durationMonths,

      paymentMode: req.body.paymentMode,
      paymentStatus: "paid",
      status: "active",
      renewedFrom: old._id,
    });

    old.status = "renewed";
    await old.save();

    res.json({ success: true, enrollment: renewed });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   DELETE ENROLLMENT (ADMIN)
   - Decrements batch count
====================================================== */
exports.deleteEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    await Batch.findByIdAndUpdate(enrollment.batchId, {
      $inc: { enrolledCount: -1 },
    });

    await enrollment.deleteOne();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
