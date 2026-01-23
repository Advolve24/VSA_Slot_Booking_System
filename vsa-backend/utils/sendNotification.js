const Notification = require("../models/Notification");

exports.sendNotification = async (userId, title, message) => {
  return await Notification.create({
    userId,
    title,
    message,
  });
};
