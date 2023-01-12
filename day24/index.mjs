import { readFile } from 'node:fs/promises';
import { REGEX } from '../common.mjs';

const input = await readFile('./data.txt', 'utf8');

const DIRECTIONS = {
  RIGHT: '>',
  LEFT: '<',
  DOWN: 'v',
  UP: '^'
};

const ELEMENTS = {
  AIR: '.',
  BORDER: '#',
};

function isNotWall(chars) {
  return !chars.includes(ELEMENTS.BORDER);
}

function drawMaze(maze) {
  return maze.map(line => line.map(chars => chars.length > 1 ? chars.length : chars[0]).join('')).join('\n');
}

function strToMaze(str) {
  return str.trim().split(REGEX.NEWLINE).map(line => line.split(''));
}

function getBlizzards(maze) {
  const result = [];
  const directions = Object.values(DIRECTIONS);

  for (const [rowIdx, row] of maze.entries()) {
    for (const [colIdx, col] of row.entries()) {
      const blizzards = col.filter(item => directions.includes(item));
      blizzards.forEach(blizzard => result.push([blizzard, rowIdx, colIdx]));
    }
  }

  return result;
}

function getNextTile(direction, [row, col]) {
  switch (direction) {
    case DIRECTIONS.UP: return [row - 1, col];
    case DIRECTIONS.RIGHT: return [row, col + 1];
    case DIRECTIONS.DOWN: return [row + 1, col];
    case DIRECTIONS.LEFT: return [row, col - 1];
  }
}

function wrapAround(maze, char, [row, col]) {
  switch (char) {
    case DIRECTIONS.UP: {
      const nextRow = maze.map(row => row[col]).findLastIndex(isNotWall);
      return [nextRow, col];
    }

    case DIRECTIONS.RIGHT: {
      const nextCol = maze[row].findIndex(isNotWall);
      return [row, nextCol];
    }

    case DIRECTIONS.DOWN: {
      const nextRow = maze.map(row => row[col]).findIndex(isNotWall);
      return [nextRow, col];
    }

    case DIRECTIONS.LEFT: {
      const nextCol = maze[row].findLastIndex(isNotWall);
      return [row, nextCol];
    }
  }
}

function removeOneDirection(arr, direction) {
  const result = [];

  let filtered = false;
  while (arr.length > 0) {
    const item = arr.pop();

    if (!filtered && item === direction) {
      filtered = true;
      continue;
    }

    result.push(item);
  }

  return result;
}

function createSim(startingMaze) {
  let maze = [...startingMaze.map(row => [...row])]

  return {
    getState() {
      return maze;
    },
    tick() {
      const blizzards = getBlizzards(maze);

      blizzards.forEach(blizzard => {
        const [direction, row, col] = blizzard;
        let [nextTileRow, nextTileCol] = getNextTile(direction, [row, col]);

        if (!isNotWall(maze[nextTileRow][nextTileCol])) {
          [nextTileRow, nextTileCol] = wrapAround(maze, direction, [row, col]);
        }

        maze[row][col] = removeOneDirection(maze[row][col], direction);
        maze[nextTileRow][nextTileCol].push(direction);
      });

      maze = maze.map(row => row.map(col => {
        if (col.length === 0) return [ELEMENTS.AIR];
        if (col.length === 1) return col;
        return col.filter(x => x !== ELEMENTS.AIR);
      }));
    },
  }
}

function getSimulationResults(simulator, modulo) {
  const simulations = [];

  for (let i = 0; i <= modulo; i++) {
    const maze = drawMaze(simulator.getState());
    simulations.push(maze);
    simulator.tick();
  }

  return simulations;
}

function getNextNodes([row, col], simulations, minutes) {
  const maze = strToMaze(simulations[minutes]);
  return [
    [row - 1, col],
    [row, col - 1],
    [row, col],
    [row, col + 1],
    [row + 1, col],
  ].filter(([r, c]) => maze[r]?.[c] === ELEMENTS.AIR);
}

function walkMaze([from, to], initialMinute, simulations, modulo) {
  const queue = [];
  const visited = new Set();
  queue.push([from, initialMinute]);

  while (queue.length > 0) {
    const item = queue.shift();
    const [[row, col], minutes] = item;

    if (row === to[0] && col === to[1]) return minutes;

    for (const node of getNextNodes([row, col], simulations, (minutes + 1) % modulo)) {
      const key = `${node.join('-')}-${(minutes + 1) % modulo}`;
      if (visited.has(key)) continue;
      queue.push([node, minutes + 1]);
      visited.add(key);
    }
  }

  return -1;
}

const maze = input.split(REGEX.NEWLINE).map(line => line.split('').map(char => [char]));
const start = [0, maze[0].findIndex(el => el.includes(ELEMENTS.AIR))];
const end = [maze.length - 1, maze.at(-1).findIndex(el => el.includes(ELEMENTS.AIR))];
const modulo = (maze[0].length - 2) * (maze.length - 2);

const simulator = createSim(maze);
const simulationResults = getSimulationResults(simulator, modulo);
const part1 = walkMaze([start, end], 0, simulationResults, modulo);

console.log({ part1 });

const toStart = walkMaze([end, start], part1, simulationResults, modulo);
const backAgain = walkMaze([start, end], toStart, simulationResults, modulo);
console.log({ part2: backAgain });