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
   ADMIN: GET ALL USERS
====================================================== */
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { search, role } = req.query;

    let filter = {};

    if (role) {
      filter.role = role;
    }

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    res.json(users);
  } catch (err) {
    console.error("GET ALL USERS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

/* ======================================================
   ADMIN: GET SINGLE USER
====================================================== */
exports.getUserById = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findById(req.params.id)
      .select("-password")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

/* ======================================================
   ADMIN: UPDATE USER
====================================================== */
exports.adminUpdateUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { password } = req.body; // prevent password update here

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("ADMIN UPDATE USER ERROR:", err);
    res.status(500).json({ message: "Failed to update user" });
  }
};

/* ======================================================
   ADMIN: DELETE USER
====================================================== */
exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deleting yourself
    if (String(user._id) === String(req.user.id)) {
      return res.status(400).json({
        message: "You cannot delete your own account",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    // Optional: Also delete related data
    await Enrollment.deleteMany({ userId: user._id });
    await TurfRental.deleteMany({ userId: user._id });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("DELETE USER ERROR:", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
};