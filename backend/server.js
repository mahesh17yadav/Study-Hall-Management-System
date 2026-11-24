require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const routesDir = path.join(__dirname, "routes");
console.log("ROUTES FOLDER FILES:", fs.readdirSync(routesDir));

// Required routes: import them directly. If an error occurs, the server crashes and displays it in red in the terminal.
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/cabins", require("./routes/cabinRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
console.log("✅ auth, students, cabins mounted");

// Optional routes: Load them only if the files exist.
["payments:paymentRoutes", "whatsapp:whatsappRoutes"].forEach((item) => {
  const [url, file] = item.split(":");
  if (fs.existsSync(path.join(routesDir, file + ".js"))) {
    app.use("/api/" + url, require("./routes/" + file));
    console.log("✅ Mounted /api/" + url);
  }
});

app.get("/", (req, res) => res.send("StudyHall API running"));
// Health Check API
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "StudyHall API running",
    database: mongoose.connection.readyState === 1
      ? "Connected"
      : "Disconnected"
  });
});
// 404 middleware

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

mongoose
  .connect(process.env.MONGO_URI || process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.error("MongoDB error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));