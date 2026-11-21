const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const Student = require("../models/Student");

exports.login = async (req, res) => {
  try {
    const { email, phoneNo, phone, identifier, password } = req.body;

    const id = String(email || phoneNo || phone || identifier || "").trim();
    if (!id || !password) {
      return res.status(400).json({ message: "Please provide email/phone and password" });
    }

    // ---------- ADMIN ----------
    if (id.includes("@")) {
      const admin = await Admin.findOne({ email: id.toLowerCase() });
      if (!admin) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const token = jwt.sign(
        { id: admin._id, role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      return res.json({ token, user: { email: admin.email, role: "admin" } });
    }

    // ---------- STUDENT (Accepts either +91 or 10-digit phone numbers) ----------
    const digits = id.replace(/\D/g, "").slice(-10);
    const student =
      (await Student.findOne({ phoneNo: digits }).select("+password")) ||
      (await Student.findOne({ phoneNo: id }).select("+password")) ||
      (await Student.findOne({ phoneNo: "+91" + digits }).select("+password"));

    if (!student) {
      return res.status(401).json({ message: "Student not found. Admin tho add cheyinchandi." });
    }
    if (!student.password) {
      return res.status(401).json({ message: "Password not set. Admin ki cheppandi." });
    }

    // Password also accepts both +91 and 10-digit phone numbers.
    const pwDigits = String(password).replace(/\D/g, "").slice(-10);
    const isMatch =
      (await bcrypt.compare(String(password), student.password)) ||
      (pwDigits.length === 10 && (await bcrypt.compare(pwDigits, student.password)));

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid phone number or password" });
    }

    const token = jwt.sign(
      { id: student._id, role: "student", phoneNo: student.phoneNo },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    return res.json({
      token,
      user: { name: student.name, role: "student", phoneNo: student.phoneNo },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};