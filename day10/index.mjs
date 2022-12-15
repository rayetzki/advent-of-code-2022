import { readFile } from 'node:fs/promises';
import { REGEX } from '../common.mjs';

const input = await readFile('./data.txt', { encoding: 'utf-8' });

const CHARS_PER_ROW = 40;
const CHARS_PER_COL = 6;
const PIXELS = { DARK: '.', LIT: '#' };

let cycle = 0;
let X = 1;
let breakpoint = 20;
let signalStrength = 0;
const display = new Array(CHARS_PER_COL).fill(0).map(() => new Array(CHARS_PER_ROW).fill(PIXELS.DARK));

function renderPixel() {
  const x = cycle % CHARS_PER_ROW;
  const y = Math.floor(cycle / CHARS_PER_ROW);
  display[y][x] = (x >= X - 1 && x <= X + 1) ? PIXELS.LIT : PIXELS.DARK; 
}

for (const signal of input.split(REGEX.NEWLINE)) {
  const [type, value] = signal.split(REGEX.SPACE);
  
  switch (type) {
    case "noop": {
      renderPixel();
      cycle++;
      
      if (cycle !== breakpoint) break;
      signalStrength += breakpoint * X;
      breakpoint += CHARS_PER_ROW;      
      break;
    }
    
    case "addx": {
      for (let i = 1; i <= 2; i++) {
        renderPixel();
        cycle++;

        if (cycle !== breakpoint) continue;
        signalStrength += breakpoint * X;
        breakpoint += CHARS_PER_ROW;
      }

      X += Number(value);
      break;
    }
  }
}

console.log({ signalStrength });
console.log(display.map(line => line.join('')).join(REGEX.NEWLINE));
