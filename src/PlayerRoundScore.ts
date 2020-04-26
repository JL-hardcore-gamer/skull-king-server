import { Schema, type } from '@colyseus/schema';

export class PlayerRoundScore extends Schema {
  @type('number')
  tricksBet: number;

  @type('number')
  tricksWon: number = 0;

  @type('number')
  skullKingCaptured: number = 0;

  @type('number')
  piratesCaptured: number = 0;
}
