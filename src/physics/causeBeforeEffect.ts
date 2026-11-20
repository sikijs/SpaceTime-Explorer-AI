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

// ---- Audit update (Spacetime Geometry 3): the strip of observer speeds, the guess marker and the check-up ----
// docs/audit/spacetime-geometry/03-draft-wording.md. Nothing above changes. The strip answers "for every passing speed from −c to +c,
// which event is found first?" from the one fact that the time between is γ × (t − u × x): its sign is the sign of t − u × x.

// The three kinds of place on the strip.
export type StripRegion = 'o-first' | 'same-moment' | 'b-first'

export interface OrderStretch {
  order: 'o-first' | 'b-first'
  // Speeds as a fraction of c, from the lower to the upper end; the end points are −c and +c or the same-moment speed.
  from: number
  to: number
}

export interface OrderStrip {
  event: WorldlinePoint
  // The speed at which O and B are at the same moment, or null when no speed below c does that (B inside or on the cone).
  flipSpeed: number | null
  // Stretches from −c to +c in order, split at the flip speed. The flip speed itself (the same moment) is a point, not a stretch.
  stretches: OrderStretch[]
}

export function orderStripForEvent(event: WorldlinePoint): OrderStrip {
  if (!(event.time > 0)) {
    throw new RangeError('Event B must happen after event O (time > 0)')
  }
  const flipSpeed = simultaneitySpeed(event)
  if (flipSpeed === null) {
    return { event, flipSpeed, stretches: [{ order: 'o-first', from: -SPEED_OF_LIGHT, to: SPEED_OF_LIGHT }] }
  }
  // time between ∝ t − u × x. For x > 0 it is positive below the flip speed; for x < 0 it is positive above it.
  const belowOrder = event.position > 0 ? 'o-first' : 'b-first'
  const aboveOrder = event.position > 0 ? 'b-first' : 'o-first'
  return {
    event,
    flipSpeed,
    stretches: [
      { order: belowOrder, from: -SPEED_OF_LIGHT, to: flipSpeed },
      { order: aboveOrder, from: flipSpeed, to: SPEED_OF_LIGHT },
    ],
  }
}

// The order a passing observer at speed u finds, read from the strip (not from the Lorentz transformation).
export function orderFromStrip(strip: OrderStrip, speed: number): EventOrder {
  if (strip.flipSpeed !== null && Math.abs(speed - strip.flipSpeed) <= TIME_ZERO_TOLERANCE) return 'same-moment'
  const stretch = strip.stretches.find((s) => speed >= s.from && speed <= s.to)
  if (!stretch) throw new RangeError('Passing observer speed must satisfy |u| < c')
  return stretch.order
}

// The three answers of the prediction (the interface's labels are in CauseBeforeEffectExperiment.tsx).
export type PredictionAnswer = 'yes' | 'same-moment' | 'no'

// The kind of place each answer names on the strip: "B first" for yes, "the same moment" for the second, "O first" for no.
export function guessRegion(answer: PredictionAnswer): StripRegion {
  if (answer === 'yes') return 'b-first'
  if (answer === 'same-moment') return 'same-moment'
  return 'o-first'
}

// Where the white ring goes: the middle of the stretch the answer names, or the flip speed for the same moment.
// Null when the strip has no such place (for example "B first" on an event inside the cone); the marker is then not drawn.
export function guessMarkerSpeed(answer: PredictionAnswer, strip: OrderStrip): number | null {
  const region = guessRegion(answer)
  if (region === 'same-moment') return strip.flipSpeed
  const stretch = strip.stretches.find((s) => s.order === region)
  return stretch ? (stretch.from + stretch.to) / 2 : null
}

// Which of the three kinds of place the strip really has. The real picture; the guess never changes it.
export function regionsOnStrip(strip: OrderStrip): StripRegion[] {
  const regions: StripRegion[] = []
  for (const s of strip.stretches) if (!regions.includes(s.order)) regions.push(s.order)
  if (strip.flipSpeed !== null) regions.push('same-moment')
  return regions
}

// Whether the answer agrees with the strip. "yes": the strip has a "B first" stretch. "no": it has none. "same-moment" (an observer
// could find the same moment, but none could find B first): the strip has a same-moment speed and no "B first" stretch. That last
// case never holds, because wherever the same moment occurs a slightly faster observer finds B first. Used by the tutor, not the picture.
export function guessMatchesStrip(answer: PredictionAnswer, strip: OrderStrip): boolean {
  const regions = regionsOnStrip(strip)
  const hasB = regions.includes('b-first')
  if (answer === 'yes') return hasB
  if (answer === 'no') return !hasB
  return regions.includes('same-moment') && !hasB
}

export interface CheckUpRow {
  label: string
  expected: string
  found: string
  // True when expected and found are the same; the interface words the reading.
  same: boolean
}

// The three comparisons of the check-up. Each expected value is derived without the passing observer's own numbers:
// the lab's value (the interval is the same for every observer), the lab's case, and the order the strip gives for this speed.
export function checkUpRows(result: CauseBeforeEffectResult): CheckUpRow[] {
  const strip = orderStripForEvent(result.event)
  const expectedOrder = orderFromStrip(strip, result.passingObserverSpeed)
  const intervalClose =
    Math.abs(result.passing.intervalSquared - result.lab.intervalSquared) <= 1e-9 * Math.max(1, Math.abs(result.lab.intervalSquared))
  return [
    {
      label: 'time² − distance² for the passing observer',
      expected: result.lab.intervalSquared.toFixed(2),
      found: result.passing.intervalSquared.toFixed(2),
      same: intervalClose,
    },
    {
      label: 'Which case, for the passing observer',
      expected: result.lab.relation,
      found: result.passing.relation,
      same: result.passing.relation === result.lab.relation,
    },
    {
      label: 'Which event the passing observer finds first, against the strip of speeds',
      expected: expectedOrder,
      found: result.passing.order,
      same: expectedOrder === result.passing.order,
    },
  ]
}
