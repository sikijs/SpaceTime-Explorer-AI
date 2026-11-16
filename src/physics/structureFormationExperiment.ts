// This experiment deliberately reuses earlier experiments' code unchanged (imported, not redefined):
// the expansion rate and the dark energy share (Experiment 5), and the time after the Big Bang at a
// given size (Experiment 8). See the specification's "Physics Model" and "Required Physics Tests".
import { BEST_FIT_DARK_ENERGY_FRACTION, expansionRateRatio } from './darkEnergyExperiment'
import { compareWithRange, timeAfterBigBangYears } from './observableUniverseExperiment'
import type { RangeComparison } from './observableUniverseExperiment'

// The redshift of the oldest light (Experiment 3). Restated here, with a test that it equals Experiment
// 3's own constant, so this module does not import Experiment 3 (the same choice as Experiment 8).
export const RECOMBINATION_REDSHIFT = 1089.8

// A given, rounded real-world value (about when matter began to outweigh radiation), not computed here
// because this chapter leaves radiation out. Not checked against a primary source; see the
// specification's "Decisions Needing Human Review" item 4.
export const MATTER_RADIATION_EQUALITY_REDSHIFT = 3400

// The density excess at which the small-ripple (linear) model stops being valid: the region is turning
// into a bound clump.
export const CLUMP_THRESHOLD = 1

export type KindOfMatter = 'ordinary' | 'ordinary-plus-dark'

export interface StartSizePreset {
  id: string
  label: string
  startDelta: number
}

export const START_SIZE_PRESETS: StartSizePreset[] = [
  { id: 'one-in-100000', label: '1 part in 100,000', startDelta: 1e-5 },
  { id: 'one-in-10000', label: '1 part in 10,000', startDelta: 1e-4 },
  { id: 'one-in-1000', label: '1 part in 1,000', startDelta: 1e-3 },
  { id: 'one-in-500', label: '1 part in 500', startDelta: 2e-3 },
]

export const MIN_START_DELTA = 1e-5
export const MAX_START_DELTA = 2e-3

const CURVE_SAMPLES = 61
// Number of Simpson's-rule steps (must be even), as in Experiment 5. The integrand is smooth and goes to
// zero at a = 0, so no special handling of the early-time end is needed.
const INTEGRATION_STEPS = 2000

// The redshift from which a kind of matter can start to gather.
export function startRedshiftFor(kind: KindOfMatter): number {
  return kind === 'ordinary' ? RECOMBINATION_REDSHIFT : MATTER_RADIATION_EQUALITY_REDSHIFT
}

// Growth factor of a small density excess in a flat universe with matter share (1 - L) and dark energy
// share L, normalised so that D(a) = a at early times (relative size a, today = 1):
//   D(a) = (5/2) (1 - L) E(a) x the integral from 0 to a of da' / (a' E(a'))^3.
// With L = 0 this is exactly D(a) = a.
export function growthFactor(
  relativeSize: number,
  darkEnergyFraction: number = BEST_FIT_DARK_ENERGY_FRACTION,
  steps: number = INTEGRATION_STEPS,
): number {
  if (relativeSize <= 0) return 0
  const matterFraction = 1 - darkEnergyFraction
  const ratioAt = (a: number) => expansionRateRatio(1 / a - 1, darkEnergyFraction)
  const integrand = (a: number) => (a === 0 ? 0 : (a * ratioAt(a)) ** -3)
  const h = relativeSize / steps
  let sum = integrand(0) + integrand(relativeSize)
  for (let i = 1; i < steps; i++) {
    sum += (i % 2 === 1 ? 4 : 2) * integrand(i * h)
  }
  return 2.5 * matterFraction * ratioAt(relativeSize) * ((sum * h) / 3)
}

const sizeForRedshift = (redshift: number) => 1 / (1 + redshift)

