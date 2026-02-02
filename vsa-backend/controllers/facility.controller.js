const Facility = require("../models/Facility");
const fs = require("fs");
const path = require("path");

/* ======================================================
   CREATE FACILITY (ADMIN)
   POST /api/facilities
====================================================== */
exports.createFacility = async (req, res) => {
  try {
    const { name, type, hourlyRate, status } = req.body;

    // handle sports[] from multipart/form-data
    let sports = req.body.sports || req.body["sports[]"];
    if (!sports) sports = [];
    if (!Array.isArray(sports)) sports = [sports];

    if (!name || !type || !hourlyRate || sports.length === 0) {
      return res.status(400).json({
        message:
          "Name, type, hourly rate and at least one sport are required",
      });
    }

    const images =
      req.files?.map(
        (file) => `/uploads/facilities/${file.filename}`
      ) || [];

    const facility = await Facility.create({
      name,
      type,
      hourlyRate,
      status: status || "active",
      sports,
      images,
    });

    res.status(201).json(facility);
  } catch (err) {
    console.error("Create Facility Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   GET ALL FACILITIES
   GET /api/facilities
====================================================== */
exports.getFacilities = async (req, res) => {
  try {
    const facilities = await Facility.find().sort({ createdAt: -1 });
    res.json(facilities);
  } catch (err) {
    console.error("Get Facilities Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   GET SINGLE FACILITY
   GET /api/facilities/:id
====================================================== */
exports.getFacilityById = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) {
      return res.status(404).json({ message: "Facility not found" });
    }
    res.json(facility);
  } catch (err) {
    console.error("Get Facility Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   UPDATE FACILITY (ADMIN)
   PUT /api/facilities/:id
====================================================== */
exports.updateFacility = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) {
      return res.status(404).json({ message: "Facility not found" });
    }

    const { name, type, hourlyRate, status, existingImages } = req.body;

    let sports = req.body.sports || req.body["sports[]"];
    if (sports && !Array.isArray(sports)) sports = [sports];

    if (name !== undefined) facility.name = name;
    if (type !== undefined) facility.type = type;
    if (hourlyRate !== undefined) facility.hourlyRate = hourlyRate;
    if (status !== undefined) facility.status = status;

    if (sports !== undefined) {
      if (sports.length === 0) {
        return res.status(400).json({
          message: "At least one sport must be selected",
        });
      }
      facility.sports = sports;
    }

    /* ================= IMAGE HANDLING ================= */
    let keptImages = [];

    if (existingImages) {
      keptImages = JSON.parse(existingImages);

      facility.images.forEach((img) => {
        if (!keptImages.includes(img)) {
          const filePath = path.join(__dirname, "..", img);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      });
    } else {
      keptImages = facility.images;
    }

    const newImages =
      req.files?.map(
        (file) => `/uploads/facilities/${file.filename}`
      ) || [];

    facility.images = [...keptImages, ...newImages];

    await facility.save();
    res.json(facility);
  } catch (err) {
    console.error("Update Facility Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   DELETE FACILITY (ADMIN)
   DELETE /api/facilities/:id
====================================================== */
exports.deleteFacility = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) {
      return res.status(404).json({ message: "Facility not found" });
    }

    facility.images.forEach((img) => {
      const filePath = path.join(__dirname, "..", img);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    await facility.deleteOne();
    res.json({ message: "Facility deleted successfully" });
  } catch (err) {
    console.error("Delete Facility Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
