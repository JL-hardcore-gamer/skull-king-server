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
    const cardsId = [53, 14, 54, 24, 41, 65];
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
});
