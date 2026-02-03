const BlockedSlot = require("../models/BlockedSlot");
const FacilitySlot = require("../models/FacilitySlot");

/* ======================================================
   BLOCK SLOTS (ONLY FROM ACTIVE FACILITY SLOTS)
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

    /* --------------------------------------------------
       1️⃣ Fetch ACTIVE facility slots
    -------------------------------------------------- */
    const facilitySlotDoc = await FacilitySlot.findOne({ facilityId });

    if (!facilitySlotDoc || !facilitySlotDoc.slots.length) {
      return res.status(400).json({
        message: "No active slots found for this facility",
      });
    }

    const activeSlotSet = new Set(
      facilitySlotDoc.slots
        .filter((s) => s.isActive)
        .map((s) => s.startTime)
    );

    /* --------------------------------------------------
       2️⃣ Validate requested blocked slots
    -------------------------------------------------- */
    const invalidSlots = slots.filter(
      (time) => !activeSlotSet.has(time)
    );

    if (invalidSlots.length > 0) {
      return res.status(409).json({
        message: "Some slots are not valid or inactive",
        invalidSlots,
      });
    }

    /* --------------------------------------------------
       3️⃣ Prepare slot objects
    -------------------------------------------------- */
    const slotObjects = slots.map((time) => ({
      startTime: time,
      reason,
    }));

    /* --------------------------------------------------
       4️⃣ UPSERT blocked slots (no duplicates)
    -------------------------------------------------- */
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
   GET BLOCKED SLOTS (TABLE / FILTER VIEW)
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

    // ✅ safety: ignore deleted facilities
    const safeSlots = slots.filter((s) => s.facilityId);

    res.json(safeSlots);
  } catch (err) {
    console.error("GET BLOCKED SLOTS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   GET BLOCKED SLOT BY ID
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

    if (!updated.slots.length) {
      await BlockedSlot.findByIdAndDelete(id);
      return res.json({
        message: "Slot unblocked (entry removed)",
        data: null,
      });
    }

    res.json({
      message: "Slot unblocked",
      data: updated,
    });
  } catch (err) {
    console.error("UNBLOCK SLOT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   DELETE WHOLE BLOCKED ENTRY
====================================================== */
exports.deleteBlockedEntry = async (req, res) => {
  try {
    const deleted = await BlockedSlot.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Blocked slot not found" });
    }

    res.json({
      message: "Blocked entry deleted",
      data: deleted,
    });
  } catch (err) {
    console.error("DELETE BLOCKED ENTRY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
