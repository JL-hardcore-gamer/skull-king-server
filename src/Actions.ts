import { State } from './State';
import { Player } from './Player';
import { Card } from './Card';
import { Schema, ArraySchema, MapSchema } from '@colyseus/schema';
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

export class OnStartCommand extends Command<State, {}> {
  startGame() {
    this.createDeck();
    this.shuffleDeck();
    this.shufflePlayers(this.state.players);
    this.setupRounds();
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

  setupRounds() {
    let roundID:number = 1;
    const orderedPlayers:ArraySchema<number> = this.state.game.orderedPlayers;
    let i:number;
    let round:Round;

    for (roundID; roundID <= 10; roundID += 1) {
      i = (roundID - 1) % orderedPlayers.length;
      round = new Round(roundID, orderedPlayers[i]);
      this.state.game.remainingRounds.push(round);      
    }
    
  }

  execute(obj: any) {
    this.startGame();
  };
}