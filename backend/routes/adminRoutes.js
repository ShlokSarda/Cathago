// backend/routes/adminRoutes.js

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");

// Middleware to check admin role
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admins only." });
  }
};

// Admin Analytics Route
router.get(
  "/analytics",
  authMiddleware.authorizeAdmin,
  adminController.getAnalytics
);

// Admin get credit requests
router.get(
  "/credit-requests",
  authMiddleware.authorizeAdmin,
  adminController.getPendingCreditRequests
);

// Approve or Deny Credit Requests
router.post(
  "/credits/approve",
  authMiddleware.authorizeAdmin,
  adminController.handleCreditRequest
);
router.post(
  "/credits/deny",
  authMiddleware.authenticateUser,
  adminController.handleCreditRequest
);

module.exports = router;
