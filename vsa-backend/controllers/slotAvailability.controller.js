const TurfRental = require("../models/TurfRental");
const BlockedSlot = require("../models/BlockedSlot");
const FacilitySlot = require("../models/FacilitySlot");
const Facility = require("../models/Facility");

/* ================= HELPERS ================= */

const toMinutes = (time) => {
  if (!time) return null;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

/* ======================================================
   GET FACILITY SLOTS (USER / BOOKING SIDE)
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

    /* 2️⃣ LOAD FACILITY SLOT DEFINITION */
    const slotDoc = await FacilitySlot.findOne({ facilityId });

    if (!slotDoc || !slotDoc.slots.length) {
      return res.json([]); // no slots defined
    }

    /* 🚫 FACILITY DISABLED / MAINTENANCE */
    if (["maintenance", "disabled"].includes(facility.status)) {
      return res.json(
        slotDoc.slots
          .filter((s) => s.isActive)
          .map((s) => ({
            time: s.startTime,
            label: s.label,
            status: "blocked",
          }))
      );
    }

    /* 3️⃣ BLOCKED SLOTS FOR DATE */
    const blockedDoc = await BlockedSlot.findOne({
      facilityId,
      date,
    });

    const blockedSet = new Set(
      blockedDoc?.slots?.map((s) => s.startTime) || []
    );

    /* 4️⃣ BOOKINGS FOR DATE */
    const bookings = await TurfRental.find({
      facilityId,
      rentalDate: date,
      bookingStatus: { $ne: "cancelled" },
    });

    /* 5️⃣ BUILD FINAL SLOT LIST */
    const result = slotDoc.slots
      .filter((slot) => slot.isActive)
      .sort(
        (a, b) =>
          toMinutes(a.startTime) - toMinutes(b.startTime)
      )
      .map((slot) => {
        const slotStart = toMinutes(slot.startTime);
        const slotEnd = toMinutes(slot.endTime);

        /* 🔴 BLOCKED BY ADMIN */
        if (blockedSet.has(slot.startTime)) {
          return {
            time: slot.startTime,
            label: slot.label,
            status: "blocked",
          };
        }

        /* 🟠 BOOKED */
        const isBooked = bookings.some((b) => {
          const bStart = toMinutes(b.startTime);
          const bEnd = toMinutes(b.endTime);
          return bStart < slotEnd && bEnd > slotStart;
        });

        if (isBooked) {
          return {
            time: slot.startTime,
            label: slot.label,
            status: "booked",
          };
        }

        /* 🟢 AVAILABLE */
        return {
          time: slot.startTime,
          label: slot.label,
          status: "available",
        };
      });

    res.json(result);
  } catch (err) {
    console.error("Slot Availability Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
