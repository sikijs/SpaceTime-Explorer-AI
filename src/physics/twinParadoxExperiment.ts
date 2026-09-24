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
