const Attendance = require("../models/Attendance");

exports.markAttendance = async (req, res) => {
  const data = await Attendance.create(req.body);
  res.json(data);
};

exports.getAttendance = async (req, res) => {
  const { studentId } = req.query;

  const records = await Attendance.find({ studentId });
  res.json(records);
};
