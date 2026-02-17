const Batch = require("../models/Batch");
const Sport = require("../models/Sport");
const FacilitySlot = require("../models/FacilitySlot");

/* ======================================================
   GET ALL BATCHES (ADMIN + FRONTEND)
====================================================== */
exports.getBatches = async (req, res) => {
  try {
    const today = new Date();

    const batches = await Batch.aggregate([
      /* ================= ENROLLMENTS ================= */
      {
        $lookup: {
          from: "enrollments",
          localField: "_id",
          foreignField: "batchId",
          as: "enrollments",
        },
      },
      {
        $addFields: {
          enrolledCount: {
            $size: {
              $filter: {
                input: "$enrollments",
                as: "e",
                cond: { $in: ["$$e.status", ["active", "expiring"]] },
              },
            },
          },
        },
      },

      /* ================= SPORT ================= */
      {
        $lookup: {
          from: "sports",
          localField: "sportId",
          foreignField: "_id",
          as: "sport",
        },
      },
      {
        $addFields: {
          sportName: { $first: "$sport.name" },
        },
      },

      /* ================= SLOT ================= */
      {
        $lookup: {
          from: "facilityslots",
          localField: "facilityId",
          foreignField: "facilityId",
          as: "slotDoc",
        },
      },
      {
        $addFields: {
          slotLabel: {
            $let: {
              vars: {
                slotMaster: { $first: "$slotDoc" },
              },
              in: {
                $first: {
                  $map: {
                    input: {
                      $filter: {
                        input: "$$slotMaster.slots",
                        as: "s",
                        cond: { $eq: ["$$s._id", "$slotId"] },
                      },
                    },
                    as: "matched",
                    in: "$$matched.label",
                  },
                },
              },
            },
          },
        },
      },

      {
        $addFields: {
          time: { $ifNull: ["$slotLabel", null] },
        },
      },

      /* ================= STATUS ================= */
      {
        $addFields: {
          status: {
            $cond: [
              { $lt: ["$endDate", today] },
              "expired",
              {
                $cond: [
                  { $gt: ["$startDate", today] },
                  "upcoming",
                  {
                    $cond: [
                      { $gte: ["$enrolledCount", "$capacity"] },
                      "full",
                      "active",
                    ],
                  },
                ],
              },
            ],
          },
        },
      },

      {
        $project: {
          enrollments: 0,
          sport: 0,
          slotDoc: 0,
          slotLabel: 0,
        },
      },

      { $sort: { createdAt: -1 } },
    ]);

    res.json(batches);
  } catch (err) {
    console.error("Get Batches Error:", err);
    res.status(500).json({ message: "Failed to fetch batches" });
  }
};

/* ======================================================
   GET SINGLE BATCH (ADMIN VIEW)
====================================================== */
exports.getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate("sportId", "name")
      .lean();

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    let time = null;

    if (batch.slotId) {
      const slotDoc = await FacilitySlot.findOne({
        facilityId: batch.facilityId,
      });

      const slot = slotDoc?.slots?.find(
        (s) => String(s._id) === String(batch.slotId)
      );

      time = slot?.label || null;
    }

    res.json({
      ...batch,
      sportName: batch.sportId?.name || "-",
      time,
    });
  } catch (err) {
    console.error("Get Batch Error:", err);
    res.status(500).json({ message: "Failed to fetch batch" });
  }
};

/* ======================================================
   CREATE BATCH (FACILITY + SLOT REQUIRED)
====================================================== */
exports.createBatch = async (req, res) => {
  try {
    const {
      sportName,
      facilityId,
      slotId,
      hasQuarterly,
      quarterlyMultiplier,
      ...rest
    } = req.body;

    if (!facilityId)
      return res.status(400).json({ message: "facilityId required" });

    if (!slotId)
      return res.status(400).json({ message: "slotId required" });

    const sport = await Sport.findOne({ name: sportName });
    if (!sport)
      return res.status(400).json({ message: "Invalid sport" });

    const slotDoc = await FacilitySlot.findOne({ facilityId });
    if (!slotDoc)
      return res.status(400).json({ message: "Facility slots not found" });

    const slot = slotDoc.slots.id(slotId);
    if (!slot || !slot.isActive)
      return res.status(409).json({ message: "Slot not available" });

    /* 🔒 LOCK SLOT */
    slot.isActive = false;
    await slotDoc.save();

    const batch = await Batch.create({
      ...rest,
      sportId: sport._id,
      facilityId,
      slotId,
      hasQuarterly: hasQuarterly || false,
      quarterlyMultiplier: quarterlyMultiplier || 3,
    });

    res.status(201).json(batch);
  } catch (err) {
    console.error("Create Batch Error:", err);
    res.status(400).json({ message: err.message });
  }
};

/* ======================================================
   UPDATE BATCH (ACTIVATE / DEACTIVATE SLOT)
====================================================== */
exports.updateBatch = async (req, res) => {
  try {
    const {
      sportName,
      slotId,
      slotAction,
      hasQuarterly,
      quarterlyMultiplier,
      ...rest
    } = req.body;

    const batch = await Batch.findById(req.params.id);
    if (!batch)
      return res.status(404).json({ message: "Batch not found" });

    const updateData = { ...rest };

    /* ================= SPORT ================= */
    if (sportName) {
      const sport = await Sport.findOne({ name: sportName });
      if (!sport)
        return res.status(400).json({ message: "Invalid sport" });
      updateData.sportId = sport._id;
    }

    /* ================= QUARTERLY SETTINGS ================= */
    if (hasQuarterly !== undefined)
      updateData.hasQuarterly = hasQuarterly;

    if (quarterlyMultiplier)
      updateData.quarterlyMultiplier = quarterlyMultiplier;

    /* ================= SLOT LOGIC ================= */
    if (slotAction) {
      const slotDoc = await FacilitySlot.findOne({
        facilityId: batch.facilityId,
      });

      if (!slotDoc)
        return res.status(400).json({ message: "Slots not found" });

      if (slotAction === "deactivate" && batch.slotId) {
        const oldSlot = slotDoc.slots.id(batch.slotId);
        if (oldSlot) oldSlot.isActive = true;
        await slotDoc.save();
        updateData.slotId = null;
      }

      if (slotAction === "activate") {
        if (!slotId)
          return res.status(400).json({ message: "slotId required" });

        if (batch.slotId) {
          const oldSlot = slotDoc.slots.id(batch.slotId);
          if (oldSlot) oldSlot.isActive = true;
        }

        const newSlot = slotDoc.slots.id(slotId);
        if (!newSlot || !newSlot.isActive)
          return res.status(409).json({ message: "Slot not available" });

        newSlot.isActive = false;
        await slotDoc.save();

        updateData.slotId = slotId;
      }
    }

    const updatedBatch = await Batch.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updatedBatch);
  } catch (err) {
    console.error("Update Batch Error:", err);
    res.status(400).json({ message: err.message });
  }
};

/* ======================================================
   DELETE BATCH (RELEASE SLOT IF ANY)
====================================================== */
exports.deleteBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch)
      return res.status(404).json({ message: "Batch not found" });

    if (batch.slotId) {
      const slotDoc = await FacilitySlot.findOne({
        facilityId: batch.facilityId,
      });

      const slot = slotDoc?.slots?.id(batch.slotId);
      if (slot) {
        slot.isActive = true;
        await slotDoc.save();
      }
    }

    await batch.deleteOne();
    res.json({ success: true });
  } catch (err) {
    console.error("Delete Batch Error:", err);
    res.status(500).json({ message: "Failed to delete batch" });
  }
};
