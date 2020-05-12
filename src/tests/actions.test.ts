import { MapSchema, ArraySchema } from '@colyseus/schema';
import { findHighestCard, createDeck, computeTrickPlayerOrder } from '../utils';
import { Card } from '../Card';
import { Round } from '../Round';
import { PlayerHand } from '../PlayerHand';
import { PlayerRoundScore } from '../PlayerRoundScore';

test('The highest blue card is at index 3 (12 Blue)', () => {
  const suit = 'blue';
  const deck = createDeck();
  const cards = [deck[3], deck[13], deck[15], deck[24], deck[41], deck[65]];
  // 4 rouge, 1 bleu, 3 bleu, 12 bleu, 3 noir, bloody Mary

  let cardsPlayed = new MapSchema<Card>();
  for (let i = 0; i < 6; i++) {
    cardsPlayed[i] = cards[i];
  }

  expect(findHighestCard(suit, cardsPlayed)).toBe(3);
});

test('Compute trick player order at various stages of a round', () => {
  let absolutePlayerOrder = new ArraySchema<number>();
  [3, 4, 2, 1, 5].forEach((id) => absolutePlayerOrder.push(id));
  const round = new Round(
    3,
    4, // first trick player
    new MapSchema<PlayerHand>(),
    new MapSchema<PlayerRoundScore>()
  );

  // first trick of the round
  let trickPlayerOrder1 = new ArraySchema<number>();
  [4, 2, 1, 5, 3].forEach((id) => trickPlayerOrder1.push(id));

  expect(computeTrickPlayerOrder(round, absolutePlayerOrder)).toEqual(
    trickPlayerOrder1
  );

  // new trick (still the same round)
  round.firstPlayer = 5;
  let trickPlayerOrder2 = new ArraySchema<number>();
  [5, 3, 4, 2, 1].forEach((id) => trickPlayerOrder2.push(id));
  expect(computeTrickPlayerOrder(round, absolutePlayerOrder)).toEqual(
    trickPlayerOrder2
  );
});
