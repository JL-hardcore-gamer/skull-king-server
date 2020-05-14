import { State } from './State';
import { Player } from './Player';
import { Card } from './Card';
import { MapSchema, ArraySchema } from '@colyseus/schema';
import { Command } from '@colyseus/command';
import { Round } from './Round';
import { PlayerHand } from './PlayerHand';
import { shuffleArray, deck, prettyPrintObj, createDeck } from './utils';
import { Trick } from './Trick';
import { PlayerRoundScore } from './PlayerRoundScore';
import { PlayerGameScore } from './PlayerGameScore';

const findHighestCardOwner = (
  givenSuit: string,
  cardsPlayed: MapSchema<Card>
) => {
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

const computeTrickPlayerOrder = (
  round: Round,
  absolutePlayerOrder: ArraySchema<number>
) => {
  const firstTrickPlayer = round.firstPlayer || round.startingPlayer;
  const length = absolutePlayerOrder.length;
  const startIdx = absolutePlayerOrder.findIndex(
    (playerId) => playerId === firstTrickPlayer
  );
  let result: number[] = [];

  // add the players after (and including) the starting trick player
  for (let i = startIdx; i < length; i += 1) {
    result.push(absolutePlayerOrder[i]);
  }

  // add the players before the starting trick player
  for (let j = 0; j < startIdx; j += 1) {
    result.push(absolutePlayerOrder[j]);
  }

  return result;
};

const findFirstCardOwner = function (
  trickPlayerOrder: number[],
  cardsPlayed: MapSchema<Card>,
  ...characters: string[]
) {
  let card: Card;

  return trickPlayerOrder.reduce((firstCardOwner, playerId) => {
    if (firstCardOwner === -1) {
      card = cardsPlayed[playerId];
      return characters.includes(card.character) ? playerId : firstCardOwner;
    }
    return firstCardOwner;
  }, -1);
};

// input: [suit, cardsPlayed, trickPlayerOrder, bloodyMaryChoice]
function computeWinner(params: any) {
  const {
    suit,
    cardsPlayed,
    trickPlayerOrder,
    bloodyMaryChoice,
  }: {
    suit: string;
    cardsPlayed: MapSchema<Card>;
    trickPlayerOrder: number[];
    bloodyMaryChoice: string;
  } = params;

  const cards = Object.values(cardsPlayed);
  const characters = cards.map((card) => card.character);
  const suits = cards.map((card) => card.suit);
  let winner: number;
  let skullKingCaptured = 0;
  let piratesCaptured = 0;

  if (characters.includes('Skull King')) {
    if (characters.includes('Mermaid')) {
      winner = findFirstCardOwner(trickPlayerOrder, cardsPlayed, 'Mermaid');
      skullKingCaptured += 1;
    } else {
      winner = findFirstCardOwner(trickPlayerOrder, cardsPlayed, 'Skull King');

      if (bloodyMaryChoice) piratesCaptured += 1;

      piratesCaptured += cards.reduce((nbOfPirates, card) => {
        return card.character === 'Pirate' ? nbOfPirates + 1 : nbOfPirates;
      }, 0);
    }
  } else if (
    characters.includes('Bloody Mary') &&
    bloodyMaryChoice === 'pirate'
  ) {
    winner = findFirstCardOwner(
      trickPlayerOrder,
      cardsPlayed,
      'Pirate',
      'Bloody Mary'
    );
  } else if (characters.includes('Pirate')) {
    winner = findFirstCardOwner(trickPlayerOrder, cardsPlayed, 'Pirate');
  } else if (characters.includes('Mermaid')) {
    winner = findFirstCardOwner(trickPlayerOrder, cardsPlayed, 'Mermaid');
  } else if (suits.includes('black')) {
    winner = findHighestCardOwner('black', cardsPlayed);
  } else if (suits.includes(suit)) {
    winner = findHighestCardOwner(suit, cardsPlayed);
  } else if (
    characters.includes('Bloody Mary') &&
    bloodyMaryChoice === 'escape'
  ) {
    winner = findFirstCardOwner(
      trickPlayerOrder,
      cardsPlayed,
      'White Flag',
      'Bloody Mary'
    );
  } else if (characters.every((character) => character === 'White Flag')) {
    winner = findFirstCardOwner(trickPlayerOrder, cardsPlayed, 'White Flag');
  } else {
    console.log('=== Error ===');
    console.log('computeWinner() failed');
    console.log('Characters', characters);
    console.log('Suit:', suit);
  }

  return { winner, skullKingCaptured, piratesCaptured };
}

/*
  Who wins the trick? 
  1/ if the Skull King is played:
    - check if there's also a Mermaid:
    -- if it is, the 1st mermaid played is the winner
    -- else, the SK is the winner

  2/ if the Bloody Mary is played as a pirate, the first card that is a pirate or a bloody Mary wins
  
  3/ if a Pirate is played, the 1st pirate played is the winner

  4/ if a Mermaid is played, the 1st mermaid played is the winner

  5/ if a black card is played, the highest black card is the winner

  6/ if the suits played include the trick suit, the highest card with the trick suit is the winner (translation: avoids a situation where all cards are flags)

  7/ if the Bloody Mary is played as a White flag, the first card that  is a bloody Mary or a White flag wins

  8/ else, first player is the winner (translation: all cards played are flags)
*/

export {
  findFirstCardOwner,
  findHighestCardOwner,
  computeTrickPlayerOrder,
  computeWinner,
};

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
      orderedPlayers.push(parseInt(roundStartingPlayer));
    }

    // only keep one id for each player
    let orderedPlayers = this.state.game.orderedPlayers;
    let numberOfPlayers = Object.keys(this.state.players).length;
    orderedPlayers.splice(numberOfPlayers);

    // /!\ TODO Must be created dynamically by the round
    this.state.currentTrick = new Trick(1, orderedPlayers[0]);

    if (this.state.game.remainingRounds.length > 0) {
      this.state.currentRound = this.state.game.remainingRounds[0].id;
    }
  }

  prepareScoreboard() {
    let playersId: string[] = Object.keys(this.state.players).map(
      (playerId: string) => {
        return playerId;
      }
    );
    let scoreboard = this.state.game.scoreboard;

    playersId.forEach((playerId) => {
      scoreboard[playerId] = new PlayerGameScore();
    });
  }

  execute(obj: any) {
    this.prepareRounds();
    this.prepareScoreboard();
  }
}

