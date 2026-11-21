const mongoose = require("mongoose");

const cabinSchema = new mongoose.Schema({
  cabinNo: { type: Number, required: true, unique: true },
  isOccupied: { type: Boolean, default: false },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    default: null,
  },
});

module.exports = mongoose.model("Cabin", cabinSchema);