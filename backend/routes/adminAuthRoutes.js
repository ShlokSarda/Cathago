// backend/routes/authRoutes.js

const express = require("express");
const router = express.Router();
const adminAuthController = require("../controllers/adminAuthController");
const authMiddleware = require("../middleware/authMiddleware");

// User Registration
router.post("/register", adminAuthController.register);

// User Login
router.post("/login", adminAuthController.login);

// Get User Profile
router.get(
  "/profile",
  authMiddleware.authorizeAdmin,
  adminAuthController.getProfile
);

module.exports = router;
