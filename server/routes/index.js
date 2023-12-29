const express = require("express");
const router = express.Router();

router.post("/join-room", (req, res) => {
  const { room } = req.body;
  res.json({ success: true, message: `Joined room: ${room}` });
});

module.exports = router;
