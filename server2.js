// server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Fake in-memory database
let users = [
  { id: 1, name: "Vishal", points: 50 },
  { id: 2, name: "Ankit", points: 30 }
];

// ✅ API Routes
app.get("/", (req, res) => {
  res.send("Eco Reward Backend Running 🚀");
});

// Get all users (for leaderboard)
app.get("/users", (req, res) => {
  res.json(users);
});

// Add points to a user
app.post("/add-points", (req, res) => {
  const { id, points } = req.body;
  const user = users.find(u => u.id === id);
  if (user) {
    user.points += points;
    res.json({ success: true, user });
  } else {
    res.status(404).json({ success: false, message: "User not found" });
  }
});

// Start server
app.listen(5000, () => {
  console.log("✅ Backend running at http://localhost:5000");
});
