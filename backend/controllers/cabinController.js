const Student = require("../models/Student");

// ---------- ADMIN DASHBOARD (With all cabins and student details) ----------

exports.getCabins = async (req, res) => {
  try {
    const students = await Student.find();
    const cabins = [];

    for (let i = 1; i <= 22; i++) {
      const student = students.find((s) => s.cabinNo === i);
      cabins.push({
        cabinNo: i,
        isOccupied: !!student,
        student: student || null,
      });
    }

    res.json(cabins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Public route: returns only available (empty) cabins, no login required
exports.getPublicCabins = async (req, res) => {
  try {
    const students = await Student.find();
    const cabins = [];

    for (let i = 1; i <= 22; i++) {
      const student = students.find((s) => s.cabinNo === i);
      cabins.push({
        cabinNo: i,
        isOccupied: !!student,
      });
    }

    res.json(cabins);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};