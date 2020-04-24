import { State } from './State';
import { Player } from './Player';
import { Command } from '@colyseus/command';

const getRandom = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};  

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