import { Schema, type } from "@colyseus/schema";

export class PlayerGameScore extends Schema {
  @type('number')
  totalScore: number;

  @type('number')
  round1Bet: number;

  @type('number')
  round1Score: number;

  // repeat for rounds 1 to 10
}