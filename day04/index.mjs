import { readFile } from 'node:fs/promises';
import { REGEX } from '../common.mjs';

const input = await readFile('./data.txt', { encoding: 'utf-8' });

const fullOverlapCount = input.split(REGEX.NEWLINE).reduce((count, pair) => {
  const [[low1, high1], [low2, high2]] = pair.split(REGEX.COMMA).map(range => range.split(REGEX.SEPARATOR).map(Number));
  const firstOverlaps = (low1 <= low2) && (high1 >= high2);
  const secondOverlaps = (low2 <= low1) && (high2 >= high1);
  if (firstOverlaps || secondOverlaps) return count + 1;
  return count;
}, 0);

const overlapAtAllCount = input.split(REGEX.NEWLINE).reduce((count, pair) => {
  const [[low1, high1], [low2, high2]] = pair.split(REGEX.SEPARATOR).map(range => range.split(REGEX.SEPARATOR).map(Number));
  if (high1 >= low2 && low1 <= high2) return count + 1;
  return count;
}, 0);

console.log({ fullOverlapCount, overlapAtAllCount });