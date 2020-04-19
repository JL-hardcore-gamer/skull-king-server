import { Schema, type } from '@colyseus/schema';

export class PlayerRoundScore extends Schema {
  @type('number')
  tricksBet: number;

  @type('number')
  tricksWon: number;

  @type('number')
  skullKingCaptured: number;

  @type('number')
  piratesCaptured: number;
}