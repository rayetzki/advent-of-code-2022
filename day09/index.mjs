import { readFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { REGEX } from '../common.mjs';

const input = await readFile('./data.txt', { encoding: 'utf-8' });

const { values: { knots: count } } = parseArgs({ 
  options: { 
    'knots': { 
      type: 'string',
      short: 'k',
      default: '2',
    }, 
  },
  tokens: true,
});

const moves = input
  .split(REGEX.NEWLINE)
  .map(value => value.split(REGEX.SPACE));

// [x, y]
const start = { x: 0, y: 0 };
const head = { ...start };
const knots = [head];

// Instanciate knots

for (let i = 1; i < +count; i++) {
  knots.push({ ...start });
}

const tailWay = new Set([`${start.x}, ${start.y}`]);

for (const [direction, count] of moves) { // Series of steps; Starting position [0, 0]
  const steps = parseInt(count, 10);
  
  for (let i = steps; i > 0; i--) {  // Steps
    // Update head [x, y]

    if (direction === "U") head.y++;
    if (direction === "D") head.y--;
    if (direction === "L") head.x--;
    if (direction === "R") head.x++;

    for (let i = 0; i < knots.length - 1; i++) {
      const [head, tail] = [knots[i], knots[i + 1]];

      const isTouching = (
        tail.x >= head.x - 1 &&
        tail.x <= head.x + 1 &&
        tail.y >= head.y - 1 &&
        tail.y <= head.y + 1
      );
    
      if (isTouching) continue;

      if (head.x === tail.x) {
        tail.y += head.y < tail.y ? -1 : 1;
      } else if (head.y === tail.y) {
        tail.x += head.x > tail.x ? 1 : -1;
      } else {
        tail.x += head.x > tail.x ? 1 : -1;
        tail.y += head.y < tail.y ? -1 : 1;
      }
    }

    tailWay.add(`${knots.at(-1).x}, ${knots.at(-1).y}`); 
  }
}

console.log(tailWay.size);