const router = require("express").Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const ctrl = require("../controllers/enrollment.controller");

/* ================= WEBSITE ================= */
router.post("/website", ctrl.createEnrollment); // PUBLIC

/* ================= ADMIN ================= */
router.post("/", auth, role(["admin"]), ctrl.createEnrollment);
router.get("/", auth, role(["admin"]), ctrl.getEnrollments);
router.get("/:id", auth, role(["admin"]), ctrl.getEnrollmentById);
router.put("/:id", auth, role(["admin"]), ctrl.updateEnrollment);
router.delete("/:id", auth, role(["admin"]), ctrl.deleteEnrollment);
router.post("/:id/renew", auth, role(["admin"]), ctrl.renewEnrollment);

module.exports = router;
