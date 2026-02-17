const express = require("express");
const router = express.Router();
const {
  getEnrollmentInvoice,
  getTurfInvoice,
  downloadEnrollmentInvoicePDF,
  downloadTurfInvoicePDF,
} = require("../controllers/invoice.controller");

const authRequired = require("../middleware/auth");


/* ================= ENROLLMENT ================= */

router.get(
  "/enrollment/:id",
  authRequired,
  getEnrollmentInvoice
);

router.get(
  "/enrollment/:id/download",
  authRequired,
  downloadEnrollmentInvoicePDF
);

/* ================= TURF ================= */

router.get(
  "/turf/:id",
  authRequired,
  getTurfInvoice
);

router.get(
  "/turf/:id/download",
  authRequired,
  downloadTurfInvoicePDF
);

module.exports = router;
