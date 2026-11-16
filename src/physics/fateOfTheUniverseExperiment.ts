// This experiment deliberately reuses earlier experiments' code unchanged (imported, not redefined):
// the Hubble constant (Experiment 1), the Hubble time (Experiment 2), the dark energy share limits,
// the expansion-rate ratio and the deceleration parameter (Experiment 5), the size-at-a-time formula
// and today's age (Experiment 6), and the time-at-a-size formula (Experiment 8). See the
// specification's "Physics Model" and "Required Physics Tests".
import { HUBBLE_CONSTANT_KM_PER_S_PER_MPC } from './hubblesLawExperiment'
import { hubbleTimeYears } from './bigBangExperiment'
import {
  BEST_FIT_DARK_ENERGY_FRACTION,
  MAX_DARK_ENERGY_FRACTION,
  decelerationParameter,
  expansionRateRatio,
} from './darkEnergyExperiment'
import { relativeSizeAtTime, universeAgeYears } from './universeAgeExperiment'
import { timeAfterBigBangYears } from './observableUniverseExperiment'

// Fixed axis ranges so the graph does not jump when the learner moves the slider. 100 billion years is
// only an axis choice, not a prediction of any real event (specification's Decision 5). The graph starts
// a little before today so the point where the expansion started to speed up is visible for the real
// case (about 6 billion years ago).
export const FUTURE_GRAPH_MAX_YEARS = 100e9
export const PAST_GRAPH_YEARS = 10e9
export const NUMBER_OF_DOUBLINGS_SHOWN = 4
const CURVE_SAMPLES = 61

export { BEST_FIT_DARK_ENERGY_FRACTION, MAX_DARK_ENERGY_FRACTION }

// Size of the universe (today = 1) a given number of years from now. Every universe is matched to the
// real one today (same expansion rate and size, as in Experiment 6), so "now" is that universe's own age.
export function futureRelativeSize(yearsFromNow: number, darkEnergyFraction: number): number {
  return relativeSizeAtTime(universeAgeYears(darkEnergyFraction) + yearsFromNow, darkEnergyFraction)
}

// Years for the universe to grow from one relative size to a larger one: the difference of two of
// Experiment 8's times after the Big Bang.
export function yearsToGrow(fromSize: number, toSize: number, darkEnergyFraction: number): number {
  return (
    timeAfterBigBangYears(toSize, darkEnergyFraction) - timeAfterBigBangYears(fromSize, darkEnergyFraction)
  )
}

// The expansion rate (the Hubble constant's value at that time), in km/s/Mpc, when the universe has the
// given relative size: H0 x E(z), with 1 + z = 1 / size.
export function expansionRateAtSize(relativeSize: number, darkEnergyFraction: number): number {
  return (
    HUBBLE_CONSTANT_KM_PER_S_PER_MPC * expansionRateRatio(1 / relativeSize - 1, darkEnergyFraction)
  )
}

// The value the expansion rate settles to at late times: H0 x sqrt(L). With no dark energy it falls
// toward zero and never reaches it, so the limit is 0.
export function longTermExpansionRate(darkEnergyFraction: number): number {
  return HUBBLE_CONSTANT_KM_PER_S_PER_MPC * Math.sqrt(Math.max(0, darkEnergyFraction))
}

// The doubling time the universe settles to: ln 2 / (H0 x sqrt(L)) = ln 2 x Hubble time / sqrt(L), in
// years. With no dark energy the doubling time grows without limit.
export function longTermDoublingTimeYears(darkEnergyFraction: number): number {
  if (darkEnergyFraction <= 0) return Infinity
  return (Math.LN2 * hubbleTimeYears()) / Math.sqrt(darkEnergyFraction)
}

// The relative size at which the expansion starts to speed up: ((1 - L) / (2L))^(1/3). It is today
// (size 1) at L = 1/3, in the future for a smaller L, and never happens when L = 0.
export function speedUpSize(darkEnergyFraction: number): number {
  if (darkEnergyFraction <= 0) return Infinity
  return Math.pow((1 - darkEnergyFraction) / (2 * darkEnergyFraction), 1 / 3)
}

export interface Doubling {
  fromSize: number
  toSize: number
  years: number
}

