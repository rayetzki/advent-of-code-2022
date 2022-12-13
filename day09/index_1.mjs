import { readFile } from 'node:fs/promises';
import { REGEX } from '../common.mjs';

const input = await readFile('./data.txt', { encoding: 'utf-8' });
const moves = input
  .split(REGEX.NEWLINE)
  .map(value => value.split(REGEX.SPACE));
  
// [x, y]

const head = { x: 0, y: 0 };
const tail = { x: 0, y: 0 };

const tailWay = new Set([`${tail.x}, ${tail.y}`]);

for (const [direction, count] of moves) { // Series of steps; Starting position [0, 0]
  const steps = parseInt(count, 10);
  
  for (let i = steps; i > 0; i--) {  // Steps
    // Update head [x, y]
    if (direction === "U") head.y++;
    if (direction === "D") head.y--;
    if (direction === "L") head.x--;
    if (direction === "R") head.x++;

    const isTouching = (
      tail.x >= head.x - 1 &&
      tail.x <= head.x + 1 &&
      tail.y >= head.y - 1 &&
      tail.y <= head.y + 1
    );
    
    if (isTouching) continue;
    
    // Calculate tail [x, y]
    if (head.x === tail.x) {
      tail.y += head.y < tail.y ? -1 : 1;
    } else if (head.y === tail.y) {
      tail.x += head.x > tail.x ? 1 : -1;
    } else {
      tail.x += head.x > tail.x ? 1 : -1;
      tail.y += head.y < tail.y ? -1 : 1;
    }
    
    // Track each tail [x, y] position frequency
    tailWay.add(`${tail.x}, ${tail.y}`);
  }
}

console.log(tailWay.size);