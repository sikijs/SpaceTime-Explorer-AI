import { timeDilationFactorFor } from './movingClockExperiment'
import { spacetimeDiagramFor } from './spacetimeDiagramView'
import type { WorldlinePoint } from './spacetimeDiagramView'
import type { SimultaneityResult } from './relativityOfSimultaneityExperiment'

// Units: velocity is a fraction of c (c = 1); position in light-seconds, time in seconds — same
// convention as the rest of the app. Converts an event's lab-frame (position, time) into the
// (position, time) a frame moving at `velocity` (relative to the lab) would assign to that same
// event. Reuses Experiment 3's own time dilation factor by division, rather than introducing a
// separately named gamma or duplicating the underlying √(1 − v²) formula.
export function lorentzTransform(event: WorldlinePoint, velocity: number): WorldlinePoint {
  const timeDilationFactor = timeDilationFactorFor(velocity)
  const gammaFactor = 1 / timeDilationFactor

  return {
    time: gammaFactor * (event.time - velocity * event.position),
    position: gammaFactor * (event.position - velocity * event.time),
  }
}

// ---- Experiment 11, audit update (docs/audit/relativity-of-time-and-motion/11-draft-wording.md) ----
// Everything below reads the already-computed experiment result, or calls lorentzTransform above; no relativistic quantity is
// recalculated here (CLAUDE.md §9).

export type TimeChoice = 'same' | 'different'

// Two events agree on a time when they differ by less than this many seconds (rounding only).
const TIME_TOLERANCE = 1e-9

export interface BlockFrameEvents {
  lab: { back: WorldlinePoint; front: WorldlinePoint }
  block: { back: WorldlinePoint; front: WorldlinePoint }
  timesAgree: boolean // do the two events come out at the same time on the block's own clocks?
}

// The two flash events on the lab's clocks and, by the Lorentz transformation, on the block's own clocks. Replaces a fixed
// "the same time" answer: whether the times agree is read from the transformed numbers.
export function blockFrameEventsFor(result: SimultaneityResult): BlockFrameEvents {
  const diagram = spacetimeDiagramFor(result)
  const block = {
    back: lorentzTransform(diagram.backEvent, result.velocity),
    front: lorentzTransform(diagram.frontEvent, result.velocity),
  }
  return {
    lab: { back: diagram.backEvent, front: diagram.frontEvent },
    block,
    timesAgree: Math.abs(block.back.time - block.front.time) <= TIME_TOLERANCE,
  }
}

// The panel "The two events on two sets of clocks" has one time scale from 0 seconds. Part 1 is fixed at 0.5c (the later event is at
// 0.433 s); Part 2 must fit every speed up to 0.9c (the later event is at about 1.09 s).
export const PART1_CLOCKS_SCALE_END = 0.5
export const PART2_CLOCKS_SCALE_END = 1.2

export interface ClockMarker {
  time: number // seconds
  fraction: number // position along the scale, 0 to 1 (more than 1 would be off the scale)
}

export interface ClockRows {
  scaleEnd: number
  lab: { back: ClockMarker; front: ClockMarker }
  block: { back: ClockMarker; front: ClockMarker }
  fits: boolean // every marker is on the scale
}

export function clockRowsFor(result: SimultaneityResult, scaleEnd: number): ClockRows {
  if (!(scaleEnd > 0)) {
    throw new RangeError('The scale must end after 0 seconds')
  }
  const events = blockFrameEventsFor(result)
  const marker = (time: number): ClockMarker => ({ time, fraction: time / scaleEnd })
  const rows = {
    scaleEnd,
    lab: { back: marker(events.lab.back.time), front: marker(events.lab.front.time) },
    block: { back: marker(events.block.back.time), front: marker(events.block.front.time) },
  }
  const fits = [rows.lab.back, rows.lab.front, rows.block.back, rows.block.front].every((m) => m.fraction >= 0 && m.fraction <= 1)
  return { ...rows, fits }
}

// The learner's guess is only "same" or "different", so it is a white marker of two ticks: level, or apart by this example gap in
// seconds. The example gap is never the real gap.
export const EXAMPLE_TICK_GAP = 0.1

export interface TimeGuessMarker {
  kind: 'level' | 'apart'
  gap: number
}

export function timeGuessMarkerFor(choice: TimeChoice): TimeGuessMarker {
  return choice === 'same' ? { kind: 'level', gap: 0 } : { kind: 'apart', gap: EXAMPLE_TICK_GAP }
}

