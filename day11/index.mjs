import { readFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { REGEX } from '../common.mjs';

// Check whether worry level is ridiculous or not
const { values: { relief } } = parseArgs({ 
  options: { 
    'relief': { 
      type: 'boolean',
      default: false,
    }, 
  },
  tokens: true,
});

const LEAST_COMMON_MULTIPLIER = 9_699_690;
const ROUNDS = relief ? 20 : 10_000;
const rawInput = await readFile('./data.txt', { encoding: 'utf-8' });
const input = rawInput
  .split(REGEX.DOUBLE_NEWLINE)
  .map(line => line.split(REGEX.NEWLINE).map(cmd => cmd.trim().replace(':', '')));

class Item {
  constructor(level) {
    this.level = level;
  }
}

class Monkey {
  constructor(items, operation, test) {
    this.items = items;
    this.#operation = operation;
    this.#test = test;
  }
  
  #inspecting = null;
  #operation;
  #test;
  count = 0;

  play() {
    while (this.items.length !== 0) {
      this.#inspect();
      this.#bother();
      this.#throw();
    }
  }

  accept(item) {
    this.items.push(item);
  }
  
  #inspect() {
    this.count++;
    this.#inspecting = this.items.shift();
    const newWorry = this.#operation(this.#inspecting.level);
    this.#inspecting.level = relief ? newWorry : (newWorry % LEAST_COMMON_MULTIPLIER);
  }

  #bother() {
    if (!relief) return;
    this.#inspecting.level = Math.floor(this.#inspecting.level / 3);
  }

  #throw() {
    const to = this.#test(this.#inspecting.level);
    monkeys[to].accept(this.#inspecting);
    this.#inspecting = null;
  }
}

// parse input text and create a list of participating monkeys
const monkeys = input.reduce((monkeyList, text) => {
  // get raw text for each monkey
  const [, itemsStr, operationStr, ...testStr] = text;

  // parse text
  const items = itemsStr.match(REGEX.NUMS).map(value => new Item(+value));
  const { operator, operand } = operationStr.match(/new = old (?<operator>[*+-/]) (?<operand>(.+))/).groups;
  const [divisibleBy, ifTo, elseTo] = testStr.map(str => Number(str.split(REGEX.SPACE).at(-1)));
  
  function operation(old) {
    const on = Number(operand) || old;
    if (operator === '*') return old * on;
    else if (operator === '+') return old + on;
    else if (operator === '/') return old / on;
    else if (operator === '-') return old - on;
    else throw new Error('Operation unknown: ', { cause: { on, operator } });
  }

  function test(level) {
    return (level % divisibleBy === 0) ? ifTo : elseTo;
  }
  
  // create monkeylevel % divisibleBy === 0
  monkeyList.push(new Monkey(items, operation, test));
  return monkeyList;
}, []);

for (let i = 1; i <= ROUNDS; i++) {
  for (const monkey of monkeys) {
    monkey.play();
  }
}

// activity after 20 rounds
const activity = [];
monkeys.forEach(({ count }) => activity.push(count));

// count monkey business level: 2 most active multiplied
const mostActive = activity.sort((a, b) => b - a).slice(0, 2);
const monkeyBusiness = mostActive[0] * mostActive[1];
console.log({ monkeyBusiness });