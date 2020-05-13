import { MapSchema } from '@colyseus/schema';
import { createDeck } from '../utils';
import { Card } from '../Card';

const setupTrick = (params: any = []) => {
  const orderedCardsId = params[0] || [3, 13, 15, 24, 41, 65];
  const suit = params[1] || 'blue';
  const playerOrder: number[] = params[2] || [5, 3, 4, 2, 1, 6];
  const bloodyMaryChoice: string = params[3] || undefined;
  const deck = createDeck();
  const cards = orderedCardsId.map((id: number) => deck[id]);

  let cardsPlayed = new MapSchema<Card>();
  playerOrder.forEach((playerId: number, idx: number) => {
    cardsPlayed[playerId] = cards[idx];
  });

  return { suit, cardsPlayed, playerOrder, bloodyMaryChoice };
  // return Object.values(resultObj);
};

export { setupTrick };
