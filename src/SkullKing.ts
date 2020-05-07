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
      console.log('message received:', message);
      console.log('client:', client.auth.nickname);
      console.log('client ID:', client.auth.ID);

      this.broadcast('GAME_STARTED', `${client.auth.nickname} start the game`);
      this.broadcast('TOP_MESSAGE', `Préparation de la partie`);

      this.dispatcher.dispatch(new OnStartCommand(), {});

      console.log("=== Scoreboard ===");
      prettyPrintObj(this.state.game.scoreboard);
      console.log("Score player 1:", this.state.game.scoreboard[1].totalScore);

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
      console.log('player array:', this.state.game.orderedPlayers);
      console.log('Current: ', this.state.currentTrick.currentPlayer);
      let currentRound = this.state.currentRound;
      this.dispatcher.dispatch(new OnCardReceivedCommand(), {
        playerId: client.auth.ID,
        cardId: message.value,
        bloodyMaryChoice: message.bloodyMaryChoice,
      });

      client.send('CARD_VALIDATED', { value: message.value });
      this.broadcast('TOP_MESSAGE', `${client.auth.nickname} a joué ${
        this.state.currentTrick.cardsPlayed[client.auth.ID].friendlyName
      }`);

      console.log(
        `${client.auth.nickname} a joué ${
          this.state.currentTrick.cardsPlayed[client.auth.ID].friendlyName
        }`
      );
      console.log('The suit is: ', this.state.currentTrick.suit);
      console.log('Current: ', this.state.currentTrick.currentPlayer);

      this.dispatcher.dispatch(new AfterCardPlayedCommand(), {
        playerId: client.auth.ID,
      });

      let winner = this.state.currentTrick.winner;
      console.log('Winner: ', winner);

      if (winner) {
        this.broadcast(
          'TRICK_WINNER',
          `${this.state.players[winner].name} remporte le pli avec ${this.state.currentTrick.cardsPlayed[winner].friendlyName} !`
        );
        // for tests
        this.broadcast(
          'TOP_MESSAGE',
          `${this.state.players[winner].name} remporte le pli avec ${this.state.currentTrick.cardsPlayed[winner].friendlyName} !`
        );

        this.clock.setTimeout(() => {
          this.dispatcher.dispatch(new OnEndOfTrickCommand(), {});
          if (this.state.currentRound === 10) {
            this.broadcast('GAME_OVER', 'Winner');
            console.log('--------Game over-------');

          } else if (currentRound !== this.state.currentRound) {
            // New Round !
            console.log('New Round !');
            this.clock.setTimeout(() => {
              const newRoundMaxBet = this.state.currentRound + 1;
              this.broadcast('START_BETTING', {
                maxBet: newRoundMaxBet,
                topMessage: `Pari entre 0 et ${newRoundMaxBet}`,
              });
            }, 3_000);
          } else {
            // next trick
            this.broadcast('NEXT_TRICK', 'Next Trick');
          }
        }, 1_000);
        console.log('Trick number: ', this.state.currentTrick.id);
      }

      console.log('currentRound', currentRound);
      console.log('this.state.currentRound', this.state.currentRound);

      console.log("=== Scoreboard ===");
      console.log("Score player 1:", this.state.game.scoreboard[1].totalScore);
      console.log("Score player 2:", this.state.game.scoreboard[2].totalScore);
      console.log("Player 1, 1st round, tricks bet: ", this.state.game.scoreboard[1].round0Bet);
      console.log("Player 1, 1st round, points: ", this.state.game.scoreboard[1].round0Score);
      console.log("Player 1, 2nd round, tricks bet: ", this.state.game.scoreboard[1].round1Bet);
      console.log("Player 1, 2nd round, points: ", this.state.game.scoreboard[1].round1Score);
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
    // For test
    // this.dispatcher.dispatch(new OnJoinCommand(), {
    //   id: 2,
    //   nickname: 'Tony',
    //   email: 'jl@test.com',
    // });

    // this.dispatcher.dispatch(new OnJoinCommand(), {
    //   id: 3,
    //   nickname: 'Test',
    //   email: 'test@test.com',
    // });
  }

  // When a client leaves the room
  onLeave(client: Client, consented: boolean) {}

  // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
  onDispose() {}
}
