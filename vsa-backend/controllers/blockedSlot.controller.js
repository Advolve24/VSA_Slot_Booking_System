const BlockedSlot = require("../models/BlockedSlot");

/* ======================================================
   BLOCK SLOTS (ADMIN)
   POST /api/turf-rentals/blocked-slots
====================================================== */
exports.blockSlot = async (req, res) => {
  try {
    const {
      facilityId,
      date,
      slots,
      reason = "coaching",
    } = req.body;

    if (!facilityId || !date || !Array.isArray(slots) || !slots.length) {
      return res.status(400).json({
        message: "facilityId, date and slots[] are required",
      });
    }

    const blocked = [];
    const skipped = [];

    for (const startTime of slots) {
      if (!startTime) continue;

      const exists = await BlockedSlot.findOne({
        facilityId,
        date,
        startTime,
      });

      if (exists) {
        skipped.push(startTime);
        continue;
      }

      const doc = await BlockedSlot.create({
        facilityId,
        date,
        startTime,
        reason,
      });

      blocked.push(doc);
    }

    res.status(201).json({
      message: "Slots blocked successfully",
      blocked,
      skipped,
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
    const { facilityId, date, view } = req.query;

    const filter = {};

    // 🔒 facilityId required ONLY for non-table views
    if (view !== "table") {
      if (!facilityId) {
        return res.status(400).json({
          message: "facilityId is required",
        });
      }
      filter.facilityId = facilityId;
    } else {
      // table view → optional facility filter
      if (facilityId) {
        filter.facilityId = facilityId;
      }
    }

    if (date) filter.date = date;

    const slots = await BlockedSlot.find(filter)
      .populate("facilityId", "name type")
      .sort({ date: 1, startTime: 1 });

    res.set("Cache-Control", "no-store");

    // 🔁 NORMAL RESPONSE
    if (view !== "table") {
      return res.json(slots);
    }

    // 📊 TABLE RESPONSE (GROUPED)
    const grouped = {};

    for (const slot of slots) {
      const key = `${slot.facilityId._id}_${slot.date}`;

      if (!grouped[key]) {
        grouped[key] = {
          facility: slot.facilityId,
          date: slot.date,
          slots: [],
        };
      }

      grouped[key].slots.push({
        _id: slot._id,
        startTime: slot.startTime,
        reason: slot.reason,
      });
    }

    return res.json(Object.values(grouped));
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
      return res.status(404).json({
        message: "Blocked slot not found",
      });
    }

    res.json(slot);
  } catch (err) {
    console.error("GET BLOCKED SLOT BY ID ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   UNBLOCK SLOT
   DELETE /api/turf-rentals/blocked-slots/:id
====================================================== */
exports.unblockSlot = async (req, res) => {
  try {
    const removed = await BlockedSlot.findByIdAndDelete(req.params.id);

    if (!removed) {
      return res.status(404).json({
        message: "Blocked slot not found",
      });
    }

    res.json({
      message: "Slot unblocked successfully",
      removed,
    });
  } catch (err) {
    console.error("UNBLOCK SLOT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
