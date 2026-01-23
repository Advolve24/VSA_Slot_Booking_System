const TimeSlot = require("../models/TimeSlot");
const generateSlots = require("../utils/generateSlots");

exports.generateSlotsForDate = async (req, res) => {
  const { facilityId, sport, date } = req.body;

  const slots = generateSlots();

  const data = await TimeSlot.create({
    facilityId,
    sport,
    date,
    slots,
  });

  res.json(data);
};

exports.getSlots = async (req, res) => {
  const { facilityId, date } = req.query;

  const data = await TimeSlot.findOne({ facilityId, date });

  res.json(data);
};
