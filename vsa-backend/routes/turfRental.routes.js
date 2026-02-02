const express = require("express");
const router = express.Router();

/* ================= TURF RENTAL CRUD ================= */
const {
  createTurfRental,
  getTurfRentals,
  getTurfRentalById,
  updateTurfRental,
  cancelTurfRental,
  deleteTurfRental,
} = require("../controllers/turfRental.controller");

/* ================= SLOT AVAILABILITY ================= */
const {
  getFacilitySlots,
} = require("../controllers/slotAvailability.controller");

/* ================= BLOCKED SLOT ================= */
const {
  blockSlot,
  getBlockedSlots,
  getBlockedSlotById,
  unblockSlotTime,
  deleteBlockedEntry, // ✅ ADD THIS
} = require("../controllers/blockedSlot.controller");

/* ======================================================
   SLOT AVAILABILITY
   GET /api/turf-rentals/facilities/:id/slots?date=YYYY-MM-DD
====================================================== */
router.get("/facilities/:id/slots", getFacilitySlots);

/* ======================================================
   BLOCKED SLOTS (ADMIN)
====================================================== */
router.post("/blocked-slots", blockSlot);
router.get("/blocked-slots", getBlockedSlots);
router.get("/blocked-slots/:id", getBlockedSlotById);
router.delete("/blocked-slots/:id/:startTime", unblockSlotTime);
router.delete("/blocked-slots/:id", deleteBlockedEntry);

/* ======================================================
   TURF RENTAL CRUD
====================================================== */
router.post("/", createTurfRental);
router.get("/", getTurfRentals);
router.get("/:id", getTurfRentalById);
router.patch("/:id", updateTurfRental);
router.patch("/:id/cancel", cancelTurfRental);
router.delete("/:id", deleteTurfRental);

module.exports = router;
