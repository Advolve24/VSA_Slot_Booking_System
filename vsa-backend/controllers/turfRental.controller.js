const TurfRental = require("../models/TurfRental");
const Facility = require("../models/Facility");

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
      sport,
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
      !sport ||
      !rentalDate ||
      !startTime ||
      !endTime ||
      !durationHours
    ) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    /* ================= FACILITY ================= */
    const facility = await Facility.findById(facilityId);
    if (!facility) {
      return res.status(404).json({ message: "Facility not found" });
    }

    if (facility.status !== "active") {
      return res.status(409).json({
        message: "Facility is not active",
      });
    }

    /* ================= PRICE ================= */
    const hourlyRate = facility.hourlyRate;
    const baseAmount = hourlyRate * Number(durationHours);
    const taxAmount = 0;
    const totalAmount = baseAmount + taxAmount;

    const bookingStatus =
      paymentStatus === "paid" ? "confirmed" : "pending";

    /* ================= CREATE ================= */
    const rental = await TurfRental.create({
      source,
      userName,
      phone,
      email,
      notes,
      facilityId,
      facilityName: facility.name,
      facilityType: facility.type,
      sport,
      rentalDate,
      startTime,
      endTime,
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
