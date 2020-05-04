import { Room, Client } from 'colyseus';
import { State } from './State';
import { Card } from './Card';
import { Dispatcher } from '@colyseus/command';
import { prettyPrintObj } from './utils';
import {
  OnJoinCommand,
  OnStartCommand,
  OnCardReceivedCommand,
} from './Actions';
import { Player } from './Player';
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
      console.log('player array:', this.state.game.orderedPlayers);

      this.dispatcher.dispatch(new OnStartCommand(), {});
    });

    this.onMessage('START_GAME', (client, message) => {
      console.log('message received:', message);
      console.log('client:', client.auth.nickname);
      console.log('client ID:', client.auth.ID);

      this.broadcast('GAME_STARTED', `${client.auth.nickname} start the game`);
      this.broadcast('TOP_MESSAGE', `Préparation de la partie`);

      this.dispatcher.dispatch(new OnStartCommand(), {});

      // Need to add a delay otherwise we do not have time to see the first message
      this.broadcast('START_BETTING', {
        maxBet: 1,
        topMessage: 'Pari entre 0 et 1',
      });
    });

    this.onMessage('BET', (client, message) => {
      const playersCount = Object.keys(this.state.players).length;
      const player = this.state.players[client.auth.ID];

      // Change player's bet in Round -> Score
      if (player) {
        this.state.game.remainingRounds[this.state.currentRound].playersScore[
          player.id
        ].tricksBet = message.value;
      } else {
        // Error
      }

      // Increase Round nb of bet

      this.state.game.remainingRounds[
        this.state.currentRound
      ].numberOfBets += 1;

      if (
        this.state.game.remainingRounds[this.state.currentRound]
          .numberOfBets === playersCount
      ) {
        this.broadcast('START_ROUND', {
          currentPlayer: this.state.game.remainingRounds[
            this.state.currentRound
          ].startingPlayer,
        });
      }
    });

    this.onMessage('PLAY_CARD', (client, message) => {
      // - check that card is from currentPlayer
      // - remove card from player's hand
      // - add card to Trick cardPlayed
      // (with key player Id)
      // - check if suit is undefined & define suit of Trick
      // - update current player
      // - check if trick is over?
      // -- if it is, compute winner
      // -- & go to next trick

      console.log('player array:', this.state.game.orderedPlayers);
      console.log('Current: ', this.state.currentTrick.currentPlayer);

      this.dispatcher.dispatch(new OnCardReceivedCommand(), {
        playerId: client.auth.ID,
        cardId: message.value,
      });

      console.log(message.value);
      console.log(
        `${client.auth.nickname} a joué ${
          this.state.currentTrick.cardsPlayed[client.auth.ID].friendlyName
        }`
      );
      console.log('The suit is: ', this.state.currentTrick.suit);
      console.log('Current: ', this.state.currentTrick.currentPlayer);
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
    // // For test
    // this.dispatcher.dispatch(new OnJoinCommand(), {
    //   id: 2,
    //   nickname: 'Tony',
    //   email: 'jl@test.com',
    // });

    // this.dispatcher.dispatch(new OnJoinCommand(), {
    //   id: 3,
    //   nickname: 'Test',
    //   email: 'test@test.com	',
    // });
  }

  // When a client leaves the room
  onLeave(client: Client, consented: boolean) {}

  // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
  onDispose() {}
}
