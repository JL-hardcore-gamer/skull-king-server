import { Schema, MapSchema, ArraySchema, type } from "@colyseus/schema";
import { Player } from './Player'
import { Card } from './Card'
import { Trick } from './Trick'
import { Round } from './Round'
import { Game } from "./Game";

/*
What does this mean? (constructor... name)

export class CardType extends Schema {
  @type("string") name: string;
  @type("number") cost: number = 0;

  constructor(name: string) {
    super();

    this.name = name;
  }
}
*/

export class State extends Schema {
  @type({ map: Player })
  players = new MapSchema<Player>();
  
  @type([ Card ])
  rounds = new ArraySchema<Card>();

  @type(Trick)
  currentTrick: Trick;

  @type(Round)
  currentRound: Round;

  @type(Game)
  game: Game;
  // You can add as many stuff as you want actually
}

