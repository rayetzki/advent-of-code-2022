import { readFile } from 'node:fs/promises';

const rawInput = await readFile('./data.txt', { encoding: 'utf-8' });