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
  console.log('Connected to the game.db database.');
});

if (false) {
  // Create users table
  // Need to setup correctly to write correctly a `setupDB.js`
  db.run(`
  CREATE TABLE users (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
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

app.post('/api/signin', (req, res) => {
  const { body } = req;
  if (body.email) {
    db.get(
      `SELECT * FROM users WHERE email = ?`,
      [body.email],
      (e: any, row: any) => {
        if (e) {
          res.sendStatus(400);
        } else {
          if (row) {
            res.send({
              hash: row.hash,
              nickname: row.nickname,
            });
          } else {
            res.status(400).send('User not found');
          }
        }
      }
    );
  } else {
    res.sendStatus(400);
  }
});

app.post('/api/signup', (req, res: any) => {
  const { body } = req;
  if (body && body.email && body.nickname) {
    bcrypt.hash(body.email, saltRounds, (err: any, hash: string) => {
      db.run(
        'INSERT INTO users(email, nickname, hash) VALUES(?, ?, ?)',
        [body.email, body.nickname, hash],
        (e: any) => {
          if (e) {
            res.status(400).send('Cannot create user');
          } else {
            res.send({
              hash: hash,
              nickname: req.body.nickname,
            });
          }
        }
      );
    });
  } else {
    // Bad Request
    res.sendStatus(400);
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
