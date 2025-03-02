const db = require("../config/db");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const natural = require("natural");

// Multer Setup for File Uploads
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

const upload = multer({ storage }).single("document");

// Function to Compute TF-IDF Vector
const computeTFIDF = (documents) => {
  const tfidf = new natural.TfIdf();
  documents.forEach((doc) => tfidf.addDocument(doc));
  return tfidf;
};

// Function to Compute Cosine Similarity
const cosineSimilarity = (vec1, vec2) => {
  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));

  return magnitude1 && magnitude2 ? dotProduct / (magnitude1 * magnitude2) : 0;
};

// Upload and Match Document
// Upload and Match Document
exports.uploadAndMatchDocument = async (req, res) => {
  upload(req, res, async (err) => {
    if (err)
      return res.status(400).json({ message: "File upload error", error: err });

    const userId = req.user?.userId;
    const filePath = req.file.path;
    const filename = req.file.originalname;
    const fileContent = fs.readFileSync(filePath, "utf8");

    // Store document in the database
    db.run(
      "INSERT INTO Document (userId, filename, filePath, embedding) VALUES (?, ?, ?, ?)",
      [userId, filename, filePath, fileContent],
      function (err) {
        if (err) {
          console.error("Database Error:", err.message);
          fs.unlinkSync(filePath);
          return res
            .status(500)
            .json({ message: "Error saving document", error: err.message });
        }

        // Update user credit by reducing it by 1
        db.run(
          "UPDATE User SET credits = credits - 1 WHERE id = ? AND credits > 0",
          [userId],
          function (updateErr) {
            if (updateErr) {
              console.error("Error updating credit:", updateErr.message);
              return res.status(500).json({
                message: "Error updating credit",
                error: updateErr.message,
              });
            }

            // Fetch all stored documents
            db.all(
              "SELECT id, filename, embedding FROM Document",
              (err, documents) => {
                if (err) {
                  console.error("Error fetching documents:", err.message);
                  return res.status(500).json({
                    message: "Error fetching documents",
                    error: err.message,
                  });
                }

                console.log("Documents fetched from DB:", documents);

                if (!documents || documents.length === 0) {
                  return res
                    .status(400)
                    .json({ message: "No documents found for comparison" });
                }

                // Ensure each document has valid content
                const validDocuments = documents.filter(
                  (doc) => doc.embedding && doc.embedding.trim() !== ""
                );
                if (validDocuments.length === 0) {
                  return res
                    .status(400)
                    .json({ message: "All documents are empty" });
                }

                // Compute TF-IDF
                const corpus = validDocuments.map((doc) => doc.embedding);
                const tfidf = computeTFIDF(corpus);

                // Compute TF-IDF vector for uploaded document
                const uploadedVector = [];
                tfidf.tfidfs(fileContent, (i, measure) =>
                  uploadedVector.push(measure)
                );

                // Compute similarity with each stored document
                let bestMatch = { doc: null, similarity: -1 };

                validDocuments.forEach((doc, index) => {
                  const storedVector = [];
                  tfidf.tfidfs(doc.embedding, (i, measure) =>
                    storedVector.push(measure)
                  );

                  const similarity = cosineSimilarity(
                    uploadedVector,
                    storedVector
                  );
                  if (similarity > bestMatch.similarity) {
                    bestMatch = { doc, similarity };
                  }
                });

                // Return the most similar document
                return res.status(200).json({
                  message: "File uploaded successfully",
                  uploadedFile: filename,
                  bestMatch: bestMatch.doc
                    ? {
                        filename: bestMatch.doc.filename,
                        similarity: bestMatch.similarity,
                      }
                    : null,
                });
              }
            );
          }
        );
      }
    );
  });
};
