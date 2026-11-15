// This experiment deliberately reuses earlier experiments' code unchanged (imported, not redefined):
// the Hubble constant and speed of light (Experiment 1), the megaparsec conversion, the Hubble time
// and the seconds-per-year convention (Experiment 2), the comoving distance function and the best-fit
// dark energy share (Experiment 5), and the age of the universe (Experiment 6). See the
// specification's "Physics Model" and "Required Physics Tests".
import {
  HUBBLE_CONSTANT_KM_PER_S_PER_MPC,
  REAL_SPEED_OF_LIGHT_KM_PER_S,
} from './hubblesLawExperiment'
import { MPC_TO_KM, SECONDS_PER_YEAR, hubbleTimeYears } from './bigBangExperiment'
import { BEST_FIT_DARK_ENERGY_FRACTION, comovingDistanceMpc } from './darkEnergyExperiment'
import { universeAgeYears } from './universeAgeExperiment'

// The redshift of the cosmic microwave background (Experiment 3's recombination redshift), restated
// here as a given value so this module does not import Experiment 3's module. A test checks that it
// equals Experiment 3's own constant, so the two can never silently drift apart.
export const CMB_REDSHIFT = 1089.8

// Smallest redshift the custom control offers; the largest is the cosmic microwave background's.
export const MIN_REDSHIFT = 0.1
export const MAX_REDSHIFT = CMB_REDSHIFT

// Given, rounded real-world reference values (light-years), used only for comparison; not derived here.
// See the specification's "Decisions Needing Human Review" item 8.
export const REAL_CMB_SOURCE_DISTANCE_TODAY_LIGHT_YEARS = 45.7e9
export const REAL_OBSERVABLE_UNIVERSE_RADIUS_LIGHT_YEARS = 46.5e9

// The learner's source choices, by redshift.
export interface SourcePreset {
  id: string
  label: string
  redshift: number
}

export const SOURCE_PRESETS: SourcePreset[] = [
  { id: 'galaxy-z0.5', label: 'A galaxy from about 5 billion years ago', redshift: 0.5 },
  { id: 'galaxy-z2', label: 'A distant galaxy (the source in Cosmology 7)', redshift: 2 },
  { id: 'galaxy-z10', label: 'A very early galaxy', redshift: 10 },
  { id: 'cmb', label: 'The oldest light we can see: the cosmic microwave background', redshift: CMB_REDSHIFT },
]

const CURVE_POINTS = 61

// Years after the Big Bang when the universe had relative size a (today = 1): the exact inverse of
// Experiment 6's relativeSizeAtTime. Closed forms:
//   L = 0: t = (2/3) x Hubble time x a^(3/2)
//   L > 0: t = Hubble time x (2 / (3 sqrt(L))) x asinh( sqrt(L / (1 - L)) x a^(3/2) )
export function timeAfterBigBangYears(relativeSize: number, darkEnergyFraction: number): number {
  if (relativeSize <= 0) return 0
  const hubbleTime = hubbleTimeYears()
  const aToThreeHalves = Math.pow(relativeSize, 1.5)
  if (darkEnergyFraction <= 0) return (2 / 3) * hubbleTime * aToThreeHalves
  const root = Math.sqrt(darkEnergyFraction)
  return (
    hubbleTime *
    (2 / (3 * root)) *
    Math.asinh(Math.sqrt(darkEnergyFraction / (1 - darkEnergyFraction)) * aToThreeHalves)
  )
}

// How long the light has been travelling (years): today's age minus the time after the Big Bang when
// the light left. Light covers one light-year per year, so this number is also the distance the light
// travelled, in light-years.
export function lightTravelYears(redshift: number, darkEnergyFraction: number): number {
  if (redshift <= 0) return 0
  return universeAgeYears(darkEnergyFraction) - timeAfterBigBangYears(1 / (1 + redshift), darkEnergyFraction)
}

// Light-years in one megaparsec, derived from the reused constants (about 3.26 million).
const LIGHT_YEARS_PER_MPC = MPC_TO_KM / (REAL_SPEED_OF_LIGHT_KM_PER_S * SECONDS_PER_YEAR)

