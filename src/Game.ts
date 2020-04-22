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
    const specialValues:Record<string, number> = {
      'Skull King': 1,
      Mermaid: 2,
      Pirate: 5,
      'White Flag': 5,
      'Bloody Mary': 1,
    };

    let id = 1;

    suits.forEach((suit) => {
      numericValues.forEach((num) => {
        this.deck.push(new Card(id, suit, num));
        id += 1;
      });
    });

    for (const character in specialValues) {
      for (let num = specialValues[character]; num > 0; num -= 1) {
        this.deck.push(new Card(id, 'special', character));
        id += 1;
      }
    }
  }

  shuffleDeck() {
    function shuffle(a:Array<Card>) {
      for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    shuffle(this.deck);
  }
}