export interface FateCurvePoint {
  yearsFromNow: number
  relativeSize: number
}

export interface FateResult {
  darkEnergyFraction: number
  accelerationToday: boolean
  speedUpSize: number
  speedUpYearsFromNow: number | null
  doublings: Doubling[]
  doublingTimeRatios: number[]
  longTermDoublingTimeYears: number
  expansionRateToday: number
  expansionRateAtEnd: number
  longTermExpansionRate: number
  sizeAtEnd: number
  curve: FateCurvePoint[]
  fate: 'slows-forever' | 'steady-growth'
}

export function runFateOfTheUniverseExperiment(darkEnergyFraction: number): FateResult {
  const L = darkEnergyFraction
  const doublings: Doubling[] = []
  for (let i = 0; i < NUMBER_OF_DOUBLINGS_SHOWN; i++) {
    const fromSize = 2 ** i
    const toSize = 2 ** (i + 1)
    doublings.push({ fromSize, toSize, years: yearsToGrow(fromSize, toSize, L) })
  }

  const switchSize = speedUpSize(L)
  const speedUpYearsFromNow =
    switchSize === Infinity ? null : timeAfterBigBangYears(switchSize, L) - universeAgeYears(L)

  const sizeAtEnd = futureRelativeSize(FUTURE_GRAPH_MAX_YEARS, L)

  const curve: FateCurvePoint[] = []
  for (let i = 0; i < CURVE_SAMPLES; i++) {
    const yearsFromNow =
      -PAST_GRAPH_YEARS + ((FUTURE_GRAPH_MAX_YEARS + PAST_GRAPH_YEARS) * i) / (CURVE_SAMPLES - 1)
    curve.push({ yearsFromNow, relativeSize: futureRelativeSize(yearsFromNow, L) })
  }

  return {
    darkEnergyFraction: L,
    accelerationToday: decelerationParameter(L) < 0,
    speedUpSize: switchSize,
    speedUpYearsFromNow,
    doublings,
    doublingTimeRatios: doublings.slice(1).map((d, i) => d.years / doublings[i].years),
    longTermDoublingTimeYears: longTermDoublingTimeYears(L),
    expansionRateToday: expansionRateAtSize(1, L),
    expansionRateAtEnd: expansionRateAtSize(sizeAtEnd, L),
    longTermExpansionRate: longTermExpansionRate(L),
    sizeAtEnd,
    curve,
    fate: L <= 0 ? 'slows-forever' : 'steady-growth',
  }
}

// ---- Audit update (2026-11-16): the guess marks, their marking and the check-up numbers. Everything below
// is new. No function above is changed. The interface only draws and words these results (CLAUDE.md §9). ----

// The two fixed universes of Part 1: the real best fit, and the no-dark-energy contrast.
export function realUniverse(): FateResult {
  return runFateOfTheUniverseExperiment(BEST_FIT_DARK_ENERGY_FRACTION)
}
export function noDarkEnergyUniverse(): FateResult {
  return runFateOfTheUniverseExperiment(0)
}

// ---- Guess 1: what the far future looks like ----
export type FarFutureGuess = 'stops' | 'slower' | 'faster'

// What the model gives for a share: with no dark energy the expansion slows forever but never stops; with
// any dark energy the size grows steadily, ever faster. No share in the model stops the expansion.
export function modelAnswerForShare(darkEnergyFraction: number): FarFutureGuess {
  return darkEnergyFraction <= 0 ? 'slower' : 'faster'
}
export function farFutureAnswer(): FarFutureGuess {
  return modelAnswerForShare(BEST_FIT_DARK_ENERGY_FRACTION)
}
export function farFutureMatches(guess: FarFutureGuess): boolean {
  return guess === farFutureAnswer()
}

export interface SketchPoint {
  x: number
  y: number
}

// A fixed sketch of each shape, from "today" at (0, 0) to the right edge at x = 1, both in 0 to 1. The
// heights mean nothing as sizes: only the shape does (the caption says so).
const SKETCH_STEPS = 40
export function farFutureSketch(guess: FarFutureGuess): SketchPoint[] {
  const points: SketchPoint[] = []
  for (let i = 0; i <= SKETCH_STEPS; i++) {
    const x = i / SKETCH_STEPS
    // stops: rises a little, then runs level; slower: bends toward flat but keeps rising; faster: bends upward.
    const y = guess === 'stops' ? 0.25 * Math.min(1, x / 0.3) : guess === 'slower' ? 0.6 * Math.sqrt(x) : 0.9 * x * x
    points.push({ x, y })
  }
  return points
}

