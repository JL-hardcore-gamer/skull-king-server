import { Schema, type } from '@colyseus/schema';

export class Player extends Schema {
  @type('number')
  id: number;

  @type('string')
  name: string;

  @type('string')
  email: string;

  constructor(id: number, name: string, email: string) {
    super();
    this.id = id;
    this.name = name;
    this.email = email;
  }
}
