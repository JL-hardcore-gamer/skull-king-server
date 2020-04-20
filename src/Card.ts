import { Schema, type } from '@colyseus/schema';

export class Card extends Schema {
  @type('number')
  id: number;

  @type('string')
  suit: string;
  // red, blue, yellow, black, special

  @type('string')
  character: string;
  // numbers from 1 to 13, Skull King, Mermaid, Pirate, White Flag, Bloody Mary

  @type('string')
  friendlyName: string;
}
