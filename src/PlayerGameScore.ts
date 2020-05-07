import { Schema, type } from '@colyseus/schema';

export class PlayerGameScore extends Schema {
  @type('number')
  totalScore: number = 0;

  // @type('number')
  // round0Bet: number;

  // @type('number')
  // round0Score: number;

  // repeat for rounds 0 to 9
}
