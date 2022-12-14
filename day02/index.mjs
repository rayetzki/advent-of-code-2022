import { readFile } from 'node:fs/promises';
import { REGEX } from '../common.mjs';

const input = await readFile('./data.txt', { encoding: 'utf-8' });

const choiceScore = {
  'X': 1, // Rock
  'Y': 2, // Paper
  'Z': 3  // Scissors
};

const outcomeScore = {
  'W': 6,
  'D': 3,
  'L': 0,
}

const strategies = input.split(REGEX.NEWLINE).map(x => x.split(REGEX.SPACE));

const totalScoreFollowed = strategies.reduce((score, [opp, you]) => {
  if ((opp === 'C' && you === 'X') || (opp === 'B' && you === 'Z') ||  (opp === 'A' && you === 'Y')) { // Win variant
    return score + choiceScore[you] + outcomeScore['W'];
  } else if ((opp === 'A' && you === 'X') || (opp === 'B' && you === 'Y') || (opp === 'C' && you === 'Z')) {  // Draw variant
    return score + choiceScore[you] + outcomeScore['D'];
  } else {   // Loss
    return score + choiceScore[you] + outcomeScore['L'];
  }
}, 0);

// X means you need to lose, Y means you need to end the round in a draw, and Z means you need to win

const totalScoreAdjusted = strategies.reduce((score, [opp, outcome]) => {
  if (opp === 'A') {
    if (outcome === 'X') {
      return score + choiceScore['Z'] + outcomeScore['L']; 
    } else if (outcome === 'Y') {
      return score + choiceScore['X'] + outcomeScore['D'];
    } else {
      return score + choiceScore['Y'] + outcomeScore['W'];
    }
  } else if (opp === 'B') {
    if (outcome === 'X') {
      return score + choiceScore['X'] + outcomeScore['L']; 
    } else if (outcome === 'Y') {
      return score + choiceScore['Y'] + outcomeScore['D'];
    } else {
      return score + choiceScore['Z'] + outcomeScore['W'];
    }
  } else if (opp === 'C') {
    if (outcome === 'X') {
      return score + choiceScore['Y'] + outcomeScore['L']; 
    } else if (outcome === 'Y') {
      return score + choiceScore['Z'] + outcomeScore['D'];
    } else {
      return score + choiceScore['X'] + outcomeScore['W'];
    }
  }
}, 0);

console.log({ totalScoreFollowed, totalScoreAdjusted });