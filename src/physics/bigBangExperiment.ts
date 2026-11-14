// This experiment deliberately reuses hubblesLawExperiment.ts's HUBBLE_CONSTANT_KM_PER_S_PER_MPC
// unchanged rather than redefining it, so this calculation can never silently drift from
// Experiment 1's own value. See the specification's "Physics Model" and "Required Physics Tests".
import { HUBBLE_CONSTANT_KM_PER_S_PER_MPC } from './hubblesLawExperiment'
// Used only by the audit-update functions at the end of this file.
import {
  GALAXY_PRESETS,
  MAX_CUSTOM_DISTANCE_MPC,
  PUBLISHED_H0_EARLY,
  PUBLISHED_H0_LOCAL,
  hubbleConstantReading,
  recessionSpeedKmPerS,
} from './hubblesLawExperiment'

// Real, standard unit-conversion constant (kilometers per megaparsec), not an invented value.
export const MPC_TO_KM = 3.0856775814913673e19

// A Julian year in seconds (365.25 days) - the standard astronomical convention for year-scale
// conversions.
export const SECONDS_PER_YEAR = 365.25 * 24 * 60 * 60

// A real, independently measured comparison value, stated as a real-world comparison - not
// derived by this experiment. Source: NASA ("about 13.8 billion years", the Hubble "Big Bang" and
// "Cosmic History" pages, read 2026-11-14). The earlier comment here named a Planck-era LambdaCDM
// estimate, but the Planck 2018 abstract that was read gives no age, so that is not claimed.
export const REAL_UNIVERSE_AGE_YEARS = 13.8e9

// The one genuinely new physical idea: running v = H0 * d backward. Since d / v = d / (H0 * d) =
// 1 / H0, the time for ANY galaxy to reach zero distance from us (at today's constant recession
// speed) is the same number regardless of distance - the "Hubble time." Takes no argument because
// it does not depend on distance; that independence from distance is the whole point.
export function hubbleTimeYears(): number {
  const hubbleConstantPerSecond = HUBBLE_CONSTANT_KM_PER_S_PER_MPC / MPC_TO_KM
  const hubbleTimeSeconds = 1 / hubbleConstantPerSecond
  return hubbleTimeSeconds / SECONDS_PER_YEAR
}

// Linear backward extrapolation of a galaxy's distance from Earth, assuming its current recession
// speed has stayed constant throughout (see the specification's "Simplifying assumptions").
// Reaches exactly 0 at yearsAgo = hubbleTimeYears(), for every distanceMpc - confirming the premise
// above directly in the position function the diagram animates. Clamped at 0 for yearsAgo beyond
// hubbleTimeYears(), since this simplified model does not extend past that point.
export function distanceAtPastTimeMpc(distanceMpc: number, yearsAgo: number): number {
  const fraction = 1 - yearsAgo / hubbleTimeYears()
  return distanceMpc * Math.max(0, fraction)
}

export interface BigBangResult {
  distanceMpc: number
  hubbleTimeYears: number
  realUniverseAgeYears: number
}

// distanceMpc is echoed back for display and for driving the diagram's animation - the result
// itself (hubbleTimeYears) does not depend on it.
export function runBigBangExperiment(distanceMpc: number): BigBangResult {
  if (!(distanceMpc > 0)) {
    throw new RangeError('Distance must be greater than zero')
  }

  return {
    distanceMpc,
    hubbleTimeYears: hubbleTimeYears(),
    realUniverseAgeYears: REAL_UNIVERSE_AGE_YEARS,
  }
}

// ---------------------------------------------------------------------------------------------
// Audit update (2026-11): the time-to-reach-Earth bars, the zoom strip, the guess markers, the
// tutor's marking, the check-up against published values and the worked example. Everything below
// is new; nothing above this line was changed except the comment on REAL_UNIVERSE_AGE_YEARS. The
// interface only displays what these functions return (CLAUDE.md §9).
// ---------------------------------------------------------------------------------------------

// The three preset galaxies drawn in Part 1, nearest first; Part 1 highlights the first.
export const BACKWARD_RUN_PRESETS = GALAXY_PRESETS
export const MIN_OWN_GALAXY_DISTANCE_MPC = 1
export const MAX_OWN_GALAXY_DISTANCE_MPC = MAX_CUSTOM_DISTANCE_MPC

