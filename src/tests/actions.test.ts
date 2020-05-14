import { MapSchema, ArraySchema } from '@colyseus/schema';
import {
  findHighestCardOwner,
  findFirstCardOwner,
  computeTrickPlayerOrder,
  computeWinner,
} from '../Actions';
import { Round } from '../Round';
import { PlayerHand } from '../PlayerHand';
import { PlayerRoundScore } from '../PlayerRoundScore';
import { setupTrick } from './helpers';

describe('findHighestCardOwner()', () => {
  const cardsId = [13, 3, 15, 24, 41, 65];
  // 1 bleu, 4 rouge, 3 bleu, 12 bleu, 3 noir, bloody Mary

  const trick = setupTrick([cardsId, 'blue', , 'escape']);

  test('The highest blue card is player 2 (12 Blue)', () => {
    expect(findHighestCardOwner(trick.suit, trick.cardsPlayed)).toBe(2);
  });
});

describe('computeTrickPlayerOrder()', () => {
  let absolutePlayerOrder = new ArraySchema<number>();
  [3, 4, 2, 1, 5].forEach((id) => absolutePlayerOrder.push(id));

  const round = new Round(
    3,
    4, // first trick player
    new MapSchema<PlayerHand>(),
    new MapSchema<PlayerRoundScore>()
  );

  test('At first trick of a round', () => {
    let trickPlayerOrder1 = new ArraySchema<number>();
    [4, 2, 1, 5, 3].forEach((id) => trickPlayerOrder1.push(id));

    expect(computeTrickPlayerOrder(round, absolutePlayerOrder)).toEqual(
      trickPlayerOrder1
    );
  });

  test('During the round', () => {
    round.firstPlayer = 5;
    let trickPlayerOrder2 = new ArraySchema<number>();
    [5, 3, 4, 2, 1].forEach((id) => trickPlayerOrder2.push(id));

    expect(computeTrickPlayerOrder(round, absolutePlayerOrder)).toEqual(
      trickPlayerOrder2
    );
  });
});

describe('findFirstCardOwner()', () => {
  test('Find first mermaid played', () => {
    const cardsId = [53, 13, 54, 24, 41, 65];
    // sirène, 1 bleu, sirène, 12 bleu, 3 noir, bloody Mary

    const trick = setupTrick([cardsId, 'blue', , 'escape']);

    expect(
      findFirstCardOwner(trick.playerOrder, trick.cardsPlayed, 'Mermaid')
    ).toBe(5);
  });

  test('Find first pirate played, with Bloody Mary', () => {
    const cardsId = [53, 58, 54, 57, 41, 65];
    // sirène, pirate, sirène, pirate, 3 noir, bloody Mary

    const trick = setupTrick([cardsId, 'black', , 'pirate']);

    expect(
      findFirstCardOwner(
        trick.playerOrder,
        trick.cardsPlayed,
        'Pirate',
        'Bloody Mary'
      )
    ).toBe(3);
  });

  test('Find first pirate played, with Bloody Mary as a winner', () => {
    const cardsId = [65, 58, 54, 57, 41, 58];
    // bloody Mary, pirate, sirène, pirate, 3 noir, pirate

    const trick = setupTrick([cardsId, , , 'pirate']);

    expect(
      findFirstCardOwner(
        trick.playerOrder,
        trick.cardsPlayed,
        'Pirate',
        'Bloody Mary'
      )
    ).toBe(5);
  });
});

