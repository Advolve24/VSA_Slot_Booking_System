const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/dashboard.controller");

// Admin Dashboard
router.get("/admin", auth, ctrl.adminDashboard);

module.exports = router;
