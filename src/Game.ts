import { Schema, MapSchema, ArraySchema, type } from '@colyseus/schema';
import { Player } from './Player';
import { Round } from './Round';
import { PlayerGameScore } from './PlayerGameScore';
import { Card } from './Card';

export class Game extends Schema {
  @type('number')
  id: number;

  @type([Player])
  winners = new ArraySchema<Player>();

  @type('boolean')
  isFinished: boolean;

  @type([Round])
  remainingRounds = new ArraySchema<Round>();

  @type({ map: PlayerGameScore })
  scoreboard = new MapSchema<PlayerGameScore>();

  @type([Player])
  players = new ArraySchema<Player>();

  @type([Card])
  deck = new ArraySchema<Card>();

  // unfinished
  createDeck() {
    const suits = ['red', 'blue', 'yellow', 'black'];
    const numericValues = [
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '12',
      '13',
    ];
    const specialValues = {
      'Skull King': 1,
      Mermaid: 2,
      Pirate: 5,
      'White Flag': 5,
      'Bloody Mary': 1,
    };

    suits.forEach((suit) => {
      numericValues.forEach((num) => {
        this.deck.push(new Card(suit, num));
      });
    });
  }
}
