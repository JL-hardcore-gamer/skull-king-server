import { Schema, MapSchema, ArraySchema, type } from '@colyseus/schema';
import { Card } from './Card';
import { PlayerRoundScore } from './PlayerRoundScore';
import { PlayerHand } from './PlayerHand';

export class Round extends Schema {
  @type('number')
  id: number;

  @type('number')
  startingPlayer: number;
  // first player of the round, depends on the game order

  @type('number')
  firstPlayer: number;
  // first player of the trick (except first trick), depends on the last trick winner

  @type([Card])
  deckCards = new ArraySchema<Card>();

  @type('number')
  remainingTricks: number;

  @type({ map: PlayerRoundScore })
  playersScore = new MapSchema<PlayerRoundScore>();

  /**
   * Patrick Test
   */
  @type({ map: PlayerHand })
  playersHand = new MapSchema<PlayerHand>();

  constructor(id: number, startingPlayer: number, players: Array<number>) {
    super();

    this.id = id;
    this.startingPlayer = startingPlayer;
  }
}
