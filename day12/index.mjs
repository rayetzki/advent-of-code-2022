import { readFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';

const NEWLINE = /\n/g;

const { values: { backwards } } = parseArgs({ 
  options: { 
    'backwards': { 
      type: 'boolean',
      short: 'b',
    }, 
  },
  tokens: true,
});

const MARKERS = {
  UP: '^',
  DOWN: '∨',
  LEFT: '<',
  RIGHT: '>',
  BLANK: '.',
  START: 'S',
  END: 'E',
};

const input = await readFile('./data.txt', { encoding: 'utf-8' });
const { length: width } = input.split(/\n/g)[0];

// Map here is already processed into a map of heights
const map = input
  .replaceAll(MARKERS.START, "a")
  .replaceAll(MARKERS.END, "z")
  .split(NEWLINE)
  .map(line => line.split('').map(char => char.charCodeAt(0) - 97));

// Looking for a start point
const start = {
  x: input.replaceAll(NEWLINE, '').indexOf(MARKERS.START) % width,
  y: Math.floor(input.replaceAll(NEWLINE, '').indexOf(MARKERS.START) / width),
};

// Looking for an end point
const end = {
  x: input.replaceAll(NEWLINE, '').indexOf(MARKERS.END) % width,
  y: Math.floor(input.replace(NEWLINE, '').indexOf(MARKERS.END) / width),
};

const id = ({ x, y }) => `(${x}, ${y})`;
const visited = new Set();
const foundPaths = [];
let queue = [
  { path: [], point: { ...(backwards ? end : start) } },
];

while (queue.length > 0) {
  const { path, point } = queue.shift();
  const pathId = id(point);

  // If we are already at the end point we can break the loop, the path is found
  if (backwards ? (map[point.y][point.x] === 0) : (point.y === end.y && point.x === end.x)) {
    foundPaths.push(path);
    break;
  }

  // Or, if we already been here, just skip this iteration
  if (visited.has(pathId)) continue;

  // Points we can go to
  const neighbours = [
    { x: point.x - 1, y: point.y },
    { x: point.x + 1, y: point.y },
    { x: point.x, y: point.y - 1 },
    { x: point.x, y: point.y + 1 },
  ];

  // But not all of them are traversable, because of height threshold
  // Add candidates to the queue with the path they've been through
  queue = queue.concat(
    neighbours.filter(p => (
      backwards 
        ? map[p.y] && map[p.y][p.x] >= map[point.y][point.x] - 1 
        : map[p.y] && map[p.y][p.x] <= map[point.y][point.x] + 1
      ))
    .map((p) => ({ point: p, path: path.concat([{ ...point }]) }))
);

  visited.add(pathId);
}

console.log(foundPaths[0].length);