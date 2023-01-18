import { readFile } from 'node:fs/promises';
import { REGEX } from '../common.mjs';

const data = await readFile('./data.txt', 'utf-8');

const regex = /Blueprint ([0-9]+): Each ore robot costs ([0-9]) ore. Each clay robot costs ([0-9]) ore. Each obsidian robot costs ([0-9]) ore and ([0-9]+) clay. Each geode robot costs ([0-9]) ore and ([0-9]+) obsidian./;

const blueprints = data.split(REGEX.NEWLINE).map(line => {
  const [_, index, oreBotCost, clayBotCost, obsidianBotOre, obsidianBotClay, geodeBotOre, geodeBotObsidian] = line.match(regex);
  return {
    name: `Blueprint ${index}`,
    oreBot: { ore: +oreBotCost },
    clayBot: { ore: +clayBotCost },
    obsidianBot: { ore: +obsidianBotOre, clay: +obsidianBotClay },
    geodeBot: { ore: +geodeBotOre, obsidian: +geodeBotObsidian },
  };
});

function getBlueprintQualityLevel({ name, oreBot, clayBot, obsidianBot, geodeBot }, duration) {
  const maxOre = Math.max(oreBot.ore, clayBot.ore, obsidianBot.ore, geodeBot.ore);
  const maxClay = obsidianBot.clay;
  const maxObsidian = geodeBot.obsidian;

  const seen = new Set();
  const stack = [[
    [0, 0, 0, 0],
    [1, 0, 0, 0],
    duration,
  ]];

  let maxGeodes = 0;

  while (stack.length > 0) {
    const [mats, bots, timeleft] = stack.pop();
    const [ore, clay, obsidian, geodes] = mats;
    const [oreBots, clayBots, obsidianBots, geodeBots] = bots;

    if (timeleft <= 0) {
      maxGeodes = Math.max(maxGeodes, geodes);
      continue;
    }

    const key = [mats, bots, timeleft].join();
    if (seen.has(key)) continue;
    seen.add(key);

    const [nextOre, nextClay, nextObsidian, nextGeodes] = [
      ore + oreBots,
      clay + clayBots,
      obsidian + obsidianBots,
      geodes + geodeBots,
    ];

    if (ore >= geodeBot.ore && obsidian >= geodeBot.obsidian) {
      const nextMats = [nextOre - geodeBot.ore, nextClay, nextObsidian - geodeBot.obsidian, nextGeodes];
      const nextBots = [oreBots, clayBots, obsidianBots, geodeBots + 1];
      stack.push([nextMats, nextBots, timeleft - 1]);
      continue;
    }

    if (obsidianBots < maxObsidian && ore >= obsidianBot.ore && clay >= obsidianBot.clay) {
      const nextMats = [nextOre - obsidianBot.ore, nextClay - obsidianBot.clay, nextObsidian, nextGeodes];
      const nextBots = [oreBots, clayBots, obsidianBots + 1, geodeBots];
      stack.push([nextMats, nextBots, timeleft - 1]);
      if (duration === 32) continue;
    }

    const nextMats = [nextOre, nextClay, nextObsidian, nextGeodes];
    const nextBots = [oreBots, clayBots, obsidianBots, geodeBots];
    stack.push([nextMats, nextBots, timeleft - 1]);

    if (clayBots < maxClay && ore >= clayBot.ore) {
      const nextMats = [nextOre - clayBot.ore, nextClay, nextObsidian, nextGeodes];
      const nextBots = [oreBots, clayBots + 1, obsidianBots, geodeBots];
      stack.push([nextMats, nextBots, timeleft - 1]);
    }

    if (oreBots < maxOre && ore >= oreBot.ore) {
      const nextMats = [nextOre - oreBot.ore, nextClay, nextObsidian, nextGeodes];
      const nextBots = [oreBots + 1, clayBots, obsidianBots, geodeBots];
      stack.push([nextMats, nextBots, timeleft - 1]);
    }
  }

  console.log(`Best geode output for ${name} is ${maxGeodes}`);
  return maxGeodes;
}

const part1 = blueprints
  .map((blueprint) => getBlueprintQualityLevel(blueprint, 24))
  .map((maxGeodes, index) => maxGeodes * (index + 1))
  .reduce((sum, level) => sum + level, 0);

const part2 = blueprints
  .slice(0, 3)
  .map((blueprint) => getBlueprintQualityLevel(blueprint, 32))
  .sort((a, b) => b - a)
  .reduce((sum, level) => sum * level, 1);

console.log({ part1, part2 });