// How many times a small density excess has grown between two redshifts (start earlier than end).
export function growthBetween(
  startRedshift: number,
  endRedshift: number,
  darkEnergyFraction: number = BEST_FIT_DARK_ENERGY_FRACTION,
): number {
  return (
    growthFactor(sizeForRedshift(endRedshift), darkEnergyFraction) /
    growthFactor(sizeForRedshift(startRedshift), darkEnergyFraction)
  )
}

// The smallest starting density excess that reaches CLUMP_THRESHOLD by today: 1 / growth since the start.
export function requiredStartDelta(
  startRedshift: number,
  darkEnergyFraction: number = BEST_FIT_DARK_ENERGY_FRACTION,
): number {
  return CLUMP_THRESHOLD / growthBetween(startRedshift, 0, darkEnergyFraction)
}

// The density excess at a redshift, for a ripple that started at startRedshift with startDelta. Before
// the start nothing has grown yet, so it returns startDelta.
export function densityExcessAt(
  redshift: number,
  startRedshift: number,
  startDelta: number,
  darkEnergyFraction: number = BEST_FIT_DARK_ENERGY_FRACTION,
): number {
  if (redshift >= startRedshift) return startDelta
  return startDelta * growthBetween(startRedshift, redshift, darkEnergyFraction)
}

// The first redshift at which the ripple reaches CLUMP_THRESHOLD, found by bisection (the density excess
// only ever grows as the universe grows), or null if it never does by today.
function redshiftOfClumpFor(
  startRedshift: number,
  startDelta: number,
  darkEnergyFraction: number,
): number | null {
  if (startDelta >= CLUMP_THRESHOLD) return startRedshift
  if (densityExcessAt(0, startRedshift, startDelta, darkEnergyFraction) < CLUMP_THRESHOLD) return null
  let early = startRedshift
  let late = 0
  for (let i = 0; i < 60; i++) {
    const middle = (early + late) / 2
    if (densityExcessAt(middle, startRedshift, startDelta, darkEnergyFraction) >= CLUMP_THRESHOLD) {
      late = middle
    } else {
      early = middle
    }
  }
  return late
}

export interface StructureFormationCurvePoint {
  redshift: number
  yearsAfterBigBang: number
  growth: number // how many times the ripple has grown since its start
  densityExcess: number
}

export interface StructureFormationResult {
  kindOfMatter: KindOfMatter
  startRedshift: number
  startDelta: number
  growthSinceStart: number // D(today) / D(start)
  growthWithoutDarkEnergy: number // the same with dark energy share 0, which is 1 + start redshift
  requiredStartDelta: number // the starting excess needed to become a clump by today
  requiredStartDeltaOtherMatter: number // the same for the other kind of matter, for comparison
  densityExcessToday: number
  becameClump: boolean
  redshiftOfClump: number | null
  curve: StructureFormationCurvePoint[]
}

export function runStructureFormationExperiment(
  kindOfMatter: KindOfMatter,
  startDelta: number,
): StructureFormationResult {
  const darkEnergyFraction = BEST_FIT_DARK_ENERGY_FRACTION
  const startRedshift = startRedshiftFor(kindOfMatter)
  const otherStartRedshift = startRedshiftFor(kindOfMatter === 'ordinary' ? 'ordinary-plus-dark' : 'ordinary')

  // Log-spaced in (1 + z) from the start to today, so the early, fast-changing part is sampled well.
  const curve: StructureFormationCurvePoint[] = []
  const logStart = Math.log(1 + startRedshift)
  for (let i = 0; i < CURVE_SAMPLES; i++) {
    const redshift = i === CURVE_SAMPLES - 1 ? 0 : Math.exp(logStart * (1 - i / (CURVE_SAMPLES - 1))) - 1
    const growth = growthBetween(startRedshift, redshift, darkEnergyFraction)
    curve.push({
      redshift,
      yearsAfterBigBang: timeAfterBigBangYears(sizeForRedshift(redshift), darkEnergyFraction),
      growth,
      densityExcess: startDelta * growth,
    })
  }

  const growthSinceStart = growthBetween(startRedshift, 0, darkEnergyFraction)
  const densityExcessToday = startDelta * growthSinceStart
  const redshiftOfClump = redshiftOfClumpFor(startRedshift, startDelta, darkEnergyFraction)
  return {
    kindOfMatter,
    startRedshift,
    startDelta,
    growthSinceStart,
    growthWithoutDarkEnergy: growthBetween(startRedshift, 0, 0),
    requiredStartDelta: requiredStartDelta(startRedshift, darkEnergyFraction),
    requiredStartDeltaOtherMatter: requiredStartDelta(otherStartRedshift, darkEnergyFraction),
    densityExcessToday,
    becameClump: redshiftOfClump !== null,
    redshiftOfClump,
    curve,
  }
}

