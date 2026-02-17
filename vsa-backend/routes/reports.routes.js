// routes/reports.routes.js
const router = require("express").Router();
const { getReports } = require("../controllers/reports.controller");
const auth = require("../middleware/auth");

// FINAL endpoint: GET /api/reports
router.get("/", auth, getReports);

module.exports = router;
