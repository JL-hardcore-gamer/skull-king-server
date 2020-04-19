import { Schema, MapSchema, ArraySchema, type } from "@colyseus/schema";
import { Player } from './Player';
import { Round } from './Round';
import { PlayerGameScore } from "./PlayerGameScore";

export class Game extends Schema {
  @type('number')
  id: number;

  @type([ Player ])
  winners = new ArraySchema<Player>();

  @type('boolean')
  isFinished: boolean;

  @type([ Round ])
  remainingRounds = new ArraySchema<Round>();

  @type({ map: PlayerGameScore })
  scoreboard = new MapSchema<PlayerGameScore>();

  @type([ Player ])
  players = new ArraySchema<Player>();
}