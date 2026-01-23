const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  addSport,
  getSports,
  updateSport,
  deleteSport,
} = require("../controllers/sport.controller");

/* ================= MULTER ================= */
const storage = multer.diskStorage({
  destination: "uploads/sports",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/* ================= ROUTES ================= */
router.get("/", getSports);
router.post("/", upload.single("icon"), addSport);
router.put("/:id", upload.single("icon"), updateSport);
router.delete("/:id", deleteSport);

module.exports = router;
