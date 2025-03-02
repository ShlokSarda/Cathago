// backend/controllers/adminController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const SECRET_KEY =
  "a9b8c7d6e5f4g3h2i1j0klmnopqrstuvwxyzABCDEFGHIJKLMNO0123456789PQRSTUVWXYZ";

// Approve or reject credit requests
exports.handleCreditRequest = (req, res) => {
  const { requestId, approve, userId } = req.body;

  if (approve) {
    // Approve request and add 20 credits to user
    db.run(
      'UPDATE CreditRequest SET status = "approved" WHERE id = ?',
      [requestId],
      (err) => {
        if (err) return res.status(500).json({ message: "Database error" });

        // Add 20 credits to the user
        db.run(
          "UPDATE User SET credits = credits + 20 WHERE id = ?",
          [userId],
          (creditErr) => {
            if (creditErr)
              return res.status(500).json({ message: "Error adding credits" });
            return res
              .status(200)
              .json({ message: "Credit request approved, 20 credits added" });
          }
        );
      }
    );
  } else {
    // Reject request
    db.run(
      'UPDATE CreditRequest SET status = "rejected" WHERE id = ?',
      [requestId],
      (err) => {
        if (err) return res.status(500).json({ message: "Database error" });
        return res.status(200).json({ message: "Credit request rejected" });
      }
    );
  }
};

// Manually adjust user credits
exports.updateUserCredits = (req, res) => {
  const { userId } = req.body;
  db.run(
    "UPDATE User SET credits = credits + 20 WHERE id = ?",
    [userId],
    (err) => {
      if (err) return res.status(500).json({ message: "Database error" });
      return res
        .status(200)
        .json({ message: "User credits updated successfully" });
    }
  );
};

//Get credit requests
exports.getPendingCreditRequests = (req, res) => {
  const query = `
    SELECT CreditRequest.id, userId, User.username, CreditRequest.status 
    FROM CreditRequest 
    JOIN User ON CreditRequest.userId = User.id
    WHERE CreditRequest.status = 'pending'
  `;

  db.all(query, [], (err, requests) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }
    return res.status(200).json({ pendingCreditRequests: requests });
  });
};

// Get admin analytics
exports.getAnalytics = (req, res) => {
  // Get total scans (count of all documents)
  db.get(
    `SELECT COUNT(*) AS totalScans FROM Document`,
    [],
    (err, totalScans) => {
      if (err) return res.status(500).json({ message: "Database error" });

      // Get the top user by scans with username
      db.get(
        `SELECT User.username, COUNT(Document.id) AS totalScans 
       FROM Document 
       JOIN User ON Document.userId = User.id 
       GROUP BY Document.userId 
       ORDER BY totalScans DESC 
       LIMIT 1`,
        [],
        (err, topUser) => {
          if (err) return res.status(500).json({ message: "Database error" });

          // Get credit usage per user with username
          db.all(
            `SELECT User.username, COUNT(Document.filename) AS totalCreditsUsed 
           FROM Document 
           JOIN User ON Document.userId = User.id 
           GROUP BY Document.userId`,
            [],
            (err, creditUsage) => {
              if (err)
                return res.status(500).json({ message: "Database error" });

              return res.status(200).json({
                totalScans: totalScans.totalScans || 0,
                topUser: topUser || { username: null, totalScans: 0 },
                creditUsage,
              });
            }
          );
        }
      );
    }
  );
};
