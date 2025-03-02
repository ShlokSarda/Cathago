const path = require("path");
const fs = require("fs");
const multer = require("multer");
const db = require("../config/db"); // Assuming you have a database connection

// Multer setup for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`);
  },
});

const upload = multer({ storage }).single("document"); // 'document' should match frontend input name

exports.uploadDocument = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error("❌ Error uploading file:", err);
      return res
        .status(500)
        .json({ message: "File upload failed", error: err.message });
    }

    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filename = req.file.filename;
    const filePath = req.file.path;

    // Store document in the database
    const query = `INSERT INTO Document (userId, filename, filePath) VALUES (?, ?, ?)`;
    db.run(query, [userId, filename, filePath], function (err) {
      if (err) {
        console.error("❌ Error saving document:", err);
        return res
          .status(500)
          .json({ message: "Error saving document", error: err.message });
      }

      // Deduct one credit
      db.run(
        `UPDATE User SET credits = credits - 1 WHERE id = ? AND credits > 0`,
        [userId],
        (err) => {
          if (err) {
            console.error("❌ Error deducting credits:", err);
            return res
              .status(500)
              .json({ message: "Error deducting credits", error: err.message });
          }

          console.log("✅ Document uploaded successfully. ID:", this.lastID);
          res.status(201).json({
            message: "Document uploaded successfully",
            documentId: this.lastID,
            filename: filename,
          });
        }
      );
    });
  });
};

exports.getLastScans = (req, res) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const query = `SELECT id, filename, filePath FROM Document WHERE userId = ?`;
  db.all(query, [userId], (err, rows) => {
    if (err) {
      console.error("❌ Error fetching last scans:", err);
      return res
        .status(500)
        .json({ message: "Error fetching last scans", error: err.message });
    }

    res.status(200).json({ lastScans: rows });
  });
};