// The source's distance today, in light-years: Experiment 5's comoving distance, converted from Mpc.
export function distanceTodayLightYears(redshift: number, darkEnergyFraction: number): number {
  return comovingDistanceMpc(redshift, darkEnergyFraction) * LIGHT_YEARS_PER_MPC
}

// The source's distance when the light left, in light-years: every distance has grown by the same
// factor as the universe's size, 1 + z, so it is the distance today divided by 1 + z.
export function distanceWhenLightLeftLightYears(redshift: number, darkEnergyFraction: number): number {
  return distanceTodayLightYears(redshift, darkEnergyFraction) / (1 + redshift)
}

export interface ObservableUniverseCurvePoint {
  redshift: number
  lightTravelYears: number
  distanceTodayLightYears: number
  distanceWhenLightLeftLightYears: number
}

export interface ObservableUniverseResult {
  redshift: number
  // 1 + z: the factor the universe's size, and every distance, has grown by since the light left.
  stretchingFactor: number
  // Also the distance the light travelled, in light-years.
  lightTravelYears: number
  distanceTodayLightYears: number
  distanceWhenLightLeftLightYears: number
  // Distance today divided by the distance the light travelled.
  todayOverTravelled: number
  // Hubble's Law (Experiment 1) applied to the distance today, as a multiple of the speed of light.
  recessionSpeedTodayOverC: number
  // Log-spaced redshifts from MIN_REDSHIFT to MAX_REDSHIFT, for the graph.
  curve: ObservableUniverseCurvePoint[]
}

// The universe is fixed at Experiment 5's best-fit dark energy share and Experiment 1's Hubble
// constant (see the specification's "Fixed illustrative values"), so the only input is the redshift.
export function runObservableUniverseExperiment(redshift: number): ObservableUniverseResult {
  const darkEnergyFraction = BEST_FIT_DARK_ENERGY_FRACTION
  const travelYears = lightTravelYears(redshift, darkEnergyFraction)
  const todayLy = distanceTodayLightYears(redshift, darkEnergyFraction)
  const todayMpc = comovingDistanceMpc(redshift, darkEnergyFraction)
  const redshiftRatio = MAX_REDSHIFT / MIN_REDSHIFT
  return {
    redshift,
    stretchingFactor: 1 + redshift,
    lightTravelYears: travelYears,
    distanceTodayLightYears: todayLy,
    distanceWhenLightLeftLightYears: todayLy / (1 + redshift),
    todayOverTravelled: todayLy / travelYears,
    recessionSpeedTodayOverC: (HUBBLE_CONSTANT_KM_PER_S_PER_MPC * todayMpc) / REAL_SPEED_OF_LIGHT_KM_PER_S,
    curve: Array.from({ length: CURVE_POINTS }, (_, i) => {
      const z = MIN_REDSHIFT * redshiftRatio ** (i / (CURVE_POINTS - 1))
      return {
        redshift: z,
        lightTravelYears: lightTravelYears(z, darkEnergyFraction),
        distanceTodayLightYears: distanceTodayLightYears(z, darkEnergyFraction),
        distanceWhenLightLeftLightYears: distanceWhenLightLeftLightYears(z, darkEnergyFraction),
      }
    }),
  }
}

// ---------------------------------------------------------------------------------------------
// Added in the audit (2026-11-15): the two fixed sources of Part 1, the guess marks, the zoomed
// panel, tutor marking, the check-up, Table 2 and the worked examples. The interface only displays
// what these functions return (CLAUDE.md §9, §14 "Predictions and the Real Results"). The physics
// above is unchanged.
// ---------------------------------------------------------------------------------------------

