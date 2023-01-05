import { readFile } from 'node:fs/promises';
import { REGEX } from '../common.mjs';

const input = await readFile('./data.txt', 'utf8');
const part1 = input.split(REGEX.NEWLINE).map(Number);

function mix(arr, times = 1) {  
  const list = arr.map((num, index) => ({ num, index }));

  do {
    for (const [index, num] of arr.entries()) {
      const id = list.findIndex(num => num.index === index);
      list.splice(id, 1);
      list.splice((num + id) % list.length, 0, { num, index });
    }
  } while (--times > 0);

  return list;
}

function getGroveCoordinates(list) {
  const zeroIndex = list.findIndex(({ num }) => num === 0);
  return [1000, 2000, 3000].reduce((acc, num) => acc + list[(num + zeroIndex) % list.length].num, 0);
}

const list = mix(part1);
console.log(getGroveCoordinates(list));

// Part 2
const DECRYPTION_KEY = 811589153;
const MIX_TIMES = 10;

const part2 = input.split(REGEX.NEWLINE).map(num => Number(num) * DECRYPTION_KEY);
const list2 = mix(part2, MIX_TIMES);
console.log(getGroveCoordinates(list2));