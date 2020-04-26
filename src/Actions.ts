import { State } from './State';
import { Player } from './Player';
import { Card } from './Card';
import { Schema, ArraySchema, MapSchema } from '@colyseus/schema';
import { Command } from '@colyseus/command';
import { Round } from './Round';
import { PlayerHand } from './PlayerHand';
import { shuffleArray, prettyPrintObj } from './utils';

export class OnJoinCommand extends Command<
  State,
  { id: number; nickname: string; email: string }
> {
  execute(obj: any) {
    this.state.players[obj.id] = new Player(obj.id, obj.nickname, obj.email);
  }
}

export class OnStartCommand extends Command<State, {}> {
  // startGame() {
  // this.createDeck();
  // this.shuffleDeck();
  // this.shufflePlayers(this.state.players);
  // this.setupRounds();
  // this.dealCards(1);
  // }

  /**
   * The purpose of this function is to create all the Round
   * A Round is :
   * - id: number;
   * - startingPlayer: number;
   * - firstPlayer: number;
   * - deckCards = new ArraySchema<Card>(); // useless
   * - remainingTricks: number; // TODO Check if this is the right place
   * - playersScore = new MapSchema<PlayerRoundScore>(); // Auto
   * - playersHand = new MapSchema<PlayerHand>(); // To fill with deal function
   *
   * The most difficult part is to generate playersHand.
   *
   *
   */
  prepareRounds() {
    const initialDeck = this.state.game.deck;

    let playersId: string[] = Object.keys(this.state.players).map(
      (playedId: string) => {
        return playedId;
      }
    );
    /**
     * We want to get the first player for each round
     * so let's first shuffle the players
     */
    let shuffledPlayersId = shuffleArray(playersId);
    /**
     * We have something like this : [2,5,3,1,4]
     * But we actually want something like this :
     * [2,5,3,1,4, 2,5,3,1,4, 2,5,3,1,4, 2,5]
     *
     * TODO Neet to improve :
     * Very lazy way to get the first starting player.
     * Since we have at least 3 players we could just
     * duplicate the array 4 time to be know the
     * starting player for every round (3 * 4 = 12)
     * (we need only the first 10 one)
     */
    shuffledPlayersId = [
      ...shuffledPlayersId,
      ...shuffledPlayersId,
      ...shuffledPlayersId,
      ...shuffledPlayersId,
    ];
    /**
     * Create 10 rounds
     */
    let prevDeck: Card[] = initialDeck;

    for (let roundId = 0; roundId < 10; ++roundId) {
      let newShuffledDeck = shuffleArray(prevDeck);
      prevDeck = newShuffledDeck;

      let playersHand = new MapSchema<PlayerHand>();
      /**
       * TODO : Need to improve
       * /!\ Complex part of the code
       * Deal cards to all players
       */
      playersId.forEach((playerId) => {
        // Create a PlayerHand object otherwise
        // it's not possible have access to the player hand field.
        playersHand[playerId] = new PlayerHand();
        let nbOfCardToDeal = roundId + 1;
        for (nbOfCardToDeal; nbOfCardToDeal > 0; --nbOfCardToDeal) {
          playersHand[playerId].hand.push(newShuffledDeck.shift());
        }
      });

      let roundStartingPlayer = shuffledPlayersId[roundId];

      let newRound = new Round(
        roundId,
        // This should not be a int because an object key is always
        // a string anyway
        parseInt(roundStartingPlayer),
        playersHand
      );

      this.state.game.remainingRounds.push(newRound);
    }
  }

  /**
   * Maybe we should extract this to utils.ts
   */
  createDeck() {
    const suits = ['red', 'blue', 'yellow', 'black'];
    const numericValues = [
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '12',
      '13',
    ];
    const specialValues: Record<string, number> = {
      'Skull King': 1,
      Mermaid: 2,
      Pirate: 5,
      'White Flag': 5,
      'Bloody Mary': 1,
    };

    let id = 1;

    suits.forEach((suit) => {
      numericValues.forEach((num) => {
        this.state.game.deck.push(new Card(id, suit, num));
        id += 1;
      });
    });

    for (const character in specialValues) {
      for (let num = specialValues[character]; num > 0; num -= 1) {
        this.state.game.deck.push(new Card(id, 'special', character));
        id += 1;
      }
    }
  }

  // shuffleDeck() {
  //   function shuffle(a: Array<Card>) {
  //     for (let i = a.length - 1; i > 0; i--) {
  //       const j = Math.floor(Math.random() * (i + 1));
  //       [a[i], a[j]] = [a[j], a[i]];
  //     }
  //     return a;
  //   }
  //   shuffle(this.state.game.deck);
  // }

  // shufflePlayers(players: MapSchema<Player>) {
  //   function shuffle(a: Array<Number>) {
  //     for (let i = a.length - 1; i > 0; i--) {
  //       const j = Math.floor(Math.random() * (i + 1));
  //       [a[i], a[j]] = [a[j], a[i]];
  //     }
  //     return a;
  //   }

  //   Object.keys(players).forEach((id) => {
  //     this.state.game.orderedPlayers.push(Number(id));
  //   });

  //   shuffle(this.state.game.orderedPlayers);
  // }

  // setupRounds() {
  //   let roundID: number = 1;
  //   const orderedPlayers: ArraySchema<number> = this.state.game.orderedPlayers;
  //   let i: number;
  //   let round: Round;

  //   for (roundID; roundID <= 10; roundID += 1) {
  //     i = (roundID - 1) % orderedPlayers.length;
  //     // round = new Round(roundID, orderedPlayers[i], orderedPlayers);
  //     console.log('====== prettyPrintObj round ==== ');
  //     prettyPrintObj(round);
  //     this.state.game.remainingRounds.push(round);
  //   }
  // }

  // dealCards(numberOfCards: number) {
  //   let deck: Array<Card> = this.state.game.deck.slice();
  //   let players: Array<number> = this.state.game.orderedPlayers;
  //   const round: Round = this.state.game.remainingRounds[0]; // à changer pour currentRound

  //   for (numberOfCards; numberOfCards > 0; numberOfCards -= 1) {
  //     players.forEach((id) => {
  //       round.playersHand[id].hand.push(deck.shift());
  //     });
  //   }
  // }

  execute(obj: any) {
    /**
     * This can be done before actually
     */
    this.createDeck();
    this.prepareRounds();
  }
}
