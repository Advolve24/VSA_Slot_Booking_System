const router = require("express").Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const ctrl = require("../controllers/announcement.controller");

router.get("/", ctrl.getAnnouncements);
router.post("/", auth, role(["admin"]), ctrl.createAnnouncement);

module.exports = router;
