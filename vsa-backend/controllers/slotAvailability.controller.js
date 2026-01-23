const TurfRental = require("../models/TurfRental");
const BlockedSlot = require("../models/BlockedSlot");
const Facility = require("../models/Facility");

/* ================= TIME HELPERS ================= */

const toMinutes = (time) => {
  if (!time) return null; // 🛡️ SAFETY FIX
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const formatLabel = (hour) => {
  const h = hour % 12 || 12;
  const ampm = hour < 12 ? "AM" : "PM";
  return `${h}:00 ${ampm}`;
};

/* ================= SLOT GENERATOR =================
   Morning: 7–11 AM
   Evening: 2–9 PM
=================================================== */

const generateSlots = () => {
  const slots = [];

  // Morning (7–11)
  for (let h = 7; h < 11; h++) slots.push(h);

  // Evening (14–21)
  for (let h = 14; h < 21; h++) slots.push(h);

  return slots.map((hour) => ({
    time: `${String(hour).padStart(2, "0")}:00`,
    label: formatLabel(hour),
  }));
};

/* ======================================================
   GET FACILITY SLOT AVAILABILITY
   GET /api/facilities/:id/slots?date=YYYY-MM-DD
====================================================== */
exports.getFacilitySlots = async (req, res) => {
  try {
    const { id: facilityId } = req.params;
    const { date } = req.query;

    /* ================= VALIDATION ================= */
    if (!facilityId || !date) {
      return res.status(400).json({
        message: "facilityId and date are required",
      });
    }

    const facility = await Facility.findById(facilityId);
    if (!facility) {
      return res.status(404).json({ message: "Facility not found" });
    }

    const baseSlots = generateSlots();

    /* 🚫 Facility disabled / maintenance */
    if (["maintenance", "disabled"].includes(facility.status)) {
      return res.json(
        baseSlots.map((slot) => ({
          ...slot,
          status: "blocked",
        }))
      );
    }

    /* ================= FETCH DATA ================= */

    const blockedSlots = await BlockedSlot.find({
      facilityId,
      date,
    });

    const bookings = await TurfRental.find({
      facilityId,
      rentalDate: date,
      bookingStatus: { $ne: "cancelled" },
    });

    /* ================= SLOT STATUS LOGIC ================= */

    const result = baseSlots.map((slot) => {
      const slotStart = toMinutes(slot.time);
      const slotEnd = slotStart + 60;

      /* 🔴 BLOCKED SLOT (ADMIN) */
      const isBlocked = blockedSlots.some((b) => {
        const start = toMinutes(b.startTime);
        if (start == null) return false;

        const end = start + 60; // ⏱️ DERIVED END TIME
        return start < slotEnd && end > slotStart;
      });

      if (isBlocked) {
        return { ...slot, status: "blocked" };
      }

      /* 🟠 BOOKED SLOT (RENTAL) */
      const isBooked = bookings.some((b) => {
        const start = toMinutes(b.startTime);
        const end = toMinutes(b.endTime);

        if (start == null || end == null) return false;

        return start < slotEnd && end > slotStart;
      });

      if (isBooked) {
        return { ...slot, status: "booked" };
      }

      /* 🟢 AVAILABLE */
      return { ...slot, status: "available" };
    });

    return res.json(result);
  } catch (err) {
    console.error("Slot Availability Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
