import { readFile } from 'node:fs/promises';
import { REGEX } from '../common.mjs';

const input = await readFile('./data.txt', { encoding: 'utf-8' });

const dividerPackets = [[[2]], [[6]]];

function comparePairs(left, right) {
  if (Number.isInteger(left) && Number.isInteger(right)) {
    if (left < right) return true;
    else if (left  === right) return undefined;
    return false;
  } else if (Array.isArray(left) && Array.isArray(right)) {
    for (let i = 0; i < left.length; i++) {
      const status = comparePairs(left[i], right[i]);
      if (status === undefined) continue;
      return status;
    }
    return comparePairs(left.length, right.length);
  } else if (Number.isInteger(left) && (right instanceof Object)) {
    return comparePairs([left], right);
  } else if (Number.isInteger(right) && (left instanceof Object)) {
    return comparePairs(left, [right]);
  } else return false;
}

const indicesSum = input
  .split(REGEX.DOUBLE_NEWLINE)
  .reduce((sum, pair, index) => {
    const [left, right] = pair.split(REGEX.NEWLINE);
    return comparePairs(JSON.parse(left), JSON.parse(right)) !== false ? (sum + index + 1) : sum;
  }, 0);

const decoderKey = input.split(REGEX.DOUBLE_NEWLINE)
  .flatMap(pair => pair.split(REGEX.NEWLINE).map(packet => JSON.parse(packet)))
  .concat(dividerPackets)
  .sort((a, b) => comparePairs(a, b) ? -1 : 1)
  .reduce((acc, packet, index) => dividerPackets.includes(packet) ? acc * (index + 1) : acc, 1);
  
console.log({ decoderKey, indicesSum })