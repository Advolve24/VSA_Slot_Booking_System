const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/user.controller");

/* ================= PLAYER ROUTES ================= */

// My profile
router.get("/me", auth, ctrl.getMyProfile);

// Update profile
router.put("/update", auth, ctrl.updateProfile);

// My enrollments
router.get("/my-enrollments", auth, ctrl.getMyEnrollments);

// My turf bookings
router.get("/my-turf-bookings", auth, ctrl.getMyTurfBookings);

router.get("/check-mobile/:mobile", ctrl.checkMobile);


/* ================= ADMIN ROUTES ================= */

// All users
router.get("/all", auth, ctrl.getAllUsers);

module.exports = router;
