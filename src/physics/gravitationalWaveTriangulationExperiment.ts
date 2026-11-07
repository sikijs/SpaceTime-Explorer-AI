// A single detector can only say a wave arrived — not which direction it came from. This
// experiment reuses no chirp/strain physics from Experiments 1-5; it is entirely about plane-wave
// arrival-time geometry, driven by the real, invariant speed of light already established in the
// Relativity of Time and Motion chapter (Experiment 5).
//
// Three real detectors (Hanford, Livingston, Virgo) are placed on a flat, illustrative schematic
// plane (not a real map or real 3D Earth coordinates), at positions chosen only so their pairwise
// straight-line separations approximate their real, published separations:
// Hanford-Livingston ~3,000 km, Hanford-Virgo ~8,700 km, Livingston-Virgo ~7,500 km.
//
// Audit update (2026-11-07, docs/audit/gravitational-waves/06-draft-wording.md, section 10): the
// functions below arrivalOrderFor compute every number the picture, the timeline, the tables, the
// guess marks and the tutor show. They add no physics: a gap is a difference of two arrival times,
// and its limit is the pair's separation divided by c.

export interface DetectorPosition {
  name: string
  x: number // km, schematic flat-plane coordinates
  y: number // km
}

export const REAL_SPEED_OF_LIGHT_KM_PER_S = 299_792.458 // km / s

export const DETECTORS: DetectorPosition[] = [
  { name: 'Hanford', x: 0, y: 0 },
  { name: 'Livingston', x: 3000, y: 0 },
  { name: 'Virgo', x: 4740, y: 7295.4 },
]

export interface DirectionPreset {
  label: string
  directionDegrees: number
}

// Chosen so each preset produces a different detector reached first, and a different full
// arrival order overall (verified by this module's tests) - the premise the prediction activity
// depends on.
export const DIRECTION_PRESETS: DirectionPreset[] = [
  { label: 'Direction A', directionDegrees: 0 },
  { label: 'Direction B', directionDegrees: 250 },
  { label: 'Direction C', directionDegrees: 280 },
]

function centroidOf(detectors: DetectorPosition[]): { x: number; y: number } {
  const x = detectors.reduce((sum, d) => sum + d.x, 0) / detectors.length
  const y = detectors.reduce((sum, d) => sum + d.y, 0) / detectors.length
  return { x, y }
}

// Time at which the wavefront reaches a detector, relative to the detector array's centroid
// (t = 0 at the centroid). directionDegrees is the direction the wave travels FROM, measured as a
// standard math angle (0 deg = +x axis, counterclockwise). A detector further toward that
// direction is reached earlier (a negative time); one further away is reached later (a positive
// time). This is the standard plane-wave arrival-time relationship,
// t(detector) = -(detectorPosition relative to centroid) . (unit vector toward the source) / c.
export function arrivalTimeSeconds(detector: DetectorPosition, directionDegrees: number): number {
  const centroid = centroidOf(DETECTORS)
  const relativeX = detector.x - centroid.x
  const relativeY = detector.y - centroid.y

  const radians = (directionDegrees * Math.PI) / 180
  const towardSourceX = Math.cos(radians)
  const towardSourceY = Math.sin(radians)

  const projectionKm = relativeX * towardSourceX + relativeY * towardSourceY

  return -projectionKm / REAL_SPEED_OF_LIGHT_KM_PER_S
}

export interface DetectorArrival {
  detector: DetectorPosition
  arrivalTimeSeconds: number
}

// Arrival times for all three fixed detectors under one direction preset, sorted earliest to
// latest.
export function arrivalOrderFor(directionDegrees: number): DetectorArrival[] {
  return DETECTORS.map((detector) => ({
    detector,
    arrivalTimeSeconds: arrivalTimeSeconds(detector, directionDegrees),
  })).sort((a, b) => a.arrivalTimeSeconds - b.arrivalTimeSeconds)
}

// ---- Fixed values of this experiment ----
export const TRIANGULATION_PART1_DIRECTION_INDEX = 0 // Direction A, the one direction of Part 1
export const TIMELINE_MAX_MS = 30 // the timeline's fixed scale: above the largest gap of any preset (28.27 ms)

export type DetectorName = 'Hanford' | 'Livingston' | 'Virgo'
export type FirstDetectorChoice = DetectorName
export type TimingChoice = 'same' | 'different'

const TIMING_TOLERANCE_MS = 0.01 // below this the three detectors count as "essentially the same instant"
const LIMIT_TOLERANCE_MS = 1e-6 // rounding only: "at the limit" means equal to this precision

function detectorByName(name: DetectorName): DetectorPosition {
  const found = DETECTORS.find((detector) => detector.name === name)
  if (!found) throw new Error(`No detector named ${name}`)
  return found
}

// The most two detectors can ever lag each other: their straight-line separation divided by c.
export function pairLimitMs(a: DetectorName, b: DetectorName): number {
  const first = detectorByName(a)
  const second = detectorByName(b)
  const separationKm = Math.hypot(first.x - second.x, first.y - second.y)
  return (separationKm / REAL_SPEED_OF_LIGHT_KM_PER_S) * 1000
}

