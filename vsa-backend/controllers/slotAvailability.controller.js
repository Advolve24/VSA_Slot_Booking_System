const TurfRental = require("../models/TurfRental");
const BlockedSlot = require("../models/BlockedSlot");
const FacilitySlot = require("../models/FacilitySlot");
const Facility = require("../models/Facility");

const toMinutes = (time) => {
  if (!time) return null;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

exports.getFacilitySlots = async (req, res) => {
  try {
    const { id: facilityId } = req.params;
    const { date } = req.query;

    if (!facilityId || !date) {
      return res.status(400).json({ message: "facilityId and date are required" });
    }

    const facility = await Facility.findById(facilityId);
    if (!facility) {
      return res.status(404).json({ message: "Facility not found" });
    }

    /* 🚫 Facility disabled */
    if (["maintenance", "disabled"].includes(facility.status)) {
      const slots = await FacilitySlot.find({ facilityId, isActive: true });
      return res.json(
        slots.map((s) => ({
          time: s.startTime,
          label: s.label,
          status: "blocked",
        }))
      );
    }

    /* 1️⃣ Admin-defined slots */
    const baseSlots = await FacilitySlot.find({
      facilityId,
      isActive: true,
    }).sort({ startTime: 1 });

    /* 2️⃣ Blocked slots */
    const blockedDoc = await BlockedSlot.findOne({ facilityId, date });
    const blockedSet = new Set(
      blockedDoc?.slots?.map((s) => s.startTime) || []
    );

    /* 3️⃣ Bookings */
    const bookings = await TurfRental.find({
      facilityId,
      rentalDate: date,
      bookingStatus: { $ne: "cancelled" },
    });

    /* 4️⃣ Build final slot list */
    const result = baseSlots.map((slot) => {
      const slotStart = toMinutes(slot.startTime);
      const slotEnd = toMinutes(slot.endTime);

      /* 🔴 BLOCKED */
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
