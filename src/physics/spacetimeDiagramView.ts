import { runSimultaneityExperiment } from './relativityOfSimultaneityExperiment'
import type { SimultaneityResult } from './relativityOfSimultaneityExperiment'
import { SPEED_OF_LIGHT } from './movingClockExperiment'

// A view layer only: every value here is derived directly from an already-computed
// SimultaneityResult (src/physics/relativityOfSimultaneityExperiment.ts). No relativistic
// quantity is recalculated — this module only turns known positions, times, and the block's
// velocity into straight-line endpoints for a spacetime diagram (position across, time up).
export interface WorldlinePoint {
  position: number // light-seconds
  time: number // seconds
}

export interface SpacetimeDiagramData {
  backWorldline: [WorldlinePoint, WorldlinePoint]
  frontWorldline: [WorldlinePoint, WorldlinePoint]
  leftLightWorldline: [WorldlinePoint, WorldlinePoint]
  rightLightWorldline: [WorldlinePoint, WorldlinePoint]
  backEvent: WorldlinePoint
  frontEvent: WorldlinePoint
}

export function spacetimeDiagramFor(result: SimultaneityResult): SpacetimeDiagramData {
  const { velocity, labLength, backEventLabTime, frontEventLabTime } = result
  const halfLength = labLength / 2
  // The run covers the flash (t = 0) to the later of the two events; the front event is never
  // earlier than the back event (Experiment 7's Required Physics Test 2), so it marks the end.
  const runEndTime = frontEventLabTime

  const backEvent: WorldlinePoint = { position: -halfLength + velocity * backEventLabTime, time: backEventLabTime }
  const frontEvent: WorldlinePoint = { position: halfLength + velocity * frontEventLabTime, time: frontEventLabTime }

  return {
    backWorldline: [
      { position: -halfLength, time: 0 },
      { position: -halfLength + velocity * runEndTime, time: runEndTime },
    ],
    frontWorldline: [
      { position: halfLength, time: 0 },
      { position: halfLength + velocity * runEndTime, time: runEndTime },
    ],
    leftLightWorldline: [
      { position: 0, time: 0 },
      backEvent,
    ],
    rightLightWorldline: [
      { position: 0, time: 0 },
      frontEvent,
    ],
    backEvent,
    frontEvent,
  }
}

// Experiment 9: the line through the two already-known events (backEvent, frontEvent) — the
// "same moment" line for someone riding with the block. This performs no relativistic calculation;
// it only reads the two points spacetimeDiagramFor already computed. Its time-over-position slope
// (not a worldline's usual position-over-time slope, since this is a line of simultaneity, not a
// moving object's path) always equals the block's velocity, following from Experiment 7's own
// physics, not from anything computed here — see spacetimeDiagramView.test.ts.
export function sameMomentLineFor(diagram: SpacetimeDiagramData): [WorldlinePoint, WorldlinePoint] {
  return [diagram.backEvent, diagram.frontEvent]
}

// Experiment 11: the block's own two axes, both through the origin (the flash-release event) —
// pure geometry, no new physics. Their slopes come from lines spacetimeDiagramFor already
// computed; no velocity is passed in separately, and no formula is duplicated.

// The block's own time axis: the worldline of its own spatial origin (its center), parallel to the
// already-drawn back/front worldlines (same velocity), but passing through the origin.
export function rodTimeAxisFor(diagram: SpacetimeDiagramData): [WorldlinePoint, WorldlinePoint] {
  const [start, end] = diagram.backWorldline
  const velocity = (end.position - start.position) / (end.time - start.time)

  return [
    { position: 0, time: 0 },
    { position: velocity * end.time, time: end.time },
  ]
}

// The block's own space axis: its own line of "now" through the origin — the same slope (v,
// time-over-position) as sameMomentLineFor, but anchored at the origin instead of at backEvent
// and frontEvent.
export function rodSpaceAxisFor(diagram: SpacetimeDiagramData): [WorldlinePoint, WorldlinePoint] {
  const [start, end] = diagram.backWorldline
  const velocity = (end.position - start.position) / (end.time - start.time)
  const halfLength = diagram.frontWorldline[0].position

  return [
    { position: -halfLength, time: -velocity * halfLength },
    { position: halfLength, time: velocity * halfLength },
  ]
}

// Experiment 8's introduction sketch ("From a block to two leaning lines"): the same block drawn at several
// moments, one above the other. It reuses Experiment 7's length seen from the lab (which reuses Experiment 6)
// and moves each end at the block's one steady speed; no new relativistic quantity is introduced. The block's
// centre is at position 0 at time 0, as at the flash release in Experiment 7.
export interface BlockPhoto {
  time: number // seconds
  backPosition: number // light-seconds
  frontPosition: number // light-seconds
}

export function blockSketchFor(velocity: number, photoCount: number, timeStep: number): BlockPhoto[] {
  if (!Number.isInteger(photoCount) || photoCount < 1) {
    throw new RangeError('The number of photos must be a whole number >= 1')
  }
  if (!(timeStep > 0) || !isFinite(timeStep)) {
    throw new RangeError('The time between photos must be a finite number > 0')
  }
  const halfLength = runSimultaneityExperiment(velocity).labLength / 2
  return Array.from({ length: photoCount }, (_, i) => {
    const time = i * timeStep
    return { time, backPosition: -halfLength + velocity * time, frontPosition: halfLength + velocity * time }
  })
}

