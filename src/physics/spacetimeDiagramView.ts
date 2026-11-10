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
