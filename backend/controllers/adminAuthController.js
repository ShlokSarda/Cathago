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
  const query = `INSERT INTO Admin (username, password) VALUES (?, ?)`;
  db.run(query, [username, hashedPassword], function (err) {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error registering admin", error: err.message });
    }
    res
      .status(201)
      .json({ message: "Admin registered successfully", adminId: this.lastID });
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

  const query = `SELECT * FROM Admin WHERE username = ?`;
  db.get(query, [username], (err, admin) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error fetching admin", error: err.message });
    }
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = bcrypt.compareSync(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { adminId: admin.id, username: admin.username },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.json({ message: "Login successful", token });
  });
};

// Get User Profile
exports.getProfile = (req, res) => {
  const adminId = req.admin.adminId;
  console.log(adminId);
  const query = `SELECT id, username FROM Admin WHERE id = ?`;
  db.get(query, [adminId], (err, admin) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error fetching profile", error: err.message });
    }
    if (!admin) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ profile: admin });
  });
};
