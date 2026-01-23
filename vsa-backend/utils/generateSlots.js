module.exports = function generateSlots() {
  const slots = [];
  const startHour = 6;
  const endHour = 22;

  for (let hour = startHour; hour < endHour; hour++) {
    const start = `${hour}:00`;
    const end = `${hour + 1}:00`;

    slots.push({
      time: `${start} - ${end}`,
      status: "available",
    });
  }

  return slots;
};
