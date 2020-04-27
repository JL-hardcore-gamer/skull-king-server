import { Schema, ArraySchema, MapSchema, type } from '@colyseus/schema';
import { Card } from './Card';
import { Player } from './Player';

export class Trick extends Schema {
  @type('number')
  id: number;

  @type('string')
  suit: string;

  @type({ map: Card })
  cardsPlayed = new MapSchema<Card>();

  @type('number')
  currentPlayer: number;

  @type(["number"])
  remainingPlayers = new ArraySchema<Number>();

  @type('number')
  winner: number;

  constructor(id:number, currentPlayer:number) {
    super();

    this.id = id;
    this.currentPlayer = currentPlayer;
  }
}
