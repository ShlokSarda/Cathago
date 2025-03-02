const express = require("express");
const router = express.Router();
const scanController = require("../controllers/scanController");
const authMiddleware = require("../middleware/authMiddleware");
const matchController = require("../controllers/matchController");
// Upload document for scanning (deducts 1 credit)
router.post(
  "/upload",
  authMiddleware.authenticateUser,
  matchController.uploadAndMatchDocument
);

// router.post(
//   "/match",
//   authMiddleware.authenticateUser,
//   matchController.matchDocument
// );

// Get previous Scans
router.get(
  "/previous-scans",
  authMiddleware.authenticateUser,
  scanController.getLastScans
);

module.exports = router;
