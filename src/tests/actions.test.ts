import { MapSchema, ArraySchema } from '@colyseus/schema';
import { createDeck } from '../utils';
import {
  findHighestCardOwner,
  findFirstCardOwner,
  computeTrickPlayerOrder,
} from '../Actions';
import { Card } from '../Card';
import { Round } from '../Round';
import { PlayerHand } from '../PlayerHand';
import { PlayerRoundScore } from '../PlayerRoundScore';

describe('findHighestCardOwner()', () => {
  const deck = createDeck();
  const cards = [deck[3], deck[13], deck[15], deck[24], deck[41], deck[65]];
  // 4 rouge, 1 bleu, 3 bleu, 12 bleu, 3 noir, bloody Mary

  let cardsPlayed = new MapSchema<Card>();
  for (let i = 0; i < 6; i++) {
    cardsPlayed[i] = cards[i];
  }

  test('The highest blue card is at index 3 (12 Blue)', () => {
    const suit = 'blue';
    expect(findHighestCardOwner(suit, cardsPlayed)).toBe(3);
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
  const deck = createDeck();
  const trickPlayerOrder = [5, 3, 4, 2, 1];
  let cardsPlayed = new MapSchema<Card>();

  test('Find first mermaid played', () => {
    const cards = [deck[53], deck[13], deck[54], deck[24], deck[41], deck[65]];
    // sirène, 1 bleu, sirène, 12 bleu, 3 noir, bloody Mary
    trickPlayerOrder.forEach((playerId, idx) => {
      cardsPlayed[playerId] = cards[idx];
    });

    expect(findFirstCardOwner(trickPlayerOrder, cardsPlayed, 'Mermaid')).toBe(
      5
    );
  });

  test('Find first pirate played, with Bloody Mary', () => {
    const cards = [deck[53], deck[58], deck[54], deck[57], deck[41], deck[65]];
    // sirène, pirate, sirène, pirate, 3 noir, bloody Mary
    trickPlayerOrder.forEach((playerId, idx) => {
      cardsPlayed[playerId] = cards[idx];
    });

    expect(
      findFirstCardOwner(trickPlayerOrder, cardsPlayed, 'Pirate', 'Bloody Mary')
    ).toBe(3);
  });

  test('Find first pirate played, with Bloody Mary as a winner', () => {
    const cards = [deck[65], deck[58], deck[54], deck[57], deck[41], deck[58]];
    // bloody Mary, pirate, sirène, pirate, 3 noir, pirate
    trickPlayerOrder.forEach((playerId, idx) => {
      cardsPlayed[playerId] = cards[idx];
    });

    expect(
      findFirstCardOwner(trickPlayerOrder, cardsPlayed, 'Pirate', 'Bloody Mary')
    ).toBe(5);
  });
});
