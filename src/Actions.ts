import { State } from './State';
import { Player } from './Player';
import { Card } from './Card';
import { Schema, MapSchema } from '@colyseus/schema';
import { Command } from '@colyseus/command';
import { Round } from './Round';

// const getRandom = (min: number, max: number) => {
//   return Math.random() * (max - min) + min;
// };  

export class OnJoinCommand extends Command<
  State,
  { id: number, nickname: string; email: string }
> {
  execute(obj: any) {
    this.state.players[obj.id] = new Player(
      obj.id,
      obj.nickname,
      obj.email
    );
  }
}

export class OnStartCommand extends Command<
  State,
  { players: MapSchema<Player> }
> {
  startGame(players: MapSchema<Player>) {
    this.createDeck();
    this.shuffleDeck();
    this.shufflePlayers(players);

    /* Pour Patrick */
    this.state.game.remainingRounds.push(new Round(this.state.game.orderedPlayers));
  }

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
        this.state.game.deck.push(new Card(id, suit, num));
        id += 1;
      });
    });

    for (const character in specialValues) {
      for (let num = specialValues[character]; num > 0; num -= 1) {
        this.state.game.deck.push(new Card(id, 'special', character));
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
    shuffle(this.state.game.deck);
  }

  shufflePlayers(players: MapSchema<Player>) {
    function shuffle(a: Array<Number>) {
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    Object.keys(players).forEach(id => {
      this.state.game.orderedPlayers.push(Number(id));
    })

    shuffle(this.state.game.orderedPlayers);
  }


  execute(obj: any) {
    // this.state.game.start(obj.players);
    this.startGame(obj.players);
  };
}