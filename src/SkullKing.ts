import { Room, Client } from 'colyseus';
import { State } from './State';
import { Dispatcher } from '@colyseus/command';
import { prettyPrintObj } from './utils';
import {
  OnJoinCommand,
  OnStartCommand,
  OnCardReceivedCommand,
  AfterCardPlayedCommand,
  OnEndOfTrickCommand,
  OnEndOfGameCommand,
} from './Actions';
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
    this.clock.start();

    // Useful to display the owner of the room
    if (options.nickname) {
      this.state.roomOwner = options.nickname;
    }

    // All the logic will be here
    this.onMessage('START_GAME', (client, message) => {
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
        const playerIds = Object.keys(
          this.state.game.remainingRounds[this.state.currentRound].playersScore
        );

        const playersBet = playerIds.map((playedId) => {
          this.state.game.remainingRounds[this.state.currentRound];
          return {
            playerId: playedId,
            bet: this.state.game.remainingRounds[this.state.currentRound]
              .playersScore[playedId].tricksBet,
          };
        });

        this.broadcast('START_ROUND', {
          currentPlayer: this.state.game.remainingRounds[
            this.state.currentRound
          ].startingPlayer,
          playersBet: playersBet,
        });
      }
    });

    this.onMessage('PLAY_CARD', (client, message) => {
      let currentRound = this.state.currentRound;
      this.dispatcher.dispatch(new OnCardReceivedCommand(), {
        playerId: client.auth.ID,
        cardId: message.value,
        bloodyMaryChoice: message.bloodyMaryChoice,
      });

      client.send('CARD_VALIDATED', { value: message.value });
      this.broadcast(
        'TOP_MESSAGE',
        `${client.auth.nickname} a joué ${
          this.state.currentTrick.cardsPlayed[client.auth.ID].friendlyName
        }`
      );

      this.dispatcher.dispatch(new AfterCardPlayedCommand(), {
        playerId: client.auth.ID,
      });

      let winner = this.state.currentTrick.winner;

      if (winner) {
        this.broadcast('TRICK_WINNER', {
          value: this.state.players[winner].id,
        });
        // for tests
        this.broadcast(
          'TOP_MESSAGE',
          `${this.state.players[winner].name} remporte le pli avec ${this.state.currentTrick.cardsPlayed[winner].friendlyName} !`
        );

        this.clock.setTimeout(() => {
          this.dispatcher.dispatch(new OnEndOfTrickCommand(), {});
          if (this.state.currentRound === 10) {
            this.dispatcher.dispatch(new OnEndOfGameCommand(), {});
            this.broadcast('GAME_OVER', { winners: this.state.game.winners });
            console.log('--------Game over-------');
            console.log('Winners:', this.state.game.winners);
          } else if (currentRound !== this.state.currentRound) {
            // New Round !
            console.log('New Round !');
            this.clock.setTimeout(() => {
              const newRoundMaxBet = this.state.currentRound + 1;

              const playerIds = Object.keys(
                this.state.game.remainingRounds[this.state.currentRound].playersScore
              );

              const scores = playerIds.map((playerId) => {
                return {
                  playerId: playerId,
                  score: this.state.game.scoreboard[playerId].totalScore,
                }
              });

              prettyPrintObj(scores);

              this.broadcast('START_BETTING', {
                maxBet: newRoundMaxBet,
                topMessage: `Pari entre 0 et ${newRoundMaxBet}`,
                scores: scores,
              });
            }, 3_000);
          } else {
            // next trick
            this.broadcast('NEXT_TRICK', 'Next Trick');
          }
        }, 1_000);
      }
    });

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
  }

  // When a client leaves the room
  onLeave(client: Client, consented: boolean) {}

  // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
  onDispose() {}
}
