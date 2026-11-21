const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const Student = require("../models/Student");
const Cabin = require("../models/Cabin");
const Message = require("../models/Message");

const razorpay = process.env.RAZORPAY_KEY_ID
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

// Remove the +91 country code and spaces to get a 10-digit phone number.
const normalizePhone = (v) => String(v || "").replace(/\D/g, "").slice(-10);

const adminOnly = (req, res, next) => {
  try {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "No token" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") return res.status(403).json({ message: "Admin only" });
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

// GET ALL (Admin)
router.get("/", adminOnly, async (req, res) => {
  try {
    res.json(await Student.find().sort({ cabinNo: 1 }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE (Admin)
router.post("/", adminOnly, async (req, res) => {
  try {
    const { name, age, dateOfJoin, cabinNo, feeAmount, feeStatus, feeDueDate } = req.body;
    const phoneNo = normalizePhone(req.body.phoneNo);

    if (!/^\d{10}$/.test(phoneNo)) {
      return res.status(400).json({ message: "Phone must be 10 digits" });
    }
    if (await Student.findOne({ phoneNo })) {
      return res.status(400).json({ message: "Phone number already exists" });
    }
    if (await Student.findOne({ cabinNo: Number(cabinNo) })) {
      return res.status(400).json({ message: "Cabin already occupied" });
    }

    const password = await bcrypt.hash(phoneNo, 10);
    const student = await Student.create({
      name,
      age: Number(age),
      dateOfJoin,
      phoneNo,
      cabinNo: Number(cabinNo),
      feeAmount: Number(feeAmount) || 0,
      feeStatus: feeStatus || "pending",
      feeDueDate,
      isApproved: true,
      password,
    });

    await Cabin.findOneAndUpdate({ cabinNo: Number(cabinNo) }, { isOccupied: true });

    const safe = student.toObject();
    delete safe.password;
    res.status(201).json(safe);
  } catch (err) {
    console.error("Create student error:", err);
    res.status(500).json({ message: err.message || "Failed to add student" });
  }
});

// PROFILE
router.get("/me", async (req, res) => {
  try {
    const raw = String(req.query.phoneNo || "").trim();
    if (!raw) return res.status(400).json({ message: "Phone number required" });
    const digits = normalizePhone(raw);
    const student =
      (await Student.findOne({ phoneNo: raw })) ||
      (await Student.findOne({ phoneNo: digits })) ||
      (await Student.findOne({ phoneNo: "+91" + digits }));
    if (!student) return res.status(404).json({ message: "Student not found" });
    const { password, ...studentData } = student._doc;
    res.json(studentData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUBLIC BOOKING
router.post("/public-book", async (req, res) => {
  try {
    const { name, age, cabinNo, feeAmount } = req.body;
    const phoneNo = normalizePhone(req.body.phoneNo);

    if (!/^\d{10}$/.test(phoneNo)) {
      return res.status(400).json({ message: "Phone must be 10 digits" });
    }
    if (await Student.findOne({ cabinNo: Number(cabinNo) })) {
      return res.status(400).json({ message: "Cabin is already occupied" });
    }
    if (await Student.findOne({ phoneNo })) {
      return res.status(400).json({ message: "Phone number already exists" });
    }

    const hashedPassword = await bcrypt.hash(phoneNo, 10);
    await Student.create({
      name,
      age: Number(age),
      phoneNo,
      password: hashedPassword,
      cabinNo: Number(cabinNo),
      dateOfJoin: new Date().toISOString(),
      feeAmount: Number(feeAmount) || 1000,
      feeStatus: "pending",
      feeDueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
      isApproved: false,
    });
    res.status(201).json({ message: "Booking request sent to Admin!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Booking failed. Try again." });
  }
});

// REPORT ISSUE
router.post("/report-issue", async (req, res) => {
  try {
    const { studentName, cabinNo, message } = req.body;
    await Message.create({
      name: studentName,
      email: `Cabin ${cabinNo} Student`,
      message,
      type: "student",
      isRead: false,
    });
    res.status(201).json({ message: "Report sent to Admin successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send report." });
  }
});

// CREATE PAYMENT
router.post("/create-payment", async (req, res) => {
  try {
    if (!razorpay) return res.status(500).json({ message: "Razorpay keys not set" });
    const order = await razorpay.orders.create({
      amount: Number(req.body.amount) * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    });
    res.json(order);
  } catch (err) {
    console.error("Razorpay Error:", err);
    res.status(500).json({ message: "Payment failed" });
  }
});

// Verify the payment after a successful Razorpay transaction.
router.post("/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, studentId } = req.body;

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const next = new Date(student.feeDueDate || new Date());
    next.setMonth(next.getMonth() + 1);

    student.feeStatus = "pending"; 
    student.feeDueDate = next;
    student.lastPaidAt = new Date();
    await student.save();

    res.json({ message: "Payment verified", student });
  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ message: "Verification failed" });
  }
});

// APPROVE (Admin)
router.put("/approve/:id", adminOnly, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { returnDocument: "after" }
    );
    if (!student) return res.status(404).json({ message: "Student not found" });
    await Cabin.findOneAndUpdate({ cabinNo: student.cabinNo }, { isOccupied: true });
    res.json({ message: "Student approved successfully!", student });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to approve student" });
  }
});

// UPDATE (Admin)
router.put("/:id", adminOnly, async (req, res) => {
  try {
    const { name, age, dateOfJoin, feeAmount, feeStatus, feeDueDate, cabinNo, lastPaidAt } = req.body;
    const phoneNo = normalizePhone(req.body.phoneNo);

    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      {
        name,
        age: Number(age),
        dateOfJoin,
        phoneNo,
        feeAmount: Number(feeAmount),
        feeStatus,
        feeDueDate,
        cabinNo: Number(cabinNo),
        ...(lastPaidAt && { lastPaidAt }),
      },
      { returnDocument: "after" }
    );
    if (!updated) return res.status(404).json({ message: "Student not found" });
    res.json({ message: "Student updated successfully!", student: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update student" });
  }
});

// DELETE (Admin)
router.delete("/:id", adminOnly, async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    await Cabin.findOneAndUpdate({ cabinNo: student.cabinNo }, { isOccupied: false });
    res.json({ message: "Student deleted successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete student" });
  }
});

module.exports = router;