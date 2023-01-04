import { readFile } from 'node:fs/promises';
import { REGEX } from '../common.mjs';

const input = await readFile('./data.txt', 'utf-8');

// --------------------------------- Setup ------------------------------------
const start = 'AA';
const rounds = 30;
const regex = /Valve ([A-Z]+) has flow rate=([0-9]+); tunnels? leads? to valves? (.+)/;
const valves = generateValvesMap(input);

// ----------------------------------------------------------------------------
// ------------------------------ Functions -----------------------------------
// ----------------------------------------------------------------------------

// The solution to Part 2. It uses the same function as Part 1, but it runs
// it with all possible combinations of the unopened valves and then returns
// the highest value of the best 2 paths that don't share any valves.
// ----------------------------------------------------------------------------
function findBestMultiplePaths(valves, start, rounds, pathCount) {
  const startNode = valves.get(start);

  // Splitting only the unopened valves away from the start node because
  // we don't want to make the start node a part of the combinations
  const unopened = [...valves.entries()].filter(([, { name }]) => name !== start);

  // Splitting the unopened valves into two groups. The first group will be
  // the total number of unopened valves divided by the number of paths
  // floored. The second group will be the total number of unopened valves
  // divided by the number of paths floored plus the remainder. This gives
  // us the best possible coverage of the unopened valves for both odd and
  // even numbers of valves. I did hard code the number of paths to 2 for
  // this problem, but it could be easily adapted to any number of paths.
  const splitCount = ~~(unopened.length / pathCount);
  const splitMod = unopened.length % pathCount;
  const splits = [combinations(unopened, splitCount), combinations(unopened, splitCount + splitMod)];

  // Adding the start node to each of the combinations of unopened valves
  // and then converting the array of nodes into an object containing an
  // array of the node names, and an array of the node objects.
  for (let i = 0; i < pathCount; i++) {
    for (let j = 0; j < splits[i].length; j++) {
      splits[i][j].push([start, startNode]);
      splits[i][j] = {
        path: splits[i][j].map(([valve,]) => valve),
        valves: splits[i][j],
      };
    }
  }

  // We're just going to dump the results of the combinations function into
  // an array and then sort it by value at the end to get the highest value.
  const bestFlow = [];
  // We're going to compare all elements of the first group to all elements
  // of the second group. If the two groups share any valves, then we're
  // going to skip that combination. Otherwise, we're going to run the
  // find_most_efficient_path function on each group and then add the
  // results together to get the total flow for that combination.
  for (let i = 0; i < splits[1].length; i++) {
    for (let j = 0; j < splits[0].length; j++) {
      // If the two groups share any valves, then skip this combination
      // and move on to the next one. We're using the path array that
      // we created earlier to make this comparison. The reason why we
      // are checking for a length of 1 is because we know that the
      // start node is in both groups and will always show up in the
      // shared array.
      const shared = splits[1][i].path.filter((node) => splits[0][j].path.includes(node));
      if (shared.length !== 1) continue;

      // Run the find_most_efficient_path function on each group and
      // then add the results together to get the total flow for that
      // combination. We're using the spread operator to convert the
      // array of node objects into a Map object. Maybe it's something
      // that I'm doing wrong, but it seems that it's faster than just
      // passing the array of node objects directly. Also, we are
      // doing the Map conversions here instead of in the previous
      // loop because it seems to be faster to do it here. Probably
      // because we're not doing it for every possible combination.
      bestFlow.push(
        findMostEfficientPath(new Map([...splits[1][i].valves]), start, rounds) + 
        findMostEfficientPath(new Map([...splits[0][j].valves]), start, rounds)
      );
    }
  }

  return bestFlow.sort((a, b) => b - a)[0];
}

