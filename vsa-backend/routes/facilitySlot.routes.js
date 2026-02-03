const express = require("express");
const router = express.Router();

const {
  upsertFacilitySlots,
  getSlotsByFacility,
  getAllFacilitySlots,
  updateSlot,
  deleteSlot,
} = require("../controllers/facilitySlot.controller");


/* get all facilities with slots */
router.get("/all", getAllFacilitySlots);

/* ONE facility (drawer edit) */
router.get("/", getSlotsByFacility);

/* UPDATE ALL slots for a facility */
router.post("/", upsertFacilitySlots);

/* UPDATE single slot */
router.put("/:facilityId/:slotId", updateSlot);

/* DELETE single slot */
router.delete("/:facilityId/:slotId", deleteSlot);

module.exports = router;
