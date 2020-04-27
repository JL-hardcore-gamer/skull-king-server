import { Schema, MapSchema, ArraySchema, type } from '@colyseus/schema';
import { PlayerRoundScore } from './PlayerRoundScore';
import { PlayerHand } from './PlayerHand';

export class Round extends Schema {
  @type('number')
  id: number;

  /**
   * Not sure we want this to be an number actually
   */
  @type('number')
  startingPlayer: number;
  // first player of the round, depends on the game order

  @type('number')
  firstPlayer: number;
  // first player of the trick (except first trick), depends on the last trick winner

  @type('number')
  numberOfBets = 0;

  // Not sure it's the right place
  @type('number')
  remainingTricks: number;

  @type({ map: PlayerRoundScore })
  playersScore = new MapSchema<PlayerRoundScore>();

  @type({ map: PlayerHand })
  playersHand = new MapSchema<PlayerHand>();

  constructor(
    id: number,
    startingPlayer: number,
    playersHand: MapSchema<PlayerHand> = new MapSchema<PlayerHand>()
  ) {
    super();

    this.id = id;
    this.startingPlayer = startingPlayer;
    this.playersHand = playersHand;
  }
}