// ---------------------------------------------------------------------------------------------
// Added in the audit (2026-11-15): the two fixed starts of Part 1, the guess marks, tutor marking, the
// check-up against published values, Table 2, the worked examples and the numbers the captions use.
// The interface only displays what these functions return (CLAUDE.md §9, §14 "Predictions and the Real
// Results"). The physics above is unchanged.
// ---------------------------------------------------------------------------------------------

// Published values read on 2026-11-15 (through a helper's fetch tool, which returns model summaries; to
// be spot-checked against the live pages before they are printed).
// Planck 2018 VI (arXiv:1807.06209), Table 2, the three columns' central values: z_star 1089.80 (with
// BAO), 1089.92 and 1089.95; z_eq 3387, 3402 and 3407; z_drag 1059.93 to 1060.01.
export const PLANCK_Z_STAR_RANGE = { low: 1089.8, high: 1089.95 }
export const PLANCK_Z_EQ_RANGE = { low: 3387, high: 3407 }
export const PLANCK_Z_DRAG = 1060
// Ordinary matter is released from the light at the baryon drag epoch, a little later than the oldest
// light's release. The model keeps the oldest light's redshift (the owner's choice, 2026-11-15); the
// effect of starting at the drag redshift is worked out in dragRedshiftNote().
// The standard textbook linear density excess at which a spherical region collapses, for a universe with
// matter only (arXiv:1005.0233). Shown for comparison; the model keeps CLUMP_THRESHOLD = 1.
export const TEXTBOOK_LINEAR_COLLAPSE_THRESHOLD = 1.686

// The starting size that shows a head start deciding the outcome (the 1-part-in-1,000 preset).
export const HEAD_START_EXAMPLE_DELTA = 1e-3

// The growth graph's height axis (times grown), shared by the guess marks and the interface.
export const GROWTH_AXIS_MIN = 1
export const GROWTH_AXIS_MAX = 5000

export type GrowthGuess = 'ten' | 'thousand' | 'million'
export type HeadStartGuess = 'none' | 'small' | 'decides'

export const GROWTH_GUESS_VALUES: Record<GrowthGuess, number> = { ten: 10, thousand: 1000, million: 1e6 }
// Guess 2's arrows have fixed lengths (in decades of the growth axis) that mean nothing as numbers. Both are
// shorter than the real head start (0.49 of a decade), so neither looks like a match.
export const HEAD_START_ARROW_DECADES: Record<HeadStartGuess, number> = { none: 0, small: 0.25, decides: 0.4 }

const ORDINARY: KindOfMatter = 'ordinary'
const WITH_DARK: KindOfMatter = 'ordinary-plus-dark'

// ---- Part 1's two fixed starts (no starting size) ---------------------------------------------------

export interface StartFacts {
  kind: KindOfMatter
  startRedshift: number
  // Years after the Big Bang at which this model puts the start (radiation is left out, so this is rough).
  startYearsAfterBigBang: number
  growthSinceStart: number
  growthWithoutDarkEnergy: number
  requiredStartDelta: number
}
export function startFacts(kind: KindOfMatter): StartFacts {
  const startRedshift = startRedshiftFor(kind)
  return {
    kind,
    startRedshift,
    startYearsAfterBigBang: timeAfterBigBangYears(sizeForRedshift(startRedshift), BEST_FIT_DARK_ENERGY_FRACTION),
    growthSinceStart: growthBetween(startRedshift, 0, BEST_FIT_DARK_ENERGY_FRACTION),
    growthWithoutDarkEnergy: growthBetween(startRedshift, 0, 0),
    requiredStartDelta: requiredStartDelta(startRedshift, BEST_FIT_DARK_ENERGY_FRACTION),
  }
}

