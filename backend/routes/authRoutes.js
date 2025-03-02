// backend/routes/authRoutes.js

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// User Registration
router.post("/register", authController.register);

// User Login
router.post("/login", authController.login);

// Get User Profile
router.get(
  "/profile",
  authMiddleware.authenticateUser,
  authController.getProfile
);

module.exports = router;
