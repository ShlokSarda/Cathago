// backend/config/db.js

const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "database.sqlite");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error connecting to the database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

// Create tables if they don’t exist
const createTables = () => {
  db.serialize(() => {
    db.run(`
            CREATE TABLE IF NOT EXISTS User (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                credits INTEGER DEFAULT 20
            )
        `);

    db.run(`
            CREATE TABLE IF NOT EXISTS Admin (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'admin'
            )
        `);

    db.run(`
            CREATE TABLE IF NOT EXISTS Document (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER NOT NULL,
                filename TEXT NOT NULL,
                filePath TEXT NOT NULL,
                embedding TEXT, 
                FOREIGN KEY (userId) REFERENCES User(id)
            )
        `);

    db.run(`
            CREATE TABLE IF NOT EXISTS CreditRequest (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER NOT NULL,
                status TEXT DEFAULT 'pending',
                FOREIGN KEY (userId) REFERENCES User(id)
            )
        `);
  });
};

createTables();

module.exports = db;
