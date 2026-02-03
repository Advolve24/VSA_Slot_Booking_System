const express = require("express");
const router = express.Router();

const {
  upsertFacilitySlots,
  getSlotsByFacility,
  updateSlot,
  deleteSlot,
} = require("../controllers/facilitySlot.controller");

router.post("/", upsertFacilitySlots);
router.get("/", getSlotsByFacility);
router.put("/:facilityId/:slotId", updateSlot);
router.delete("/:facilityId/:slotId", deleteSlot);

module.exports = router;
