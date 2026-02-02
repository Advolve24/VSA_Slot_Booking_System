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

    const data = await BlockedSlot.find(filter)
      .populate("facilityId", "name type")
      .sort({ date: 1 });

    res.set("Cache-Control", "no-store");
    res.json(data);
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
   UNBLOCK SLOT
   DELETE /api/turf-rentals/blocked-slots/:id
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

    res.json({
      message: "Slot time unblocked",
      data: updated,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
