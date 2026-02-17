const Enrollment = require("../models/Enrollment");
const TurfRental = require("../models/TurfRental");
const Facility = require("../models/Facility");

exports.adminDashboard = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const year = now.getFullYear();

    const monthStart = new Date(year, now.getMonth(), 1);
    const monthEnd = new Date(year, now.getMonth() + 1, 0);

    const upcomingEnd = new Date();
    upcomingEnd.setDate(now.getDate() + 3);

    /* ======================================================
       COUNTS
    ====================================================== */
    const [
      totalEnrollments,
      activeEnrollments,
      todaysTurfRentals,
      totalTurfRentals,
      facilities,
    ] = await Promise.all([
      Enrollment.countDocuments(),
      Enrollment.countDocuments({ status: "active" }),
      TurfRental.countDocuments({ rentalDate: today }),
      TurfRental.countDocuments(),
      Facility.find().lean(),
    ]);

    /* ======================================================
       TOTAL + MONTHLY REVENUE (USING finalAmount ✅)
    ====================================================== */

    const [
      enrollmentTotal,
      enrollmentMonthly,
      turfTotal,
      turfMonthly,
    ] = await Promise.all([
      Enrollment.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$finalAmount" } } },
      ]),
      Enrollment.aggregate([
        {
          $match: {
            paymentStatus: "paid",
            createdAt: { $gte: monthStart, $lte: monthEnd },
          },
        },
        { $group: { _id: null, total: { $sum: "$finalAmount" } } },
      ]),
      TurfRental.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$finalAmount" } } },
      ]),
      TurfRental.aggregate([
        {
          $match: {
            paymentStatus: "paid",
            rentalDate: {
              $gte: monthStart.toISOString().slice(0, 10),
              $lte: monthEnd.toISOString().slice(0, 10),
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$finalAmount" } } },
      ]),
    ]);

    const totalEnrollmentRevenue = enrollmentTotal[0]?.total || 0;
    const monthlyEnrollmentRevenue = enrollmentMonthly[0]?.total || 0;
    const totalTurfRevenue = turfTotal[0]?.total || 0;
    const monthlyTurfRevenue = turfMonthly[0]?.total || 0;

    /* ======================================================
       MONTHLY REVENUE SERIES (BAR CHART)
    ====================================================== */

    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const revenueSeries = await Promise.all(
      months.map(async (label, i) => {
        const start = new Date(year, i, 1);
        const end = new Date(year, i + 1, 0);

        const [e, t] = await Promise.all([
          Enrollment.aggregate([
            {
              $match: {
                paymentStatus: "paid",
                createdAt: { $gte: start, $lte: end },
              },
            },
            { $group: { _id: null, total: { $sum: "$finalAmount" } } },
          ]),
          TurfRental.aggregate([
            {
              $match: {
                paymentStatus: "paid",
                rentalDate: {
                  $gte: start.toISOString().slice(0, 10),
                  $lte: end.toISOString().slice(0, 10),
                },
              },
            },
            { $group: { _id: null, total: { $sum: "$finalAmount" } } },
          ]),
        ]);

        return {
          month: label,
          coaching: e[0]?.total || 0,
          turf: t[0]?.total || 0,
        };
      })
    );
    /* ======================================================
   UPCOMING SLOTS (NEXT 3 DAYS)
====================================================== */

    const formatTime12h = (time) => {
      if (!time) return "";

      const [h, m] = time.split(":").map(Number);
      const hour12 = h % 12 || 12;
      const suffix = h >= 12 ? "PM" : "AM";

      return m === 0
        ? `${hour12} ${suffix}`
        : `${hour12}:${m.toString().padStart(2, "0")} ${suffix}`;
    };

    const upcomingRaw = await TurfRental.find({
      rentalDate: {
        $gte: today,
        $lte: upcomingEnd.toISOString().slice(0, 10),
      },
      bookingStatus: { $ne: "cancelled" },
    })
      .sort({ rentalDate: 1 })
      .limit(10)
      .lean();

    /* Format Slots */

    const upcomingSlots = upcomingRaw.map((r) => {
      const firstSlot = r.slots?.[0] || null;

      return {
        ...r,
        formattedTime: firstSlot ? formatTime12h(firstSlot) : "",
      };
    });


    /* ======================================================
       FACILITY UTILIZATION
    ====================================================== */

    const MAX_DAILY_SLOTS = 16;

    const facilityUtilization = await Promise.all(
      facilities.map(async (f) => {
        const bookings = await TurfRental.countDocuments({
          facilityId: f._id,
          bookingStatus: { $ne: "cancelled" },
        });

        const utilization = Math.min(
          Math.round((bookings / MAX_DAILY_SLOTS) * 100),
          100
        );

        return {
          facilityId: f._id,
          name: f.name,
          utilization,
        };
      })
    );

    const turfUtilization = facilityUtilization.length
      ? Math.round(
        facilityUtilization.reduce((s, f) => s + f.utilization, 0) /
        facilityUtilization.length
      )
      : 0;

    /* ======================================================
       RESPONSE
    ====================================================== */

    res.json({
      totalEnrollments,
      activeEnrollments,
      todaysTurfRentals,
      totalTurfRentals,

      monthlyRevenue:
        monthlyEnrollmentRevenue + monthlyTurfRevenue,

      monthlyRevenueBreakup: {
        coaching: monthlyEnrollmentRevenue,
        turf: monthlyTurfRevenue,
      },

      totalRevenue:
        totalEnrollmentRevenue + totalTurfRevenue,

      revenueSeries,
      upcomingSlots,

      turfUtilization,
      facilityUtilization,
    });

  } catch (err) {
    console.error("Admin dashboard error:", err);
    res.status(500).json({ message: "Admin dashboard error" });
  }
};
