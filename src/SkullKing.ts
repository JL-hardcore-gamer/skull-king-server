import { Room, Client } from 'colyseus';
import { State } from './State';
import { Card } from './Card';
import { Player } from './Player';

const db = require('./db/database');

const getRandom = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

export class SkullKing extends Room<State> {
  constructor() {
    super();

    this.maxClients = 6;
  }

  // When room is initialized
  onCreate(options: any) {
    console.log('created!', options);
    this.setState(new State());

    // Useful to display the owner of the room
    if (options.nickname) {
      this.state.roomOwner = options.nickname;
    }
  }

  async onAuth(client: any, options: any) {
    if (options.nickname && options.token) {
      this.state.roomOwner = options.nickname;
      return new Promise((resolve, reject) => {
        db.get(
          `SELECT * FROM users WHERE nickname = ? AND token = ?`,
          [options.nickname, options.token],
          (e: any, row: any) => {
            if (e || !row) {
              reject('Authentication error');
            } else {
              resolve(row);
            }
          }
        );
      });
    }
  }

  // When client successfully join the room
  onJoin(client: Client, options: any, user: any) {
    // User is for the data retrieve by onAuth
    console.log('joined', user);

    this.state.players[user.nickname] = new Player(
      getRandom(0, 1000),
      user.nickname,
      user.email
    );

    const cards = ['SkullKing', 'Pirate', 'Red1', 'Red2'];
    // Play with an array
    cards.forEach((cardName) => {
      const newRound = new Card(cardName);
      this.state.rounds.push(newRound);
    });
  }

  // When a client sends a message
  onMessage(client: Client, message: any) {
    console.log('message received:', message);
  }

  // When a client leaves the room
  onLeave(client: Client, consented: boolean) {}

  // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
  onDispose() {}
}
