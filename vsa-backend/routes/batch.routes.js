const router = require("express").Router();

const auth = require("../middleware/auth");
const role = require("../middleware/role");
const ctrl = require("../controllers/batch.controller");

/* ======================================================
   PUBLIC ROUTES
   - Frontend user batch listing
====================================================== */

// Get all batches (for users + admin)
router.get("/", ctrl.getBatches);

// Get single batch (view modal)
router.get("/:id", ctrl.getBatchById);

/* ======================================================
   ADMIN ROUTES
====================================================== */

// Create batch
router.post("/", auth, role(["admin"]), ctrl.createBatch);

// Update batch
router.put("/:id", auth, role(["admin"]), ctrl.updateBatch);

// Delete batch
router.delete("/:id", auth, role(["admin"]), ctrl.deleteBatch);

module.exports = router;