// This is the solution to Part 1. It uses a depth first search to find the
// most efficient path through the valves. It returns the total flow of the
// most efficient path. Because this function is being called thousands of
// times, it's important to keep it as fast as possible. I've tried many ways
// to optimize it, and this is the best that I've come up with so far.
// ----------------------------------------------------------------------------
function findMostEfficientPath(valves, start, rounds) {
  const stack = [{
    node: valves.get(start),
    visited: [start],
    calculated: {
      steps: 0,
      flowRate: 0,
      flow: 0,
      totalFlow: 0
    }
  }];

  let winner = stack[0];
    
  while (stack.length > 0) {
    const current = stack.pop();
    // Using a visited array on the current node object because we want
    // each branch to track its own visited nodes. We want to be able to
    // visit the same node multiple times if it's on different branches.
    current.visited.push(current.node.name);

    // Just a simple if statement to check if we are on the winning node.
    if (current.calculated.totalFlow > winner.calculated.totalFlow) {
      winner = current;
    }

    for (const [_, edge] of valves) {
      // Just a few guard clauses to make sure that we don't actually
      // push any nodes onto the stack that we don't want to visit.
      // We don't want to visit a node that we've already visited,
      // we don't want to visit the same node that we're currently on,
      // and we don't want to visit a node that is outside of the
      // number of rounds that we're allowed to visit.
      if (current.visited.includes(edge.name)
        || current.node.name === edge.name
        || current.calculated.steps + current.node.edges[edge.name] > rounds
      ) continue;

      // We're going to create a new object for the new calculated
      // values so that we don't accidentally overwrite the values
      // Make the calculations for the node we are about to push onto
      // the stack, so we can do one last check to see if we should
      // actually push it onto the stack or kill the branch.
      const calculated = calcFlow(current, edge, rounds);

      // Kill the branch if the total flow is less than the current
      // winner and the number of steps is greater than the number of
      // steps for the current winner. This is a pretty big optimization
      // that I kind of stumbled upon while I was trying to optimize
      // the runtime of this function.
      if (
        calculated.totalFlow < winner.calculated.totalFlow
        && calculated.steps >= winner.calculated.steps
      ) continue;

      // Push the node onto the stack. Make sure to pass the visited
      // array by value, not by reference. Otherwise, we'll end up
      // with a bunch of nodes that have the same visited array.
      // I originally used lodash cloneDeep to do this, but it was
      // VERY slow in comparison to just using the slice method.
      stack.push({
        node: edge,
        visited: current.visited.slice(),
        calculated,
      });
    }
  }
  
  return winner.calculated.totalFlow;
}

// Magic calculation stuff that took me way too long to get right because
// I had a case of the dumb when I was trying to figure out how to do it.
function calcFlow(current, edge, rounds) {
  const steps = current.calculated.steps + current.node.edges[edge.name];
  // Start by calculating the flow for the current node by multiplying
  // the flow rate by the number of steps that we've taken since the
  // last valve and then adding that with the flow from the previous node.
  const flow = (current.calculated.flowRate * current.node.edges[edge.name]) + current.calculated.flow;
  // Increment the flow rate by the rate of the current node.. AFTER
  // we've calculated the flow between the last valve and the current node.
  const flowRate = current.calculated.flowRate + edge.rate;
  // Calculate the total flow we would have for the remaining rounds
  // if we were to stop at this node. This is the final weight that
  // we will use to compare and determine winners.
  const totalFlow = (flowRate * (rounds - steps)) + flow;
  
  return {
    flow,
    steps,
    flowRate,
    totalFlow,
  };
}

// ----------------------------------------------------------------------------
// --------------------------- Helper Functions -------------------------------
// ----------------------------------------------------------------------------
// This is a recursive function that generates all combinations of a
// given length from an array by taking the first element and then generating
// all combinations of the remaining elements of the array of length one less
// than the desired length. It then does the same for the second element and
// so on until it has generated all combinations of the desired length.
function combinations(list, size) {
  if (size === 0) return [[]];
  const result = [];

  for (let i = 0; i <= list.length - size; i++) {
    const subResult = combinations(list.slice(i + 1), size - 1);

    for (const combination of subResult) {
      result.push([list[i], ...combination]);
    }
  }
  
  return result;
}

