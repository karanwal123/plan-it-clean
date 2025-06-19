// src/utils/tsp.js (Enhanced with Start/End Point Support)

// Cache for distance matrix to avoid repeated API calls
const distanceCache = new Map();

function getCacheKey(locations) {
  return locations
    .map(
      (loc) => `${loc.position.lat.toFixed(6)},${loc.position.lng.toFixed(6)}`
    )
    .sort()
    .join("|");
}

// 1) Fetch full N×N travel-time matrix from Google Maps with caching
export function fetchDistanceMatrix(locations) {
  const cacheKey = getCacheKey(locations);

  if (distanceCache.has(cacheKey)) {
    return Promise.resolve(distanceCache.get(cacheKey));
  }

  return new Promise((resolve, reject) => {
    const service = new window.google.maps.DistanceMatrixService();
    const CHUNK_SIZE = 10;
    if (locations.length <= CHUNK_SIZE) {
      service.getDistanceMatrix(
        {
          origins: locations.map((l) => l.position),
          destinations: locations.map((l) => l.position),
          travelMode: window.google.maps.TravelMode.DRIVING,
          unitSystem: window.google.maps.UnitSystem.METRIC,
          avoidHighways: false,
          avoidTolls: false,
        },
        (response, status) => {
          if (status !== "OK") {
            console.error("Distance Matrix API error:", status);
            return reject(new Error(`Distance Matrix API failed: ${status}`));
          }

          try {
            const matrix = response.rows.map((row) =>
              row.elements.map((el) => {
                if (el.status !== "OK") {
                  console.warn("Element status not OK:", el.status);
                  return Infinity;
                }
                return el.duration.value;
              })
            );

            if (
              matrix.length !== locations.length ||
              matrix.some((row) => row.length !== locations.length)
            ) {
              throw new Error("Invalid distance matrix dimensions");
            }

            distanceCache.set(cacheKey, matrix);
            resolve(matrix);
          } catch (error) {
            reject(
              new Error(`Error processing distance matrix: ${error.message}`)
            );
          }
        }
      );
    } else {
      reject(
        new Error(
          `Too many locations (${locations.length}). Maximum supported: ${CHUNK_SIZE}`
        )
      );
    }
  });
}

// 2) Nearest-Neighbor with start/end constraints
function nearestNeighborTour(matrix, options = {}) {
  const N = matrix.length;
  const {
    startIndex = 0,
    endIndex = null,
    fixedStart = true,
    fixedEnd = false,
  } = options;

  if (N <= 1) return Array.from({ length: N }, (_, i) => i);

  const visited = Array(N).fill(false);
  const tour = [startIndex];
  visited[startIndex] = true;

  // If we have a fixed end point, mark it as reserved
  if (fixedEnd && endIndex !== null && endIndex !== startIndex) {
    // Don't visit the end point until the very end
  }

  // Build the middle part of the tour
  const targetLength = fixedEnd && endIndex !== null ? N - 1 : N;

  for (let k = 1; k < targetLength; k++) {
    const last = tour[tour.length - 1];
    let next = -1;
    let best = Infinity;

    for (let j = 0; j < N; j++) {
      if (
        !visited[j] &&
        matrix[last][j] < best &&
        matrix[last][j] !== Infinity &&
        !(fixedEnd && j === endIndex) // Don't visit end point in middle
      ) {
        best = matrix[last][j];
        next = j;
      }
    }

    if (next === -1) {
      // No reachable unvisited locations, add any remaining
      for (let j = 0; j < N; j++) {
        if (!visited[j] && !(fixedEnd && j === endIndex)) {
          next = j;
          break;
        }
      }
    }

    if (next !== -1) {
      tour.push(next);
      visited[next] = true;
    }
  }

  // Add the end point if specified
  if (fixedEnd && endIndex !== null && endIndex !== startIndex) {
    tour.push(endIndex);
  }

  return tour;
}

