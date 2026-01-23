const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/activity.controller");

// PLAYER / PARENT — Own activity
router.get("/me", auth, ctrl.getMyActivity);

// ADMIN — All activity logs
router.get("/admin", auth, ctrl.getAllActivity);

module.exports = router;
