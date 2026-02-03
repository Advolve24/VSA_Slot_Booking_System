const express = require("express");
const router = express.Router();

const {
  createSlot,
  getSlotsByFacility,
  updateSlot,
  deleteSlot,
} = require("../controllers/facilitySlot.controller");

/* ================= FACILITY SLOT CRUD ================= */

router.post("/", createSlot);
router.get("/", getSlotsByFacility);
router.put("/:id", updateSlot);
router.delete("/:id", deleteSlot);

module.exports = router;