// 3) Enhanced 2-Opt improvement with start/end constraints
function twoOpt(tour, matrix, options = {}, maxIterations = 1000) {
  const N = tour.length;
  const { fixedStart = true, fixedEnd = false } = options;

  if (N < 4) return tour;

  let improved = true;
  let iterations = 0;
  let bestTour = [...tour];
  let bestDistance = calculateTourDistance(tour, matrix, options);

  // Determine the range of cities we can modify
  const startIdx = fixedStart ? 1 : 0;
  const endIdx = fixedEnd ? N - 1 : N;

  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;

    for (let i = startIdx; i < endIdx - 2; i++) {
      for (let k = i + 1; k < endIdx - 1; k++) {
        const a = tour[i];
        const b = tour[i + 1];
        const c = tour[k];
        const d = tour[k + 1];

        if (
          matrix[a][b] === Infinity ||
          matrix[c][d] === Infinity ||
          matrix[a][c] === Infinity ||
          matrix[b][d] === Infinity
        ) {
          continue;
        }

        const currentCost = matrix[a][b] + matrix[c][d];
        const newCost = matrix[a][c] + matrix[b][d];

        if (newCost < currentCost) {
          const newTour = [
            ...tour.slice(0, i + 1),
            ...tour.slice(i + 1, k + 1).reverse(),
            ...tour.slice(k + 1),
          ];

          const newDistance = calculateTourDistance(newTour, matrix, options);
          if (newDistance < bestDistance) {
            tour = newTour;
            bestTour = [...newTour];
            bestDistance = newDistance;
            improved = true;
          }
        }

        if (improved) break;
      }
      if (improved) break;
    }
  }

  console.log(`2-Opt completed in ${iterations} iterations`);
  return bestTour;
}

// Helper function to calculate total tour distance with start/end options
function calculateTourDistance(tour, matrix, options = {}) {
  const { isClosedLoop = false } = options;

  let total = 0;
  const endIdx = isClosedLoop ? tour.length : tour.length - 1;

  for (let i = 0; i < endIdx - 1; i++) {
    total += matrix[tour[i]][tour[i + 1]];
  }

  // Add return to start only if it's a closed loop
  if (isClosedLoop && tour.length > 1) {
    total += matrix[tour[tour.length - 1]][tour[0]];
  }

  return total;
}

// 4) Or-Opt improvement with start/end constraints
function orOpt(tour, matrix, options = {}, maxSequenceLength = 3) {
  const N = tour.length;
  const { fixedStart = true, fixedEnd = false } = options;

  if (N < 5) return tour;

  let improved = true;
  let bestTour = [...tour];
  let bestDistance = calculateTourDistance(tour, matrix, options);

  // Determine the range of cities we can modify
  const startIdx = fixedStart ? 1 : 0;
  const endIdx = fixedEnd ? N - 1 : N;

  while (improved) {
    improved = false;

    for (
      let seqLen = 1;
      seqLen <= Math.min(maxSequenceLength, endIdx - startIdx - 2);
      seqLen++
    ) {
      for (let i = startIdx; i < endIdx - seqLen; i++) {
        for (let j = startIdx; j < endIdx - seqLen; j++) {
          if (j >= i - 1 && j <= i + seqLen) continue;

          const newTour = relocateSequence(tour, i, seqLen, j);
          const newDistance = calculateTourDistance(newTour, matrix, options);

          if (newDistance < bestDistance) {
            bestTour = [...newTour];
            bestDistance = newDistance;
            improved = true;
          }
        }
      }
    }

    tour = bestTour;
  }

  return bestTour;
}

// Helper function to relocate a sequence in the tour
function relocateSequence(tour, startIdx, seqLength, insertIdx) {
  const sequence = tour.slice(startIdx, startIdx + seqLength);
  const remaining = [
    ...tour.slice(0, startIdx),
    ...tour.slice(startIdx + seqLength),
  ];

  return [
    ...remaining.slice(0, insertIdx),
    ...sequence,
    ...remaining.slice(insertIdx),
  ];
}

