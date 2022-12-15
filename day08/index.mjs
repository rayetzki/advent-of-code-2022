import { readFile } from 'node:fs/promises';
import { REGEX } from '../common.mjs';

const input = await readFile('./data.txt', { encoding: 'utf-8' });
const scheme = input.split(REGEX.NEWLINE);

const cols = scheme[0].length;
const rows = scheme.length;

let visibleTrees = 2 * (cols + rows) - 4;
const scenicScores = new Map();

function countVisibleTrees(trees, current) {
  return (trees.findIndex(tree => tree >= current) + 1) || trees.length;
}

for (let col = 1; col < cols - 1; col++) {
  for (let row = 1; row < rows - 1; row++) {
    const current = +scheme[col][row];
    const upTrees = [];
    const downTrees = [];
    const leftTrees = [];
    const rightTrees = [];

    for (let up = col - 1; up >= 0; up--) {
      upTrees.push(+scheme[up][row]);    
    }
    
    for (let down = col + 1; down < rows; down++) {
      downTrees.push(+scheme[down][row]);
    }

    for (let left = row - 1; left >= 0; left--) {
      leftTrees.push(+scheme[col][left]);
    }

    for (let right = row + 1; right < cols; right++) {
      rightTrees.push(+scheme[col][right]);
    }
    
    const isVisible = (
      upTrees.every(tree => tree < current) ||
      downTrees.every(tree => tree < current) ||
      leftTrees.every(tree => tree < current) ||
      rightTrees.every(tree => tree < current)
    );

    if (isVisible) {
      const visibleUpTrees = countVisibleTrees(upTrees, current);
      const visibleDownTrees = countVisibleTrees(downTrees, current);
      const visibleLeftTrees = countVisibleTrees(leftTrees, current);
      const visibleRightTrees = countVisibleTrees(rightTrees, current);
      const score = visibleUpTrees * visibleDownTrees * visibleLeftTrees * visibleRightTrees;
      scenicScores.set([col, row], score);
      visibleTrees++;
    };
  }
}

const maxScenicScore = Math.max(...[...scenicScores.values()]);

console.log({ visibleTrees, maxScenicScore });