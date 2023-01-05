import { createWriteStream } from 'node:fs';
import { readFile } from 'node:fs/promises';

const input = await readFile('./data.txt', 'utf8');
const result = createWriteStream('./result.txt', { encoding: 'utf-8' });

// --- Day 17: Pyroclastic Flow ---
const ROCKS = [
  [['@', '@', '@', '@']],
  [
    ['.', '@', '.'],
    ['@', '@', '@'],
    ['.', '@', '.'],
  ],
  [
    ['.', '.', '@'],
    ['.', '.', '@'],
    ['@', '@', '@'],
  ],
  [
    ['@'],
    ['@'],
    ['@'],
    ['@'],
  ],
  [
    ['@', '@'],
    ['@', '@'],
  ],
];

const DIRECTIONS = {
  LEFT: '<',
  RIGHT: '>',
  DOWN: 'v',
};

const getEmptyRow = () => new Array(7).fill('.');

function drawResult(grid) {
  const FLOOR = '+-------+';
  return `${grid.map(row => `|${row.join('')}|`).concat([FLOOR]).join('\n')}`;
}

function detectCollision(grid, [rowIdx, colIdx], rock) {
  if (colIdx < 0 || colIdx + rock[0].length > grid[0].length) return true;

  for (const [rockRowIdx, row] of rock.entries()) {
    for (const [rockColIdx, item] of row.entries()) {
      if (item === '.') continue;
      if (grid[rowIdx + rockRowIdx]?.[colIdx + rockColIdx] !== '.') {
        return true;
      }
    }
  }

  return false;
}

function applyMove([row, col], move) {
  if (move === DIRECTIONS.LEFT) {
    return [row, col - 1];
  } else if (move === DIRECTIONS.RIGHT) {
    return [row, col + 1];
  } else if (move === DIRECTIONS.DOWN) {
    return [row + 1, col];
  };
}

function* getMove(moves) {
  for (let i = 0; true; i++) {
    yield moves[i % moves.length];
  }
}

function* getRock() {
  for (let i = 0; true; i++) {
    yield ROCKS[i % ROCKS.length];
  }  
}

function simulate() {
  let grid = [];
  let round = 0;
  const nextMove = getMove(input.trim().split(''));
  const nextRock = getRock();
  
  return {
    getState() {
      return {
        grid, 
        round
      }
    },
    
    sim() {
      round++;
      const rock = nextRock.next().value;
      
      grid.unshift(getEmptyRow(), getEmptyRow(), getEmptyRow());
      grid.unshift(...Array(rock.length).fill().map(getEmptyRow));
    
      const lastRockPosition = [0, 2];
    
      while (true) {
        const move = nextMove.next().value;
        const afterPush = applyMove(lastRockPosition, move);
    
        if (!detectCollision(grid, afterPush, rock)) {
          lastRockPosition[0] = afterPush[0];
          lastRockPosition[1] = afterPush[1];
        }
    
        const afterFall = applyMove(lastRockPosition, DIRECTIONS.DOWN);
    
        if (detectCollision(grid, afterFall, rock)) break;
        
        lastRockPosition[0] = afterFall[0];
        lastRockPosition[1] = afterFall[1];
      }
    
      const [lastRockRow, lastRockCol] = lastRockPosition;
      for (const [rowIdx, row] of rock.entries()) {
        for (const [colIdx, col] of row.entries()) {
          const current = grid[rowIdx + lastRockRow][colIdx + lastRockCol];
          const next = current === '.' ? col : current;
          grid[rowIdx + lastRockRow][colIdx + lastRockCol] = next;
        }
      }
      
      grid = grid
        .map(row => row.map(x => (x === '@' ? '#' : x)))
        .filter(row => row.some(x => x !== '.'))
      
      return { round, grid };
    }
  } 
 }
 
// First part
function part1() {
  const ROUNDS = 2022;
  const simulator = simulate();
  
  while (simulator.getState().round < ROUNDS) {
    simulator.sim();
  }

  const grid = simulator.getState().grid;
  const towerHeight = grid.length;
  result.write(drawResult(grid));
  console.log({ towerHeight });
}

function part2() {
  // TODO
}

part1();