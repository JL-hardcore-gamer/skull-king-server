import { Schema, MapSchema, ArraySchema, type } from '@colyseus/schema';
import { Player } from './Player';
import { Card } from './Card';
import { Trick } from './Trick';
import { Round } from './Round';
import { Game } from './Game';

export class State extends Schema {
  @type({ map: Player })
  players = new MapSchema<Player>();

  @type([Card])
  rounds = new ArraySchema<Card>();

  @type(Trick)
  currentTrick: Trick;

  @type(Round)
  currentRound: Round;

  @type(Game)
  game: Game;

  @type('string')
  roomOwner: string;
}
