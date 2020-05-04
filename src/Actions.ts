import { State } from './State';
import { Player } from './Player';
import { Card } from './Card';
import { Schema, ArraySchema, MapSchema } from '@colyseus/schema';
import { Command } from '@colyseus/command';
import { Round } from './Round';
import { PlayerHand } from './PlayerHand';
import { shuffleArray, deck, prettyPrintObj, createDeck } from './utils';
import { Trick } from './Trick';
import { PlayerRoundScore } from './PlayerRoundScore';

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

    // Create a deck of index so it can easily be sorted
    let prevDeck = deck.map((_, idx) => idx);

    /**
     * Create 10 rounds
     */
    for (let roundId = 0; roundId < 10; ++roundId) {
      let newShuffledDeck = shuffleArray([...prevDeck]);
      let deckToDeal = [...newShuffledDeck];
      prevDeck = newShuffledDeck;

      let playersHand = new MapSchema<PlayerHand>();
      let playersScore = new MapSchema<PlayerRoundScore>();
      /**
       * TODO : Need to improve
       * /!\ Complex part of the code
       * Deal cards to all players
       */
      playersId.forEach((playerId) => {
        // Create a PlayerHand and PlayerRoundScore object otherwise
        // it's not possible have access to the player hand field.
        playersHand[playerId] = new PlayerHand();
        playersScore[playerId] = new PlayerRoundScore();
        let nbOfCardToDeal = roundId + 1;
        for (nbOfCardToDeal; nbOfCardToDeal > 0; --nbOfCardToDeal) {
          const cardIdx = deckToDeal.shift();
          // This is the only way to duplicate correctly a class object
          const newCard = deck[cardIdx].clone();
          playersHand[playerId].hand.push(newCard);
        }
      });

      let roundStartingPlayer = shuffledPlayersId[roundId];

      let newRound = new Round(
        roundId,
        // This should not be a int because an object key is always
        // a string anyway
        parseInt(roundStartingPlayer, 10),
        playersHand,
        playersScore
      );

      this.state.game.remainingRounds.push(newRound);

      let orderedPlayers = this.state.game.orderedPlayers;
      // /!\ I'm not sure  why this  is working, but it seems to work
      orderedPlayers.push(parseInt(roundStartingPlayer));

      // only keep one id for each player
      let numberOfPlayers = Object.keys(this.state.players).length;
      orderedPlayers.splice(numberOfPlayers);

      // /!\ TODO Must be created dynamically by the round
      this.state.currentTrick = new Trick(1, orderedPlayers[0]);
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
  State,
  { playerId: number; cardId: number }
> {
  removeCardFromPlayerHand(playerId: number, cardId: number) {
    console.log('removeCardFromPlayerHand is called !');
    // what it should be
    // const round = this.state.remainingRounds[currentRound];

    const round = this.state.game.remainingRounds[0];
    const hand = round.playersHand[playerId].hand;

    // let card: Card;
    // let i = 0;

    // Procedure way => JS way
    // And it's buggy because return stop the function, it should be break
    // for (; i < hand.length; i += 1) {
    //   console.log('boucle inf ?');
    //   card = hand[i];
    //   if (cardId === card.id) return;
    // }

    // It's also possible to do it with filter actually
    const cardToRemoveIdx = hand.findIndex((card: Card) => card.id === cardId);

    hand.splice(cardToRemoveIdx, 1);
  }

  addCardtoCardsPlayed(playerId: number, card: Card) {
    const cardsPlayed = this.state.currentTrick.cardsPlayed;
    cardsPlayed[playerId] = card;
  }

  defineTrickSuit(card: Card) {
    if (card.suit === 'special') {
      return;
    } else {
      this.state.currentTrick.suit = card.suit;
    }
  }

  // /!\ doesn't seem to change currentTrick.currentPlayer
  computeNextPlayer(playerId: number, playerOrder: number[]) {
    const id = playerOrder.indexOf(playerId);
    const newPlayerId = (id + 1) % playerOrder.length;
    let newPlayer = playerOrder[newPlayerId];
    this.state.currentTrick.currentPlayer = newPlayer;
  }

  trickHasEnded(playerOrder: number[]) {
    const cardsPlayed = this.state.currentTrick.cardsPlayed;
    const numberOfCardsPlayed = Object.keys(cardsPlayed).length;
    return playerOrder.length === numberOfCardsPlayed;
  }

  computeWinner(
    suit: string,
    cardsPlayed: MapSchema<Card>,
    playerOrder: number[]
  ) {
    const cards = Object.values(cardsPlayed);
    const characters = cards.map((card) => card.character);
    const suits = cards.map((card) => card.suit);
    let winner: number;

    const findFirstCard = function (character: string) {
      let card: Card;
      let playerID: number;

      for (let i = 0, length = playerOrder.length; i < length; i += 1) {
        playerID = playerOrder[i];
        card = cardsPlayed[playerID];
        if (card.character === character) return playerID;
      }

      return -1;
    };

    const findHighestCard = (givenSuit: string) => {
      let winner = -1;
      let highestValue = 0;
      let card: Card;
      let cardValue: number;

      for (let playerID in cardsPlayed) {
        card = cardsPlayed[playerID];
        cardValue = Number(card.character);
        if (card.suit === givenSuit && cardValue > highestValue) {
          winner = Number(playerID);
          highestValue = cardValue;
        }
      }

      return winner;
    };

    if (characters.includes('Skull King')) {
      if (characters.includes('Mermaid')) {
        winner = findFirstCard('Mermaid');
      } else {
        winner = findFirstCard('Skull King');
      }
    } else if (characters.includes('Pirate')) {
      winner = findFirstCard('Pirate');
    } else if (characters.includes('Mermaid')) {
      winner = findFirstCard('Mermaid');
    } else if (suits.includes('black')) {
      winner = findHighestCard('black');
    } else {
      winner = findHighestCard(suit);
    }

    this.state.currentTrick.winner = winner;
  }

  /*
    Who wins the trick? 
    1/ if the Skull King is played:
      - check if there's also a Mermaid:
      -- if it is, the 1st mermaid played is the winner
      -- else, the SK is the winner
    
    2/ if a Pirate is played, the 1st pirate played is the winner

    3/ if a Mermaid is played, the 1st mermaid played is the winner

    4/ if a black card is played, the highest black card is the winner

    5/ else, the highest card with the trick suit is the winner

    /!\ TODO: beware of the Bloody Mary. Her versatility is not handled here!
  */

  execute(obj: any) {
    console.log('===== EXECUTE ===== ');
    const deck = createDeck();
    const card = deck[obj.cardId - 1]; // because cards ID start at 1 rather than 0
    const trick = this.state.currentTrick;
    const playerId = obj.playerId;
    const playerOrder = this.state.game.orderedPlayers;
    let suit = trick.suit;

    console.log('JUST BEFORE REMOVED');
    this.removeCardFromPlayerHand(playerId, obj.cardId);
    this.addCardtoCardsPlayed(playerId, card);
    if (!suit) this.defineTrickSuit(card);
    if (this.trickHasEnded(playerOrder)) {
      this.computeWinner(suit, trick.cardsPlayed, playerOrder);
    } else {
      this.computeNextPlayer(playerId, playerOrder);
    }
  }
}
