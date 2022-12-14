import { readFile } from 'node:fs/promises';
import { REGEX } from '../common.mjs';

const input = await readFile('./data.txt', { encoding: 'utf-8' });

// const MAX_DIR_SIZE = 100_000;
const MAX_SPACE = 70_000_000;
const SPACE_FOR_UPDATE = 30_000_000;

const ROOT = '/';

const root = {
  prev: null,
  name: ROOT,
  path: ROOT,
  size: 0,
  files: [],
};

let currentDir = root, dirSizes = new Map();

for (const command of input.split(REGEX.NEWLINE)) {
  const cmdEntries = command.split(REGEX.SPACE);

  if (cmdEntries[1] === 'cd') {
    const destination = cmdEntries.at(-1);
    if (root.name === destination) {
      currentDir = root;
      continue;
    } else if (destination === '..') {
      currentDir = currentDir.prev ?? root;
      continue;
    };

    const dirToChange = currentDir.files.find(file => file.name === destination);
    if (!dirToChange) continue;
    currentDir = dirToChange;
  } else if (cmdEntries[0] === 'dir') { // is directory
    currentDir.files.push({
      name: cmdEntries[1],
      size: 0,
      files: [],
      prev: currentDir,
      path: currentDir.path + `${cmdEntries[1]}/`,
    });
  } else if (Number.isInteger(+cmdEntries[0])) { // is file
    const [sizeStr, name] = cmdEntries;
    const size = Number(sizeStr) || 0;
    const path = currentDir.path + `${name}/`;
    currentDir.files.push({ name, size, path });
    // recalculate sizes
    let parent = currentDir;
    while (parent) {
      parent.size = parent.files.reduce((total, file) => total + file.size, 0);
      dirSizes.set(parent.path, parent.size);
      parent = parent.prev;
    }
  }
}

const usedSpace = root.size;
const unusedSpace = MAX_SPACE - usedSpace;
const neededSpace = SPACE_FOR_UPDATE - unusedSpace;
const queue = [root];

let directoryToRemove = root;

while (queue.length > 0) {
  const dir = queue.shift();
  queue.push(...dir.files.filter(file => Object.hasOwn(file, 'files')));

  if (dir.size > neededSpace && dir.size < directoryToRemove.size) {
    directoryToRemove = dir;
  } 
}

console.log(directoryToRemove.size);