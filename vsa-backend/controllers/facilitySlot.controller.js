const mongoose = require("mongoose");
const FacilitySlot = require("../models/FacilitySlot");
const TurfRental = require("../models/TurfRental");

/* ================= HELPERS ================= */

const toMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const buildLabel = (start, end) => {
  const to12H = (t) => {
    const [h, m] = t.split(":").map(Number);
    const hr = h % 12 || 12;
    const ampm = h < 12 ? "AM" : "PM";
    return `${hr}:${String(m).padStart(2, "0")} ${ampm}`;
  };
  return `${to12H(start)} – ${to12H(end)}`;
};

/* ======================================================
   ADD / UPSERT MULTIPLE SLOTS FOR A FACILITY
   POST /api/facility-slots
====================================================== */
exports.upsertFacilitySlots = async (req, res) => {
  try {
    const { facilityId, slots } = req.body;

    if (!facilityId || !Array.isArray(slots)) {
      return res.status(400).json({
        message: "facilityId and slots array are required",
      });
    }

    // Prepare slots
    const preparedSlots = slots.map((s) => {
      if (!s.startTime || !s.endTime) {
        throw new Error("startTime and endTime are required");
      }

      if (toMinutes(s.startTime) >= toMinutes(s.endTime)) {
        throw new Error("End time must be after start time");
      }

      return {
        _id: s._id || new mongoose.Types.ObjectId(),
        startTime: s.startTime,
        endTime: s.endTime,
        isActive: s.isActive !== false,
        label: buildLabel(s.startTime, s.endTime),
      };
    });

    /* ❌ Overlap check */
    const sorted = [...preparedSlots].sort(
      (a, b) => toMinutes(a.startTime) - toMinutes(b.startTime)
    );

    for (let i = 1; i < sorted.length; i++) {
      if (
        toMinutes(sorted[i].startTime) <
        toMinutes(sorted[i - 1].endTime)
      ) {
        return res.status(409).json({
          message: "Slots overlap with each other",
        });
      }
    }

    const doc = await FacilitySlot.findOneAndUpdate(
      { facilityId },
      { facilityId, slots: preparedSlots },
      { upsert: true, new: true }
    );

    res.json(doc);
  } catch (err) {
    console.error("Upsert Facility Slots Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   GET SLOTS BY FACILITY
   GET /api/facility-slots?facilityId=xxx
====================================================== */
exports.getSlotsByFacility = async (req, res) => {
  try {
    const { facilityId } = req.query;

    if (!facilityId) {
      return res.status(400).json({
        message: "facilityId is required",
      });
    }

    const doc = await FacilitySlot.findOne({ facilityId });

    res.json(doc?.slots || []);
  } catch (err) {
    console.error("Get Slots Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   UPDATE SINGLE SLOT INSIDE FACILITY
   PUT /api/facility-slots/:facilityId/:slotId
====================================================== */
exports.updateSlot = async (req, res) => {
  try {
    const { facilityId, slotId } = req.params;
    const { startTime, endTime, isActive } = req.body;

    const doc = await FacilitySlot.findOne({ facilityId });
    if (!doc) {
      return res.status(404).json({ message: "Facility slots not found" });
    }

    const slot = doc.slots.id(slotId);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    const newStart = startTime ?? slot.startTime;
    const newEnd = endTime ?? slot.endTime;

    if (toMinutes(newStart) >= toMinutes(newEnd)) {
      return res.status(400).json({
        message: "End time must be after start time",
      });
    }

    /* ❌ Overlap check (exclude self) */
    const overlap = doc.slots.some((s) => {
      if (s._id.equals(slotId)) return false;
      return (
        toMinutes(newStart) < toMinutes(s.endTime) &&
        toMinutes(newEnd) > toMinutes(s.startTime)
      );
    });

    if (overlap) {
      return res.status(409).json({
        message: "Slot overlaps with another slot",
      });
    }

    slot.startTime = newStart;
    slot.endTime = newEnd;
    if (isActive !== undefined) slot.isActive = isActive;
    slot.label = buildLabel(newStart, newEnd);

    await doc.save();
    res.json(slot);
  } catch (err) {
    console.error("Update Slot Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   DELETE SINGLE SLOT INSIDE FACILITY
   DELETE /api/facility-slots/:facilityId/:slotId
====================================================== */
exports.deleteSlot = async (req, res) => {
  try {
    const { facilityId, slotId } = req.params;

    const doc = await FacilitySlot.findOne({ facilityId });
    if (!doc) {
      return res.status(404).json({ message: "Facility slots not found" });
    }

    const slot = doc.slots.id(slotId);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    /* ❌ Prevent delete if booked */
    const hasBooking = await TurfRental.exists({
      facilityId,
      startTime: slot.startTime,
      bookingStatus: { $ne: "cancelled" },
    });

    if (hasBooking) {
      return res.status(409).json({
        message: "Cannot delete slot with existing bookings",
      });
    }

    slot.remove();
    await doc.save();

    res.json({ message: "Slot deleted successfully" });
  } catch (err) {
    console.error("Delete Slot Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
