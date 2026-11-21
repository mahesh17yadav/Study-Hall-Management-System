const express = require("express");
const router = express.Router();

// Importing the 'login' function from the controller.
const { login } = require("../controllers/authController");
// Handle POST requests to the /api/auth/login endpoint.
router.post("/login", login);

// Export the router so it can be mounted using app.use() in server.js.
module.exports = router;