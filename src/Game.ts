import { Schema, MapSchema, ArraySchema, type } from '@colyseus/schema';
import { Player } from './Player';
import { Round } from './Round';
import { PlayerGameScore } from './PlayerGameScore';
import { Card } from './Card';
import { State } from './State';

export class Game extends Schema {
  @type('number')
  id: number;

  @type([Player])
  winners = new ArraySchema<Player>();

  @type('boolean')
  isFinished = false;

  @type([Round])
  remainingRounds = new ArraySchema<Round>();

  @type({ map: PlayerGameScore })
  scoreboard = new MapSchema<PlayerGameScore>();

  // difference with State.players: only focuses on ID order, not on the whole player info
  @type(['number'])
  orderedPlayers = new ArraySchema<number>();

  @type([Card])
  deck = new ArraySchema<Card>();
}