// The growth curve of one kind of matter (it does not depend on a starting size).
export interface GrowthCurvePoint {
  redshift: number
  yearsAfterBigBang: number
  growth: number
  growthWithoutDarkEnergy: number
}
export function growthCurve(kind: KindOfMatter): GrowthCurvePoint[] {
  const start = startRedshiftFor(kind)
  return runStructureFormationExperiment(kind, MIN_START_DELTA).curve.map((p) => ({
    redshift: p.redshift,
    yearsAfterBigBang: p.yearsAfterBigBang,
    growth: p.growth,
    growthWithoutDarkEnergy: growthBetween(start, p.redshift, 0),
  }))
}

// ---- What the model actually gives (the tutor marks each guess; Results does not) --------------------

// Guess 1: the answer nearest to the ordinary matter's growth on a scale where each tick is ten times the one before.
export function growthDistanceInDecades(guess: GrowthGuess): number {
  return Math.abs(Math.log10(startFacts(ORDINARY).growthSinceStart / GROWTH_GUESS_VALUES[guess]))
}
export function actualGrowthGuess(): GrowthGuess {
  const answers = Object.keys(GROWTH_GUESS_VALUES) as GrowthGuess[]
  return answers.reduce((best, a) => (growthDistanceInDecades(a) < growthDistanceInDecades(best) ? a : best))
}
export function growthGuessMatches(guess: GrowthGuess): boolean {
  return guess === actualGrowthGuess()
}

// The head start: the factor by which the earlier start multiplies the growth, and whether it decides a
// clump at the example starting size.
export function headStartFactor(): number {
  return startFacts(WITH_DARK).growthSinceStart / startFacts(ORDINARY).growthSinceStart
}
export function headStartDecades(): number {
  return Math.log10(headStartFactor())
}
export interface HeadStartExample {
  startDelta: number
  ordinaryExcessToday: number
  darkExcessToday: number
  ordinaryBecameClump: boolean
  darkBecameClump: boolean
  // True when the earlier start turns "no clump" into "a clump" at this starting size.
  decides: boolean
}
export function headStartExample(): HeadStartExample {
  const o = runStructureFormationExperiment(ORDINARY, HEAD_START_EXAMPLE_DELTA)
  const d = runStructureFormationExperiment(WITH_DARK, HEAD_START_EXAMPLE_DELTA)
  return {
    startDelta: HEAD_START_EXAMPLE_DELTA,
    ordinaryExcessToday: o.densityExcessToday,
    darkExcessToday: d.densityExcessToday,
    ordinaryBecameClump: o.becameClump,
    darkBecameClump: d.becameClump,
    decides: !o.becameClump && d.becameClump,
  }
}

// ---- The white guess marks ---------------------------------------------------------------------------

// Guess 1: a white tick at the guessed height on the growth axis at the "today" end; an answer above the
// top of the axis (about a million) has no place on it, so it is only an arrow at the top edge.
export type GrowthGuessMark = { kind: 'tick'; atTimesGrown: number } | { kind: 'edge-arrow'; direction: 'up'; hasPosition: false }
export function growthGuessMark(guess: GrowthGuess): GrowthGuessMark {
  const value = GROWTH_GUESS_VALUES[guess]
  if (value <= GROWTH_AXIS_MAX) return { kind: 'tick', atTimesGrown: value }
  return { kind: 'edge-arrow', direction: 'up', hasPosition: false }
}

