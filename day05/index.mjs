import { readFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';

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

// Parse input
const [schemeCode, commandsList] = input.split('\n\n');
const commands = commandsList.split('\n');
const arrangement = schemeCode.split('\n');

const length = Number(schemeCode.split('\n').at(-1).split(/\s/g).at(-2));
const scheme = new Array(length).fill([]);

for (let i = 1; i <= length; i++) {
  for (let row = 0; row < arrangement.length - 1; row++) {
    const rawBox = arrangement[row]
      .slice((i - 1) * 4, (i - 1) * 4 + 3)
      .match(/\[([A-Z])\]/);

    if (rawBox === null) continue;
    scheme[i - 1].push(rawBox[1]);
  }
}

// Run commands on scheme
const regex = /move (?<count>[0-9]+) from (?<from>[0-9]+) to (?<to>[0-9]+)/g;

function moveBlock(command) {
  const { ordered } = mode;
  const [count, from, to] = Object.values([...command.matchAll(regex)][0].groups).map(Number);
  const values = scheme[from - 1].splice(0, count);
  scheme[to - 1].unshift(...(ordered ? values : values.reverse()));
}

commands.forEach(moveBlock);

console.log(scheme.reduce((acc, stack) => acc + stack[0], ''));