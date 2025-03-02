// backend/controllers/authController.js

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const SECRET_KEY =
  "a9b8c7d6e5f4g3h2i1j0klmnopqrstuvwxyzABCDEFGHIJKLMNO0123456789PQRSTUVWXYZ";

// User Registration
exports.register = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  const query = `INSERT INTO User (username, password, credits) VALUES (?, ?, 20)`;
  db.run(query, [username, hashedPassword], function (err) {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error registering user", error: err.message });
    }
    res
      .status(201)
      .json({ message: "User registered successfully", userId: this.lastID });
  });
};

// User Login
exports.login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  const query = `SELECT * FROM User WHERE username = ?`;
  db.get(query, [username], (err, user) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error fetching user", error: err.message });
    }
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.json({ message: "Login successful", token });
  });
};

// Get User Profile
exports.getProfile = (req, res) => {
  const userId = req.user.userId;
  console.log(userId);
  const query = `SELECT id, username, credits FROM User WHERE id = ?`;
  db.get(query, [userId], (err, user) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error fetching profile", error: err.message });
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ profile: user });
  });
};
