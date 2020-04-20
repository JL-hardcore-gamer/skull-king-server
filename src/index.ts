import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server } from 'colyseus';
import { monitor } from '@colyseus/monitor';
import bcrypt from 'bcrypt';
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

import { SkullKing } from './SkullKing';

const dbPath = path.resolve(__dirname, 'db/game.db');

let db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err: any) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the test.db database.');
});

if (false) {
  // Create users table
  // Need to setup correctly to write correctly a `setupDB.js`
  db.run(`
  CREATE TABLE users (
    email TEXT,
    nickname TEXT,
    hash TEXT
  );
`);
}

// db.run('INSERT INTO users(email, nickname, hash) VALUES(?, ?, ?)', ['test@gmail.com', 'toto','d1770f154ac0f9e0394498ad'])

const saltRounds = 10;

const port = Number(process.env.PORT || 2567);
const app = express();

app.use(cors());
app.use(express.json());

app.post('/login', (req, res) => {
  console.log('req.body', req.body.email);

  if (req.body.email) {
    // TODO Check if the email is already store in the db
    // Return the hash and the nickname

    res.send('OK');
  } else {
    res.sendStatus(400);
  }
});

app.post('/signup', (req, res: any) => {
  if (req.body && req.body.email && res.body.nickname) {
    // TODO Check if the email is already store in the db
    // Return an error
    db.run('INSERT INTO users(email, nickname, hash) VALUES(?, ?)', [
      'test@gmail.com',
      'toto',
      'd1770f154ac0f9e0394498ad',
    ]);
    // Else Create it, store it and return the hash and the nickname
    bcrypt.hash(req.body.email, saltRounds, (err: any, hash: string) => {
      // TODO Store hash in your password DB.
      console.log('hash', hash);
    });
    res.send('App is working');
  }
});

const server = http.createServer(app);
const gameServer = new Server({
  server,
});

// register your room handlers
gameServer.define('SkullKing', SkullKing);

/**
 * Register @colyseus/social routes
 *
 * - uncomment if you want to use default authentication (https://docs.colyseus.io/authentication/)
 * - also uncomment the import statement
 */
// app.use("/", socialRoutes);

// register colyseus monitor AFTER registering your room handlers
// app.use("/colyseus", monitor());

gameServer.listen(port);
console.log(`Listening on ws://localhost:${port}`);
