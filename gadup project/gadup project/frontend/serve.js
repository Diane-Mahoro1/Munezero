const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MySQL Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "gapup_db",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to MySQL database");
});

// JWT Secret Key
const JWT_SECRET = "your_secret_key";

// Register User
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);
  const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
  db.query(sql, [name, email, hashedPassword], (err, result) => {
    if (err) throw err;
    res.status(201).send({ message: "User registered successfully", userId: result.insertId });
  });
});

// Login User
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, result) => {
    if (err) throw err;
    if (result.length === 0) return res.status(404).send({ message: "User not found" });

    const user = result[0];
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).send({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });
    res.send({ message: "Login successful", token });
  });
});

// Get User Profile
app.get("/profile/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM users WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) throw err;
    res.send(result[0]);
  });
});

// Post a GapUp (Tweet)
app.post("/gapups", (req, res) => {
  const { userId, content } = req.body;
  const sql = "INSERT INTO gapups (user_id, content) VALUES (?, ?)";
  db.query(sql, [userId, content], (err, result) => {
    if (err) throw err;
    res.status(201).send({ message: "GapUp posted successfully", gapUpId: result.insertId });
  });
});

// Get all GapUps (Feed)
app.get("/gapups", (req, res) => {
  const sql = "SELECT gapups.*, users.name FROM gapups JOIN users ON gapups.user_id = users.id ORDER BY gapups.created_at DESC";
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

// Follow a user
app.post("/follow", (req, res) => {
  const { followerId, followedId } = req.body;
  const sql = "INSERT INTO follows (follower_id, followed_id) VALUES (?, ?)";
  db.query(sql, [followerId, followedId], (err, result) => {
    if (err) throw err;
    res.send({ message: "Followed successfully" });
  });
});

// Get followers
app.get("/followers/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM follows WHERE followed_id = ?";
  db.query(sql, [id], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
