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

  // competes with State.players, should probably be removed
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
    const specialValues: Record<string, number> = {
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
    function shuffle(a: Array<Card>) {
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }
    shuffle(this.deck);
  }

  shufflePlayers() {
    // i don't know how to avoid the repetition of the shuffle method :(
    // (because I need to strongly type the array's content)
    function shuffle(a: Array<Player>) {
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    shuffle(this.players);
  }

  start() {
    this.createDeck();
    this.shuffleDeck();
    this.shufflePlayers();

    /**
     * Patrick Test
     */

    this.remainingRounds.push(new Round(this.players));
  }
}
