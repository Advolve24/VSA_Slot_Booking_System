const User = require("../models/User");

exports.updateProfile = async (req, res) => {
  const updated = await User.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
  });
  res.json(updated);
};

exports.getAllUsers = async (_, res) => {
  res.json(await User.find().populate("children"));
};