// 5) Multi-start approach with start/end constraints
function multiStartTSP(matrix, options = {}, numStarts = 3) {
  const N = matrix.length;
  const {
    startIndex = 0,
    endIndex = null,
    fixedStart = true,
    fixedEnd = false,
  } = options;

  let bestTour = null;
  let bestDistance = Infinity;

  // If start is fixed, only try that start point
  const startPoints = fixedStart
    ? [startIndex]
    : Array.from({ length: Math.min(numStarts, N) }, (_, i) => i);

  for (const start of startPoints) {
    const tourOptions = { ...options, startIndex: start };
    const tour = nearestNeighborTour(matrix, tourOptions);
    const improvedTour = twoOpt(tour, matrix, options);
    const distance = calculateTourDistance(improvedTour, matrix, options);

    if (distance < bestDistance) {
      bestTour = improvedTour;
      bestDistance = distance;
    }
  }

  return bestTour || Array.from({ length: N }, (_, i) => i);
}

// 6) Brute force for very small instances with constraints
function bruteForceTSP(matrix, options = {}) {
  const N = matrix.length;
  const {
    startIndex = 0,
    endIndex = null,
    fixedStart = true,
    fixedEnd = false,
  } = options;

  if (N <= 1) return Array.from({ length: N }, (_, i) => i);

  // Create list of cities to permute (excluding fixed start/end)
  const cities = Array.from({ length: N }, (_, i) => i).filter((i) => {
    if (fixedStart && i === startIndex) return false;
    if (fixedEnd && i === endIndex) return false;
    return true;
  });

  const permutations = getPermutations(cities);
  let bestTour = null;
  let bestDistance = Infinity;

  for (const perm of permutations) {
    const tour = [];

    // Add start point
    if (fixedStart) tour.push(startIndex);

    // Add permuted middle cities
    tour.push(...perm);

    // Add end point
    if (fixedEnd && endIndex !== null) tour.push(endIndex);

    // If no fixed start, the first city in perm becomes start
    if (!fixedStart && tour.length === perm.length) {
      // Tour is just the permutation
    }

    const distance = calculateTourDistance(tour, matrix, options);

    if (distance < bestDistance) {
      bestTour = tour;
      bestDistance = distance;
    }
  }

  return bestTour || Array.from({ length: N }, (_, i) => i);
}

// Helper to generate all permutations
function getPermutations(arr) {
  if (arr.length <= 1) return [arr];

  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    const restPerms = getPermutations(rest);

    for (const perm of restPerms) {
      result.push([arr[i], ...perm]);
    }
  }

  return result;
}

// 7) Main TSP entry point with start/end point support
export async function computeOptimalOrder(locations, options = {}) {
  if (!locations || locations.length < 2) {
    return locations ? locations.map((_, i) => i) : [];
  }

  const {
    startIndex = 0,
    endIndex = null,
    fixedStart = true,
    fixedEnd = false,
    isClosedLoop = false,
  } = options;

  try {
    console.log(`Computing optimal order for ${locations.length} locations...`);
    console.log(
      `Start: ${startIndex}, End: ${endIndex}, Fixed start: ${fixedStart}, Fixed end: ${fixedEnd}`
    );

    const startTime = Date.now();
    const matrix = await fetchDistanceMatrix(locations);

    const algorithmOptions = {
      startIndex,
      endIndex,
      fixedStart,
      fixedEnd,
      isClosedLoop,
    };

    let tour;
    if (locations.length <= 4) {
      tour = bruteForceTSP(matrix, algorithmOptions);
    } else if (locations.length <= 10) {
      tour = multiStartTSP(
        matrix,
        algorithmOptions,
        Math.min(locations.length, 5)
      );
      tour = orOpt(tour, matrix, algorithmOptions);
    } else {
      tour = nearestNeighborTour(matrix, algorithmOptions);
      tour = twoOpt(tour, matrix, algorithmOptions);
    }

    const endTime = Date.now();
    const finalDistance = calculateTourDistance(tour, matrix, algorithmOptions);
    console.log(
      `TSP solved in ${endTime - startTime}ms, total time: ${Math.round(
        finalDistance / 60
      )}min`
    );

    return tour;
  } catch (error) {
    console.error("Error in computeOptimalOrder:", error);
    return locations.map((_, i) => i);
  }
}

// Clear cache function
export function clearDistanceCache() {
  distanceCache.clear();
  console.log("Distance matrix cache cleared");
}
