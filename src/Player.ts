import { Schema, type } from '@colyseus/schema';

export class Player extends Schema {
  @type('number')
  id: number = 1;
  // how to create id number?

  @type('string')
  name: string = 'Marcel';
  // so I need to receive a name param from the client-side?

  @type('string')
  email: string = 'marcel@aol.com';

  constructor(id: number, name: string, email: string) {
    super();
    this.id = id;
    this.name = name;
    this.email = email;
  }
}
