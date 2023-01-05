import { readFile } from 'node:fs/promises';
import { REGEX } from '../common.mjs';

const input = await readFile('./data.txt', 'utf8');

const records = input.split(REGEX.NEWLINE).reduce((monkeys, line) => {
  const [_, monkey, record] = line.match(/([a-z]+): (.+)/);

  if (Number.isNaN(+record)) {
    const [_, first, operator, second] = record.match(/(.+) ([+-/*]) (.+)/);
    monkeys.set(monkey, { operator, operands: [first, second] });
  } else {
    monkeys.set(monkey, +record);
  }
  
  return monkeys;
}, new Map());

function applyOperation(operator, args) {
  switch (operator) {
    case '*': return args[0] * args[1];
    case '/': return args[0] / args[1];
    case '+': return args[0] + args[1];
    case '-': return args[0] - args[1];
    default: throw new Error('Unknown operation', operator);
  }
}

const TARGET = 'root';
const { operator, operands } = records.get(TARGET);

function solve(args) {
  if (Number.isInteger(args)) return args;
  return applyOperation(args.operator, args.operands.map(o => solve(records.get(o))));
}

const part1 = applyOperation(operator, operands.map(o => solve(records.get(o))));
console.log(part1);

//TODO
const part2;