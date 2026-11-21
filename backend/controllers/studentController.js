const bcrypt = require("bcryptjs");
const Student = require("../models/Student");

exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ cabinNo: 1 });
    res.json(students);
  } catch (err) {
    console.error("getStudents:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const { phoneNo, cabinNo } = req.body;

    if (!/^\d{10}$/.test(String(phoneNo))) {
      return res.status(400).json({ message: "Phone must be 10 digits" });
    }
    if (await Student.findOne({ phoneNo })) {
      return res.status(400).json({ message: "Phone number already exists" });
    }
    if (await Student.findOne({ cabinNo })) {
      return res.status(400).json({ message: "Cabin already occupied" });
    }

    const password = await bcrypt.hash(String(phoneNo), 10);
    const student = await Student.create({ ...req.body, password });

    const safe = student.toObject();
    delete safe.password;
    res.status(201).json(safe);
  } catch (err) {
    console.error("createStudent:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const body = { ...req.body };
    delete body.password;

    const student = await Student.findByIdAndUpdate(req.params.id, body, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    console.error("updateStudent:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json({ message: "Student deleted" });
  } catch (err) {
    console.error("deleteStudent:", err);
    res.status(500).json({ message: "Server error" });
  }
};