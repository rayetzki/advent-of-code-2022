import { readFile } from 'node:fs/promises';
import { parseArgs } from 'util';

const input = await readFile('./data.txt', { encoding: 'utf-8' });

const { values: mode } = parseArgs({ 
  options: { 
    'ordered': { 
      type: 'boolean',
      short: 'o',
      default: false,
    }, 
  },
  tokens: true,
});

// TODO: Rewrite to parsing
const scheme = [
  ['F', 'T', 'N', 'Z', 'M', 'G', 'H', 'J'],
  ['J', 'W', 'V'],
  ['H', 'T', 'B', 'J', 'L', 'V', 'G'],
  ['L', 'V', 'D', 'C', 'N', 'J', 'P', 'B'],
  ['G', 'R', 'P', 'M', 'S', 'W', 'F'],
  ['M', 'V', 'N', 'B', 'F', 'C', 'H', 'G'],
  ['R', 'M', 'G', 'H', 'D'],
  ['D', 'Z', 'V', 'M', 'N', 'H'],
  ['H', 'F', 'N', 'G'],
];

// Parse input
const [_, commandsList] = input.split('\n\n');
const commands = commandsList.split('\n');

// Run commands on scheme
const regex = /move (?<count>[0-9]+) from (?<from>[0-9]+) to (?<to>[0-9]+)/g;

function moveBlock(command, ordered = false) {
  const [count, from, to] = Object.values([...command.matchAll(regex)][0].groups).map(Number);
  const values = scheme[from - 1].splice(0, count);
  scheme[to - 1].unshift(...(ordered ? values : values.reverse()));
}

console.log(mode.ordered)

for (const command of commands) {
  moveBlock(command, mode.ordered);
}

console.log(scheme.reduce((acc, stack) => acc + stack[0], ''));