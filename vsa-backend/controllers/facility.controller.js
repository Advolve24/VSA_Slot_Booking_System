const Facility = require("../models/Facility");
const fs = require("fs");
const path = require("path");

/* ======================================================
   CREATE FACILITY (ADMIN)
   POST /api/facilities
====================================================== */
exports.createFacility = async (req, res) => {
  try {
    const { name, type, capacity, hourlyRate, status } = req.body;

    if (!name || !type || !capacity || !hourlyRate) {
      return res.status(400).json({
        message: "Name, type, capacity and hourly rate are required",
      });
    }

    const images =
      req.files?.map((file) => `/uploads/facilities/${file.filename}`) || [];

    const facility = await Facility.create({
      name,
      type,
      capacity,
      hourlyRate,
      status: status || "active",
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

    const {
      name,
      type,
      capacity,
      hourlyRate,
      status,
      existingImages,
    } = req.body;

    facility.name = name ?? facility.name;
    facility.type = type ?? facility.type;
    facility.capacity = capacity ?? facility.capacity;
    facility.hourlyRate = hourlyRate ?? facility.hourlyRate;

    /**
     * ADMIN STATUS ONLY
     * active | maintenance | disabled
     */
    if (status) {
      facility.status = status;
    }

    /* ================= IMAGE REMOVAL ================= */
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

    /* ================= ADD NEW IMAGES ================= */
    const newImages =
      req.files?.map((file) => `/uploads/facilities/${file.filename}`) || [];

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
