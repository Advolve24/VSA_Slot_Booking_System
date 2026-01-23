const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/user.controller");

router.put("/update", auth, ctrl.updateProfile);
router.get("/all", ctrl.getAllUsers);

module.exports = router;
