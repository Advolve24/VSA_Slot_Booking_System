const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/settings.controller");

router.get("/", auth, ctrl.getSettings);
router.put("/", auth, ctrl.updateSettings);

module.exports = router;
