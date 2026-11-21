const express = require("express");
const router = express.Router();
const Student = require("../models/Student"); 
const { getCabins } = require("../controllers/cabinController");

// 1. PUBLIC ROUTE: View the status of all cabins
router.get("/public", async (req, res) => {
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
    console.error("Error fetching public cabins:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 2. PUBLIC STATS ROUTE: For displaying counts on the home page
router.get("/public-stats", async (req, res) => {
  try {
    const students = await Student.find();
    const totalCabins = 22;
    const occupiedCabins = students.length;
    const availableCabins = totalCabins - occupiedCabins;

    res.json({ totalCabins, occupiedCabins, availableCabins });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// 3. ADMIN ROUTE: For the admin dashboard
router.get("/", getCabins);

module.exports = router;