export const DETECTOR_PAIRS: Array<[DetectorName, DetectorName]> = [
  ['Hanford', 'Livingston'],
  ['Hanford', 'Virgo'],
  ['Livingston', 'Virgo'],
]

export interface ArrivalSummary {
  directionDegrees: number
  // earliest first, with each detector's time after the first one, in milliseconds
  order: Array<{ name: DetectorName; afterFirstMs: number }>
  firstDetector: DetectorName
  lastDetector: DetectorName
  // first to last: the largest gap between any two detectors
  maxGapMs: number
  // the gap between each pair, and the most it could be
  pairGaps: Array<{ a: DetectorName; b: DetectorName; gapMs: number; limitMs: number }>
}

export function arrivalSummary(directionDegrees: number): ArrivalSummary {
  const arrivals = arrivalOrderFor(directionDegrees)
  const t0 = arrivals[0].arrivalTimeSeconds
  const order = arrivals.map((arrival) => ({
    name: arrival.detector.name as DetectorName,
    afterFirstMs: (arrival.arrivalTimeSeconds - t0) * 1000,
  }))
  const afterFirst = (name: DetectorName) => order.find((entry) => entry.name === name)!.afterFirstMs
  return {
    directionDegrees,
    order,
    firstDetector: order[0].name,
    lastDetector: order[order.length - 1].name,
    maxGapMs: order[order.length - 1].afterFirstMs,
    pairGaps: DETECTOR_PAIRS.map(([a, b]) => ({
      a,
      b,
      gapMs: Math.abs(afterFirst(a) - afterFirst(b)),
      limitMs: pairLimitMs(a, b),
    })),
  }
}

// ---- The learner's two guesses ----
export const firstDetectorOutcome = (directionDegrees: number): DetectorName => arrivalSummary(directionDegrees).firstDetector

export const firstDetectorGuessMatches = (choice: FirstDetectorChoice, directionDegrees: number): boolean =>
  choice === firstDetectorOutcome(directionDegrees)

// "same" only if the largest gap is below 0.01 ms; otherwise "different".
export function timingOutcome(directionDegrees: number): TimingChoice {
  return arrivalSummary(directionDegrees).maxGapMs < TIMING_TOLERANCE_MS ? 'same' : 'different'
}

export const timingGuessMatches = (choice: TimingChoice, directionDegrees: number): boolean => choice === timingOutcome(directionDegrees)

// Guess 2 has no size of its own, so the mark is a sign only (an equals sign, or "not equal").
export type TimingMarker = 'equals' | 'notEqual'
export const timingGuessMarker = (choice: TimingChoice): TimingMarker => (choice === 'same' ? 'equals' : 'notEqual')

export type LimitWord = 'at the limit' | 'less than the limit'

// The check-up's plain reading. A gap can never be bigger than its limit (a wave cannot arrive
// before it could have travelled between the two detectors), so a larger one is an error.
export function gapVersusLimitWord(gapMs: number, limitMs: number): LimitWord {
  if (gapMs > limitMs + LIMIT_TOLERANCE_MS) throw new RangeError('A gap cannot be larger than its limit')
  return Math.abs(limitMs - gapMs) <= LIMIT_TOLERANCE_MS ? 'at the limit' : 'less than the limit'
}

// ---- Table 2: the learner's direction beside the Part 1 direction ----
export type ComparisonWord = 'the same' | 'more' | 'less'
export type DetectorComparisonWord = 'the same' | 'different'

export function compareWord(yours: number, part1: number): ComparisonWord {
  if (Math.abs(yours - part1) <= LIMIT_TOLERANCE_MS) return 'the same'
  return yours > part1 ? 'more' : 'less'
}

export interface YourDirectionComparison {
  yours: ArrivalSummary
  part1: ArrivalSummary
  atPart1Direction: boolean
  words: {
    first: DetectorComparisonWord
    second: DetectorComparisonWord
    third: DetectorComparisonWord
    maxGap: ComparisonWord
  }
  // Every pair gap is within its limit (always true: a wave cannot beat c)
  everyGapWithinLimit: boolean
}

export function yourDirectionComparison(directionIndex: number): YourDirectionComparison {
  const preset = DIRECTION_PRESETS[directionIndex]
  const part1Preset = DIRECTION_PRESETS[TRIANGULATION_PART1_DIRECTION_INDEX]
  if (!preset) throw new RangeError('No such direction preset')
  const yours = arrivalSummary(preset.directionDegrees)
  const part1 = arrivalSummary(part1Preset.directionDegrees)
  const same = (a: DetectorName, b: DetectorName): DetectorComparisonWord => (a === b ? 'the same' : 'different')
  return {
    yours,
    part1,
    atPart1Direction: directionIndex === TRIANGULATION_PART1_DIRECTION_INDEX,
    words: {
      first: same(yours.order[0].name, part1.order[0].name),
      second: same(yours.order[1].name, part1.order[1].name),
      third: same(yours.order[2].name, part1.order[2].name),
      maxGap: compareWord(yours.maxGapMs, part1.maxGapMs),
    },
    everyGapWithinLimit: yours.pairGaps.every((pair) => pair.gapMs <= pair.limitMs + LIMIT_TOLERANCE_MS),
  }
}
