import { Room, Client } from 'colyseus';
import { State } from './State';
import { Player } from './Player';
import { Card } from './Card';
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
    console.log(`${options.nickname} create a room !`);
    this.setState(new State());

    // Useful to display the owner of the room
    if (options.nickname) {
      this.state.roomOwner = options.nickname;
    }

    // To be removed once START_GAME is in effect
    // this.state.game.start();
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
    console.log(`${user.nickname} joined the room !`);

    this.state.players[user.nickname] = new Player(
      getRandom(0, 1000),
      user.nickname,
      user.email
    );
  }

  // When a client sends a message
  onMessage(client: Client, message: any) {
    console.log('message received:', message);
    console.log('client:', client.auth.nickname);
    console.log('client ID:', client.auth.ID);

    if (message.type === 'START_GAME') {
      // should I enforce that client id = room owner?

      this.state.game.start();

      // After setup the game the front-end can subscribe to
      // state.game.remainingRounds[0].playersHand['MonPote'].hand
      // And display it

      console.log(
        'MonPote hand first card friendlyName',
        this.state.game.remainingRounds[0].playersHand['MonPote'].hand[0]
          .friendlyName
      );

      // tests
      // console.log('game players', this.state.game.players);
      // console.log('players', this.state.players);
      // this.state.sortPlayers();
    }
  }

  // When a client leaves the room
  onLeave(client: Client, consented: boolean) {}

  // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
  onDispose() {}
}
