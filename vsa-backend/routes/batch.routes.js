const router = require("express").Router();

const auth = require("../middleware/auth");
const role = require("../middleware/role");
const ctrl = require("../controllers/batch.controller");

/* ======================================================
   PUBLIC ROUTES
   - Frontend (users + admin view)
====================================================== */
router.get("/", ctrl.getBatches);

router.get("/:id", ctrl.getBatchById);

/* ======================================================
   ADMIN ROUTES
====================================================== */

router.post("/", auth, role(["admin"]), ctrl.createBatch);

router.put("/:id", auth, role(["admin"]), ctrl.updateBatch);
  
// Delete batch (releases slot if any)
router.delete("/:id", auth, role(["admin"]), ctrl.deleteBatch);

module.exports = router;