// ---- Guess 2: how long the next doubling takes ----
export type NextDoublingGuess = 'shorter' | 'same' | 'longer'

export const NEXT_DOUBLING_GUESS_YEARS: Record<NextDoublingGuess, number> = {
  shorter: 5e9,
  same: 11e9,
  longer: 30e9,
}

// How far each choice is from the real second doubling, in decades (powers of ten) on a log scale.
export function nextDoublingDistancesInDecades(): Record<NextDoublingGuess, number> {
  const real = realUniverse().doublings[1].years
  return {
    shorter: Math.abs(Math.log10(NEXT_DOUBLING_GUESS_YEARS.shorter / real)),
    same: Math.abs(Math.log10(NEXT_DOUBLING_GUESS_YEARS.same / real)),
    longer: Math.abs(Math.log10(NEXT_DOUBLING_GUESS_YEARS.longer / real)),
  }
}
export function nextDoublingAnswer(): NextDoublingGuess {
  const d = nextDoublingDistancesInDecades()
  return (Object.keys(d) as NextDoublingGuess[]).reduce((best, k) => (d[k] < d[best] ? k : best), 'shorter')
}
export function nextDoublingMatches(guess: NextDoublingGuess): boolean {
  return guess === nextDoublingAnswer()
}

// ---- The steady-doubling arithmetic the components used to do themselves ----
export interface RuleOfSeventy {
  percentGrowthPerBillionYears: number
  doublingTimeYears: number
  exactDoublingTimeYears: number
  gapPercent: number | null
}

// The settled expansion rate as a percentage growth of the size per billion years, and the common rule of
// thumb "doubling time = 70 / percent growth", beside the exact settled doubling time.
export function ruleOfSeventy(darkEnergyFraction: number): RuleOfSeventy {
  const exact = longTermDoublingTimeYears(darkEnergyFraction)
  if (darkEnergyFraction <= 0) {
    return { percentGrowthPerBillionYears: 0, doublingTimeYears: Infinity, exactDoublingTimeYears: exact, gapPercent: null }
  }
  const percent =
    (longTermExpansionRate(darkEnergyFraction) /
      expansionRateAtSize(1, darkEnergyFraction) /
      (hubbleTimeYears() / 1e9)) *
    100
  const rule = (70 / percent) * 1e9
  return {
    percentGrowthPerBillionYears: percent,
    doublingTimeYears: rule,
    exactDoublingTimeYears: exact,
    gapPercent: (Math.abs(rule - exact) / exact) * 100,
  }
}

export interface SteadyDoublingEstimate {
  doublings: number
  estimate: number
  modelSize: number
  gapPercent: number
  modelIsHigher: boolean
  hasSettled: boolean
  ruleApplies: boolean
}

// If every doubling took the settled time, the size after `years` would be 2^(years / settled time). The
// doublings have "settled" if the fourth is within 5% of the settled time; the rule is a fair estimate only
// if even the first is at least 70% of it. With no dark energy there is no settled time (doublings 0).
export function steadyDoublingEstimate(darkEnergyFraction: number, years: number): SteadyDoublingEstimate {
  const settled = longTermDoublingTimeYears(darkEnergyFraction)
  const run = runFateOfTheUniverseExperiment(darkEnergyFraction)
  const doublings = settled === Infinity ? 0 : years / settled
  const estimate = 2 ** doublings
  const modelSize = futureRelativeSize(years, darkEnergyFraction)
  return {
    doublings,
    estimate,
    modelSize,
    gapPercent: (Math.abs(modelSize - estimate) / modelSize) * 100,
    modelIsHigher: modelSize > estimate,
    hasSettled: settled !== Infinity && run.doublings[run.doublings.length - 1].years >= 0.95 * settled,
    ruleApplies: settled !== Infinity && run.doublings[0].years >= 0.7 * settled,
  }
}

