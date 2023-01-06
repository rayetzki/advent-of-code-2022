import { readFile } from 'node:fs/promises';
import { REGEX } from '../common.mjs';

const input = await readFile('./data.txt', 'utf8');

const SNAFU = { '-': -1, '=': -2 };

function snafuToDecimal(snafu) {
  return [...snafu]
    .map((char, index) => ({
      place: Math.pow(5, snafu.length - 1 - index), 
      num: Number.isNaN(+char) ? SNAFU[char] : +char,
    }))
    .map(({ place, num }) => place * num)
    .reduce((acc, x) => acc + x, 0);
}

function decimalToSnafu(decimal) {  
  if (decimal === 0) return '';

  const remainder = decimal % 5;
  const floored = Math.floor(decimal / 5);

  switch (remainder) {
    case 0:
    case 1:
    case 2: return decimalToSnafu(floored) + String(remainder);
    case 3: return decimalToSnafu(floored + 1) + '=';
    case 4: return decimalToSnafu(floored + 1) + '-';
  }

  return decimalToSnafu(decimal);
}

const sum = input.split(REGEX.NEWLINE).reduce((acc, snafu) => acc + snafuToDecimal(snafu), 0);

console.log(decimalToSnafu(sum));