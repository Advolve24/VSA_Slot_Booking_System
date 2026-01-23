const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/notification.controller");

router.get("/", auth, ctrl.getMyNotifications);
router.post("/mark-read", auth, ctrl.markAllRead);

module.exports = router;
