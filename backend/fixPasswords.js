require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Student = require("./models/Student");

(async () => {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  const students = await Student.find().select("+password");
  for (const s of students) {
    await Student.updateOne(
      { _id: s._id },
      { password: await bcrypt.hash(String(s.phoneNo), 10) }
    );
    console.log("Password set:", s.name, s.phoneNo);
  }
  console.log("Done");
  process.exit();
})();