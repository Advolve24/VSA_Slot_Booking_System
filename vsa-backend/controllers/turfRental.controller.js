const TurfRental = require("../models/TurfRental");
const Facility = require("../models/Facility");
const User = require("../models/User");

/* ================= HELPERS ================= */

const normalizeDate = (d) => {
  // ensures YYYY-MM-DD
  return new Date(d).toISOString().slice(0, 10);
};

const normalizeTime = (t) => {
  // supports "8:00 PM" OR "20:00"
  if (!t) return null;

  if (/am|pm/i.test(t)) {
    const date = new Date(`1970-01-01 ${t}`);
    return date.toTimeString().slice(0, 5); // HH:mm
  }

  return t; // already HH:mm
};

/* ======================================================
   CREATE TURF RENTAL
   POST /api/turf-rentals
====================================================== */
exports.createTurfRental = async (req, res) => {
  try {
    const {
      source = "admin",
      userName,
      phone,
      email = "",
      notes = "",
      facilityId,
      sportId,
      rentalDate,
      startTime,
      endTime,
      durationHours,
      paymentMode = "cash",
      paymentStatus = "pending",
    } = req.body;

    /* ================= VALIDATION ================= */
    if (
      !userName ||
      !phone ||
      !facilityId ||
      !sportId ||
      !rentalDate ||
      !startTime ||
      !endTime ||
      !durationHours
    ) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    /* ================= NORMALIZE ================= */
    const normalizedDate = normalizeDate(rentalDate);
    const normalizedStart = normalizeTime(startTime);
    const normalizedEnd = normalizeTime(endTime);

    /* ================= FACILITY ================= */
    const facility = await Facility.findById(facilityId)
      .populate("sports");

    if (!facility) {
      return res.status(404).json({ message: "Facility not found" });
    }

    if (facility.status !== "active") {
      return res.status(409).json({
        message: "Facility is not active",
      });
    }

    /* ================= SPORT VALIDATION ================= */
    const allowedSport = facility.sports.find(
      (s) => s._id.toString() === sportId
    );

    if (!allowedSport) {
      return res.status(400).json({
        message: "This facility does not support the selected sport",
      });
    }

    /* ================= USER UPSERT ================= */
    let user = await User.findOne({ mobile: phone });

    if (!user) {
      user = await User.create({
        fullName: userName.trim(),
        mobile: phone,
        email,
        role: "player",
      });
    }

    /* ================= PRICE ================= */
    const hourlyRate = facility.hourlyRate;
    const baseAmount = hourlyRate * Number(durationHours);
    const taxAmount = 0;
    const totalAmount = baseAmount + taxAmount;

    const bookingStatus =
      paymentStatus === "paid" ? "confirmed" : "pending";

    /* ================= CREATE RENTAL ================= */
    const rental = await TurfRental.create({
      source,
      userId: user._id,
      userName,
      phone,
      email,
      notes,

      facilityId,
      facilityName: facility.name,
      facilityType: facility.type,

      sportId: allowedSport._id,
      sportName: allowedSport.name,

      rentalDate: normalizedDate,
      startTime: normalizedStart,
      endTime: normalizedEnd,
      durationHours,

      hourlyRate,
      baseAmount,
      taxAmount,
      totalAmount,

      paymentMode,
      paymentStatus,
      bookingStatus,
    });

    res.status(201).json(rental);
  } catch (err) {
    console.error("Create TurfRental Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   GET ALL TURF RENTALS
   GET /api/turf-rentals
====================================================== */
exports.getTurfRentals = async (req, res) => {
  try {
    const rentals = await TurfRental.find()
      .populate("facilityId", "name type status")
      .sort({ createdAt: -1 });

    res.json(rentals);
  } catch (err) {
    console.error("Get TurfRentals Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   GET SINGLE TURF RENTAL
   GET /api/turf-rentals/:id
====================================================== */
exports.getTurfRentalById = async (req, res) => {
  try {
    const rental = await TurfRental.findById(req.params.id)
      .populate("facilityId", "name type status");

    if (!rental) {
      return res.status(404).json({ message: "Turf rental not found" });
    }

    res.json(rental);
  } catch (err) {
    console.error("Get TurfRental Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/* ======================================================
   UPDATE TURF RENTAL
   PATCH /api/turf-rentals/:id
====================================================== */
exports.updateTurfRental = async (req, res) => {
  try {
    const rental = await TurfRental.findById(req.params.id);
    if (!rental) {
      return res.status(404).json({ message: "Turf rental not found" });
    }

    const allowedFields = [
      "userName",
      "phone",
      "email",
      "notes",
      "sport",
      "rentalDate",
      "startTime",
      "endTime",
      "durationHours",
      "paymentMode",
      "paymentStatus",
      "bookingStatus",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        rental[field] = req.body[field];
      }
    });

    /* Recalculate amount if duration changes */
    if (req.body.durationHours) {
      rental.baseAmount =
        rental.hourlyRate * Number(req.body.durationHours);
      rental.totalAmount = rental.baseAmount + rental.taxAmount;
    }

    await rental.save();
    res.json(rental);
  } catch (err) {
    console.error("Update TurfRental Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   CANCEL TURF RENTAL
   PATCH /api/turf-rentals/:id/cancel
====================================================== */
exports.cancelTurfRental = async (req, res) => {
  try {
    const rental = await TurfRental.findById(req.params.id);
    if (!rental) {
      return res.status(404).json({ message: "Turf rental not found" });
    }

    rental.bookingStatus = "cancelled";
    await rental.save();

    res.json({ message: "Booking cancelled successfully" });
  } catch (err) {
    console.error("Cancel TurfRental Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   DELETE TURF RENTAL
   DELETE /api/turf-rentals/:id
====================================================== */
exports.deleteTurfRental = async (req, res) => {
  try {
    const rental = await TurfRental.findByIdAndDelete(req.params.id);
    if (!rental) {
      return res.status(404).json({ message: "Turf rental not found" });
    }

    res.json({ message: "Turf rental deleted successfully" });
  } catch (err) {
    console.error("Delete TurfRental Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
