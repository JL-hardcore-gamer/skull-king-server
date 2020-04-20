import { Schema, ArraySchema, type } from '@colyseus/schema';

import { Card } from './Card';

export class PlayerHand extends Schema {
  @type([Card])
  hand = new ArraySchema<Card>();

  @type([Card])
  allowedCards = new ArraySchema<Card>();
}
