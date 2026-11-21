const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

//  GET all messages (to display them in the admin dashboard)
router.get("/", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

//  POST a guest message (from the Contact page)
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    await Message.create({
      name,
      email,
      message,
      type: "guest", 
      isRead: false,
    });

    res.status(201).json({ message: "Message sent successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send message." });
  }
});

module.exports = router;