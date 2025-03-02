// backend/controllers/creditController.js

const db = require("../config/db");

// Request Additional Credits
exports.requestCredits = (req, res) => {
  const userId = req.user.userId;

  const query = `INSERT INTO CreditRequest (userId, status) VALUES (?, 'pending')`;
  db.run(query, [userId], function (err) {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error requesting credits", error: err.message });
    }
    res.status(201).json({ message: "Credit request submitted successfully" });
  });
};

// Admin Approves Credit Request
exports.approveCreditRequest = (req, res) => {
  const { requestId } = req.body;

  db.get(
    `SELECT userId FROM CreditRequest WHERE id = ? AND status = 'pending'`,
    [requestId],
    (err, request) => {
      if (err || !request) {
        return res
          .status(400)
          .json({ message: "Invalid or already processed request" });
      }

      db.run(
        `UPDATE User SET credits = credits + 20 WHERE id = ?`,
        [request.user_id],
        (err) => {
          if (err) {
            return res.status(500).json({
              message: "Error updating user credits",
              error: err.message,
            });
          }

          db.run(
            `UPDATE CreditRequest SET status = 'approved' WHERE id = ?`,
            [requestId],
            (err) => {
              if (err) {
                return res.status(500).json({
                  message: "Error updating credit request status",
                  error: err.message,
                });
              }
              res.json({ message: "Credits approved successfully" });
            }
          );
        }
      );
    }
  );
};

// Admin Denies Credit Request
exports.denyCreditRequest = (req, res) => {
  const { requestId } = req.body;

  db.run(
    `UPDATE CreditRequest SET status = 'denied' WHERE id = ?`,
    [requestId],
    function (err) {
      if (err) {
        return res.status(500).json({
          message: "Error updating credit request status",
          error: err.message,
        });
      }
      res.json({ message: "Credit request denied successfully" });
    }
  );
};
