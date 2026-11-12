import { runGravitationalTimeDilationExperiment, ceilingTicksPerFloorTick } from './gravitationalTimeDilationExperiment'
import { runTidalEffectExperiment, finalSeparationMeters, EARTH_GRAVITY } from './tidalEffectExperiment'

// relativeMass and relativeDistance are dimensionless learner-facing presets, not real
// kilograms or meters. The derived strengths feed directly into Experiment 2's
// runGravitationalTimeDilationExperiment and Experiment 3's runTidalEffectExperiment,
// unmodified, so this file adds no new fundamental physics — only the mapping from
// "how much mass, how far away" to the two experiments' own existing abstracted controls.
//
// timeDilationStrength scales with relativeMass / relativeDistance (first-order weak-field
// potential scaling); convergenceStrength scales with relativeMass / relativeDistance^3
// (first-order tidal-gradient scaling) — so the tidal effect grows faster with proximity
// than time dilation does, matching the real relations these controls stand in for.
export const K_DILATION = 0.3
export const K_TIDAL = 1.2

// Matches Experiment 2's and Experiment 3's own required strict-(0, 1) range, and the
// custom "Other" ranges documented in each experiment's own UI (0.05-0.9 for time
// dilation, 0.02-0.9 for convergence), so this file can never hand either experiment's
// physics function a value it would reject.
export const TIME_DILATION_STRENGTH_MIN = 0.05
export const TIME_DILATION_STRENGTH_MAX = 0.9
export const CONVERGENCE_STRENGTH_MIN = 0.02
export const CONVERGENCE_STRENGTH_MAX = 0.9