// Guess 2 (marker only): a ring on the amber line's end ("no difference"), a short arrow ("a small
// difference") or a longer arrow ("it would decide the outcome") pointing toward the violet line's end.
export interface HeadStartMarker {
  kind: 'ring' | 'short-arrow' | 'long-arrow'
  lengthDecades: number
}
export function headStartGuessMarker(guess: HeadStartGuess): HeadStartMarker {
  const kind = guess === 'none' ? 'ring' : guess === 'small' ? 'short-arrow' : 'long-arrow'
  return { kind, lengthDecades: HEAD_START_ARROW_DECADES[guess] }
}

// ---- What the tutor says about each guess ----------------------------------------------------------------

export interface GrowthMarking {
  matches: boolean
  actual: GrowthGuess
  guessedTimes: number
  ordinaryGrowth: number
  guessDistanceDecades: number
}
export function markGrowthGuess(guess: GrowthGuess): GrowthMarking {
  return {
    matches: growthGuessMatches(guess),
    actual: actualGrowthGuess(),
    guessedTimes: GROWTH_GUESS_VALUES[guess],
    ordinaryGrowth: startFacts(ORDINARY).growthSinceStart,
    guessDistanceDecades: growthDistanceInDecades(guess),
  }
}

// The approved logic (the owner, 2026-10-09): only "no difference" is marked off; "a small difference" and
// "it would decide the outcome" are both "partly", since the head start is worth only a factor of about 3
// and, for some starting sizes, that factor decides whether a clump forms.
export type HeadStartMarkingKind = 'partly' | 'not'
export interface HeadStartMarking {
  marking: HeadStartMarkingKind
  headStartFactor: number
  ordinaryGrowth: number
  darkGrowth: number
  example: HeadStartExample
}
export function markHeadStartGuess(guess: HeadStartGuess): HeadStartMarking {
  return {
    marking: guess === 'none' ? 'not' : 'partly',
    headStartFactor: headStartFactor(),
    ordinaryGrowth: startFacts(ORDINARY).growthSinceStart,
    darkGrowth: startFacts(WITH_DARK).growthSinceStart,
    example: headStartExample(),
  }
}

// ---- The Carroll, Press and Turner (1992) approximation (an independent check on the growth) ------------

// g = (5/2) Om / [Om^(4/7) - OL + (1 + Om/2)(1 + OL/70)], for a flat universe (OL = 1 - Om); printed in
// arXiv:astro-ph/0006089, which quotes the 1992 paper (the paper itself was not read).
export function growthSuppressionApproximation(darkEnergyFraction: number = BEST_FIT_DARK_ENERGY_FRACTION): number {
  const om = 1 - darkEnergyFraction
  const ol = darkEnergyFraction
  return (2.5 * om) / (om ** (4 / 7) - ol + (1 + om / 2) * (1 + ol / 70))
}
// Growth since a start redshift by that approximation: g times the universe's growth in size, 1 + z.
export function growthApproximationSinceStart(startRedshift: number, darkEnergyFraction: number = BEST_FIT_DARK_ENERGY_FRACTION): number {
  return growthSuppressionApproximation(darkEnergyFraction) * (1 + startRedshift)
}

// ---- The check-up (Table 1): every row independent of the learner's Part 2 settings -------------------------