// Matter's contribution to the squared expansion rate when the universe has the given size (1 today).
// Dark energy's contribution stays at its share.
export function matterContributionAtSize(relativeSize: number, darkEnergyFraction: number): number {
  return (1 - darkEnergyFraction) / relativeSize ** 3
}

// A galaxy's speed away from us: the expansion rate when the universe has the given size, times its
// distance then (its distance today times that size). In km/s for a distance today in megaparsecs.
export function galaxySpeedKmPerS(distanceTodayMpc: number, relativeSize: number, darkEnergyFraction: number): number {
  return expansionRateAtSize(relativeSize, darkEnergyFraction) * distanceTodayMpc * relativeSize
}

// ---- The check-up against published values (Part 3, Table 1) ----
// Planck 2018 VI (arXiv:1807.06209), abstract, read 2026-11-16 through an HTML copy (a model summary).
export const PLANCK_MATTER_SHARE = 0.315
export const PLANCK_MATTER_SHARE_UNCERTAINTY = 0.007

// How far a matter share is from Planck's, in Planck's stated uncertainties (negative: below it).
export function matterShareGapInPlanckUncertainties(matterShare: number): number {
  return (matterShare - PLANCK_MATTER_SHARE) / PLANCK_MATTER_SHARE_UNCERTAINTY
}

// NASA's statements of when the expansion began to speed up (read 2026-11-16 through a model summary). The
// 2026 page gives a time after the universe began, which is turned into "years ago" with an age of 13.8
// billion years: that age is our arithmetic, not a figure printed on the page.
export const ASSUMED_AGE_FOR_NASA_2026_ARITHMETIC_YEARS = 13.8e9
export const NASA_SPEED_UP_YEARS_AGO: Array<{
  year: number
  yearsAgoRange?: [number, number]
  yearsAfterBigBang?: number
}> = [
  { year: 2006, yearsAgoRange: [5e9, 6e9] },
  { year: 2023, yearsAgoRange: [7.5e9, 7.5e9] },
  { year: 2026, yearsAfterBigBang: 9e9 },
]

export function publishedSpeedUpRangeYearsAgo(): { minYears: number; maxYears: number } {
  const values = NASA_SPEED_UP_YEARS_AGO.flatMap((n) =>
    n.yearsAgoRange ? n.yearsAgoRange : [ASSUMED_AGE_FOR_NASA_2026_ARITHMETIC_YEARS - (n.yearsAfterBigBang ?? 0)],
  )
  return { minYears: Math.min(...values), maxYears: Math.max(...values) }
}

// The model's speed-up as years after the Big Bang (null where it never happens).
export function speedUpYearsAfterBigBang(darkEnergyFraction: number): number | null {
  const run = runFateOfTheUniverseExperiment(darkEnergyFraction)
  return run.speedUpYearsFromNow === null ? null : universeAgeYears(darkEnergyFraction) + run.speedUpYearsFromNow
}

// Does the model's speed-up (years ago) fall within the spread of NASA's figures?
export function speedUpWithinPublishedRange(darkEnergyFraction: number): boolean {
  const run = runFateOfTheUniverseExperiment(darkEnergyFraction)
  if (run.speedUpYearsFromNow === null) return false
  const yearsAgo = -run.speedUpYearsFromNow
  const { minYears, maxYears } = publishedSpeedUpRangeYearsAgo()
  return yearsAgo >= minYears && yearsAgo <= maxYears
}

// NASA, "The Hubble constant and the tension" (updated 4 August 2025), read 2026-11-16 (a model summary).
export const HUBBLE_RANGE_SPACE_TELESCOPES: [number, number] = [70, 76]
export const HUBBLE_RANGE_OLDEST_LIGHT: [number, number] = [67, 68]

export function hubbleRateWithinPublishedValues(kmPerSPerMpc: number): {
  spaceTelescopes: boolean
  oldestLight: boolean
  any: boolean
} {
  const inside = (r: [number, number]) => kmPerSPerMpc >= r[0] && kmPerSPerMpc <= r[1]
  const spaceTelescopes = inside(HUBBLE_RANGE_SPACE_TELESCOPES)
  const oldestLight = inside(HUBBLE_RANGE_OLDEST_LIGHT)
  return { spaceTelescopes, oldestLight, any: spaceTelescopes || oldestLight }
}
