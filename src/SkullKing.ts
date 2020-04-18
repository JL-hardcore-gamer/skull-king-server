import http from "http";
import { Room, Client } from "colyseus";

export class SkullKing extends Room {
    // When room is initialized
    onCreate (options: any) { 
      console.log("created!");
    }

    // Authorize client based on provided options before WebSocket handshake is complete
    onAuth (client: Client, options: any, request: http.IncomingMessage) { }

    // When client successfully join the room
    onJoin (client: Client, options: any, auth: any) {
      console.log("joined")
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