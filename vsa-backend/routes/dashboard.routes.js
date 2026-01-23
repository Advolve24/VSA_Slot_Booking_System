const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/dashboard.controller");

// Player Dashboard
router.get("/player", auth, ctrl.playerDashboard);

// Parent Dashboard (optional)
router.get("/parent", auth, ctrl.parentDashboard);

// Admin Dashboard
router.get("/admin", auth, ctrl.adminDashboard);

module.exports = router;