// Published values read on 2026-11-15 (through a helper's fetch tool, which returns model summaries; to
// be spot-checked against the live pages before they are printed).
// Planck 2018 VI (arXiv:1807.06209): age 13.787 +- 0.020 billion years; redshift of last scattering
// 1089.80 +- 0.21 (the CMB_REDSHIFT above).
export const PLANCK_AGE_YEARS = 13.787e9
export const PLANCK_AGE_UNCERTAINTY_YEARS = 0.02e9
// ESA and NASA/JPL, 21 March 2013: the oldest light left about 380,000 (ESA) or 370,000 (NASA/JPL) years
// after the Big Bang. Restated here as given values so this module does not import Experiment 3's; a
// test checks the upper one against Experiment 3's own constant.
export const PUBLISHED_LIGHT_LEFT_YEARS_AFTER_BIG_BANG = { low: 370_000, high: 380_000 }
// The distances the helper integrated from Planck 2018's numbers (H0 67.4 to 67.66, matter share 0.311
// to 0.315, with radiation): its own calculation, NOT a fetched figure, and no official page prints them.
export const PLANCK_BASED_CMB_SOURCE_DISTANCE_LIGHT_YEARS = { low: 45.2e9, high: 45.3e9 }
export const PLANCK_BASED_EDGE_LIGHT_YEARS = { low: 46.1e9, high: 46.2e9 }

// Part 1's two fixed sources: a galaxy at redshift 2 (its light travelled about 10 billion years) and the
// oldest light we can see.
export const GALAXY_A_REDSHIFT = 2
export function galaxyA(): ObservableUniverseResult {
  return runObservableUniverseExperiment(GALAXY_A_REDSHIFT)
}
export function sourceB(): ObservableUniverseResult {
  return runObservableUniverseExperiment(CMB_REDSHIFT)
}

export type TodayGuess = 'less' | 'about' | 'more'
export type LeftGuess = 'thirteen' | 'few' | 'closer'

// Guess 1 compares Galaxy A's distance today with this line (light-years).
export const GUESS_TODAY_REFERENCE_LIGHT_YEARS = 10e9
// Guess 2's three answers: about 13 billion, a few billion (no size of its own), under 100 million.
export const GUESS_LEFT_THIRTEEN_LIGHT_YEARS = 13e9
export const GUESS_LEFT_UNDER_LIGHT_YEARS = 100e6
// Guess 1's arrow has a fixed length (light-years on the main axis) that means nothing as a number.
export const GUESS_ARROW_LENGTH_LIGHT_YEARS = 3e9

const SAME_TOLERANCE = 1e-9

// ---- What the model actually gives (the tutor marks each guess; Results does not) ----------------

// Guess 1: Galaxy A's distance today against 10 billion light-years.
export function actualToday(): TodayGuess {
  const ratio = galaxyA().distanceTodayLightYears / GUESS_TODAY_REFERENCE_LIGHT_YEARS
  if (Math.abs(ratio - 1) < SAME_TOLERANCE) return 'about'
  return ratio > 1 ? 'more' : 'less'
}

// Guess 2: Source B's distance when the light left. Only "under 100 million" has a size to test against;
// if the distance were not under it, none of the three answers would be marked as the model's (null), so
// no cut-off is invented between "about 13 billion" and "a few billion".
export function actualLeft(): LeftGuess | null {
  return sourceB().distanceWhenLightLeftLightYears < GUESS_LEFT_UNDER_LIGHT_YEARS ? 'closer' : null
}

export function todayGuessMatches(guess: TodayGuess): boolean {
  return guess === actualToday()
}
export function leftGuessMatches(guess: LeftGuess): boolean {
  return guess === actualLeft()
}

// ---- The white guess marks ---------------------------------------------------------------------------

// Guess 1 (marker only): a white line at 10 billion on Galaxy A's gold row with an arrow pointing left,
// a ring on the line, or an arrow pointing right.
export interface TodayGuessMarker {
  lineAtLightYears: number
  kind: 'left' | 'ring' | 'right'
  arrowFromLightYears: number
  arrowToLightYears: number
}
export function todayGuessMarker(guess: TodayGuess): TodayGuessMarker {
  const line = GUESS_TODAY_REFERENCE_LIGHT_YEARS
  const to = guess === 'more' ? line + GUESS_ARROW_LENGTH_LIGHT_YEARS : guess === 'less' ? line - GUESS_ARROW_LENGTH_LIGHT_YEARS : line
  return { lineAtLightYears: line, kind: guess === 'less' ? 'left' : guess === 'more' ? 'right' : 'ring', arrowFromLightYears: line, arrowToLightYears: to }
}

