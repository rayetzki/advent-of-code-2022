import { readFile } from 'node:fs/promises';
import { REGEX } from '../common.mjs';

const input = await readFile('./data.txt', 'utf8');

const FACINGS = ['>', 'v', '<', '^'];
const TURNS = {
  '>': {
    L: '^',
    R: 'v',
  },
  'v': {
    L: '>',
    R: '<',
  },
  '<': {
    L: 'v',
    R: '^',
  },
  '^': {
    L: '<',
    R: '>',
  }
};

const ELEMENTS = { TILE: '.', WALL: '#', AIR: '0' };
const [map, key] = input.trimEnd().split(REGEX.DOUBLE_NEWLINE);
const longestRow = Math.max(...map.split(REGEX.NEWLINE).map(row => row.length));
const road = map.split(REGEX.NEWLINE).map(x => x.replace(REGEX.SPACE, ELEMENTS.AIR).padEnd(longestRow, ELEMENTS.AIR).split(''));
const moves = [...key.matchAll(/[0-9]+|[a-z]/ig)].flat().map(char => REGEX.NUMS.test(char) ? +char : char);

function turn(facing, direction) {
  return FACINGS.findIndex(f => f === TURNS[FACINGS[facing]][direction]); 
}

function isNotVoid(cell) {
  return cell !== ELEMENTS.AIR;
}

function getNextTile(direction, [row, col]) {
  switch (direction) {
    case 0: return [row, col + 1];
    case 1: return [row + 1, col];
    case 2: return [row, col - 1];
    case 3: return [row - 1, col];
  }
}

function wrapAround(board, direction, [row, col]) {
  switch (direction) {
    case 0: {
      const newCol = board[row].findIndex(isNotVoid);
      return [row, newCol];
    }

    case 1: {
      const newRow = board.map(row => row[col]).findIndex(isNotVoid);
      return [newRow, col];
    }

    case 2: {
      const newCol = board[row].findLastIndex(isNotVoid);
      return [row, newCol];
    }

    case 3: {
      const newRow = board.map(row => row[col]).findLastIndex(isNotVoid);
      return [newRow, col];
    }
  }
}

function run(grid) {
  let facing = 0;
  let [row, col] = [0, road[0].findIndex(char => char === ELEMENTS.TILE)];

  for (const value of moves) {
    if (Number.isInteger(value)) {
      let steps = value;

      while (steps > 0) {
        road[row][col] = FACINGS[facing];
        const [nextTileRow, nextTileCol] = getNextTile(facing, [row, col]);
        const nextTile = grid[nextTileRow]?.[nextTileCol];
        
        if (nextTile === ELEMENTS.WALL) break;
        else if (!nextTile || nextTile === ELEMENTS.AIR) {
          const [nextWrapRow, nextWrapCol] = wrapAround(road, facing, [nextTileRow, nextTileCol]);
          const nextTileWrapped = road[nextWrapRow]?.[nextWrapCol];
          if (nextTileWrapped === ELEMENTS.WALL) break;
          [row, col] = [nextWrapRow, nextWrapCol];  
        } else {
          [row, col] = [nextTileRow, nextTileCol];
        }

        steps--;
      };
    } else {
      // turn 90 degrees L or R, tile stays the same
      facing = turn(facing, value);
    }
  }

  return [[row, col], facing];
}

const [[row, col], facing] = run(road);
const part1 = 1000 * (row + 1) + 4 * (col + 1) + facing;

console.log({ part1 })


