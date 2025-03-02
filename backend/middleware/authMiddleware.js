// backend/middleware/authMiddleware.js

const jwt = require("jsonwebtoken");
const db = require("../config/db");

// Middleware to authenticate users
exports.authenticateUser = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied: No Token Provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(400).json({ message: "Invalid Token" });
  }
};

// Middleware to authorize admin access
exports.authorizeAdmin = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied: No Token Provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    const adminId = req.admin.adminId;
    db.get(`SELECT role FROM Admin WHERE id = ?`, [adminId], (err, user) => {
      if (err || !user) {
        return res.status(500).json({ message: "Error retrieving user data" });
      }

      if (user.role !== "admin") {
        return res.status(403).json({ message: "Access Denied: Admins Only" });
      }

      next();
    });
  } catch (error) {
    return res.status(400).json({ message: "Invalid Token" });
  }
  // if (!req.user || !req.user.userId) {
  //   return res.status(401).json({ message: "Unauthorized: No user data" });
  // }
};
