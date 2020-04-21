import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server } from 'colyseus';
import { monitor } from '@colyseus/monitor';
import bcrypt from 'bcrypt';

import { SkullKing } from './SkullKing';

const db = require('./db/database');

if (false) {
  // Create users table
  // Need to setup correctly to write correctly a `setupDB.js`
  db.run(`
    CREATE TABLE users (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      nickname TEXT UNIQUE,
      token TEXT UNIQUE
    );
  `);
}

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
              token: row.token,
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
    // FIXME Need to check if email and nickname are correct
    const regexName = new RegExp(/^[a-z0-9]+$/, 'gi');
    const regexEmail = new RegExp(/^[\w-.]+@([\w-]+\.)+[\w-]+$/, "gi");

    if (regexName.test(body.nickname) && regexEmail.test(body.email)) {
      // shouldn't we force the conversion of body.email to lowercase?
      // body.email = body.email.toLowerCase();

      bcrypt.hash(body.email, saltRounds, (err: any, hash: string) => {
        db.run(
          'INSERT INTO users(email, nickname, token) VALUES(?, ?, ?)',
          [body.email, body.nickname, hash],
          (e: any) => {
            if (e) {
              res.status(400).send('Cannot create user');
            } else {
              res.send({
                token: hash,
                nickname: req.body.nickname,
              });
            }
          }
        );
      });
    }
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