export interface SpacetimeCurvatureStrengths {
  timeDilationStrength: number
  convergenceStrength: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function strengthsForMassAndDistance(relativeMass: number, relativeDistance: number): SpacetimeCurvatureStrengths {
  if (!(relativeMass > 0)) {
    throw new RangeError('Relative mass must be greater than 0')
  }
  if (!(relativeDistance > 0)) {
    throw new RangeError('Relative distance must be greater than 0')
  }

  const timeDilationStrength = clamp(
    (K_DILATION * relativeMass) / relativeDistance,
    TIME_DILATION_STRENGTH_MIN,
    TIME_DILATION_STRENGTH_MAX
  )
  const convergenceStrength = clamp(
    (K_TIDAL * relativeMass) / relativeDistance ** 3,
    CONVERGENCE_STRENGTH_MIN,
    CONVERGENCE_STRENGTH_MAX
  )

  return { timeDilationStrength, convergenceStrength }
}

// ---- Audit update (2026-11-12): the four guesses, the strength lines, the outcome, the markers and the worked numbers ----
// Nothing above changes (the constants, the presets and the limits are the approved ones). The real outcome never depends on a guess.

export type Effect = 'dilation' | 'tidal'
export type PredictionChoice = 'stronger' | 'weaker' | 'same'
export type PredictionKey = 'closerDilation' | 'closerTidal' | 'biggerDilation' | 'biggerTidal'

// The most any strength can reach: both limits above are 0.9.
export const STRENGTH_CAP = 0.9
// The vertical axis of every strength graph runs from 0 to this value, so that the cap line has room above it (a change of scale only).
export const STRENGTH_AXIS_TOP = 1

export const MEDIUM_MASS = 2
export const MEDIUM_DISTANCE = 2
// The preset ends of each sweep: Far (4) to Close (1) for the distance, Small (1) to Large (4) for the mass.
export const FAR_DISTANCE = 4
export const CLOSE_DISTANCE = 1
export const SMALL_MASS = 1
export const LARGE_MASS = 4

export interface PredictionSetup {
  key: PredictionKey
  effect: Effect
  // The quantity the guess moves, the other quantity held at Medium, and the two ends of the move.
  variable: 'distance' | 'mass'
  fixedValue: number
  from: number
  to: number
}

export function predictionSetup(key: PredictionKey): PredictionSetup {
  switch (key) {
    case 'closerDilation':
      return { key, effect: 'dilation', variable: 'distance', fixedValue: MEDIUM_MASS, from: FAR_DISTANCE, to: CLOSE_DISTANCE }
    case 'closerTidal':
      return { key, effect: 'tidal', variable: 'distance', fixedValue: MEDIUM_MASS, from: FAR_DISTANCE, to: CLOSE_DISTANCE }
    case 'biggerDilation':
      return { key, effect: 'dilation', variable: 'mass', fixedValue: MEDIUM_DISTANCE, from: SMALL_MASS, to: LARGE_MASS }
    case 'biggerTidal':
      return { key, effect: 'tidal', variable: 'mass', fixedValue: MEDIUM_DISTANCE, from: SMALL_MASS, to: LARGE_MASS }
  }
}

export const PREDICTION_KEYS: PredictionKey[] = ['closerDilation', 'closerTidal', 'biggerDilation', 'biggerTidal']

// The strength the formula gives before the limits are applied.
export function rawStrength(effect: Effect, mass: number, distance: number): number {
  return effect === 'dilation' ? (K_DILATION * mass) / distance : (K_TIDAL * mass) / distance ** 3
}

// The strength Experiments 2 and 3 are given, after the limits.
export function strengthOf(effect: Effect, mass: number, distance: number): number {
  const s = strengthsForMassAndDistance(mass, distance)
  return effect === 'dilation' ? s.timeDilationStrength : s.convergenceStrength
}

// True when the formula's value was outside the limits, so that the page used a limit instead.
export function isCapped(effect: Effect, mass: number, distance: number): boolean {
  return Math.abs(strengthOf(effect, mass, distance) - rawStrength(effect, mass, distance)) > 1e-12
}

export interface StrengthPoint {
  // The mass or the distance at this point of the sweep.
  x: number
  strength: number
}

// The start and end of a sweep that must also show the learner's own value (Part 2's "Other"): the distance runs from the far end to
// the close end, the mass from the small end to the large end.
export function sweepRange(variable: 'distance' | 'mass', chosenValue?: number): { start: number; end: number } {
  if (variable === 'distance') {
    return { start: Math.max(FAR_DISTANCE, chosenValue ?? 0), end: Math.min(CLOSE_DISTANCE, chosenValue ?? Infinity) }
  }
  return { start: Math.min(SMALL_MASS, chosenValue ?? Infinity), end: Math.max(LARGE_MASS, chosenValue ?? 0) }
}

// One strength line, sampled along a sweep: for the distance, the mass is held at `fixedValue`; for the mass, the distance is.
export function strengthLine(
  effect: Effect,
  variable: 'distance' | 'mass',
  fixedValue: number,
  range: { start: number; end: number },
  samples = 30
): StrengthPoint[] {
  return Array.from({ length: samples + 1 }, (_, i) => {
    const x = range.start + ((range.end - range.start) * i) / samples
    return {
      x,
      strength: variable === 'distance' ? strengthOf(effect, fixedValue, x) : strengthOf(effect, x, fixedValue),
    }
  })
}

// The line for one of the four guesses, over the preset range.
export function strengthLineFor(key: PredictionKey, samples = 30): StrengthPoint[] {
  const setup = predictionSetup(key)
  return strengthLine(setup.effect, setup.variable, setup.fixedValue, { start: setup.from, end: setup.to }, samples)
}

// The strength at the start and at the end of a guess's move.
export function endStrengths(key: PredictionKey): { start: number; end: number; endCapped: boolean } {
  const setup = predictionSetup(key)
  const at = (x: number) => (setup.variable === 'distance' ? [setup.fixedValue, x] : [x, setup.fixedValue])
  const [m0, d0] = at(setup.from)
  const [m1, d1] = at(setup.to)
  return {
    start: strengthOf(setup.effect, m0, d0),
    end: strengthOf(setup.effect, m1, d1),
    endCapped: isCapped(setup.effect, m1, d1),
  }
}

// Computed, not typed: it compares the strength at the two ends of the move. At the page's Medium setups all four come out
// "stronger". (The old interface had a hard-coded "stronger" that was not true at the cap: at Close distance the tidal strength is
// 0.900 for every mass.)
export function actualOutcomeFor(key: PredictionKey): PredictionChoice {
  const { start, end } = endStrengths(key)
  if (Math.abs(end - start) < 1e-9) return 'same'
  return end > start ? 'stronger' : 'weaker'
}

// How a strength is written on the page: at least three decimals, and four where a fourth is needed (0.0375).
export function formatStrength(value: number): string {
  const trimmed = String(+value.toFixed(4))
  const [whole, frac = ''] = trimmed.split('.')
  return `${whole}.${frac.padEnd(3, '0')}`
}

export type GuessArrow = 'up' | 'none' | 'down'

const KEY_NAME: Record<PredictionKey, string> = {
  closerDilation: 'closer mass, time dilation',
  closerTidal: 'closer mass, tidal effect',
  biggerDilation: 'bigger mass, time dilation',
  biggerTidal: 'bigger mass, tidal effect',
}
const CHOICE_PHRASE: Record<PredictionChoice, string> = {
  stronger: 'the effect gets stronger',
  weaker: 'the effect gets weaker',
  same: 'the effect stays the same',
}
const CHOICE_PHRASE_PLAIN: Record<PredictionChoice, string> = {
  stronger: 'get stronger',
  weaker: 'get weaker',
  same: 'stay the same',
}

export interface GuessMarker {
  // Where the white ring sits on its graph: the end of the line (Close for the distance, Large for the mass).
  x: number
  strength: number
  // The direction guessed. It has no length: the guess has no size of its own.
  arrow: GuessArrow
  boxText: string
}

// A three-way guess has a direction but no size, so the ring sits at the end of the line whichever choice was made, and the arrow shows
// only the direction guessed. It is only a marker.
export function guessMarkerFor(key: PredictionKey, choice: PredictionChoice): GuessMarker {
  const setup = predictionSetup(key)
  return {
    x: setup.to,
    strength: endStrengths(key).end,
    arrow: choice === 'stronger' ? 'up' : choice === 'weaker' ? 'down' : 'none',
    boxText: `YOUR GUESS, ${KEY_NAME[key]} (a marker only): ${CHOICE_PHRASE[choice]}`,
  }
}

export interface GuessMarking {
  matched: boolean
  // The tutor's opening sentence for this guess: what the guess was and what the graph showed.
  text: string
}

const MOVE_PHRASE: Record<PredictionKey, string> = {
  closerDilation: 'the time-dilation effect would ${choice} when the mass moves closer',
  closerTidal: 'the tidal effect would ${choice} when the mass moves closer',
  biggerDilation: 'the time-dilation effect would ${choice} when the mass is bigger',
  biggerTidal: 'the tidal effect would ${choice} when the mass is bigger',
}

export function markGuess(key: PredictionKey, choice: PredictionChoice): GuessMarking {
  const setup = predictionSetup(key)
  const actual = actualOutcomeFor(key)
  const matched = choice === actual
  const { start, end, endCapped } = endStrengths(key)
  const [startName, endName] = setup.variable === 'distance' ? ['Far', 'Close'] : ['Small', 'Large']
  const verb = actual === 'stronger' ? 'rises' : actual === 'weaker' ? 'falls' : 'stays'
  const shown =
    actual === 'same'
      ? `The line stays at ${formatStrength(end)}.`
      : `The line ${verb} from ${formatStrength(start)} at ${startName} to ${formatStrength(end)} at ${endName}${endCapped ? ', where it reaches the cap' : ''}.`
  return {
    matched,
    text:
      `You guessed that ${MOVE_PHRASE[key].replace('${choice}', CHOICE_PHRASE_PLAIN[choice])}. ${shown} ` +
      (matched ? 'So your guess matched what the graph shows.' : 'So the graph shows something different from your guess.'),
  }
}

// The distance below which the tidal strength is held at the cap, for a given mass (about 1.387 at Medium mass).
export function tidalCapDistance(mass: number): number {
  return (K_TIDAL * mass / STRENGTH_CAP) ** (1 / 3)
}

export interface WorkedNumbers {
  mediumDilation: number
  mediumTidal: number
  farDilation: number
  farTidal: number
  closeDilation: number
  closeTidalFormula: number
  closeTidal: number
  largeCloseDilationFormula: number
  largeCloseTidalFormula: number
  smallFarDilation: number
  smallFarTidalFormula: number
  smallFarTidal: number
  tidalCapDistanceAtMediumMass: number
}

// The numbers the caption, the tutor and Part 2's caption use.
export function workedNumbers(): WorkedNumbers {
  return {
    mediumDilation: strengthOf('dilation', MEDIUM_MASS, MEDIUM_DISTANCE),
    mediumTidal: strengthOf('tidal', MEDIUM_MASS, MEDIUM_DISTANCE),
    farDilation: strengthOf('dilation', MEDIUM_MASS, FAR_DISTANCE),
    farTidal: strengthOf('tidal', MEDIUM_MASS, FAR_DISTANCE),
    closeDilation: strengthOf('dilation', MEDIUM_MASS, CLOSE_DISTANCE),
    closeTidalFormula: rawStrength('tidal', MEDIUM_MASS, CLOSE_DISTANCE),
    closeTidal: strengthOf('tidal', MEDIUM_MASS, CLOSE_DISTANCE),
    largeCloseDilationFormula: rawStrength('dilation', LARGE_MASS, CLOSE_DISTANCE),
    largeCloseTidalFormula: rawStrength('tidal', LARGE_MASS, CLOSE_DISTANCE),
    smallFarDilation: strengthOf('dilation', SMALL_MASS, FAR_DISTANCE),
    smallFarTidalFormula: rawStrength('tidal', SMALL_MASS, FAR_DISTANCE),
    smallFarTidal: strengthOf('tidal', SMALL_MASS, FAR_DISTANCE),
    tidalCapDistanceAtMediumMass: tidalCapDistance(MEDIUM_MASS),
  }
}

export interface RefresherNumbers {
  // Experiment 2: the ceiling clock's ticks for every floor tick, at strengths 0.3 and 0.6.
  ceilingTicksPerFloorTickAt0p3: number
  ceilingTicksPerFloorTickAt0p6: number
  // Experiment 3: how far apart two balls that start 1 m apart land in the planet cabin, at strengths 0.3 and 0.6.
  planetLandingSeparationAt0p3: number
  planetLandingSeparationAt0p6: number
}

// The numbers in the introduction's reminder of what the two strengths did in Experiments 2 and 3. They come from those experiments'
// own functions, unchanged.
export function refresherNumbers(): RefresherNumbers {
  const clocks = (strength: number) => ceilingTicksPerFloorTick(runGravitationalTimeDilationExperiment(strength))
  const landing = (strength: number) => finalSeparationMeters(runTidalEffectExperiment(EARTH_GRAVITY, 2, 1, strength), 'planet')
  return {
    ceilingTicksPerFloorTickAt0p3: clocks(0.3),
    ceilingTicksPerFloorTickAt0p6: clocks(0.6),
    planetLandingSeparationAt0p3: landing(0.3),
    planetLandingSeparationAt0p6: landing(0.6),
  }
}

export interface Part2Example {
  massLabel: string
  distanceLabel: string
  mass: number
  distance: number
  dilationStrength: number
  tidalStrength: number
  dilationCapped: boolean
  tidalCapped: boolean
  // Experiment 2: the ceiling clock's ticks for every floor tick, and its count after the run's 10 floor seconds.
  ceilingTicksPerFloorTick: number
  ceilingTicksAfterRun: number
  // Experiment 3: how far apart the two balls land in the planet cabin (they start 1 m apart).
  planetLandingSeparation: number
}

// Three worked settings for Part 2's caption. Every number comes from this module and from Experiments 2 and 3's own functions.
export function part2Examples(): Part2Example[] {
  const settings: Array<[string, string, number, number]> = [
    ['Medium', 'Medium', MEDIUM_MASS, MEDIUM_DISTANCE],
    ['Large', 'Medium', LARGE_MASS, MEDIUM_DISTANCE],
    ['Large', 'Close', LARGE_MASS, CLOSE_DISTANCE],
  ]
  return settings.map(([massLabel, distanceLabel, mass, distance]) => {
    const { timeDilationStrength, convergenceStrength } = strengthsForMassAndDistance(mass, distance)
    const perTick = ceilingTicksPerFloorTick(runGravitationalTimeDilationExperiment(timeDilationStrength))
    return {
      massLabel,
      distanceLabel,
      mass,
      distance,
      dilationStrength: timeDilationStrength,
      tidalStrength: convergenceStrength,
      dilationCapped: isCapped('dilation', mass, distance),
      tidalCapped: isCapped('tidal', mass, distance),
      ceilingTicksPerFloorTick: perTick,
      ceilingTicksAfterRun: perTick * 10,
      planetLandingSeparation: finalSeparationMeters(
        runTidalEffectExperiment(EARTH_GRAVITY, 2, 1, convergenceStrength),
        'planet'
      ),
    }
  })
}
