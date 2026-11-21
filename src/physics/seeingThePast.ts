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

// ---- The audit update (2026-11-21): Part 1's fixed case, the strip of image speeds, the check-up ----

// Part 1 is fixed on a spaceship coming toward the lab at 0.6c (the specification's headline case: the image looks to move at 1.5c).
export const PART_ONE_DIRECTION: Direction = 'approaching'
export const PART_ONE_SPEED = 0.6

// The image's speed from the two arrival times is v / (1 - v) approaching and v / (1 + v) receding (the same straight-line motion plus the light's travel
// time, no relativity). The run measures it from its samples; this closed form is the shortcut used by the check-up.
export function closedFormImageSpeed(direction: Direction, speed: number): number {
  checkSpeed(speed)
  return direction === 'approaching' ? speed / (1 - speed) : speed / (1 + speed)
}

export type SpeedGuess = 'slower' | 'same' | 'faster'

// What the tutor marks the guess against: how the image's speed compares with the spaceship's real speed. 'same' is never the result for a speed
// above 0 and below c, because v / (1 - v) is more than v and v / (1 + v) is less.
export function imageComparedWithShip(direction: Direction, speed: number): SpeedGuess {
  const image = closedFormImageSpeed(direction, speed)
  if (Math.abs(image - speed) < 1e-9) return 'same'
  return image > speed ? 'faster' : 'slower'
}

// The strip of image speeds in Panel B: a linear scale from 0 to 2c (so Part 1's 1.5c fits), 0 at the left end and 1 at the right.
export const STRIP_MAX_C = 2

export function stripPosition(speedInC: number): number {
  if (!(speedInC >= 0)) throw new RangeError(`speed must be 0 or more, got ${speedInC}`)
  return Math.min(1, speedInC / STRIP_MAX_C)
}

// The stretch of the strip a guess names, in c: 'slower' from 0 up to the real speed, 'same' the tick at the real speed, 'faster' from the real speed
// to the end of the strip. It is only a marker for an answer that has no size of its own.
export function guessStretch(guess: SpeedGuess, speed: number): { from: number; to: number } {
  checkSpeed(speed)
  if (guess === 'slower') return { from: 0, to: speed }
  if (guess === 'same') return { from: speed, to: speed }
  return { from: speed, to: STRIP_MAX_C }
}

export type CheckUpReading = 'the same' | 'more' | 'less'

export interface CheckUpRow {
  id: 'image-speed' | 'image-distance' | 'image-time'
  page: number
  expected: number
  reading: CheckUpReading
  gap: number
}

// The page's numbers set beside what the same physics gives. "The same" means the same at the two decimals the page shows.
function reading(page: number, expected: number): CheckUpReading {
  if (Math.abs(page - expected) < 0.005) return 'the same'
  return page > expected ? 'more' : 'less'
}

export function checkUpRows(direction: Direction, speed: number): CheckUpRow[] {
  const run = runSeeingExperiment(direction, speed)
  const shipDistance = Math.abs(measuredPositionAt(direction, speed, run.measuredDuration) - measuredPositionAt(direction, speed, 0))
  const row = (id: CheckUpRow['id'], page: number, expected: number): CheckUpRow => ({
    id,
    page,
    expected,
    reading: reading(page, expected),
    gap: Math.abs(page - expected),
  })
  return [
    row('image-speed', run.imageSpeed, closedFormImageSpeed(direction, speed)),
    row('image-distance', run.distanceCovered, shipDistance),
    row('image-time', run.imageDuration, run.measuredDuration),
  ]
}
