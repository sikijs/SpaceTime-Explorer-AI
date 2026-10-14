import { SPEED_OF_LIGHT } from './movingClockExperiment'
import { lorentzTransform } from './lorentzTransform'
import { intervalSquared } from './spacetimeInterval'
import { classifyEventPair, EVENT_O, INTERVAL_ZERO_TOLERANCE } from './lightCones'
import type { EventRelation } from './lightCones'
import type { WorldlinePoint } from './spacetimeDiagramView'

// Units: velocity is a fraction of c (c = 1); time in seconds, distance in light-seconds.

// Which of two events an observer finds first, from the sign of the time between them.
//   o-first:     the time from the first event (O) to the second (B) is positive
//   same-moment: the time between them is zero, within the stated tolerance
//   b-first:     the time between them is negative, so B happened before O for this observer
export type EventOrder = 'o-first' | 'same-moment' | 'b-first'

// A transformed "same moment" pair is zero only up to floating-point rounding, so "zero" means within this.
export const TIME_ZERO_TOLERANCE = INTERVAL_ZERO_TOLERANCE

export function eventOrder(a: WorldlinePoint, b: WorldlinePoint): EventOrder {
  const timeBetween = b.time - a.time
  if (Math.abs(timeBetween) <= TIME_ZERO_TOLERANCE) return 'same-moment'
  return timeBetween > 0 ? 'o-first' : 'b-first'
}

// The passing speed (a fraction of c) at which O and B are at the same moment: t ÷ x.
// Null when there is no such speed below the speed of light, which is exactly when B is inside or on the light cone.
export function simultaneitySpeed(event: WorldlinePoint): number | null {
  if (event.position === 0) return null
  const speed = event.time / event.position
  return Math.abs(speed) < SPEED_OF_LIGHT - TIME_ZERO_TOLERANCE ? speed : null
}

export interface OrderReading {
  // Signed: positive means B is later than O, negative means B is earlier.
  timeBetween: number
  distanceBetween: number
  intervalSquared: number
  relation: EventRelation
  order: EventOrder
}

export interface CauseBeforeEffectResult {
  event: WorldlinePoint
  passingObserverSpeed: number
  lab: OrderReading
  passing: OrderReading
  simultaneitySpeed: number | null
  // The passing observer's same-moment line through O, drawn on the lab's diagram: time over position, equal to the speed.
  sameMomentLineSlope: number
}

function readingFor(a: WorldlinePoint, b: WorldlinePoint): OrderReading {
  return {
    timeBetween: b.time - a.time,
    distanceBetween: b.position - a.position,
    intervalSquared: intervalSquared(a, b),
    relation: classifyEventPair(a, b),
    order: eventOrder(a, b),
  }
}

// Event O is "here, now" in the lab. The passing observer's numbers come from the Lorentz transformation
// (first chapter, Experiment 11), not from any new formula.
export function runCauseBeforeEffectExperiment(
  event: WorldlinePoint,
  passingObserverSpeed: number,
): CauseBeforeEffectResult {
  if (!(event.time > 0)) {
    throw new RangeError('Event B must happen after event O (time > 0)')
  }
  if (!(Math.abs(passingObserverSpeed) < SPEED_OF_LIGHT)) {
    throw new RangeError('Passing observer speed must satisfy |u| < c')
  }

  return {
    event,
    passingObserverSpeed,
    lab: readingFor(EVENT_O, event),
    passing: readingFor(
      lorentzTransform(EVENT_O, passingObserverSpeed),
      lorentzTransform(event, passingObserverSpeed),
    ),
    simultaneitySpeed: simultaneitySpeed(event),
    sameMomentLineSlope: passingObserverSpeed,
  }
}
