import { Room, Client } from 'colyseus';
import { State } from './State';
import { Dispatcher } from '@colyseus/command';
import { OnJoinCommand, OnStartCommand } from './Actions';
const db = require('./db/database');

export class SkullKing extends Room<State> {
  dispatcher = new Dispatcher(this);

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

    // All the logic will be here

    /**
     * Useful for testing purpose
     */
    this.onMessage('TEST', (client, message) => {
      console.log('message received:', message);
      console.log('client:', client.auth.nickname);
      console.log('client ID:', client.auth.ID);
      // console.log('player array:', this.state.game.orderedPlayers);

      const prettyPrint = (obj: any) => {
        const allKeys = Object.keys(obj);

        allKeys.forEach((key) => {
          console.log(`Key ${key}:`, obj[key]);
        });
      };

      // prettyPrint(this.state.game.orderedPlayers);

      // prettyPrint(this.state.players);
      // After setup the game the front-end can subscribe to
      // [state.game.remainingRounds[0].playersHand['MonPote'].hand
      // And display it

      // console.log(
      //   'MonPote hand first card friendlyName',
      //   this.state.game.remainingRounds[0].playersHand['MonPote'].hand[0]
      //     .friendlyName
      // );
    });

    this.onMessage('START_GAME', (client, message) => {
      console.log('message received:', message);
      console.log('client:', client.auth.nickname);
      console.log('client ID:', client.auth.ID);
      //
      // Triggers when `GAME_STATE` message is sent.
      //

      // should I enforce that client id = room owner?

      // this.state.game.start(this.state.players);

      this.dispatcher.dispatch(new OnStartCommand(), {
        players: this.state.players
      });

      console.log('players: ', this.state.game.orderedPlayers);

      this.broadcast('GAME_STATE', 'an action has been taken!');
    });

    /**
     * /!\ Some part of the documentation is wrong for example `onMessage`.
     * In the documentation they said you need to have a `type` but in
     * the implementation the `type` is missing
     * cf: https://docs.colyseus.io/server/room/#onmessage-type-callback
     */
    this.onMessage('*', (client: Client, message: any) => {
      //
      // Triggers when any other type of message is sent,
      // excluding "action", which has its own specific handler defined above.
      //

      console.log(client.sessionId, 'sent', message);
    });

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

    this.dispatcher.dispatch(new OnJoinCommand(), {
      id: user.ID,
      nickname: user.nickname,
      email: user.email,
    });
  }

  // When a client leaves the room
  onLeave(client: Client, consented: boolean) {}

  // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
  onDispose() {}
}
