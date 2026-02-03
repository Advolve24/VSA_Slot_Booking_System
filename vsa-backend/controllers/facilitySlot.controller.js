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
   CREATE SLOT (ADMIN)
   POST /api/facility-slots
====================================================== */
exports.createSlot = async (req, res) => {
  try {
    const { facilityId, startTime, endTime, isActive = true } = req.body;

    if (!facilityId || !startTime || !endTime) {
      return res.status(400).json({
        message: "facilityId, startTime and endTime are required",
      });
    }

    const startMin = toMinutes(startTime);
    const endMin = toMinutes(endTime);

    if (startMin >= endMin) {
      return res.status(400).json({
        message: "End time must be after start time",
      });
    }

    /* ❌ Prevent overlapping slots */
    const existingSlots = await FacilitySlot.find({ facilityId });

    const overlap = existingSlots.some((s) => {
      const sStart = toMinutes(s.startTime);
      const sEnd = toMinutes(s.endTime);
      return startMin < sEnd && endMin > sStart;
    });

    if (overlap) {
      return res.status(409).json({
        message: "Slot overlaps with an existing slot",
      });
    }

    const slot = await FacilitySlot.create({
      facilityId,
      startTime,
      endTime,
      isActive,
      label: buildLabel(startTime, endTime),
    });

    res.status(201).json(slot);
  } catch (err) {
    console.error("Create Slot Error:", err);
    res.status(500).json({ message: "Server error" });
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

    const slots = await FacilitySlot.find({ facilityId }).sort({
      startTime: 1,
    });

    res.json(slots);
  } catch (err) {
    console.error("Get Slots Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   UPDATE SLOT (ADMIN)
   PUT /api/facility-slots/:id
====================================================== */
exports.updateSlot = async (req, res) => {
  try {
    const slot = await FacilitySlot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    const { startTime, endTime, isActive } = req.body;

    const newStart = startTime ?? slot.startTime;
    const newEnd = endTime ?? slot.endTime;

    const startMin = toMinutes(newStart);
    const endMin = toMinutes(newEnd);

    if (startMin >= endMin) {
      return res.status(400).json({
        message: "End time must be after start time",
      });
    }

    /* ❌ Prevent overlap (exclude self) */
    const otherSlots = await FacilitySlot.find({
      facilityId: slot.facilityId,
      _id: { $ne: slot._id },
    });

    const overlap = otherSlots.some((s) => {
      const sStart = toMinutes(s.startTime);
      const sEnd = toMinutes(s.endTime);
      return startMin < sEnd && endMin > sStart;
    });

    if (overlap) {
      return res.status(409).json({
        message: "Slot overlaps with an existing slot",
      });
    }

    slot.startTime = newStart;
    slot.endTime = newEnd;
    if (isActive !== undefined) slot.isActive = isActive;
    slot.label = buildLabel(newStart, newEnd);

    await slot.save();
    res.json(slot);
  } catch (err) {
    console.error("Update Slot Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   DELETE SLOT (ADMIN)
   DELETE /api/facility-slots/:id
====================================================== */
exports.deleteSlot = async (req, res) => {
  try {
    const slot = await FacilitySlot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    /* ❌ Prevent deleting slot with future bookings */
    const hasBooking = await TurfRental.exists({
      facilityId: slot.facilityId,
      startTime: slot.startTime,
      bookingStatus: { $ne: "cancelled" },
    });

    if (hasBooking) {
      return res.status(409).json({
        message: "Cannot delete slot with existing bookings",
      });
    }

    await slot.deleteOne();
    res.json({ message: "Slot deleted successfully" });
  } catch (err) {
    console.error("Delete Slot Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
