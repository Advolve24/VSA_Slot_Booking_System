const router = require("express").Router();
const ctrl = require("../controllers/attendance.controller");

router.post("/", ctrl.markAttendance);
router.get("/", ctrl.getAttendance);

module.exports = router;