// Guess 2: "about 13 billion" has a size and is drawn on the main axis; "under 100 million" is a bracket
// from 0 to 100 million on the zoomed panel; "a few billion" has no size, so it is only an edge arrow on
// the zoomed panel pointing off the scale to the right.
export type LeftGuessMark =
  | { panel: 'main'; kind: 'line'; atLightYears: number }
  | { panel: 'zoom'; kind: 'bracket'; fromLightYears: number; toLightYears: number }
  | { panel: 'zoom'; kind: 'edge-arrow'; hasSize: false }
export function leftGuessMark(guess: LeftGuess): LeftGuessMark {
  if (guess === 'thirteen') return { panel: 'main', kind: 'line', atLightYears: GUESS_LEFT_THIRTEEN_LIGHT_YEARS }
  if (guess === 'closer') return { panel: 'zoom', kind: 'bracket', fromLightYears: 0, toLightYears: GUESS_LEFT_UNDER_LIGHT_YEARS }
  return { panel: 'zoom', kind: 'edge-arrow', hasSize: false }
}

// The zoomed panel: its own axis from 0 to 100 million light-years, ticks every 20 million, showing Source
// B's green bar. It is a different scale from the main axis.
export interface ZoomPanel {
  axisMaxLightYears: number
  tickStepLightYears: number
  ticksLightYears: number[]
  greenBarLightYears: number
  greenBarFractionOfAxis: number
}
export function zoomPanel(): ZoomPanel {
  const axisMax = GUESS_LEFT_UNDER_LIGHT_YEARS
  const tickStep = 20e6
  const green = sourceB().distanceWhenLightLeftLightYears
  return {
    axisMaxLightYears: axisMax,
    tickStepLightYears: tickStep,
    ticksLightYears: Array.from({ length: Math.round(axisMax / tickStep) + 1 }, (_, i) => i * tickStep),
    greenBarLightYears: green,
    greenBarFractionOfAxis: green / axisMax,
  }
}

// ---- What the tutor says about each guess ---------------------------------------------------------------

export interface TodayMarking {
  matches: boolean
  actual: TodayGuess
  galaxyATravelledLightYears: number
  galaxyATodayLightYears: number
  referenceLightYears: number
  // Galaxy A's distance today minus the distance its light travelled.
  todayMinusTravelledLightYears: number
}
export function markTodayGuess(guess: TodayGuess): TodayMarking {
  const a = galaxyA()
  return {
    matches: todayGuessMatches(guess),
    actual: actualToday(),
    galaxyATravelledLightYears: a.lightTravelYears,
    galaxyATodayLightYears: a.distanceTodayLightYears,
    referenceLightYears: GUESS_TODAY_REFERENCE_LIGHT_YEARS,
    todayMinusTravelledLightYears: a.distanceTodayLightYears - a.lightTravelYears,
  }
}
export interface LeftMarking {
  matches: boolean
  actual: LeftGuess | null
  sourceBLeftLightYears: number
  sourceBTravelledLightYears: number
}
export function markLeftGuess(guess: LeftGuess): LeftMarking {
  const b = sourceB()
  return {
    matches: leftGuessMatches(guess),
    actual: actualLeft(),
    sourceBLeftLightYears: b.distanceWhenLightLeftLightYears,
    sourceBTravelledLightYears: b.lightTravelYears,
  }
}

// ---- Readings (no accepted range for most rows, so only "less", "more" or "the same") ----------------

export type Reading = 'less' | 'more' | 'the same' | 'within the published range'

// (value - reference) / reference, in percent.
export function percentDifference(value: number, reference: number): number {
  return ((value - reference) / reference) * 100
}

export interface RangeComparison {
  reading: Reading
  // value minus the reference at each end of the published range.
  differenceAtLow: number
  differenceAtHigh: number
  percentAtLow: number
  percentAtHigh: number
}
// Compares a value with a published range (or a single value, with low equal to high): "less" or "more"
// when it lies outside the range, "within the published range" when it lies inside it.
export function compareWithRange(value: number, low: number, high: number): RangeComparison {
  const reading: Reading = value < low ? 'less' : value > high ? 'more' : low === high ? 'the same' : 'within the published range'
  return {
    reading,
    differenceAtLow: value - low,
    differenceAtHigh: value - high,
    percentAtLow: percentDifference(value, low),
    percentAtHigh: percentDifference(value, high),
  }
}