export type CheckUpReading = 'less' | 'more' | 'within the published range' | 'the same' | 'calculated here only'
export interface CheckUpRow {
  // a: growth since the oldest light against the approximation; b: with dark energy against without;
  // c: the head start; d: the oldest light's redshift; e: the redshift when matter began to outweigh radiation.
  id: 'a' | 'b' | 'c' | 'd' | 'e'
  model: number
  comparedWith: number | null
  publishedLow: number | null
  publishedHigh: number | null
  reading: CheckUpReading
  // model minus the thing it is compared with, and the same as a percentage of it (null where there is none)
  difference: number | null
  percent: number | null
  // for the head start: the factor
  factor: number | null
}
export function checkUp(): CheckUpRow[] {
  const ordinary = startFacts(ORDINARY)
  const dark = startFacts(WITH_DARK)
  const approx = growthApproximationSinceStart(ordinary.startRedshift)
  const range = (value: number, r: { low: number; high: number }): RangeComparison => compareWithRange(value, r.low, r.high)
  const zStar = range(RECOMBINATION_REDSHIFT, PLANCK_Z_STAR_RANGE)
  const zEq = range(MATTER_RADIATION_EQUALITY_REDSHIFT, PLANCK_Z_EQ_RANGE)
  const reading = (value: number, reference: number): 'less' | 'more' | 'the same' => (value === reference ? 'the same' : value < reference ? 'less' : 'more')
  return [
    {
      id: 'a',
      model: ordinary.growthSinceStart,
      comparedWith: approx,
      publishedLow: approx,
      publishedHigh: approx,
      reading: reading(ordinary.growthSinceStart, approx),
      difference: ordinary.growthSinceStart - approx,
      percent: ((ordinary.growthSinceStart - approx) / approx) * 100,
      factor: null,
    },
    {
      id: 'b',
      model: ordinary.growthSinceStart,
      comparedWith: ordinary.growthWithoutDarkEnergy,
      publishedLow: null,
      publishedHigh: null,
      reading: reading(ordinary.growthSinceStart, ordinary.growthWithoutDarkEnergy),
      difference: ordinary.growthSinceStart - ordinary.growthWithoutDarkEnergy,
      percent: ((ordinary.growthSinceStart - ordinary.growthWithoutDarkEnergy) / ordinary.growthWithoutDarkEnergy) * 100,
      factor: null,
    },
    {
      id: 'c',
      model: dark.growthSinceStart,
      comparedWith: ordinary.growthSinceStart,
      publishedLow: null,
      publishedHigh: null,
      reading: 'calculated here only',
      difference: null,
      percent: null,
      factor: headStartFactor(),
    },
    {
      id: 'd',
      model: RECOMBINATION_REDSHIFT,
      comparedWith: null,
      publishedLow: PLANCK_Z_STAR_RANGE.low,
      publishedHigh: PLANCK_Z_STAR_RANGE.high,
      reading: zStar.reading,
      difference: null,
      percent: null,
      factor: null,
    },
    {
      id: 'e',
      model: MATTER_RADIATION_EQUALITY_REDSHIFT,
      comparedWith: null,
      publishedLow: PLANCK_Z_EQ_RANGE.low,
      publishedHigh: PLANCK_Z_EQ_RANGE.high,
      reading: zEq.reading,
      difference: null,
      percent: null,
      factor: null,
    },
  ]
}

// ---- Table 2: the two fixed starts and the learner's own region ---------------------------------------------

export interface YourRegion {
  kind: KindOfMatter
  startDelta: number
  startRedshift: number
  growthSinceStart: number
  growthWithoutDarkEnergy: number
  requiredStartDelta: number
  densityExcessToday: number
  becameClump: boolean
  redshiftOfClump: number | null
  // The starting size against the size needed for a clump with this kind of matter.
  againstRequired: 'bigger' | 'smaller' | 'the same'
}
export function yourRegion(kind: KindOfMatter, startDelta: number): YourRegion {
  const r = runStructureFormationExperiment(kind, startDelta)
  return {
    kind,
    startDelta,
    startRedshift: r.startRedshift,
    growthSinceStart: r.growthSinceStart,
    growthWithoutDarkEnergy: r.growthWithoutDarkEnergy,
    requiredStartDelta: r.requiredStartDelta,
    densityExcessToday: r.densityExcessToday,
    becameClump: r.becameClump,
    redshiftOfClump: r.redshiftOfClump,
    againstRequired: startDelta === r.requiredStartDelta ? 'the same' : startDelta > r.requiredStartDelta ? 'bigger' : 'smaller',
  }
}

// ---- Numbers the captions and the words box use ---------------------------------------------------------------

