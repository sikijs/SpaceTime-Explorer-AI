import { SPEED_OF_LIGHT, timeDilationFactorFor } from './movingClockExperiment'
import { lorentzTransform } from './lorentzTransform'
import type { WorldlinePoint } from './spacetimeDiagramView'

// Units: velocity is a fraction of c (c = 1); time in seconds, distance in light-seconds.

// time² − distance², in seconds², for two events. It is the same for every observer.
export function intervalSquared(a: WorldlinePoint, b: WorldlinePoint): number {
  const timeBetween = b.time - a.time
  const distanceBetween = b.position - a.position
  return timeBetween * timeBetween - distanceBetween * distanceBetween
}

export interface ObserverReading {
  timeBetween: number
  distanceBetween: number
  intervalSquared: number
}

export interface IntervalExperimentResult {
  clockSpeed: number
  passingObserverSpeed: number
  // The two events: tick 0 and tick 1 of the moving clock, in the lab's coordinates.
  tickZero: WorldlinePoint
  tickOne: WorldlinePoint
  lab: ObserverReading
  clockFrame: ObserverReading
  passing: ObserverReading
}

function readingFor(a: WorldlinePoint, b: WorldlinePoint): ObserverReading {
  return {
    timeBetween: b.time - a.time,
    distanceBetween: b.position - a.position,
    intervalSquared: intervalSquared(a, b),
  }
}

// The clock ticks once per second of its own time. Tick 0 is at the lab's origin at time zero.
// The lab's numbers come from Experiment 3's time dilation factor; the other two observers'
// numbers come from the Lorentz transformation (Experiment 11), not from any new formula.
export function runIntervalExperiment(clockSpeed: number, passingObserverSpeed: number): IntervalExperimentResult {
  if (!(clockSpeed >= 0 && clockSpeed < SPEED_OF_LIGHT)) {
    throw new RangeError('Clock speed must satisfy 0 <= v < c')
  }
  if (!(Math.abs(passingObserverSpeed) < SPEED_OF_LIGHT)) {
    throw new RangeError('Passing observer speed must satisfy |u| < c')
  }

  const labTimeBetween = 1 / timeDilationFactorFor(clockSpeed)
  const tickZero: WorldlinePoint = { position: 0, time: 0 }
  const tickOne: WorldlinePoint = { position: clockSpeed * labTimeBetween, time: labTimeBetween }

  return {
    clockSpeed,
    passingObserverSpeed,
    tickZero,
    tickOne,
    lab: readingFor(tickZero, tickOne),
    clockFrame: readingFor(lorentzTransform(tickZero, clockSpeed), lorentzTransform(tickOne, clockSpeed)),
    passing: readingFor(lorentzTransform(tickZero, passingObserverSpeed), lorentzTransform(tickOne, passingObserverSpeed)),
  }
}

// ---- Audit update (docs/audit/spacetime-geometry/01-draft-wording.md): numbers for the guess mark and the check-up. ----

export type IntervalGuess = 'bigger' | 'same' | 'smaller'

// The side scale on the results picture runs from 0 to this value (time² − distance², in seconds²).
export const INTERVAL_SCALE_END = 2

// The clock ticks once per second of its own face, so its own face time between the two ticks is 1 second.
export const CLOCK_TICK_SECONDS = 1

// A guess of "bigger", "the same" or "smaller" has no size of its own. The marker is drawn at this many times
// the clock-frame row's real value; the position is only a marker, never a number the learner guessed.
const MARKER_MULTIPLIER: Record<IntervalGuess, number> = { bigger: 1.5, same: 1, smaller: 0.5 }

export interface GuessMarker {
  guess: IntervalGuess
  // Where the marker sits, on the 0 to INTERVAL_SCALE_END scale, and as a fraction 0 to 1 of that scale.
  markerValue: number
  markerFraction: number
  // The real values the marker is set beside (the lab row's and the clock-frame row's time² − distance²).
  labValue: number
  clockFrameValue: number
}

export function guessMarkerOnScale(result: IntervalExperimentResult, guess: IntervalGuess): GuessMarker {
  const multiplier = MARKER_MULTIPLIER[guess]
  if (multiplier === undefined) {
    throw new RangeError('Guess must be "bigger", "same" or "smaller"')
  }
  const markerValue = result.clockFrame.intervalSquared * multiplier
  return {
    guess,
    markerValue,
    markerFraction: markerValue / INTERVAL_SCALE_END,
    labValue: result.lab.intervalSquared,
    clockFrameValue: result.clockFrame.intervalSquared,
  }
}

// The real value of a row's time² − distance² as a fraction 0 to 1 of the side scale.
export function intervalFractionOnScale(value: number): number {
  return value / INTERVAL_SCALE_END
}

export interface CheckUpRow {
  observer: 'lab' | 'clockFrame' | 'passing'
  // What the same physics predicts: the clock's own face reads CLOCK_TICK_SECONDS between its ticks, so the squared interval is that squared.
  expected: number
  found: number
  // No cut-off is invented: "the same" only if the two agree to rounding error.
  reading: 'the same' | 'different'
}

const SAME_TOLERANCE = 1e-9

export function checkUpRows(result: IntervalExperimentResult): CheckUpRow[] {
  const expected = CLOCK_TICK_SECONDS * CLOCK_TICK_SECONDS
  const row = (observer: CheckUpRow['observer'], found: number): CheckUpRow => ({
    observer,
    expected,
    found,
    reading: Math.abs(found - expected) <= SAME_TOLERANCE ? 'the same' : 'different',
  })
  return [
    row('lab', result.lab.intervalSquared),
    row('clockFrame', result.clockFrame.intervalSquared),
    row('passing', result.passing.intervalSquared),
  ]
}
