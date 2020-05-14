const db = require('../src/db/database');

db.run(`
  CREATE TABLE users (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    nickname TEXT UNIQUE,
    token TEXT UNIQUE
  );
`);
