import { Card } from './Card';

const prettyPrintObj = (obj: any) => {
  const allKeys = Object.keys(obj);

  allKeys.forEach((key) => {
    console.log(`Key ${key}:`, obj[key]);
  });
};

const shuffleArray = <T>(arr: Array<T>): Array<T> => {
  let a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const createDeck = (): Array<Card> => {
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
  let deck: Array<Card> = [];

  suits.forEach((suit) => {
    numericValues.forEach((num) => {
      deck.push(new Card(id, suit, num));
      id += 1;
    });
  });

  for (const character in specialValues) {
    for (let num = specialValues[character]; num > 0; num -= 1) {
      deck.push(new Card(id, 'special', character));
      id += 1;
    }
  }

  return deck;
};

const deck = createDeck();

export { prettyPrintObj, shuffleArray, deck, createDeck };
