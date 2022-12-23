import { readFile } from 'node:fs/promises';
import { REGEX } from '../common.mjs';

const input = await readFile('./data.txt', { encoding: 'utf-8' });

const Y = 2_000_000;
const DISTRESS_BEACON = { min: 0, max: 4_000_000 };

const regex = /Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)/;

function tuningFrequency({ x, y }) {
  return x * DISTRESS_BEACON.max + y;
}

function manhattanDistance(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

const data = input.split(REGEX.NEWLINE).map(line => {
  const [_, sensorX, sensorY, beaconX, beaconY] = line.match(regex);
  const sensor = { x: +sensorX, y: +sensorY };
  const beacon = { x: +beaconX, y: +beaconY };
  const distance = manhattanDistance(sensor, beacon);
  return { sensor, beacon, distance };
});

// Part 1

const cannotContainDistressBeacon = new Set();
const beaconsOnLine = new Set(); 

for (const { sensor, beacon, distance: distanceToBeacon } of data) {
  if (beacon.y === Y) beaconsOnLine.add(beacon.x);
  // calculate distance to the line , skip if is sensor is not in the zone for Y
  const distanceToLine = manhattanDistance(sensor, { x: sensor.x, y: Y });
  if (distanceToLine > distanceToBeacon) continue;
  const dx = distanceToBeacon - distanceToLine;
  for (let x = sensor.x - dx; x <= sensor.x + dx; x++) {
    cannotContainDistressBeacon.add(x);
  }
}

console.log(cannotContainDistressBeacon.size - beaconsOnLine.size);

// Part 2
const posLines = [], negLines = [];

for (const { sensor, distance } of data) {
  posLines.push(sensor.x - sensor.y - distance, sensor.x - sensor.y + distance);
  negLines.push(sensor.x + sensor.y - distance, sensor.x + sensor.y + distance);
}

let neg, pos;

for (let i = 0; i < posLines.length; i++) {
  for (let j = i + 1; j < negLines.length; j++) {
    const [posA, posB] = [posLines[i], posLines[j]];
    const [negA, negB] = [negLines[i], negLines[j]];

    if (Math.abs(posA - posB) === 2) {
      pos = Math.min(posA, posB) + 1;
    };

    if (Math.abs(negA - negB) === 2) {
      neg = Math.min(negA, negB) + 1;
    };
  }
} 


const x = (pos + neg) / 2;
const y = (neg - pos) / 2;

console.log(tuningFrequency({ x, y }));