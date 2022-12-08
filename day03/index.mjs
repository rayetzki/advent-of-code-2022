import { readFile } from 'node:fs/promises';

const input = await readFile('./data.txt', { encoding: 'utf-8' });

const PRIORITIES = {
  'a': 1,
  'b': 2,
  'c': 3,
  'd': 4,
  'e': 5,
  'f': 6,
  'g': 7,
  'h': 8,
  'i': 9,
  'j': 10,
  'k': 11,
  'l': 12,
  'm': 13,
  'n': 14,
  'o': 15,
  'p': 16,
  'q': 17,
  'r': 18,
  's': 19,
  't': 20,
  'u': 21,
  'v': 22,
  'w': 23,
  'x': 24,
  'y': 25,
  'z': 26,
  'A': 27,
  'B': 28,
  'C': 29,
  'D': 30,
  'E': 31,
  'F': 32,
  'G': 33,
  'H': 34,
  'I': 35,
  'J': 36,
  'K': 37,
  'L': 38,
  'M': 39,
  'N': 40,
  'O': 41,
  'P': 42,
  'Q': 43,
  'R': 44,
  'S': 45,
  'T': 46,
  'U': 47,
  'V': 48,
  'W': 49,
  'X': 50,
  'Y': 51,
  'Z': 52
};


function findCommon(first, second) {
  let common;

  for (const char of first) {
    for (const defendant of second) {
      if (char !== defendant) continue;
      common = char;
    }
  }

  return common;
}

const lines = input.split('\n');

const prioritiesSum = lines.reduce((sum, item) => {
  const breakpoint = item.length / 2;
  const compartments = [item.slice(0, breakpoint), item.slice(breakpoint)];
  const common = findCommon(...compartments);
  return sum + PRIORITIES[common];
}, 0);

function findCommonInGroup(first, second, third) {
  let common;

  for (const i of first) {
    for (const j of second) {
      for (const k of third) {
        if (i !== j || i !== k) continue;
        common = i;
      }
    }
  }

  return common;
}

let groupsSum = 0;

for (let i = 0; i < lines.length; i += 3) {
  const elves = [lines[i], lines[i + 1], lines[i + 2]];
  const common = findCommonInGroup(...elves);
  groupsSum += PRIORITIES[common];
}

console.log({ prioritiesSum, groupsSum });