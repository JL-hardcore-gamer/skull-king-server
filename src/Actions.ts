import { State } from './State';
import { Player } from './Player';
import { Card } from './Card';
import { Schema, ArraySchema, MapSchema } from '@colyseus/schema';
import { Command } from '@colyseus/command';
import { Round } from './Round';
import { PlayerHand } from './PlayerHand';
import { shuffleArray, deck, prettyPrintObj, createDeck } from './utils';
import { Trick } from './Trick';

export class OnJoinCommand extends Command<
  State,
  { id: number; nickname: string; email: string }
> {
  execute(obj: any) {
    this.state.players[obj.id] = new Player(obj.id, obj.nickname, obj.email);
  }
}

export class OnStartCommand extends Command<State, {}> {
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
    const initialDeck = deck;

    let playersId: string[] = Object.keys(this.state.players).map(
      (playerId: string) => {
        return playerId;
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
     * Since we have at least 2 players we could just
     * duplicate the array 5 times to be know the
     * starting player for every round (2 * 5= 10)
     * (we need only the first 10 one)
     */
    shuffledPlayersId = [
      ...shuffledPlayersId,
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
        parseInt(roundStartingPlayer, 10),
        playersHand
      );

      this.state.game.remainingRounds.push(newRound);

      // /!\ TODO Must be created dynamically by the round
      this.state.currentTrick = new Trick(1, 1);
    }

    if (this.state.game.remainingRounds.length > 0) {
      this.state.currentRound = this.state.game.remainingRounds[0].id;
    }
  }

  execute(obj: any) {
    this.prepareRounds();
  }
}

export class OnCardReceivedCommand extends Command<
  State, { playerId:number, cardId:number }
> 
{
  removeCardFromPlayerHand(playerId:number, cardId:number) {
    // what it should be
    // const round = this.state.remainingRounds[currentRound];

    const round = this.state.game.remainingRounds[0];
    const hand = round.playersHand[playerId].hand;
    let card:Card;
    let i = 0

    for (; i < hand.length; i += 1) {
      card = hand[i];      
      if (cardId === card.id) return;
    }

    hand.splice(i, 1);
  };

  addCardtoCardsPlayed(playerId:number, card:Card) {
    const cardsPlayed = this.state.currentTrick.cardsPlayed; 
    cardsPlayed[playerId] = card;
  }

  defineTrickSuit(card:Card) {
    if (card.suit === "special") { 
      return 
    } else {
      this.state.currentTrick.suit = card.suit
    };
  }

  // /!\ doesn't seem to change currentTrick.currentPlayer
  computeNextPlayer(playerId:number, playerOrder:number[]) {
    const id = playerOrder.indexOf(playerId);
    const newPlayerId = (id + 1) % playerOrder.length;
    let newPlayer = playerOrder[newPlayerId];
    this.state.currentTrick.currentPlayer = newPlayer;
  }

  trickHasEnded(playerOrder:number[]) {
    const cardsPlayed = this.state.currentTrick.cardsPlayed;
    const numberOfCardsPlayed = Object.keys(cardsPlayed).length;
    return playerOrder.length === numberOfCardsPlayed;
  }

  execute(obj: any) {
    const deck = createDeck();
    const card = deck[obj.cardId - 1]; // because cards ID start at 1 rather than 0
    const trick = this.state.currentTrick;
    const playerId = obj.playerId;
    const playerOrder = this.state.game.orderedPlayers;
    let suit = trick.suit;

    this.removeCardFromPlayerHand(playerId, obj.cardId);
    this.addCardtoCardsPlayed(playerId, card);
    if (!suit) this.defineTrickSuit(card);
    this.computeNextPlayer(playerId, playerOrder);
    if (this.trickHasEnded(playerOrder)) {
      // compute trick winner
    } else {
      // go to next trick
    }
  }
}