// The time a galaxy takes to reach zero distance, found the long way (its distance in km divided
// by its recession speed in km/s, then converted to years) so that it is an independent route to
// the same number as 1 / H0.
export function timeBackToZeroYears(distanceMpc: number): number {
  if (!(distanceMpc > 0)) {
    throw new RangeError('Distance must be greater than zero')
  }
  const distanceKm = distanceMpc * MPC_TO_KM
  const seconds = distanceKm / recessionSpeedKmPerS(distanceMpc)
  return seconds / SECONDS_PER_YEAR
}

export interface GalaxyTimeRow {
  distanceMpc: number
  recessionSpeedKmPerS: number
  timeBackYears: number
}

export function galaxyTimeRow(distanceMpc: number): GalaxyTimeRow {
  return {
    distanceMpc,
    recessionSpeedKmPerS: recessionSpeedKmPerS(distanceMpc),
    timeBackYears: timeBackToZeroYears(distanceMpc),
  }
}

// 1 / H0 for any Hubble constant (the page's own hubbleTimeYears() is this at H0 = 70).
export function hubbleTimeYearsForH0(hubbleConstantKmPerSPerMpc: number): number {
  if (!(hubbleConstantKmPerSPerMpc > 0)) {
    throw new RangeError('The Hubble constant must be greater than zero')
  }
  return MPC_TO_KM / hubbleConstantKmPerSPerMpc / SECONDS_PER_YEAR
}

// --- The "Time to reach Earth" panel and the zoom strip (display scales) -----------------------
export const TIME_PANEL_MAX_YEARS = 16e9
export const AGE_STRIP_MIN_YEARS = 12e9
export const AGE_STRIP_MAX_YEARS = 16e9

export function timeBarFraction(timeYears: number): number {
  return Math.max(0, Math.min(1, timeYears / TIME_PANEL_MAX_YEARS))
}

export function ageStripFraction(years: number): number {
  return Math.max(0, Math.min(1, (years - AGE_STRIP_MIN_YEARS) / (AGE_STRIP_MAX_YEARS - AGE_STRIP_MIN_YEARS)))
}

// --- The learner's two guesses -----------------------------------------------------------------
export type TimeGuess = 'longer' | 'shorter' | 'same'
export type AgeGuess = 'muchLonger' | 'muchShorter' | 'close'

// Guess 1 has no size of its own, so its white mark is only a marker on the farthest galaxy's bar:
// an arrow past the bar's end, an arrow ending short of it, or a tick exactly at its end.
export type TimeMarker = 'past-end' | 'short-of-end' | 'at-end'
export function timeGuessMarker(guess: TimeGuess): TimeMarker {
  return guess === 'longer' ? 'past-end' : guess === 'shorter' ? 'short-of-end' : 'at-end'
}

// Guess 2 is also only a marker. "Much" has no scientific size: it is drawn this fraction of the
// strip's width away from a tick, for display only, and the caption says so.
export const AGE_GUESS_OFFSET_FRACTION = 0.25

// Where the white marker sits on the zoom strip, in years: "much longer" to the right of this
// page's own answer, "much shorter" to the left of the measured age, "close" between the two.
export function ageGuessMarkerYears(guess: AgeGuess): number {
  const offset = AGE_GUESS_OFFSET_FRACTION * (AGE_STRIP_MAX_YEARS - AGE_STRIP_MIN_YEARS)
  const model = hubbleTimeYears()
  if (guess === 'muchLonger') return model + offset
  if (guess === 'muchShorter') return REAL_UNIVERSE_AGE_YEARS - offset
  return (model + REAL_UNIVERSE_AGE_YEARS) / 2
}

// --- Marking the guesses (the tutor only): the real answers are read from the numbers ---------
const TIME_TOLERANCE_FRACTION = 1e-9

// Compares the farthest and the nearest galaxy in the rows (the question was about a farther
// galaxy against a nearer one).
export function actualTimeAnswer(rows: GalaxyTimeRow[]): TimeGuess {
  const sorted = [...rows].sort((a, b) => a.distanceMpc - b.distanceMpc)
  const near = sorted[0]
  const far = sorted[sorted.length - 1]
  if (Math.abs(far.timeBackYears - near.timeBackYears) <= TIME_TOLERANCE_FRACTION * near.timeBackYears) return 'same'
  return far.timeBackYears > near.timeBackYears ? 'longer' : 'shorter'
}

