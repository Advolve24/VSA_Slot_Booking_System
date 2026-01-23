const Activity = require("../models/Activity");

exports.logActivity = async (userId, type, description) => {
  await Activity.create({
    userId,
    type,
    description,
  });
};
