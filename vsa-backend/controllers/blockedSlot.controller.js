const BlockedSlot = require("../models/BlockedSlot");


/* ======================================================
   BLOCK SLOTS (CREATE OR UPDATE)
   POST /api/turf-rentals/blocked-slots
====================================================== */
exports.blockSlot = async (req, res) => {
  try {
    const { facilityId, date, slots, reason = "coaching" } = req.body;

    if (!facilityId || !date || !Array.isArray(slots) || !slots.length) {
      return res.status(400).json({
        message: "facilityId, date and slots[] are required",
      });
    }

    const slotObjects = slots.map((time) => ({
      startTime: time,
      reason,
    }));

    const doc = await BlockedSlot.findOneAndUpdate(
      { facilityId, date },
      {
        $set: { facilityId, date },
        $addToSet: { slots: { $each: slotObjects } },
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      message: "Slots blocked successfully",
      data: doc,
    });
  } catch (err) {
    console.error("BLOCK SLOT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   GET BLOCKED SLOTS
   LIST OR TABLE VIEW
   GET /api/turf-rentals/blocked-slots
====================================================== */
exports.getBlockedSlots = async (req, res) => {
  try {
    const { facilityId, date } = req.query;

    const filter = {};
    if (facilityId) filter.facilityId = facilityId;
    if (date) filter.date = date;

    const slots = await BlockedSlot.find(filter)
      .populate("facilityId", "name type")
      .sort({ date: 1 });

    // ✅ FILTER OUT BROKEN RECORDS
    const safeSlots = slots.filter(
      (s) => s.facilityId !== null
    );

    res.json(safeSlots);
  } catch (err) {
    console.error("GET BLOCKED SLOTS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   GET BLOCKED SLOT BY ID (VIEW MODAL)
   GET /api/turf-rentals/blocked-slots/:id
====================================================== */
exports.getBlockedSlotById = async (req, res) => {
  try {
    const slot = await BlockedSlot.findById(req.params.id)
      .populate("facilityId", "name type");

    if (!slot) {
      return res.status(404).json({ message: "Blocked slot not found" });
    }

    res.json(slot);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   UNBLOCK SINGLE SLOT TIME
   DELETE /api/turf-rentals/blocked-slots/:id/:startTime
====================================================== */
exports.unblockSlotTime = async (req, res) => {
  try {
    const { id, startTime } = req.params;

    const updated = await BlockedSlot.findByIdAndUpdate(
      id,
      { $pull: { slots: { startTime } } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Blocked slot not found" });
    }

    // ✅ if no slots left, delete whole doc
    if (!updated.slots || updated.slots.length === 0) {
      await BlockedSlot.findByIdAndDelete(id);
      return res.json({
        message: "Slot unblocked and entry deleted (no slots left)",
        data: null,
      });
    }

    res.json({
      message: "Slot time unblocked",
      data: updated,
    });
  } catch (err) {
    console.error("UNBLOCK SLOT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/* ======================================================
   DELETE WHOLE ENTRY (ALL SLOTS FOR DATE)
   DELETE /api/turf-rentals/blocked-slots/:id
====================================================== */
exports.deleteBlockedEntry = async (req, res) => {
  try {
    const deleted = await BlockedSlot.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Blocked slot not found" });
    }

    res.json({ message: "Blocked entry deleted", data: deleted });
  } catch (err) {
    console.error("DELETE ENTRY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