// The tutor's marking of the one guess: what was chosen, what the block's clocks gave, and the numbers behind it. No score, no
// "right" or "wrong" (CLAUDE.md §12, §13): the tutor words it.
export interface TimeGuessMarking {
  chosen: TimeChoice
  actual: TimeChoice
  blockBackTime: number
  blockFrontTime: number
  labBackTime: number
  labFrontTime: number
}

export function markTimeGuess(choice: TimeChoice, result: SimultaneityResult): TimeGuessMarking {
  const events = blockFrameEventsFor(result)
  return {
    chosen: choice,
    actual: events.timesAgree ? 'same' : 'different',
    blockBackTime: events.block.back.time,
    blockFrontTime: events.block.front.time,
    labBackTime: events.lab.back.time,
    labFrontTime: events.lab.front.time,
  }
}

export interface LorentzWorkedNumbers {
  factor: number // the time dilation factor
  inverseFactor: number // 1 divided by that factor
  timeTerm: number // lab time minus speed times lab position
  blockTime: number
  positionTerm: number // lab position minus speed times lab time
  blockPosition: number
}

// Each step of the two formulas for one event, so the page and the tutor quote numbers and do no arithmetic of their own.
export function lorentzWorkedNumbers(event: WorldlinePoint, velocity: number): LorentzWorkedNumbers {
  const factor = timeDilationFactorFor(velocity)
  const inverseFactor = 1 / factor
  const timeTerm = event.time - velocity * event.position
  const positionTerm = event.position - velocity * event.time
  return {
    factor,
    inverseFactor,
    timeTerm,
    blockTime: inverseFactor * timeTerm,
    positionTerm,
    blockPosition: inverseFactor * positionTerm,
  }
}

export type CheckUpReading = 'the same' | 'more' | 'less'

export interface CheckUpRow {
  label: string
  expected: number
  found: number
  reading: CheckUpReading
}

const CHECK_TOLERANCE = 5e-4 // the page shows three decimals

// The transformation's four results beside the numbers earlier chapters worked out by other routes: "At the same time... for
// whom?" reasoned in the block's own frame (rodFrameEventTime), and "Does motion change length?" gave the rest length (half of
// it each side). The expected numbers do not come from the transformation.
export function checkUpRowsFor(result: SimultaneityResult): CheckUpRow[] {
  const events = blockFrameEventsFor(result)
  const row = (label: string, expected: number, found: number): CheckUpRow => ({
    label,
    expected,
    found,
    reading: Math.abs(found - expected) <= CHECK_TOLERANCE ? 'the same' : found > expected ? 'more' : 'less',
  })
  return [
    row("Back event, block's own time", result.rodFrameEventTime, events.block.back.time),
    row("Front event, block's own time", result.rodFrameEventTime, events.block.front.time),
    row("Back event, block's own position", -result.restLength / 2, events.block.back.position),
    row("Front event, block's own position", result.restLength / 2, events.block.front.position),
  ]
}

// The introduction sketch "What a frame's own axes are": the lab's pair and a moving frame's pair, through one point, with made-up
// numbers (a frame at 0.25c). The moving frame's time axis goes `lean` light-seconds across for every second up; its space axis goes
// `lean` seconds up for every light-second across.
export const AXES_SKETCH_LEAN = 0.25
export const AXES_SKETCH_EXTENT = 0.6

export interface AxesSketch {
  lean: number
  labTimeAxis: [WorldlinePoint, WorldlinePoint]
  labSpaceAxis: [WorldlinePoint, WorldlinePoint]
  movingTimeAxis: [WorldlinePoint, WorldlinePoint]
  movingSpaceAxis: [WorldlinePoint, WorldlinePoint]
}

export function axesSketchFor(): AxesSketch {
  const e = AXES_SKETCH_EXTENT
  const lean = AXES_SKETCH_LEAN
  return {
    lean,
    labTimeAxis: [{ position: 0, time: 0 }, { position: 0, time: e }],
    labSpaceAxis: [{ position: 0, time: 0 }, { position: e, time: 0 }],
    movingTimeAxis: [{ position: 0, time: 0 }, { position: lean * e, time: e }],
    movingSpaceAxis: [{ position: 0, time: 0 }, { position: e, time: lean * e }],
  }
}
