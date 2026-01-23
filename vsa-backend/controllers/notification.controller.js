const Notification = require("../models/Notification");

exports.getMyNotifications = async (req, res) => {
  const list = await Notification.find({ userId: req.user.id });
  res.json(list);
};

exports.markAllRead = async (req, res) => {
  await Notification.updateMany(
    { userId: req.user.id },
    { $set: { read: true } }
  );

  res.json({ message: "All marked as read" });
};
