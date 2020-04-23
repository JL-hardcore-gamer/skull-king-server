const db = {
  game: {
    id: 3,
    winners: [
      /* Player objects */
    ],
    isFinished: false,
    remainingRounds: [
      { number: 8, firstPlayer: 2 },
      { number: 9, firstPlayer: 3 },
      { number: 10, firstPlayer: 4 },
    ],
    scoreboard: {
      player1: {
        totalScore: 200,
        round1Bet: 0,
        round1Score: 10,
        round2Bet: 1,
        round2Score: -20,
        /* etc */
        round9Bet: undefined, // or NaN if I have to user a Number
        round9Score: undefined,
        round10Bet: undefined,
        round10Score: undefined,
      },
      player2: {
        /* etc */
      },
    },
    players: {
      1: {
        name: 'Marcel',
        email: 'marcel@aol.com',
        // sessionId: "d1770f154ac0f9e0394498ad"
      },
      2: {
        /* rest of the players ommitted  */
      },
    },
    deck: [
      /* Card objects */
    ],
  },

  round: {
    id: 7,
    startingPlayer: 1, // first player of the round, depends on the game
    firstPlayer: 4, // first player of the trick, depends on the last winner
    deckCards: [
      /* Card objects */
    ],
    remainingTricks: 3,
    playersScore: {
      1: {
        tricksBet: 0,
        tricksWon: 1,
        skullKingCaptured: 0,
        piratesCaptured: 0,
      },
      2: {
        tricksBet: 3,
        tricksWon: 3,
        skullKingCaptured: 1,
        piratesCaptured: 0,
      },
      /* the rest is ommitted */
    },
    player1Hand: {
      hand: [
        /* Card objects */
      ],
      allowedCards: [
        /* Card objects */
      ],
    },
    player2Hand: {
      hand: [
        /* Card objects */
      ],
      allowedCards: [
        /* Card objects */
      ],
    },
    /* rest of the players' hand ommitted */

    /**
     * Patrick Test start
     */
    playersHand: {
      MonPote: {
        hand: [1, 2, 3, 4, 5],
        allowedCards: [1, 2],
      },
      Tony: {
        hand: [8, 7, 23, 34, 9],
        allowedCards: [34, 9],
      },
    },

    /**
     * Patrick Test end
     */
  },

  trick: {
    id: 4,
    suit: 'Red',
    cardsPlayed: [
      /* Card objects */
    ],
    currentPlayer: 2,
    remainingPlayers: [3, 4], // unless IDs are already in the right order?,
    winner: undefined,
  },

  card: {
    id: 42,
    suit: 'Red', // possible values: red, blue, yellow, black, special
    character: '3', // possible values: number from 1 to 13, Skull King, Mermaid, Pirate, White flag, Bloody Mary
    friendlyName: 'le 3 Rouge', // le Skull King, une Sirène, le 1 Noir...
  },
};
