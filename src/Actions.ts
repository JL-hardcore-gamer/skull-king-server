import { State } from './State';
import { Player } from './Player';
import { Dispatcher, Command } from '@colyseus/command';

const getRandom = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
  };  

export class OnJoinCommand extends Command<
  State,
  { nickname: string; email: string }
> {
  execute(obj: any) {
    this.state.players[obj.nickname] = new Player(
      getRandom(0, 1000),
      obj.nickname,
      obj.email
    );
  }
}