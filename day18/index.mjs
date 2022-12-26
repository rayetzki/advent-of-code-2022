import { readFile } from 'node:fs/promises';
import { REGEX } from '../common.mjs';

const input = await readFile('./data.txt', { encoding: 'utf-8' });

const cubes = new Set(input.split(REGEX.NEWLINE));
const offsets = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];

const allValues = [...cubes.values()].map(line => line.split(REGEX.SEPARATOR).map(Number));
const xses = [...allValues.map(line => line[0])];
const ys = [...allValues.map(line => line[1])];
const zs = [...allValues.map(line => line[2])];

const [minX, maxX] = [Math.min(...xses), Math.max(...xses)];
const [minY, maxY] = [Math.min(...ys), Math.max(...ys)];
const [minZ, maxZ] = [Math.min(...zs), Math.max(...zs)];

function canGetOut(cube) {
  const queue = [cube];
  const seen = new Set();
  
  while (queue.length > 0) {
    const [x, y, z] = queue.pop();
    const id = [x, y, z].join();
    
    if (seen.has(id)) continue;
    seen.add(id);
    if (cubes.has(id)) continue;

    if (
      x > maxX || x < minX || y > maxY || 
      y < minY || z > maxZ || z < minZ
    ) return true; 

    for (const [dx, dy, dz] of offsets) {
      queue.push([x + dx, y + dy, z + dz]);
    }
  }

  return false;
}

let surfaceCount = 0, airDropsCount = 0;

for (const cube of cubes) {
  const [x, y, z] = cube.split(REGEX.SEPARATOR).map(Number);
  
  for (const [dx, dy, dz] of offsets) {
    const sides = [x + dx, y + dy, z + dz];

    // part 1
    if (cubes.has(sides.join())) continue;
    surfaceCount++;
    
    // part 2
    if (!canGetOut(sides)) continue;
    airDropsCount++;
  }
}

console.log({ surfaceCount, airDropsCount });