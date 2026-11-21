const mongoose = require("mongoose");
require("dotenv").config();
const Admin = require("./models/Admin");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected ✅");

    // Delete the existing admin.
    await Admin.deleteMany({});
    console.log("Old admins deleted 🗑️");

    // Create a new admin (password hashing is handled by the model).
 await Admin.create({
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
});
    console.log("Admin created successfully! 🎉");

    process.exit();
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

createAdmin();