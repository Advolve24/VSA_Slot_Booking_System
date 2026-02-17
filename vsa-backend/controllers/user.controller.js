const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const TurfRental = require("../models/TurfRental");
const FacilitySlot = require("../models/FacilitySlot");

/* ======================================================
   GET MY PROFILE
====================================================== */
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .lean();

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (err) {
    console.error("GET MY PROFILE ERROR:", err);
    res.status(500).json({
      message: "Failed to fetch profile",
    });
  }
};

/* ======================================================
   UPDATE MY PROFILE
====================================================== */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { role, password, ...safeUpdates } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: safeUpdates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    /* ================= SYNC ENROLLMENTS ================= */
    await Enrollment.updateMany(
      { userId },
      {
        $set: {
          playerName: updatedUser.fullName,
          mobile: updatedUser.mobile,
          email: updatedUser.email,
          address: updatedUser.address,
        },
      }
    );

    /* ================= SYNC TURF BOOKINGS ================= */
    await TurfRental.updateMany(
      { userId },
      {
        $set: {
          userName: updatedUser.fullName,
          phone: updatedUser.mobile,
          email: updatedUser.email,
          address: updatedUser.address,
        },
      }
    );

    res.json({
      message: "Profile updated & synced successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(500).json({
      message: "Failed to update profile",
    });
  }
};

/* ======================================================
   GET MY ENROLLMENTS
====================================================== */
exports.getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      userId: req.user.id,
    })
      .populate({
        path: "batchId",
        select:
          "name schedule startDate endDate slotId coachName facilityId",
      })
      .sort({ createdAt: -1 })
      .lean();

    const formatted = [];

    for (const en of enrollments) {
      let slotLabel = null;

      if (en.batchId?.slotId) {
        const slotDoc = await FacilitySlot.findOne({
          facilityId: en.batchId.facilityId,
        });

        const matched = slotDoc?.slots?.find(
          (s) => String(s._id) === String(en.batchId.slotId)
        );

        slotLabel = matched?.label || null;
      }

      formatted.push({
        ...en,
        slotLabel,
      });
    }

    res.json(formatted);
  } catch (err) {
    console.error("MY ENROLLMENTS ERROR:", err);
    res.status(500).json({
      message: "Failed to fetch enrollments",
    });
  }
};

/* ======================================================
   GET MY TURF BOOKINGS
====================================================== */
exports.getMyTurfBookings = async (req, res) => {
  try {
    const bookings = await TurfRental.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    const formattedBookings = [];

    for (const booking of bookings) {
      const slotMaster = await FacilitySlot.findOne({
        facilityId: booking.facilityId,
      });

      let slotLabels = [];

      if (slotMaster?.slots?.length) {
        slotLabels = booking.slots.map((startTime) => {
          const matched = slotMaster.slots.find(
            (s) => s.startTime === startTime
          );
          return matched ? matched.label : startTime;
        });
      }

      formattedBookings.push({
        ...booking.toObject(),
        slotLabels,
      });
    }

    res.json(formattedBookings);
  } catch (err) {
    console.error("MY TURF BOOKINGS ERROR:", err);
    res.status(500).json({
      message: "Failed to fetch turf bookings",
    });
  }
};

/* ======================================================
   CHECK MOBILE (FOR ENROLLMENT FLOW)
====================================================== */
exports.checkMobile = async (req, res) => {
  try {
    const { mobile } = req.params;

    const user = await User.findOne({
      mobile,
      role: "player",
    }).select("-password");

    if (!user) {
      return res.json({ exists: false });
    }

    res.json({
      exists: true,
      user,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

/* ======================================================
   GET ALL USERS (ADMIN ONLY)
====================================================== */
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    res.json(users);
  } catch (err) {
    console.error("GET ALL USERS ERROR:", err);
    res.status(500).json({
      message: "Failed to fetch users",
    });
  }
};
