import { Room, Client } from "colyseus";
import { State } from './State';
import { Card } from './Card';
import { Player } from './Player';

export class SkullKing extends Room<State> {
    // When room is initialized
    onCreate (options: any) { 
      console.log("created!", options);
      // Initialize the state so you can do a `this.state.something`
      this.setState(new State());
    }

    // When client successfully join the room
    onJoin (client: Client, options: any, auth: any) {
      console.log("joined")
      const cards = ["SkullKing", "Pirate", "Red1", "Red2"];
      // Play with an array
      cards.forEach(cardName => {
        const newRound = new Card(cardName)
        this.state.rounds.push(newRound);
      })

      // Play with an map (object)
      this.state.players['player1'] = new Player();
     }

    // When a client sends a message
    onMessage (client: Client, message: any) { 
      console.log("message received:", message);
    }

    // When a client leaves the room
    onLeave (client: Client, consented: boolean) { }

    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose () { }
}
