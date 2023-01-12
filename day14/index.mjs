import { createWriteStream } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { REGEX } from '../common.mjs';

const input = await readFile('./data.txt', { encoding: 'utf-8' });
const result = createWriteStream('./result.txt', { encoding: 'utf-8' });

const ELEMENTS = {
  ROCK: '#',
  AIR: '.',
  SAND: '+',
  REST: 'o',
  FALL: '~',
  VECTOR: '->'
};

const SAND_POSITION = [500, 0];

const id = (x, y) => [x, y].join();

const map = new Map([[id(...SAND_POSITION), ELEMENTS.SAND]]);

let maxY = -Infinity;
for (const path of input.split(REGEX.NEWLINE)) {
  const chunks = path.split(` ${ELEMENTS.VECTOR} `);

  for (let i = 0, j = 1; i < chunks.length - 1; i++, j++) {
    let [currentX, currentY] = chunks[i].split(REGEX.SEPARATOR).map(Number);
    let [nextX, nextY] = chunks[j].split(REGEX.SEPARATOR).map(Number);

    while (currentX !== nextX) {
      map.set(id(currentX, currentY), ELEMENTS.ROCK);
      currentX = currentX > nextX ? currentX - 1 : currentX + 1;
      map.set(id(currentX, currentY), ELEMENTS.ROCK);
    }

    while (currentY !== nextY) {
      map.set(id(currentX, currentY), ELEMENTS.ROCK);
      currentY = currentY > nextY ? currentY - 1 : currentY + 1;
      map.set(id(currentX, currentY), ELEMENTS.ROCK);
    }
  
    maxY = currentY > maxY ? currentY : maxY;
  }
}

// Emulating sand
let [sandX, sandY] = SAND_POSITION;
let counter = 0;

while (true) {
  let [below, toLeft, toRight] = [
    map.get(id(sandX, sandY + 1)),
    map.get(id(sandX - 1, sandY + 1)),
    map.get(id(sandX + 1, sandY + 1))
  ];

  if (sandY === maxY + 1) {
    below = ELEMENTS.ROCK;
    toLeft = ELEMENTS.ROCK;
    toRight = ELEMENTS.ROCK;
  }

  if (below !== ELEMENTS.ROCK && below !== ELEMENTS.REST) {
    [sandX, sandY] = [sandX, sandY + 1];
    continue;
  } else if (toLeft !== ELEMENTS.ROCK && toLeft !== ELEMENTS.REST) {
    [sandX, sandY] = [sandX - 1, sandY + 1];
    continue;
  } else if (toRight !== ELEMENTS.ROCK && toRight !== ELEMENTS.REST) {
    [sandX, sandY] = [sandX + 1, sandY + 1];
    continue;
  } else {
    map.set(id(sandX, sandY), ELEMENTS.REST);
    counter++;
    if (sandX === SAND_POSITION[0] && sandY === SAND_POSITION[1]) break;
    [sandX, sandY] = SAND_POSITION;
    continue;
  }
}

function drawGrid() {
  const entries = [...map.keys()].map(key => key.split(REGEX.SEPARATOR).map(Number));
  const xs = entries.flatMap(([x, ]) => x);
  const ys = entries.flatMap(([, y]) => y);
  const [xMin, xMax] = [Math.min(...xs), Math.max(...xs)];
  const [yMin, yMax] = [Math.min(...ys), Math.max(...ys)];
  const grid = new Array(yMax).fill().map(() => new Array(xMax).fill(ELEMENTS.AIR));
  
  for (const [path, value] of map.entries()) {
    const [x, y] = path.split(REGEX.SEPARATOR).map(Number);
    const [posX, posY] = [x - 1 <= 0 ? 0 : x - 1, y - 1 <= 0 ? 0 : y -1]; 
    grid[posY][posX] = value;
  };

  return grid.map(row => row.slice(xMin, xMax).join('')).slice(yMin, yMax).join('\n');
}

result.write(drawGrid());
console.log(counter);
result.close();