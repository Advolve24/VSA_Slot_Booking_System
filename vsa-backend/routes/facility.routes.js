const express = require("express");
const router = express.Router();

const {
  createFacility,
  getFacilities,
  getFacilityById,
  updateFacility,
  deleteFacility,
} = require("../controllers/facility.controller");

const { getFacilitySlots } = require("../controllers/slotAvailability.controller");


const upload = require("../middleware/upload");

/* ======================================================
   PUBLIC ROUTES (USER + ADMIN)
====================================================== */
router.get("/", getFacilities);
router.get("/:id", getFacilityById);
router.get("/:id/slots", getFacilitySlots);

/* ======================================================
   ADMIN ROUTES
====================================================== */
router.post("/", createFacility);
router.put("/:id", updateFacility);
router.delete("/:id", deleteFacility);

module.exports = router;
