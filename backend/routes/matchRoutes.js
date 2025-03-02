const express = require("express");
const {
  uploadDocument,
  matchDocument,
} = require("../controllers/matchController");

const router = express.Router();

router.post("/upload", uploadDocument); // Upload and store document embeddings
router.post("/match", matchDocument); // Match uploaded document against stored embeddings

module.exports = router;
