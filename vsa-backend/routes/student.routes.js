const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/student.controller");

router.post("/", auth, ctrl.addStudent);
router.get("/mine", auth, ctrl.getMyChildren);

module.exports = router;