// ---- Time the oldest light left, in the model -------------------------------------------------------

// Years after the Big Bang at which this model puts the oldest light's departure (unrounded).
export function modelLightLeftYearsAfterBigBang(): number {
  return timeAfterBigBangYears(1 / (1 + CMB_REDSHIFT), BEST_FIT_DARK_ENERGY_FRACTION)
}
// The same, rounded to the nearest thousand years, as the page prints it.
export function modelLightLeftYearsRounded(): number {
  return Math.round(modelLightLeftYearsAfterBigBang() / 1e3) * 1e3
}

// ---- The check-up (Table 1): every row independent of the learner's Part 2 source ------------------------

export interface CheckUpRow {
  // a: the oldest light's source today; b: that distance against the edge of the observable universe;
  // c: when the oldest light left (years after the Big Bang); d: the age of the universe (years).
  id: 'a' | 'b' | 'c' | 'd'
  model: number
  publishedLow: number
  publishedHigh: number
  comparison: RangeComparison
}
export function checkUp(): CheckUpRow[] {
  const cmbToday = sourceB().distanceTodayLightYears
  const modelAge = universeAgeYears(BEST_FIT_DARK_ENERGY_FRACTION)
  const rows: Array<[CheckUpRow['id'], number, number, number]> = [
    // The two ends of the range are the Planck-based calculation and the older given value (Wikipedia, citing
    // Gott and others 2005), the figures the owner kept (2026-11-15, Question G, option 1).
    ['a', cmbToday, PLANCK_BASED_CMB_SOURCE_DISTANCE_LIGHT_YEARS.low, REAL_CMB_SOURCE_DISTANCE_TODAY_LIGHT_YEARS],
    ['b', cmbToday, PLANCK_BASED_EDGE_LIGHT_YEARS.low, REAL_OBSERVABLE_UNIVERSE_RADIUS_LIGHT_YEARS],
    ['c', modelLightLeftYearsAfterBigBang(), PUBLISHED_LIGHT_LEFT_YEARS_AFTER_BIG_BANG.low, PUBLISHED_LIGHT_LEFT_YEARS_AFTER_BIG_BANG.high],
    ['d', modelAge, PLANCK_AGE_YEARS, PLANCK_AGE_YEARS],
  ]
  return rows.map(([id, model, low, high]) => ({ id, model, publishedLow: low, publishedHigh: high, comparison: compareWithRange(model, low, high) }))
}

// ---- Table 2: the three distances for Galaxy A, Source B and the learner's own source ----------------------

export interface DistanceTableRow {
  label: 'Galaxy A' | 'Source B' | 'Your source'
  redshift: number
  lightTravelYears: number
  distanceTodayLightYears: number
  distanceWhenLightLeftLightYears: number
}
export function distanceTable(yourRedshift: number): DistanceTableRow[] {
  const row = (label: DistanceTableRow['label'], redshift: number): DistanceTableRow => {
    const r = runObservableUniverseExperiment(redshift)
    return {
      label,
      redshift,
      lightTravelYears: r.lightTravelYears,
      distanceTodayLightYears: r.distanceTodayLightYears,
      distanceWhenLightLeftLightYears: r.distanceWhenLightLeftLightYears,
    }
  }
  return [row('Galaxy A', GALAXY_A_REDSHIFT), row('Source B', CMB_REDSHIFT), row('Your source', yourRedshift)]
}

// "What your numbers show": the learner's source against Galaxy A (trial values).
export interface YourNumbers {
  redshift: number
  lightTravelYears: number
  distanceTodayLightYears: number
  distanceWhenLightLeftLightYears: number
  todayOverTravelled: number
  // Your source's distance today minus Galaxy A's, and the reading ("less" when your source is nearer).
  todayMinusGalaxyALightYears: number
  todayReadingAgainstGalaxyA: 'less' | 'more' | 'the same'
}
export function whatYourNumbersShow(redshift: number): YourNumbers {
  const mine = runObservableUniverseExperiment(redshift)
  const a = galaxyA()
  const difference = mine.distanceTodayLightYears - a.distanceTodayLightYears
  return {
    redshift,
    lightTravelYears: mine.lightTravelYears,
    distanceTodayLightYears: mine.distanceTodayLightYears,
    distanceWhenLightLeftLightYears: mine.distanceWhenLightLeftLightYears,
    todayOverTravelled: mine.todayOverTravelled,
    todayMinusGalaxyALightYears: difference,
    todayReadingAgainstGalaxyA: Math.abs(difference) < 1 ? 'the same' : difference < 0 ? 'less' : 'more',
  }
}

