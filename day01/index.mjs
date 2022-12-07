import { readFile } from 'node:fs/promises';

const input = await readFile('./data.txt', { encoding: 'utf-8' });

const elvesJournal = input.split('\n').reduce((acc, value, index, array) => {
  if (value === '' && array[index + 1]) {
    acc.push([]);
  } else if (acc.length === 0) {
    acc.push([Number(value)]);
  } else {
    acc.at(-1).push(Number(value));
  };

  return acc;
}, []);

const elvesTotals = elvesJournal.map(elf => elf.reduce((acc, x) => acc + x, 0));

const maxCaloriesCarried = Math.max(...elvesTotals);

const topThree = elvesTotals
  .sort((a, b) => b - a)
  .slice(0, 3);

const topThreeTotal = topThree.reduce((acc, x) => acc + x, 0);

console.log({ maxCaloriesCarried, topThreeTotal });