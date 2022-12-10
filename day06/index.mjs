import { readFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';

const input = await readFile('./data.txt', { encoding: 'utf-8' });

const { values } = parseArgs({ 
  options: { 
    'step': { 
      type: 'string',
    }, 
  },
  tokens: true,
});

const STEP = Number(values.step);

for (let i = 0, charactersProcessed = 0;  i < input.length; i++, charactersProcessed = i + STEP) {  
  const str = input.slice(i, i + STEP);
  if (new Set(str).size === str.length) {
    console.log(charactersProcessed);
    break;
  };
}