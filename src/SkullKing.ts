import http from "http";
import { Room, Client } from "colyseus";


import { Schema, MapSchema, ArraySchema, type } from "@colyseus/schema";


export class Player extends Schema {
  @type("number") x: number = 0.11;
  @type("number") y: number = 2.22;
}

// "Items inside Arrays and Maps must be all instance of the same type."
// CardType is a `type` so we can actually mix string and number
// It's more logical
export class CardType extends Schema {
  @type("string") name: string;
  @type("number") cost: number = 0;

  constructor(name: string) {
    super();

    this.name = name;
  }
}

export class State extends Schema {
  @type({ map: Player })
  players = new MapSchema<Player>();
  
  @type([ CardType ])
  rounds = new ArraySchema<CardType>();

  // You can add as many stuff as you want actually
}



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
      const card = ["SkullKing", "Pirate", "Red1", "Red2"];
      // Play with an array
      card.forEach(cardName => {
        const newRound = new CardType(cardName)
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
