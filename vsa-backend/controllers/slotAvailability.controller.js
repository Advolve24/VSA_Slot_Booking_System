const TurfRental = require("../models/TurfRental");
const BlockedSlot = require("../models/BlockedSlot");
const FacilitySlot = require("../models/FacilitySlot");
const Facility = require("../models/Facility");

/* ======================================================
   GET FACILITY SLOTS (USER / ADMIN / BOOKING SIDE)
   GET /api/turf-rentals/facilities/:id/slots?date=YYYY-MM-DD
====================================================== */
exports.getFacilitySlots = async (req, res) => {
  try {
    const { id: facilityId } = req.params;
    const { date } = req.query;

    if (!facilityId || !date) {
      return res.status(400).json({
        message: "facilityId and date are required",
      });
    }

    /* 1️⃣ FACILITY CHECK */
    const facility = await Facility.findById(facilityId);
    if (!facility) {
      return res.status(404).json({ message: "Facility not found" });
    }

    /* 2️⃣ SLOT DEFINITIONS */
    const slotDoc = await FacilitySlot.findOne({ facilityId });

    if (!slotDoc || !slotDoc.slots?.length) {
      return res.json([]);
    }

    /* 🚫 FACILITY INACTIVE */
    if (["maintenance", "disabled"].includes(facility.status)) {
      return res.json(
        slotDoc.slots
          .filter((s) => s.isActive)
          .map((s) => ({
            time: s.startTime,
            label: s.label || s.startTime,
            status: "blocked",
          }))
      );
    }

    /* 3️⃣ ADMIN BLOCKED SLOTS */
    const blockedDoc = await BlockedSlot.findOne({
      facilityId,
      date,
    });

    const blockedSet = new Set(
      blockedDoc?.slots?.map((s) => s.startTime) || []
    );

    /* 4️⃣ BOOKINGS FOR DATE (🔥 SLOT BASED) */
    const bookings = await TurfRental.find({
      facilityId,
      rentalDate: date,
      bookingStatus: { $ne: "cancelled" },
    }).select("slots");

    const bookedSet = new Set(
      bookings.flatMap((b) => b.slots || [])
    );

    /* 5️⃣ BUILD FINAL SLOT LIST */
    const result = slotDoc.slots
      .filter((s) => s.isActive)
      .map((slot) => {
        const time = slot.startTime;

        /* 🔴 BLOCKED */
        if (blockedSet.has(time)) {
          return {
            time,
            label: slot.label || time,
            status: "blocked",
          };
        }

        /* 🟠 BOOKED */
        if (bookedSet.has(time)) {
          return {
            time,
            label: slot.label || time,
            status: "booked",
          };
        }

        /* 🟢 AVAILABLE */
        return {
          time,
          label: slot.label || time,
          status: "available",
        };
      });

    res.json(result);
  } catch (err) {
    console.error("Slot Availability Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
