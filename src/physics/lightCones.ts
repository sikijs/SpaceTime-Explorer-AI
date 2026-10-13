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
