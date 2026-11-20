import { SPEED_OF_LIGHT } from './movingClockExperiment'
import { lorentzTransform } from './lorentzTransform'
import { intervalSquared } from './spacetimeInterval'
import type { WorldlinePoint } from './spacetimeDiagramView'

// Units: velocity is a fraction of c (c = 1); time in seconds, distance in light-seconds.

// Names for the three cases (the plain-language names are the approved defaults, Decision 3).
//   reachable:   time² − distance² > 0, something slower than light could get from one event to the other
//   light-only:  time² − distance² = 0, only light itself could
//   unreachable: time² − distance² < 0, not even light could
export type EventRelation = 'reachable' | 'light-only' | 'unreachable'

// A transformed light-only pair is zero only up to floating-point rounding, so "zero" means within this.
export const INTERVAL_ZERO_TOLERANCE = 1e-9

export function classifyEventPair(a: WorldlinePoint, b: WorldlinePoint): EventRelation {
  const interval = intervalSquared(a, b)
  if (Math.abs(interval) <= INTERVAL_ZERO_TOLERANCE) return 'light-only'
  return interval > 0 ? 'reachable' : 'unreachable'
}

// The speed (as a fraction of c) something would need to cover the distance in the time:
// |Δposition| ÷ |Δtime|. Infinity if there is distance but no time.
export function speedNeeded(a: WorldlinePoint, b: WorldlinePoint): number {
  const timeBetween = Math.abs(b.time - a.time)
  const distanceBetween = Math.abs(b.position - a.position)
  if (timeBetween === 0) return distanceBetween === 0 ? 0 : Infinity
  return distanceBetween / timeBetween
}

export interface PairReading {
  timeBetween: number
  distanceBetween: number
  intervalSquared: number
  relation: EventRelation
  speedNeeded: number
}

export interface LightConeExperimentResult {
  event: WorldlinePoint
  passingObserverSpeed: number
  lab: PairReading
  passing: PairReading
  // How far the flash from event O has spread, on the side where event B is, at the lab time of B.
  lightFrontPositionAtEventTime: number
}

// The five preset events B (Decision 4); event O is at position 0, time 0 in the lab.
export const PRESET_EVENTS: WorldlinePoint[] = [
  { time: 5, position: 3 },
  { time: 5, position: -4 },
  { time: 3, position: 3 },
  { time: 3, position: 5 },
  { time: 4, position: -5 },
]

export const EVENT_O: WorldlinePoint = { time: 0, position: 0 }

function readingFor(a: WorldlinePoint, b: WorldlinePoint): PairReading {
  return {
    timeBetween: b.time - a.time,
    distanceBetween: b.position - a.position,
    intervalSquared: intervalSquared(a, b),
    relation: classifyEventPair(a, b),
    speedNeeded: speedNeeded(a, b),
  }
}

// Event O is "here, now" in the lab. The passing observer's numbers come from the Lorentz transformation
// (first chapter, Experiment 11), not from any new formula.
export function runLightConeExperiment(event: WorldlinePoint, passingObserverSpeed: number): LightConeExperimentResult {
  if (!(event.time > 0)) {
    throw new RangeError('Event B must happen after event O (time > 0)')
  }
  if (!(Math.abs(passingObserverSpeed) < SPEED_OF_LIGHT)) {
    throw new RangeError('Passing observer speed must satisfy |u| < c')
  }

  const side = event.position < 0 ? -1 : 1

  return {
    event,
    passingObserverSpeed,
    lab: readingFor(EVENT_O, event),
    passing: readingFor(
      lorentzTransform(EVENT_O, passingObserverSpeed),
      lorentzTransform(event, passingObserverSpeed),
    ),
    lightFrontPositionAtEventTime: side * SPEED_OF_LIGHT * event.time,
  }
}

// ---- Audit update (2026-11-19): the fixed Part 1 run, the answers and their guess marks, and the check-up ----

// Part 1 is fixed on the first preset event (5 s, 3 ls) and a passing observer at +0.3c; Part 2 offers every preset.
export const PART1_EVENT_INDEX = 0
export const PART1_PASSING_SPEED = 0.3

// The three answers of the prediction. Each names one of the three cases.
export type LightConeGuess = 'slower' | 'light-only' | 'no'

const GUESS_REGIONS: Record<LightConeGuess, EventRelation> = {
  slower: 'reachable',
  'light-only': 'light-only',
  no: 'unreachable',
}

export function answerRegion(guess: LightConeGuess): EventRelation {
  const region = GUESS_REGIONS[guess]
  if (region === undefined) throw new RangeError(`Unknown answer: ${String(guess)}`)
  return region
}

// Where the white YOUR GUESS ring sits for each answer, in the lab's units (time in seconds, position in light-seconds):
// inside the cone, on its left edge and outside it. The ring marks the answer only; it is never placed at event B.
const GUESS_MARKERS: Record<LightConeGuess, WorldlinePoint> = {
  slower: { time: 4, position: -1 },
  'light-only': { time: 2.5, position: -2.5 },
  no: { time: 2, position: -4 },
}

export function guessMarkerPosition(guess: LightConeGuess): WorldlinePoint {
  const marker = GUESS_MARKERS[guess]
  if (marker === undefined) throw new RangeError(`Unknown answer: ${String(guess)}`)
  return { ...marker }
}

export type CheckUpReading = 'the same' | 'different'

export interface CheckUpRow {
  what: string
  expected: string
  found: string
  reading: CheckUpReading | 'the same side of 1' | 'different sides of 1'
}

const SIDE_OF_ONE_TOLERANCE = 1e-9

function sideOfOne(speed: number): 'below' | 'at' | 'above' {
  if (Math.abs(speed - 1) <= SIDE_OF_ONE_TOLERANCE) return 'at'
  return speed < 1 ? 'below' : 'above'
}

// The passing observer against the lab: the interval squared, the case and the side of 1 of the speed needed must all agree.
// The reference is the lab's own reading, from the same model, so no outside value is needed and no cut-off is invented.
export function checkUpRows(result: LightConeExperimentResult): CheckUpRow[] {
  const { lab, passing } = result
  const intervalAgrees = Math.abs(lab.intervalSquared - passing.intervalSquared) <= 1e-9
  const sameSide = sideOfOne(lab.speedNeeded) === sideOfOne(passing.speedNeeded)
  const fixed = (value: number) => value.toFixed(2).replace('-', '−')
  return [
    {
      what: 'time² − distance² for the passing observer',
      expected: fixed(lab.intervalSquared),
      found: fixed(passing.intervalSquared),
      reading: intervalAgrees ? 'the same' : 'different',
    },
    {
      what: 'The case for the passing observer',
      expected: lab.relation,
      found: passing.relation,
      reading: lab.relation === passing.relation ? 'the same' : 'different',
    },
    {
      what: 'Speed needed, passing observer',
      expected: `${sideOfOne(lab.speedNeeded)} 1, as for the lab (${lab.speedNeeded.toFixed(2)})`,
      found: passing.speedNeeded.toFixed(2),
      reading: sameSide ? 'the same side of 1' : 'different sides of 1',
    },
  ]
}