export function timeGuessMatches(guess: TimeGuess, rows: GalaxyTimeRow[]): boolean {
  return actualTimeAnswer(rows) === guess
}

// "Close, but not exact" needs a rule to be marked. The page's own test already uses within about
// 10 percent of the real age; that is a code threshold, not a published one, and the Results never
// presents it as one (they show the numbers and the percentage). Beyond it, the answer is "much".
export const CLOSE_RELATIVE_GAP = 0.1

export function relativeGapToMeasuredAge(modelYears: number = hubbleTimeYears()): number {
  return (modelYears - REAL_UNIVERSE_AGE_YEARS) / REAL_UNIVERSE_AGE_YEARS
}

export function actualAgeAnswer(modelYears: number = hubbleTimeYears()): AgeGuess {
  const gap = relativeGapToMeasuredAge(modelYears)
  if (gap > CLOSE_RELATIVE_GAP) return 'muchLonger'
  if (gap < -CLOSE_RELATIVE_GAP) return 'muchShorter'
  return 'close'
}

export function ageGuessMatches(guess: AgeGuess, modelYears: number = hubbleTimeYears()): boolean {
  return actualAgeAnswer(modelYears) === guess
}

// --- The check-up: this page's numbers beside published ones (values read 2026-11-14) ---------
export type BigBangCheckUpReading = 'more' | 'less' | 'same' | 'between' | 'between-not-independent' | 'calculated-only'

export function ageReading(modelYears: number, measuredYears: number): 'more' | 'less' | 'same' {
  if (modelYears === measuredYears) return 'same'
  return modelYears > measuredYears ? 'more' : 'less'
}

export interface BigBangCheckUpRow {
  id: 'age-against-measured' | 'hubble-constant' | 'age-at-published-h0' | 'time-per-galaxy'
  used: number
  // The published value(s) the row sets beside it, null when there is none.
  published: number | null
  publishedLow?: number
  publishedHigh?: number
  reading: BigBangCheckUpReading
  relativeGap?: number
}

export function bigBangCheckUp(): BigBangCheckUpRow[] {
  const model = hubbleTimeYears()
  const atLocal = hubbleTimeYearsForH0(PUBLISHED_H0_LOCAL.value)
  const atEarly = hubbleTimeYearsForH0(PUBLISHED_H0_EARLY.value)
  const low = Math.min(atLocal, atEarly)
  const high = Math.max(atLocal, atEarly)
  const measuredBetween = REAL_UNIVERSE_AGE_YEARS > low && REAL_UNIVERSE_AGE_YEARS < high
  return [
    {
      id: 'age-against-measured',
      used: model,
      published: REAL_UNIVERSE_AGE_YEARS,
      reading: ageReading(model, REAL_UNIVERSE_AGE_YEARS),
      relativeGap: relativeGapToMeasuredAge(model),
    },
    {
      id: 'hubble-constant',
      used: HUBBLE_CONSTANT_KM_PER_S_PER_MPC,
      published: null,
      reading: hubbleConstantReading(HUBBLE_CONSTANT_KM_PER_S_PER_MPC) === 'between' ? 'between' : 'calculated-only',
    },
    {
      id: 'age-at-published-h0',
      used: model,
      published: REAL_UNIVERSE_AGE_YEARS,
      publishedLow: low,
      publishedHigh: high,
      // A consistency check only: the measured age is not found from 1 / H0.
      reading: measuredBetween ? 'between-not-independent' : 'calculated-only',
    },
    {
      id: 'time-per-galaxy',
      used: model,
      published: null,
      reading: 'calculated-only',
    },
  ]
}

// --- The worked example shown in the words box and the caption ---------------------------------
export interface BigBangWorkedExample {
  distanceMpc: number
  distanceKm: number
  speedKmPerS: number
  seconds: number
  years: number
}

export function bigBangWorkedExample(distanceMpc: number = GALAXY_PRESETS[0].distanceMpc): BigBangWorkedExample {
  const distanceKm = distanceMpc * MPC_TO_KM
  const speedKmPerS = recessionSpeedKmPerS(distanceMpc)
  const seconds = distanceKm / speedKmPerS
  return { distanceMpc, distanceKm, speedKmPerS, seconds, years: seconds / SECONDS_PER_YEAR }
}
