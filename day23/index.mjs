import { readFile } from 'node:fs/promises';
import { REGEX } from '../common.mjs';

const data = await readFile('./data.txt', 'utf-8');

const ELEMENTS = { ELF: '#', GROUND: '.' };

function parseInput(input) {
  return input
    .trim()
    .split(REGEX.NEWLINE)
    .map(line => line.split(''));
}

function drawGrid(grid) {
  return `\n${grid.map(row => row.join('')).join('\n')}\n`
}

function getElves(grid) {
  const result = [];

  for (const [rowIdx, row] of grid.entries()) {
    for (const [colIdx, col] of row.entries()) {
      if (col === ELEMENTS.ELF) {
        result.push([rowIdx, colIdx]);
      }
    }
  }

  return result;
}

function expandGrid(grid) {
  const newLength = grid[0].length + 2;

  return [
    Array(newLength).fill(ELEMENTS.GROUND),
    ...grid.map(row => [ELEMENTS.GROUND, ...row, ELEMENTS.GROUND]),
    Array(newLength).fill(ELEMENTS.GROUND),
  ]
}

function trimGrid(grid) {
  const result = [], cols = [];

  for (let c = 0; c < grid[0].length; c++) {
    const col = [];
    
    for (let r = 0; r < grid.length; r++) {
      col.push(grid[r][c]);
    }

    cols.push(col);
  }

  const firstRow = grid.findIndex(row => row.includes(ELEMENTS.ELF));
  const firstCol = cols.findIndex(col => col.includes(ELEMENTS.ELF));
  const lastRow = grid.findLastIndex(row => row.includes(ELEMENTS.ELF));
  const lastCol = cols.findLastIndex(col => col.includes(ELEMENTS.ELF));

  for (let r = firstRow; r <= lastRow; r++) {
    const row = [];

    for (let c = firstCol; c <= lastCol; c++) {
      row.push(grid[r][c]);
    }

    result.push(row);
  }

  return result;
}

function hasNoNeighbors(grid, row, col) {
  const neighbors = [
    [row - 1, col - 1],
    [row - 1, col],
    [row - 1, col + 1],
    [row, col - 1],
    [row, col + 1],
    [row + 1, col - 1],
    [row + 1, col],
    [row + 1, col + 1],
  ];

  return neighbors.every(([r, c]) => {
    const result = grid[r]?.[c];
    return result === undefined || result === ELEMENTS.GROUND;
  });
}

function hasNoNorthNeighbors(grid, row, col) {
  const northNeighbors = [
    [row - 1, col - 1],
    [row - 1, col],
    [row - 1, col + 1],
  ];

  return northNeighbors.every(([r, c]) => {
    const result = grid[r]?.[c];
    return result === undefined || result === ELEMENTS.GROUND;
  })
}

function hasNoSouthNeighbors(grid, row, col) {
  const southNeighbors = [
    [row + 1, col - 1],
    [row + 1, col],
    [row + 1, col + 1],
  ];

  return southNeighbors.every(([r, c]) => {
    const result = grid[r]?.[c];
    return result === undefined || result === ELEMENTS.GROUND;
  });
}

function hasNoWestNeighbors(grid, row, col) {
  const westNeighbors = [
    [row - 1, col - 1],
    [row, col - 1],
    [row + 1, col - 1],
  ];

  return westNeighbors.every(([r, c]) => {
    const result = grid[r]?.[c];
    return result === undefined || result === ELEMENTS.GROUND;
  });
}

function hasNoEastNeighbor(grid, row, col) {
  const eastNeighbors = [
    [row - 1, col + 1],
    [row, col + 1],
    [row + 1, col + 1],
  ];

  return eastNeighbors.every(([r, c]) => {
    const result = grid[r]?.[c];
    return result === undefined || result === ELEMENTS.GROUND;
  });
}

function nextTile(direction, row, col) {
  switch (direction) {
    case 'N': return [row - 1, col];
    case 'S': return [row + 1, col];
    case 'W': return [row, col - 1];
    case 'E': return [row, col + 1];
  }
}

const DIRECTIONS = ['N', 'S', 'W', 'E'];

const DIRECTION_CHECKS = [
  hasNoNorthNeighbors,
  hasNoSouthNeighbors,
  hasNoWestNeighbors,
  hasNoEastNeighbor,
];

function createSim(startingGrid) {
  let grid = startingGrid;
  let directionIdx = 0;

  return {
    getState: () => grid,
    tick() {
      grid = expandGrid(grid);
      const elves = getElves(grid);
      const moves = {};

      for (const elf of elves.filter(elf => !hasNoNeighbors(grid, ...elf))) {
        let innerDirectionIdx = directionIdx;
        let nextDirection;
        let i = 0;

        while (!nextDirection && i < DIRECTIONS.length) {
          if (DIRECTION_CHECKS[innerDirectionIdx](grid, ...elf)) {
            nextDirection = DIRECTIONS[innerDirectionIdx];
            break;
          }

          innerDirectionIdx = (innerDirectionIdx + 1) % DIRECTIONS.length;
          i++;
        }

        if (i === DIRECTIONS.length) continue;

        const key = nextTile(nextDirection, ...elf).join('-');
        if (!moves[key]) moves[key] = [];
        moves[key].push(elf);
      }

      for (const [key, [value]] of Object.entries(moves).filter(([_, elves]) => elves.length === 1)) {
        const [curRow, curCol] = value;
        const [nextRow, nextCol] = key.split(REGEX.SEPARATOR);
        grid[curRow][curCol] = ELEMENTS.GROUND;
        grid[nextRow][nextCol] = ELEMENTS.ELF;
      }

      grid = trimGrid(grid);
      directionIdx = (directionIdx + 1) % DIRECTIONS.length;
    },
  }
}

function solution1(input) {
  const startingGrid = parseInput(input);
  const sim = createSim(startingGrid);
  const ROUNDS = 10;

  for (let i = 0; i < ROUNDS; i++) sim.tick();

  const grid = sim.getState();

  return grid.reduce((acc, row) => {
    return acc + row.filter(x => x === ELEMENTS.GROUND).length;
  }, 0);
}

const firstAnswer = solution1(data);
console.log(firstAnswer);

function solution2(input) {
  const startingGrid = parseInput(input);
  const sim = createSim(startingGrid);

  let previousGrid = drawGrid(sim.getState());
  let rounds = 0;

  while (true) {
    rounds++;
    sim.tick();
    const currentGrid = drawGrid(sim.getState());
    if (currentGrid === previousGrid) break;
    previousGrid = currentGrid;
  }

  return rounds;
}

const secondAnswer = solution2(data);
console.log(secondAnswer);