// Experiment 8's second introduction sketch ("From a flash to two leaning lines"): where the two parts of a flash are at several
// moments after it is released from position 0 at time 0. Light travels at c in both directions (Experiment 5), so after a time t
// each part is c * t from the release point. No block is involved and nothing relativistic is added.
export interface FlashPhoto {
  time: number // seconds
  leftPosition: number // light-seconds
  rightPosition: number // light-seconds
}

export function flashSketchFor(photoCount: number, timeStep: number): FlashPhoto[] {
  if (!Number.isInteger(photoCount) || photoCount < 1) {
    throw new RangeError('The number of photos must be a whole number >= 1')
  }
  if (!(timeStep > 0) || !isFinite(timeStep)) {
    throw new RangeError('The time between photos must be a finite number > 0')
  }
  return Array.from({ length: photoCount }, (_, i) => {
    const time = i * timeStep
    return { time, leftPosition: -SPEED_OF_LIGHT * time, rightPosition: SPEED_OF_LIGHT * time }
  })
}

// ---- Experiment 8, audit update (docs/audit/relativity-of-time-and-motion/08-draft-wording.md) ----
// Everything below only reads the already-computed diagram or result; no relativistic quantity is recalculated.

export type OrderChoice = 'same' | 'back' | 'front'

export const orderWording: Record<OrderChoice, string> = {
  same: 'both at the same time',
  back: "the back end's worldline first",
  front: "the front end's worldline first",
}

// The back event is never later than the front event; they coincide only at v = 0 (Experiment 7, Required Physics Test 2, reused here
// without recomputation).
export function actualOrderFor(result: SimultaneityResult): OrderChoice {
  return result.velocity === 0 ? 'same' : 'back'
}

// Where the learner's guess is drawn: a ring round the back dot, a ring round the front dot, or a ring round both. The guess has no
// size or position of its own, so this only says which real dot or dots the white marker points at. (A line joining the two dots is
// deliberately not offered: it would be the "same moment" line that Experiment 9 asks the learner to predict.)
export interface GuessMarkerTarget {
  pointsAt: 'backDot' | 'frontDot' | 'bothDots'
  points: WorldlinePoint[]
}

export function guessMarkerFor(diagram: SpacetimeDiagramData, choice: OrderChoice): GuessMarkerTarget {
  if (choice === 'back') return { pointsAt: 'backDot', points: [diagram.backEvent] }
  if (choice === 'front') return { pointsAt: 'frontDot', points: [diagram.frontEvent] }
  return { pointsAt: 'bothDots', points: [diagram.backEvent, diagram.frontEvent] }
}

// Tick marks for the two axes: multiples of `step` that cover every point of the diagram, from the first multiple below the leftmost
// point to the first multiple above the rightmost one (position), and from 0 up to the first multiple above the latest time (time).
export interface DiagramTicks {
  positions: number[]
  times: number[]
  positionMin: number
  positionMax: number
  timeMax: number
}

// Given several diagrams (Part 2 draws every run at one scale), the ticks cover all of them.
export function diagramTicksFor(diagram: SpacetimeDiagramData | SpacetimeDiagramData[], step = 0.1): DiagramTicks {
  if (!(step > 0) || !isFinite(step)) {
    throw new RangeError('The tick step must be a finite number > 0')
  }
  const diagrams = Array.isArray(diagram) ? diagram : [diagram]
  const points = diagrams.flatMap((d) => [...d.backWorldline, ...d.frontWorldline, ...d.leftLightWorldline, ...d.rightLightWorldline])
  const minPosition = Math.min(0, ...points.map((p) => p.position))
  const maxPosition = Math.max(0, ...points.map((p) => p.position))
  const maxTime = Math.max(...points.map((p) => p.time))
  const eps = 1e-9
  const lowIndex = Math.floor(minPosition / step + eps)
  const highIndex = Math.ceil(maxPosition / step - eps)
  const timeIndex = Math.max(1, Math.ceil(maxTime / step - eps))
  const at = (index: number) => parseFloat((index * step).toFixed(6))
  const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => at(from + i))
  return {
    positions: range(lowIndex, highIndex),
    times: range(0, timeIndex),
    positionMin: at(lowIndex),
    positionMax: at(highIndex),
    timeMax: at(timeIndex),
  }
}

// The tutor's marking of the one guess: what was chosen, what the diagram shows, and the numbers behind it. No score, no "right" or
// "wrong" (CLAUDE.md §12, §13): the tutor words it.
export interface OrderGuessMarking {
  chosen: OrderChoice
  actual: OrderChoice
  backTime: number
  frontTime: number
  gap: number
}

export function markOrderGuess(choice: OrderChoice, result: SimultaneityResult): OrderGuessMarking {
  return {
    chosen: choice,
    actual: actualOrderFor(result),
    backTime: result.backEventLabTime,
    frontTime: result.frontEventLabTime,
    gap: result.labTimeGap,
  }
}
