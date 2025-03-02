const db = require("../config/db");
const cron = require("node-cron");

// Reset credits to 20 every day at midnight (00:00)
cron.schedule("0 0 * * *", () => {
  console.log("🔄 Running daily credit reset...");

  db.run(`UPDATE User SET credits = 20`, (err) => {
    if (err) {
      console.error("❌ Error resetting credits:", err.message);
    } else {
      console.log("✅ User credits reset to 20 successfully!");
    }
  });
});

console.log("✅ Cron job initialized: User credits reset every midnight.");
