const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const dbPath = path.resolve(__dirname, "db/hey.db");

let db = new sqlite3.Database(dbPath);

db.run(`
  CREATE TABLE users (
    email TEXT,
    hash TEXT
  );
`);
