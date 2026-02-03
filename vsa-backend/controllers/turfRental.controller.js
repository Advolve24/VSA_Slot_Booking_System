const TurfRental = require("../models/TurfRental");
const Facility = require("../models/Facility");
const FacilitySlot = require("../models/FacilitySlot");
const BlockedSlot = require("../models/BlockedSlot");
const User = require("../models/User");

/* ================= HELPERS ================= */

const normalizeDate = (d) =>
  new Date(d).toISOString().slice(0, 10);

/* ======================================================
   CREATE TURF RENTAL (MULTI SLOT)
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
      slots, // ✅ ["07:00","08:00"]
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
      !Array.isArray(slots) ||
      slots.length === 0
    ) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const date = normalizeDate(rentalDate);

    /* ================= FACILITY ================= */
    const facility = await Facility.findById(facilityId).populate("sports");

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

    /* ================= SLOT DEFINITION ================= */
    const slotDoc = await FacilitySlot.findOne({ facilityId });

    if (!slotDoc) {
      return res.status(409).json({
        message: "No slots defined for this facility",
      });
    }

    const activeSlots = slotDoc.slots
      .filter((s) => s.isActive)
      .map((s) => s.startTime);

    const invalidSlots = slots.filter(
      (t) => !activeSlots.includes(t)
    );

    if (invalidSlots.length) {
      return res.status(409).json({
        message: "Invalid slot(s) selected",
        invalidSlots,
      });
    }

    /* ================= BLOCKED SLOT CHECK ================= */
    const blocked = await BlockedSlot.findOne({
      facilityId,
      date,
      "slots.startTime": { $in: slots },
    });

    if (blocked) {
      return res.status(409).json({
        message: "One or more slots are blocked",
      });
    }

    /* ================= OVERLAP CHECK (🔥 SIMPLE) ================= */
    const alreadyBooked = await TurfRental.findOne({
      facilityId,
      rentalDate: date,
      bookingStatus: { $ne: "cancelled" },
      slots: { $in: slots }, // ✅ THIS IS THE MAGIC
    });

    if (alreadyBooked) {
      return res.status(409).json({
        message: "One or more slots already booked",
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
    const durationHours = slots.length;
    const hourlyRate = facility.hourlyRate;
    const baseAmount = hourlyRate * durationHours;
    const taxAmount = 0;
    const totalAmount = baseAmount;

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

      rentalDate: date,
      slots, // ✅ STORE DIRECTLY
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
   UPDATE TURF RENTAL (NO SLOT CHANGE)
====================================================== */
exports.updateTurfRental = async (req, res) => {
  try {
    const rental = await TurfRental.findById(req.params.id);
    if (!rental) {
      return res.status(404).json({ message: "Turf rental not found" });
    }

    Object.assign(rental, req.body);

    if (req.body.slots) {
      rental.durationHours = req.body.slots.length;
      rental.baseAmount =
        rental.hourlyRate * rental.durationHours;
      rental.totalAmount = rental.baseAmount;
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
