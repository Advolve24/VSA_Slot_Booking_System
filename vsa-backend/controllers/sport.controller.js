const Sport = require("../models/Sport");

/* ======================================================
   CREATE SPORT
====================================================== */
exports.addSport = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Sport name is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Sport icon is required" });
    }

    // Prevent duplicate sport
    const exists = await Sport.findOne({ name: name.trim() });
    if (exists) {
      return res.status(409).json({ message: "Sport already exists" });
    }

    const sport = await Sport.create({
      name: name.trim(),
      iconUrl: `/uploads/sports/${req.file.filename}`,
    });

    res.status(201).json(sport);
  } catch (err) {
    console.error("Add sport error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   GET ALL SPORTS
====================================================== */
exports.getSports = async (req, res) => {
  try {
    const sports = await Sport.find().sort({ createdAt: -1 });
    res.json(sports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   UPDATE SPORT (name / icon optional)
====================================================== */
exports.updateSport = async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = {};

    if (req.body.name) {
      updateData.name = req.body.name.trim();
    }

    if (req.file) {
      updateData.iconUrl = `/uploads/sports/${req.file.filename}`;
    }

    const sport = await Sport.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!sport) {
      return res.status(404).json({ message: "Sport not found" });
    }

    res.json(sport);
  } catch (err) {
    console.error("Update sport error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   DELETE SPORT
====================================================== */
exports.deleteSport = async (req, res) => {
  try {
    const { id } = req.params;

    const sport = await Sport.findByIdAndDelete(id);

    if (!sport) {
      return res.status(404).json({ message: "Sport not found" });
    }

    res.json({ success: true, message: "Sport deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
