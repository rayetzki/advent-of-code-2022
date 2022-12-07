import { readFile } from 'node:fs/promises';

const input = await readFile('./data.txt', { encoding: 'utf-8' });

