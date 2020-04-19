import { Schema, ArraySchema, type } from "@colyseus/schema";
import { Card } from './Card';
import { Player } from './Player';

export class Trick extends Schema {
  @type('number')
  id: number;

  @type('string')
  suit: string;

  @type([ Card ])
  cardsPlayed = new ArraySchema<Card>();

  @type(Player)
  currentPlayer: Player;

  @type([ Player ])
  remainingPlayers = new ArraySchema<Player>();

  @type(Player)
  winner: Player;
}