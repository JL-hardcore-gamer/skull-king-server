import { Schema, type } from '@colyseus/schema';

export class Card extends Schema {
  @type('number')
  id: number;

  @type('string')
  suit: string;
  // red, blue, yellow, black, special

  @type('string')
  character: string;
  // numbers from 1 to 13, Skull King, Mermaid, Pirate, White Flag, Bloody Mary

  @type('string')
  friendlyName: string;

  constructor(id: number, suit: string, character: string) {
    super();
    this.id = id;
    this.suit = suit;
    this.character = character;
    this.friendlyName = this.computeFriendlyName(suit, character)
  }

  computeSpecialFriendlyName(character: string) {
    switch (character) {
      case "Skull King":
        return "le Skull King";
      case "Mermaid":
        return "une sirène";
      case "Pirate":
        return "un pirate";
      case "White Flag":
        return "un drapeau blanc";
      case "Bloody Mary":
        return "la Bloody Mary";
    }
  }

  computeFriendlyName(suit: string, character: string) {
    let name:string;

    if (suit === 'special') {
      name = this.computeSpecialFriendlyName(character);
    } else {
      const suitTranslation:Record<string, string> = {
        red: 'rouge',
        blue: 'bleu',
        yellow: 'jaune',
        black: 'noir',
      };

      name = `le ${character} ${suitTranslation[suit]}`      
    }

    return name;
  }
}
