import { MapSchema } from '@colyseus/schema';
import { findHighestCard, createDeck } from '../utils';
import { Card } from '../Card';

test("The highest blue card is at index 3 (12 Blue)", () => {
  const suit = "blue";
  const deck = createDeck();
  const cards = [deck[3], deck[13], deck[15], deck[24], deck[41], deck[65]]
  // 4 rouge, 1 bleu, 3 bleu, 12 bleu, 3 noir, bloody Mary
  
  let cardsPlayed = new MapSchema<Card>();
  for (let i = 0; i < 6; i ++) {
    cardsPlayed[i] = cards[i];
  }

  expect(findHighestCard(suit, cardsPlayed)).toBe(3);
});
