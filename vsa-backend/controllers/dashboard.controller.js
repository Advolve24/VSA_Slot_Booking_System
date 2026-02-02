const Enrollment = require("../models/Enrollment");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const Facility = require("../models/Facility");


// ----------------------------------------------------------
// PLAYER DASHBOARD
// ----------------------------------------------------------
exports.playerDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.find({ user: userId }).sort({ bookingDate: -1 });
    const enrollments = await Enrollment.find({ user: userId });

    res.json({
      bookings,
      enrollments,
      totalBookings: bookings.length,
      totalEnrollments: enrollments.length,
    });

  } catch (err) {
    res.status(500).json({ message: "Player dashboard error", err });
  }
};



// ----------------------------------------------------------
// PARENT DASHBOARD
// ----------------------------------------------------------
exports.parentDashboard = async (req, res) => {
  try {
    const parentId = req.user.id;

    const children = await Student.find({ parent: parentId });

    const childIds = children.map(c => c._id);

    const enrollments = await Enrollment.find({ student: { $in: childIds } });
    const bookings = await Booking.find({ user: parentId });

    res.json({
      children,
      enrollments,
      bookings,
      totalEnrollments: enrollments.length,
      totalBookings: bookings.length,
    });

  } catch (err) {
    res.status(500).json({ message: "Parent dashboard error", err });
  }
};



// ----------------------------------------------------------
// ADMIN DASHBOARD
// ----------------------------------------------------------
exports.adminDashboard = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized — admin only" });
    }

    // Enrollments
    const totalEnrollments = await Enrollment.countDocuments();
    const activeEnrollments = await Enrollment.countDocuments({ status: "active" });

    // Today's Bookings
    const today = new Date().toISOString().slice(0, 10);
    const todaysBookings = await Booking.countDocuments({ bookingDate: today });

    // Monthly Revenue
    const monthly = await Payment.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          }
        }
      },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const monthlyRevenue = monthly[0]?.total || 0;

    // Total Bookings
    const totalBookings = await Booking.countDocuments();

    // Total Revenue Ever
    const revenue = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalRevenue = revenue[0]?.total || 0;

    // Turf Utilization
    const facilities = await Facility.find();
    const occupied = facilities.filter(f => f.status === "occupied").length;
    const turfUtilization = facilities.length
      ? Math.round((occupied / facilities.length) * 100)
      : 0;

    res.json({
      totalEnrollments,
      activeEnrollments,
      todaysBookings,
      monthlyRevenue,
      totalBookings,
      totalRevenue,
      turfUtilization
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Admin dashboard error", err });
  }
};
