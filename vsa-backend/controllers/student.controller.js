const Student = require("../models/Student");

exports.addStudent = async (req, res) => {
  const student = await Student.create({
    ...req.body,
    parentId: req.user.id,
  });

  res.json(student);
};

exports.getMyChildren = async (req, res) => {
  const children = await Student.find({ parentId: req.user.id });
  res.json(children);
};
