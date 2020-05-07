import { Schema, type } from '@colyseus/schema';

export class PlayerGameScore extends Schema {
  @type('number')
  totalScore: number = 0;

  @type('number')
  round0Bet: number;

  @type('number')
  round0Score: number;

  @type('number')
  round1Bet: number;

  @type('number')
  round1Score: number;

  @type('number')
  round2Bet: number;

  @type('number')
  round2Score: number;

  @type('number')
  round3Bet: number;

  @type('number')
  round3Score: number;

  @type('number')
  round4Bet: number;

  @type('number')
  round4Score: number;

  @type('number')
  round5Bet: number;

  @type('number')
  round5Score: number;

  @type('number')
  round6Bet: number;

  @type('number')
  round6Score: number;

  @type('number')
  round7Bet: number;

  @type('number')
  round7Score: number;

  @type('number')
  round8Bet: number;

  @type('number')
  round8Score: number;

  @type('number')
  round9Bet: number;

  @type('number')
  round9Score: number;
}
