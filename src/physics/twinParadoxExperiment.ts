import { runMovingClockExperiment } from './movingClockExperiment'

// Simulation layer only (AGENTS.md, "Separation of Responsibilities"): this sets up a round
// trip and hands the resulting lab duration to Experiment 3's own, unmodified physics function.
// No relativistic quantity is computed here — only distance / velocity arithmetic to find how
// long the round trip takes in the lab frame.
export interface TwinParadoxResult {
  distance: number // light-seconds, one-way
  velocity: number // fraction of c
  labElapsedTime: number // total round-trip time for the Earthbound twin
  travelerElapsedTime: number // total elapsed time for the traveling twin
  ageDifference: number // labElapsedTime - travelerElapsedTime
  timeDilationFactor: number // reused from Experiment 3's runMovingClockExperiment
}

export function runTwinParadoxExperiment(distance: number, velocity: number): TwinParadoxResult {
  if (!(distance > 0)) {
    throw new RangeError('Distance must be greater than 0')
  }
  if (!(velocity > 0 && velocity < 1)) {
    throw new RangeError('Velocity must satisfy 0 < v < c (v = 0 would never complete the trip)')
  }

  const oneWayLabTime = distance / velocity
  const labElapsedTime = 2 * oneWayLabTime
  const movingClock = runMovingClockExperiment(labElapsedTime, velocity)

  return {
    distance,
    velocity,
    labElapsedTime,
    travelerElapsedTime: movingClock.movingClockElapsedTime,
    ageDifference: labElapsedTime - movingClock.movingClockElapsedTime,
    timeDilationFactor: movingClock.timeDilationFactor,
  }
}

export type TwinOutcome = 'sameAge' | 'earthOlder' | 'travelerOlder'

// Which twin is older when they meet again, from the run itself (not a fixed answer).
export function olderTwin(result: TwinParadoxResult): TwinOutcome {
  if (result.ageDifference > 0) return 'earthOlder'
  if (result.ageDifference < 0) return 'travelerOlder'
  return 'sameAge'
}

export interface TwinClocksState {
  earthClockReading: number
  travelerClockReading: number
  gap: number // earth reading minus traveler reading at this point of the trip
}

// Both clocks at a point of the trip, as a fraction of it (0 = departure, 1 = reunion). Each leg is at
// the same constant speed, so each clock grows in a straight line and the fraction is all the picture
// needs. Playback speed only decides how fast the fraction advances; it never changes the totals.
export function twinClocksAt(result: TwinParadoxResult, fraction: number): TwinClocksState {
  if (!(fraction >= 0 && fraction <= 1)) {
    throw new RangeError('The fraction of the trip must be between 0 and 1')
  }
  const earthClockReading = fraction * result.labElapsedTime
  const travelerClockReading = fraction * result.travelerElapsedTime
  return { earthClockReading, travelerClockReading, gap: earthClockReading - travelerClockReading }
}

// The two bars share one scale that ends at the Earth twin's total, the longer bar.
export function twinBarScaleEnd(result: TwinParadoxResult): number {
  return result.labElapsedTime
}

export type TwinGuessMarker = 'level' | 'toEarthBar' | 'toTravelerBar'

// The white marker for a guess. A guess has no size, so this only says which way the marker points;
// it never changes the result.
export function guessMarkerFor(guess: TwinOutcome): TwinGuessMarker {
  if (guess === 'earthOlder') return 'toEarthBar'
  if (guess === 'travelerOlder') return 'toTravelerBar'
  return 'level'
}

export interface TwinGuessMarking {
  guessed: TwinOutcome
  actual: TwinOutcome
  guessedActual: boolean
}

// The tutor's marking of the guess in its explanation. Not a score.
export function markTwinGuess(guess: TwinOutcome, result: TwinParadoxResult): TwinGuessMarking {
  const actual = olderTwin(result)
  return { guessed: guess, actual, guessedActual: guess === actual }
}

export interface TwinWorkedNumbers {
  oneWayLabTime: number
  roundTripLabTime: number
  vSquared: number
  oneMinusVSquared: number
  factor: number
  travelerElapsedTime: number
  gap: number
}

// The steps for the worked moment, from the same run, so the page quotes no number of its own.
export function twinWorkedNumbers(distance: number, velocity: number): TwinWorkedNumbers {
  const result = runTwinParadoxExperiment(distance, velocity)
  const vSquared = velocity * velocity
  return {
    oneWayLabTime: distance / velocity,
    roundTripLabTime: result.labElapsedTime,
    vSquared,
    oneMinusVSquared: 1 - vSquared,
    factor: result.timeDilationFactor,
    travelerElapsedTime: result.travelerElapsedTime,
    gap: result.ageDifference,
  }
}