// ----------------------------------------------------------------------------
// --------------------------- Setup Functions --------------------------------
// ----------------------------------------------------------------------------
// Generate a map of all the valves and their connections, but throw out the
// ones that don't have any rate (they don't actually matter)
function generateValvesMap(input) {
  const valves = [];

  for (const line of input.split(REGEX.NEWLINE)) {
    const [_, valve, rate, tunnels] = line.match(regex);

    valves.push([valve, {
      name: valve,
      rate: +rate,
      tunnels: tunnels.split(REGEX.SEPARATOR).map(tunnel => tunnel.trim()),
    }]);
  }

  // Generate the shortest paths from each node to all other nodes
  for (const [name, valve] of valves) {
    valve.edges = generateShortestPaths(valves, name);
  }

  // Remove the valves that don't have any rate since they dont matter
  return new Map(valves.filter(([name, { rate }]) => rate > 0 || name === start));
}

// Using BFS to find the shortest path from a given node to all other nodes in
// the graph so we can access the most valuable nodes in the shortest amount of
// time. This function does not take long at all to run with the given input and
// saves a lot of time in the long run.
// ----------------------------------------------------------------------------
function generateShortestPaths(valves, start) {
  return valves.reduce((paths, [endValve, { rate }]) => {
    // Skip if the valve is the start node or has no flow rate
    if (endValve === start || rate === 0) return paths;

    const visited = new Set();
    const queue = [start];
    const path = [];
    
    while (queue.length > 0) {
      const valve = queue.shift();
      const [, { tunnels }] = valves.find(([name,]) => name === valve);

      // If we found the end valve, we can stop the BFS and backtrace the path.
      if (tunnels.includes(endValve)) {
        paths[endValve] = backtracePath(path, valve, endValve);
        break;
      }

      // Add all the availables tunnels that the current valve can go to
      // the queue if they have not been visited yet.
      for (const tunnel of tunnels) {
        if (visited.has(tunnel)) continue;
        path.push([tunnel, valve]);
        queue.push(tunnel);
      }

      visited.add(valve);
    }
  
    return paths;
  }, {});
}

// This function is used to backtrace the path from the end valve to the start
// valve as a part of the BFS algorithm. It takes the path array that was
// used in the BFS to hold node pairs that visited each other and the current
// valve we were on when we found the end valve.
// ----------------------------------------------------------------------------
function backtracePath(path, startValve, endValve) {
  // We're gonna add the path back to the start valve in reverse order so we
  // start with the end valve and work our way back to the start valve.
  const returnPath = [endValve, startValve];
  let currentValve = startValve;
  
  while (path.length > 0) {
    const [name, valve] = path.pop();
    // Just pop everything off the path until we find the node where the
    // current valve is the first element in the node pair. That means
    // that the second element in the node pair is valve we need to go to
    // next to get closer to the start valve because that is the valve that
    // we visited before we visited the current valve.
    if (name === currentValve) {
      returnPath.push(valve);
      currentValve = valve;
    }
  }
  // We just return the length of the path because we don't need the actual
  // path. The weight of the path is the length of the path.
  return returnPath.length;
}

// ------------------------------- Solution -----------------------------------
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
// -------------------------------- Part 1 ------------------------------------
// ============================================================================

const mostEfficientPath = findMostEfficientPath(valves, start, rounds);
console.log(`Part 1 solution: ${mostEfficientPath}`);

// ============================================================================

// ----------------------------------------------------------------------------
// -------------------------------- Part 2 ------------------------------------
// ============================================================================

const bestMultiplePaths = findBestMultiplePaths(valves, start, rounds - 4, 2);
console.log(`Part 2 solution: ${bestMultiplePaths}`);