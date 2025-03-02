const express = require("express");
const router = express.Router();
const creditController = require("../controllers/creditController");
const authMiddleware = require("../middleware/authMiddleware");

// Request additional credits
router.post(
  "/request",
  authMiddleware.authenticateUser,
  creditController.requestCredits
);

// Get user's credit balance
// router.get(
//   "/balance",
//   authMiddleware.authenticateUser,
//   creditController.getCreditBalance
// );

module.exports = router;
