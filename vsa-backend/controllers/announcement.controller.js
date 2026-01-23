const Announcement = require("../models/Announcement");

exports.getAnnouncements = async (_, res) => {
  res.json(await Announcement.find().sort({ createdAt: -1 }));
};

exports.createAnnouncement = async (req, res) => {
  const data = await Announcement.create(req.body);
  res.json(data);
};