export interface CaptionNumbers {
  ordinaryGrowth: number
  darkGrowth: number
  headStartFactor: number
  headStartDecades: number
  ordinaryWithoutDarkEnergy: number
  darkWithoutDarkEnergy: number
  // The percentage of the growth that dark energy takes away (the same for both starts).
  lostToDarkEnergyPercent: number
  ordinaryStartThousandYears: number
  darkStartThousandYears: number
  // A region of 1 part in 100,000 (the size of the oldest light's temperature ripples): the starting size
  // it would reach by today, as "1 part in N".
  hundredThousandOrdinaryPartsIn: number
  hundredThousandDarkPartsIn: number
}
export function captionNumbers(): CaptionNumbers {
  const o = startFacts(ORDINARY)
  const d = startFacts(WITH_DARK)
  return {
    ordinaryGrowth: o.growthSinceStart,
    darkGrowth: d.growthSinceStart,
    headStartFactor: headStartFactor(),
    headStartDecades: headStartDecades(),
    ordinaryWithoutDarkEnergy: o.growthWithoutDarkEnergy,
    darkWithoutDarkEnergy: d.growthWithoutDarkEnergy,
    lostToDarkEnergyPercent: (1 - o.growthSinceStart / o.growthWithoutDarkEnergy) * 100,
    ordinaryStartThousandYears: Math.round(o.startYearsAfterBigBang / 1e3),
    darkStartThousandYears: Math.round(d.startYearsAfterBigBang / 1e3),
    hundredThousandOrdinaryPartsIn: 1 / (MIN_START_DELTA * o.growthSinceStart),
    hundredThousandDarkPartsIn: 1 / (MIN_START_DELTA * d.growthSinceStart),
  }
}

// The effect of starting ordinary matter's growth at the baryon drag redshift instead of the oldest light's.
export interface DragRedshiftNote {
  dragRedshift: number
  growthFromDrag: number
  growthFromOldestLight: number
  percentLess: number
}
export function dragRedshiftNote(): DragRedshiftNote {
  const fromDrag = growthBetween(PLANCK_Z_DRAG, 0, BEST_FIT_DARK_ENERGY_FRACTION)
  const fromLight = startFacts(ORDINARY).growthSinceStart
  return { dragRedshift: PLANCK_Z_DRAG, growthFromDrag: fromDrag, growthFromOldestLight: fromLight, percentLess: (1 - fromDrag / fromLight) * 100 }
}

// ---- Worked examples for the Words and formulas box (the last four are held back until after the run) ------

export interface WorkedExamples {
  // The grains picture: 100 grains in an average patch, a density excess of 0.1.
  grainsAverage: number
  grainsExcessFraction: number
  grainsInRegion: number
  // 1 part in 1,000 grown 100 times is 1 part in 10.
  smallStartDelta: number
  smallGrowth: number
  smallEndDelta: number
  // density excess today = start x growth, for the example start and ordinary matter
  exampleStartDelta: number
  exampleOrdinaryGrowth: number
  exampleOrdinaryExcess: number
  // the size needed = 1 / growth, for ordinary matter
  requiredPartsIn: number
  // growth with no dark energy = 1 + start redshift
  ordinaryWithoutDarkEnergy: number
  darkWithoutDarkEnergy: number
}
export function workedExamples(): WorkedExamples {
  const o = startFacts(ORDINARY)
  const d = startFacts(WITH_DARK)
  return {
    grainsAverage: 100,
    grainsExcessFraction: 0.1,
    grainsInRegion: 100 * (1 + 0.1),
    smallStartDelta: 1e-3,
    smallGrowth: 100,
    smallEndDelta: 1e-3 * 100,
    exampleStartDelta: HEAD_START_EXAMPLE_DELTA,
    exampleOrdinaryGrowth: o.growthSinceStart,
    exampleOrdinaryExcess: HEAD_START_EXAMPLE_DELTA * o.growthSinceStart,
    requiredPartsIn: 1 / o.requiredStartDelta,
    ordinaryWithoutDarkEnergy: o.growthWithoutDarkEnergy,
    darkWithoutDarkEnergy: d.growthWithoutDarkEnergy,
  }
}
