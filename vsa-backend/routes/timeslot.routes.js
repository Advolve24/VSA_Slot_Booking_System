const router = require("express").Router();
const ctrl = require("../controllers/timeslot.controller");

router.post("/generate", ctrl.generateSlotsForDate);
router.get("/", ctrl.getSlots);

module.exports = router;
