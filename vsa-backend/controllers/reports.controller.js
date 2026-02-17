const Enrollment = require("../models/Enrollment");
const TurfRental = require("../models/TurfRental");
const Batch = require("../models/Batch");

exports.getReports = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const now = new Date();
    const month = Number(req.query.month) || now.getMonth() + 1;
    const year = Number(req.query.year) || now.getFullYear();

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);

    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);

    /* ======================================================
       REVENUE (USING finalAmount ✅)
    ====================================================== */

    const enrollmentRevenueAgg = await Enrollment.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$finalAmount" },
        },
      },
    ]);

    const rentalRevenueAgg = await TurfRental.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          rentalDate: { $gte: startStr, $lte: endStr },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$finalAmount" },
        },
      },
    ]);

    const enrollmentRevenue = enrollmentRevenueAgg[0]?.total || 0;
    const rentalRevenue = rentalRevenueAgg[0]?.total || 0;

    /* ======================================================
       ENROLLMENTS BY SPORT
    ====================================================== */

    const sportRaw = await Enrollment.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: "$sportName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const totalEnrollments = sportRaw.reduce(
      (acc, curr) => acc + curr.count,
      0
    );

    const enrollmentsBySport = sportRaw.map((s) => ({
      name: s._id,
      count: s.count,
      percentage:
        totalEnrollments === 0
          ? 0
          : Math.round((s.count / totalEnrollments) * 100),
    }));

    /* ======================================================
       BATCH UTILIZATION
    ====================================================== */

    const activeBatches = await Batch.find({ status: "active" });

    const batchUtilization = await Promise.all(
      activeBatches.map(async (batch) => {
        const enrolledCount = await Enrollment.countDocuments({
          batchName: batch.name,
          paymentStatus: "paid",
        });

        const percentage =
          batch.capacity === 0
            ? 0
            : Math.round((enrolledCount / batch.capacity) * 100);

        return {
          name: batch.name,
          enrolled: enrolledCount,
          capacity: batch.capacity,
          percentage,
        };
      })
    );

    /* ======================================================
       QUICK STATS
    ====================================================== */

    const totalStudents = totalEnrollments;

    const totalTurfRentals = await TurfRental.countDocuments({
      rentalDate: { $gte: startStr, $lte: endStr },
    });

    const activeBatchCount = activeBatches.length;

    /* ======================================================
       RESPONSE
    ====================================================== */

    res.json({
      totalRevenue: enrollmentRevenue + rentalRevenue,
      enrollmentRevenue,
      rentalRevenue,

      enrollmentsBySport,
      batchUtilization,

      quickStats: {
        totalStudents,
        totalTurfRentals,
        activeBatches: activeBatchCount,
      },
    });

  } catch (err) {
    console.error("Reports error:", err);
    res.status(500).json({ message: "Reports error" });
  }
};
