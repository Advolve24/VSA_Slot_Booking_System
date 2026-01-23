const Batch = require("../models/Batch");
const Sport = require("../models/Sport");

/* ======================================================
   GET ALL BATCHES
   - Admin + Frontend
====================================================== */
const Enrollment = require("../models/Enrollment");

exports.getBatches = async (req, res) => {
  try {
    const isAdmin = req.user?.role === "admin";

    const batches = await Batch.aggregate([
      /* ================= JOIN ENROLLMENTS ================= */
      {
        $lookup: {
          from: "enrollments",
          localField: "_id",
          foreignField: "batchId",
          as: "enrollments",
        },
      },

      /* ================= CALCULATE ENROLLED COUNT ================= */
      {
        $addFields: {
          enrolledCount: {
            $size: {
              $filter: {
                input: "$enrollments",
                as: "e",
                cond: {
                  $in: ["$$e.status", ["active", "expiring"]],
                },
              },
            },
          },
        },
      },

      /* ================= JOIN SPORT ================= */
      {
        $lookup: {
          from: "sports",
          localField: "sportId",
          foreignField: "_id",
          as: "sport",
        },
      },
      {
        $addFields: {
          sportName: { $first: "$sport.name" },
        },
      },

      /* ================= CLEANUP ================= */
      {
        $project: {
          enrollments: 0,
          sport: 0,
        },
      },

      { $sort: { createdAt: -1 } },
    ]);

    res.json(
      batches.map((b) => ({
        _id: b._id,
        name: b.name,
        sportName: b.sportName || "-",
        level: b.level,
        coachName: b.coachName,
        schedule: b.schedule,
        time: b.time,
        startDate: b.startDate,
        endDate: b.endDate, // ✅ ALWAYS SEND
        monthlyFee: b.monthlyFee,
        capacity: b.capacity,
        enrolledCount: b.enrolledCount,
        status: b.status,
        /* ✅ FINAL COUNT (pending NOT included) */
        enrolledCount: b.enrolledCount,

        status: b.status,
      }))
    );
  } catch (err) {
    console.error("Get Batches Error:", err);
    res.status(500).json({ message: "Failed to fetch batches" });
  }
};

/* ======================================================
   GET SINGLE BATCH (ADMIN VIEW)
====================================================== */
exports.getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate("sportId", "name")
      .lean();

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    res.json({
      _id: batch._id,
      name: batch.name,
      sportName: batch.sportId?.name || "-",
      level: batch.level,
      coachName: batch.coachName,
      schedule: batch.schedule,
      time: batch.time,
      startDate: batch.startDate,
      endDate: batch.endDate,
      monthlyFee: batch.monthlyFee,
      capacity: batch.capacity,
      enrolledCount: batch.enrolledCount || 0,
      status: batch.status,
    });
  } catch (err) {
    console.error("Get Batch Error:", err);
    res.status(500).json({ message: "Failed to fetch batch" });
  }
};

/* ======================================================
   CREATE BATCH (sportName → sportId)
====================================================== */
exports.createBatch = async (req, res) => {
  try {
    const { sportName, ...rest } = req.body;

    const sport = await Sport.findOne({ name: sportName });
    if (!sport) {
      return res.status(400).json({ message: "Invalid sport selected" });
    }

    const batch = await Batch.create({
      ...rest,
      sportId: sport._id,
    });

    res.status(201).json(batch);
  } catch (err) {
    console.error("Create Batch Error:", err);
    res.status(400).json({ message: err.message });
  }
};

/* ======================================================
   UPDATE BATCH
====================================================== */
exports.updateBatch = async (req, res) => {
  try {
    const { sportName, ...rest } = req.body;
    let updateData = { ...rest };

    if (sportName) {
      const sport = await Sport.findOne({ name: sportName });
      if (!sport) {
        return res.status(400).json({ message: "Invalid sport selected" });
      }
      updateData.sportId = sport._id;
    }

    const updated = await Batch.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Batch not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Update Batch Error:", err);
    res.status(400).json({ message: err.message });
  }
};

/* ======================================================
   DELETE
====================================================== */
exports.deleteBatch = async (req, res) => {
  await Batch.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};
