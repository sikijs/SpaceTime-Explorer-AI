// Spacetime Geometry, Experiment 4: what you see is the past.
// A ship flies straight toward the lab's eye (at position 0) or straight away from it, at a steady speed.
// Everything here is straight-line motion plus the travel time of light: no relativistic formula is used.
// Units: speed is a fraction of c (c = 1); time in seconds, distance in light-seconds.

export type Direction = 'approaching' | 'receding'

export interface ShipSample {
  lookingTime: number // T, on the lab's clock
  measuredPosition: number // where the lab works out the ship is at lab time T
  seenPosition: number // where the ship looks to be at looking time T
  emissionTime: number // the earlier lab time at which the light now arriving left the ship
}

export interface SeeingExperimentResult {
  measuredSpeed: number
  imageSpeed: number
  distanceCovered: number
  measuredDuration: number // lab time the ship takes to cover the distance
  imageDuration: number // looking time over which the image covers the same distance
  firstLooking: number
  lastLooking: number
  samples: ShipSample[]
}

// The two fixed runs (Decision 4): the ship covers 4 light-seconds, and never crosses the eye.
export const RUN_DISTANCE = 4
const APPROACHING_START = 5
const RECEDING_START = 1
export const SAMPLE_COUNT = 41

function checkSpeed(speed: number): void {
  if (!(speed > 0 && speed < 1)) throw new RangeError(`speed must be above 0 and below c, got ${speed}`)
}

function startPosition(direction: Direction): number {
  return direction === 'approaching' ? APPROACHING_START : RECEDING_START
}

function sign(direction: Direction): number {
  return direction === 'approaching' ? -1 : 1
}

// The ship's measured position at lab time t: x(t) = x0 + s × v × t.
export function measuredPositionAt(direction: Direction, speed: number, labTime: number): number {
  return startPosition(direction) + sign(direction) * speed * labTime
}

// Light from the ship at (t, x(t)) reaches the eye at T(t) = t + |x(t)|. The ship stays on the right of the eye in
// both runs, so |x(t)| = x(t) and T(t) is a straight line in t.
function lookingTimeFor(direction: Direction, speed: number, emissionTime: number): number {
  return emissionTime + Math.abs(measuredPositionAt(direction, speed, emissionTime))
}

export function lookingRange(direction: Direction, speed: number): { first: number; last: number } {
  checkSpeed(speed)
  const duration = RUN_DISTANCE / speed
  return { first: lookingTimeFor(direction, speed, 0), last: lookingTimeFor(direction, speed, duration) }
}

// Solves  t + |x(t)| = T  for the emission time t (a linear equation), then reads off x(t).
export function seenAt(direction: Direction, speed: number, lookingTime: number): ShipSample {
  const { first, last } = lookingRange(direction, speed)
  if (!(lookingTime >= first && lookingTime <= last)) {
    throw new RangeError(`lookingTime must be between ${first} and ${last}, got ${lookingTime}`)
  }
  // t + x0 + s v t = T  →  t = (T − x0) ÷ (1 + s v)
  const emissionTime = (lookingTime - startPosition(direction)) / (1 + sign(direction) * speed)
  return {
    lookingTime,
    measuredPosition: measuredPositionAt(direction, speed, lookingTime),
    seenPosition: measuredPositionAt(direction, speed, emissionTime),
    emissionTime,
  }
}

export function runSeeingExperiment(direction: Direction, speed: number): SeeingExperimentResult {
  const { first, last } = lookingRange(direction, speed)
  const samples: ShipSample[] = []
  for (let i = 0; i < SAMPLE_COUNT; i++) {
    samples.push(seenAt(direction, speed, first + ((last - first) * i) / (SAMPLE_COUNT - 1)))
  }
  const start = samples[0]
  const end = samples[samples.length - 1]
  const distanceCovered = Math.abs(end.seenPosition - start.seenPosition)
  const imageDuration = end.lookingTime - start.lookingTime
  return {
    measuredSpeed: speed,
    imageSpeed: distanceCovered / imageDuration,
    distanceCovered,
    measuredDuration: end.emissionTime - start.emissionTime,
    imageDuration,
    firstLooking: first,
    lastLooking: last,
    samples,
  }
}