export class OnCardReceivedCommand extends Command<
  State,
  { playerId: number; cardId: number; bloodyMaryChoice: string }
> {
  removeCardFromPlayerHand(round: Round, playerId: number, cardId: number) {
    const hand = round.playersHand[playerId].hand;
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

  execute(obj: any) {
    const deck = createDeck();
    const card = deck[obj.cardId];
    const trick = this.state.currentTrick;
    const playerId = obj.playerId;
    const round = this.state.game.remainingRounds[this.state.currentRound];
    let suit = trick.suit;

    if (card.friendlyName === 'la Bloody Mary') {
      trick.bloodyMary = obj.bloodyMaryChoice;
      console.log(`========= ROUND ${this.state.currentRound} ========`);
      console.log('============================');
      console.log('==== Change Bloody Mary ====', obj.bloodyMaryChoice);
      console.log('============================');
    }

    this.removeCardFromPlayerHand(round, playerId, obj.cardId);
    this.addCardtoCardsPlayed(playerId, card);
    if (!suit) this.defineTrickSuit(card);
  }
}

export class AfterCardPlayedCommand extends Command<
  State,
  { playerId: number }
> {
  trickHasEnded() {
    const playerOrder = this.state.game.orderedPlayers;
    const cardsPlayed = this.state.currentTrick.cardsPlayed;
    const numberOfCardsPlayed = Object.keys(cardsPlayed).length;
    return playerOrder.length === numberOfCardsPlayed;
  }

  computeNextPlayer(playerId: number) {
    const playerOrder = this.state.game.orderedPlayers;
    const id = playerOrder.indexOf(playerId);
    const newPlayerId = (id + 1) % playerOrder.length;
    let newPlayer = playerOrder[newPlayerId];
    this.state.currentTrick.currentPlayer = newPlayer;
  }

  updateScores(round: Round, result: any) {
    const winner = result.winner;

    this.state.currentTrick.winner = winner;
    round.playersScore[winner].skullKingCaptured += result.skullKingCaptured;
    round.playersScore[winner].piratesCaptured += result.piratesCaptured;
    round.playersScore[winner].tricksWon += 1;
  }

  execute(obj: any) {
    const trick = this.state.currentTrick;
    const suit = trick.suit;
    const cardsPlayed = trick.cardsPlayed;
    const bloodyMaryChoice = trick.bloodyMary;
    const round = this.state.game.remainingRounds[this.state.currentRound];
    const absolutePlayerOrder = this.state.game.orderedPlayers;
    const trickPlayerOrder = computeTrickPlayerOrder(
      round,
      absolutePlayerOrder
    );

    if (this.trickHasEnded()) {
      const result = computeWinner({
        suit,
        cardsPlayed,
        trickPlayerOrder,
        bloodyMaryChoice,
      });
      this.updateScores(round, result);
    } else {
      this.computeNextPlayer(obj.playerId);
    }
  }
}

export class OnEndOfTrickCommand extends Command<State, {}> {
  startNextTrick(round: Round, trick: Trick) {
    const winner = trick.winner;
    round.firstPlayer = winner;
    const nextID = trick.id + 1;
    this.state.currentTrick = new Trick(nextID, winner);
    round.remainingTricks -= 1;
  }

  computeRoundScore(
    round: Round,
    playerScore: MapSchema<PlayerRoundScore>,
    gameScore: MapSchema<PlayerGameScore>
  ) {
    const players = this.state.game.orderedPlayers;
    const roundNumber = round.id;

    const computePlayerScore = (playerId: number) => {
      const roundScore = playerScore[playerId];
      const tricksBet = roundScore.tricksBet;
      const tricksWon = roundScore.tricksWon;
      const skullKingCaptured = roundScore.skullKingCaptured;
      const piratesCaptured = roundScore.piratesCaptured;

      let globalScore = gameScore[playerId];
      let difference: number;
      let points = 0;

      if (tricksBet === 0) {
        if (tricksWon === tricksBet) {
          points += (roundNumber + 1) * 10;
        } else {
          points -= (roundNumber + 1) * 10;
        }
      } else {
        if (tricksWon === tricksBet) {
          points += tricksBet * 20;

          if (skullKingCaptured) points += 50;
          if (piratesCaptured) points += piratesCaptured * 30;
        } else {
          difference = Math.abs(tricksWon - tricksBet);
          points -= difference * 10;
        }
      }

      globalScore.totalScore += points;
      globalScore[`round${roundNumber}Score`] = points;
      globalScore[`round${roundNumber}Bet`] = tricksBet;
    };

    players.forEach((playerId) => {
      computePlayerScore(playerId);
    });

    /*
      Compare tricksBet and tricksWon
      - if equal & tricksBet > 0 : 
      -- points = tricksBet * 20;
      - if equal & tricksBet = 0:
      -- points = (roundNumber + 1) * 10,
      - if diff & tricksBet > 0:
      -- points = (tricksWon - tricksBet) (absolute value) * - 10
      - if diff & tricksBet = 0:
      -- points = (roundNumber + 1) * - 10

      if equal and skullkingcaptured:
      - points += 50
      
      if equal and piratescaptured:
      - points += 30 * number of pirates
    */
  }

  startNextRound() {
    this.state.currentRound += 1;
    const nextRound = this.state.game.remainingRounds[this.state.currentRound];
    const startingPlayer = nextRound.startingPlayer;
    this.state.currentTrick = new Trick(1, startingPlayer);
  }

  execute() {
    const round = this.state.game.remainingRounds[this.state.currentRound];
    const trick = this.state.currentTrick;
    const playersScore = round.playersScore;
    const gameScore = this.state.game.scoreboard;

    if (round.remainingTricks) {
      console.log('==== Next trick ====');
      this.startNextTrick(round, trick);
    } else {
      this.computeRoundScore(round, playersScore, gameScore);
      this.startNextRound();
    }
  }
}

export class OnEndOfGameCommand extends Command<State, {}> {
  execute() {
    const gameScore = this.state.game.scoreboard;
    const playerIds = Object.keys(
      this.state.game.remainingRounds[9].playersScore
    );
    const scores = playerIds.map((playerId) => {
      return gameScore[playerId].totalScore;
    });
    const winningScore = Math.max(...scores);

    playerIds.forEach((playerId) => {
      let playerScore = gameScore[playerId].totalScore;
      if (playerScore === winningScore) {
        this.state.game.winners.push(playerId);
      }
    });

    this.state.game.isFinished = true;
  }
}
