const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
    dateOfJoin: { type: Date, required: true },
    phoneNo: { type: String, required: true, unique: true, trim: true },
    cabinNo: { type: Number, required: true },
    feeAmount: { type: Number, default: 0 },
    feeStatus: { type: String, enum: ["pending", "paid"], default: "pending" },
    feeDueDate: { type: Date },
    lastPaidAt: { type: Date },
    password: { type: String, select: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);