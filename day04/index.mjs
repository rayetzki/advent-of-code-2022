import { readFile } from 'node:fs/promises';

const input = await readFile('./data.txt', { encoding: 'utf-8' });

const fullOverlapCount = input.split('\n').reduce((count, pair) => {
  const [[low1, high1], [low2, high2]] = pair.split(',').map(range => [...range.split('-')].map(Number));
  const firstOverlaps = (low1 <= low2) && (high1 >= high2);
  const secondOverlaps = (low2 <= low1) && (high2 >= high1);
  if (firstOverlaps || secondOverlaps) return count + 1;
  return count;
}, 0);

const overlapAtAllCount = input.split('\n').reduce((count, pair) => {
  const [[low1, high1], [low2, high2]] = pair.split(',').map(range => [...range.split('-')].map(Number));
  if (high1 >= low2 && low1 <= high2) return count + 1;
  return count;
}, 0);

console.log({ fullOverlapCount, overlapAtAllCount });