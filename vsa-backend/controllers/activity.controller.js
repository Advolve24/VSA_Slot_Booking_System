const Activity = require("../models/Activity");
const Booking = require("../models/Booking");
const Enrollment = require("../models/Enrollment");


// -----------------------------------------
// PLAYER / PARENT → Their own activity
// -----------------------------------------
exports.getMyActivity = async (req, res) => {
  try {
    const userId = req.user.id;

    const logs = await Activity.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Unable to load activity", err });
  }
};



// -----------------------------------------
// ADMIN → All system activity
// -----------------------------------------
exports.getAllActivity = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied – admins only" });
    }

    const logs = await Activity.find()
      .populate("user", "fullName role")
      .sort({ createdAt: -1 })
      .limit(30);

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Unable to fetch admin activity", err });
  }
};
