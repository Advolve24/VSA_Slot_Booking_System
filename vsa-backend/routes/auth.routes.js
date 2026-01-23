const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/auth.controller");

// Create initial admin (first time only)
router.post("/create-admin", ctrl.createInitialAdmin);

// Admin login (email + password)
router.post("/admin-login", ctrl.adminLogin);

// Player login via Firebase
router.post("/firebase-login", ctrl.firebaseLogin);

// Get logged-in profile
router.get("/me", auth, ctrl.getProfile);

module.exports = router;