// ---- The picture's own numbers (captions and the graph) ------------------------------------------------------

export interface CaptionNumbers {
  // Distance today minus the distance the light travelled, for each fixed source (light-years).
  galaxyAGapLightYears: number
  sourceBGapLightYears: number
  // The graph's green curve: where it peaks (redshift and distance in light-years).
  leftCurvePeakRedshift: number
  leftCurvePeakLightYears: number
  // The graph's blue curve at its right-hand end.
  travelCurveEndLightYears: number
  todayCurveEndLightYears: number
}
export function captionNumbers(): CaptionNumbers {
  const a = galaxyA()
  const b = sourceB()
  const curve = b.curve
  const peak = curve.reduce((best, p) => (p.distanceWhenLightLeftLightYears > best.distanceWhenLightLeftLightYears ? p : best))
  const end = curve[curve.length - 1]
  return {
    galaxyAGapLightYears: a.distanceTodayLightYears - a.lightTravelYears,
    sourceBGapLightYears: b.distanceTodayLightYears - b.lightTravelYears,
    leftCurvePeakRedshift: peak.redshift,
    leftCurvePeakLightYears: peak.distanceWhenLightLeftLightYears,
    travelCurveEndLightYears: end.lightTravelYears,
    todayCurveEndLightYears: end.distanceTodayLightYears,
  }
}

// ---- Worked examples for the Words and formulas box (the last two are held back until after the run) --------

export interface WorkedExamples {
  // Distance the light travelled = travel time x the speed of light (1 light-year per year).
  travelYears: number
  travelLightYears: number
  // Distance when the light left = distance today / (1 + z), for Source B.
  todayLightYears: number
  stretchingFactor: number
  leftLightYears: number
  // Recession speed = H0 x distance today, for Source B.
  hubbleConstant: number
  distanceTodayMpc: number
  recessionSpeedKmPerS: number
  recessionSpeedOverC: number
}
export function workedExamples(): WorkedExamples {
  const b = sourceB()
  const mpc = comovingDistanceMpc(CMB_REDSHIFT, BEST_FIT_DARK_ENERGY_FRACTION)
  const speed = HUBBLE_CONSTANT_KM_PER_S_PER_MPC * mpc
  return {
    travelYears: b.lightTravelYears,
    travelLightYears: b.lightTravelYears * 1,
    todayLightYears: b.distanceTodayLightYears,
    stretchingFactor: b.stretchingFactor,
    leftLightYears: b.distanceTodayLightYears / b.stretchingFactor,
    hubbleConstant: HUBBLE_CONSTANT_KM_PER_S_PER_MPC,
    distanceTodayMpc: mpc,
    recessionSpeedKmPerS: speed,
    recessionSpeedOverC: speed / REAL_SPEED_OF_LIGHT_KM_PER_S,
  }
}

// ---- Part 2's zoomed strip -----------------------------------------------------------------------------

// The axes a zoomed strip may use (light-years), smallest first. A learner's source whose "when the light
// left" distance is under 1 billion light-years is too short to see on the main 0 to 50 billion axis, so a
// strip is drawn on the smallest of these axes that holds it. At or above 1 billion no strip is needed.
export const ZOOM_AXES_LIGHT_YEARS = [100e6, 200e6, 500e6, 1e9]
export function zoomAxisFor(distanceWhenLightLeftLightYears: number): number | null {
  if (distanceWhenLightLeftLightYears >= ZOOM_AXES_LIGHT_YEARS[ZOOM_AXES_LIGHT_YEARS.length - 1]) return null
  return ZOOM_AXES_LIGHT_YEARS.find((axis) => distanceWhenLightLeftLightYears <= axis) ?? null
}