describe('computeWinner()', () => {
  test('Black wins over suit cards (Mary as an Escape)', () => {
    const trick = Object.values(setupTrick());
    const result = { winner: 1, skullKingCaptured: 0, piratesCaptured: 0 };

    expect(computeWinner(trick)).toEqual(result);
  });

  test('Pirates win over Black cards and Mermaids', () => {
    const cardsId = [53, 58, 54, 57, 41, 65];
    // sirène, pirate, sirène, pirate, 3 noir, bloody Mary

    const trick = Object.values(setupTrick([cardsId, 'black', , 'escape']));

    const result = { winner: 3, skullKingCaptured: 0, piratesCaptured: 0 };

    expect(computeWinner(trick)).toEqual(result);
  });

  test('Mermaids win over black cards', () => {
    const cardsId = [51, 16, 53, 54, 41, 64];
    //  13 noir, 4 bleu, sirène, sirène, 3 noir, escape

    const trick = Object.values(setupTrick([cardsId, 'black']));

    const result = { winner: 4, skullKingCaptured: 0, piratesCaptured: 0 };

    expect(computeWinner(trick)).toEqual(result);
  });

  test('Pirates win over mermaids', () => {
    const cardsId = [51, 16, 53, 58, 41, 64];
    //  13 noir, 4 bleu, sirène, pirate, 3 noir, escape

    const trick = Object.values(setupTrick([cardsId, 'black']));

    const result = { winner: 2, skullKingCaptured: 0, piratesCaptured: 0 };

    expect(computeWinner(trick)).toEqual(result);
  });

  test('Mermaids win over the Skull King (and SK counter is incremented)', () => {
    const cardsId = [52, 16, 53, 51, 41, 64];
    //  skull king, 4 bleu, sirène, 13 noir, 3 noir, escape

    const trick = Object.values(setupTrick([cardsId, 'blue']));

    const result = { winner: 4, skullKingCaptured: 1, piratesCaptured: 0 };

    expect(computeWinner(trick)).toEqual(result);
  });

  test('Mermaids win over the Skull King even with pirates', () => {
    const cardsId = [52, 16, 53, 58, 41, 54];
    //  skull king, 4 bleu, sirène, pirate, 3 noir, sirène

    const trick = Object.values(setupTrick([cardsId, 'blue']));

    const result = { winner: 4, skullKingCaptured: 1, piratesCaptured: 0 };

    expect(computeWinner(trick)).toEqual(result);
  });

  test('Skull King captures pirates', () => {
    const cardsId = [52, 16, 58, 51, 41, 56];
    //  skull king, 4 bleu, pirate, 13 noir, 3 noir, pirate

    const trick = Object.values(setupTrick([cardsId, 'blue']));

    const result = { winner: 5, skullKingCaptured: 0, piratesCaptured: 2 };

    expect(computeWinner(trick)).toEqual(result);
  });

  test('Skull King captures bloody Mary (escape)', () => {
    const cardsId = [52, 16, 65, 51, 41, 13];
    //  skull king, 4 bleu, bloody Mary, 13 noir, 3 noir, 1 bleu

    const trick = Object.values(setupTrick([cardsId, 'blue', , 'escape']));

    const result = { winner: 5, skullKingCaptured: 0, piratesCaptured: 1 };

    expect(computeWinner(trick)).toEqual(result);
  });

  test('Skull King captures bloody Mary (pirate)', () => {
    const cardsId = [52, 16, 65, 51, 41, 13];
    //  skull king, 4 bleu, bloody Mary, 13 noir, 3 noir, 1 bleu

    const trick = Object.values(setupTrick([cardsId, 'blue', , 'pirate']));

    const result = { winner: 5, skullKingCaptured: 0, piratesCaptured: 1 };

    expect(computeWinner(trick)).toEqual(result);
  });

  test('Flags only: winner is the first player', () => {
    const cardsId = [63, 61, 60, 62, 64];
    // all escape flags
    const playerOrder = [4, 2, 1, 3, 5];

    const trick = Object.values(setupTrick([cardsId, undefined, playerOrder]));

    const result = { winner: 4, skullKingCaptured: 0, piratesCaptured: 0 };

    expect(computeWinner(trick)).toEqual(result);
  });

  test('Suit color wins over higher cards of other suits (except black)', () => {
    const cardsId = [13, 12, 38, 11, 35, 37];
    // 1 bleu, 13 rouge, 13 jaune, 12 rouge, 10 jaune, 12 jaune

    const trick = Object.values(setupTrick([cardsId, 'blue']));

    const result = { winner: 5, skullKingCaptured: 0, piratesCaptured: 0 };

    expect(computeWinner(trick)).toEqual(result);
  });
});
