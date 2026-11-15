// This experiment deliberately reuses earlier experiments' code unchanged (imported, not redefined):
// the Hubble constant (Experiment 1), the Hubble time and real measured age (Experiment 2), and the
// dark energy share limits (Experiment 5). See the specification's "Physics Model" and "Required
// Physics Tests".
import { HUBBLE_CONSTANT_KM_PER_S_PER_MPC } from './hubblesLawExperiment'
import { REAL_UNIVERSE_AGE_YEARS, hubbleTimeYears } from './bigBangExperiment'
import { BEST_FIT_DARK_ENERGY_FRACTION, MAX_DARK_ENERGY_FRACTION } from './darkEnergyExperiment'

// The comparison marker for the oldest known star clusters: "older than about 13.3 billion years",
// a lower limit from Cimatti and Moresco (2023, ApJ 953, 149; arXiv:2302.07899), abstract: the
// selected oldest objects are "older than 13.3 Gyr". The study assumes a matter share of 0.3 and a
// formation redshift of 11 to 30, so the figure depends on its model. Changed from the rounded 12.5
// (not supported by any source read) on 2026-11-15 in the audit. A comparison marker only; no age
// formula uses it.
export const OLDEST_STARS_AGE_YEARS = 13.3e9

// The Planck-like values behind the real measured age (13.8 billion years), used only for the
// Hubble-tension comparison: a slightly lower Hubble constant AND a slightly lower dark energy share.
export const PLANCK_LIKE_HUBBLE_CONSTANT_KM_PER_S_PER_MPC = 67.4
export const PLANCK_LIKE_DARK_ENERGY_FRACTION = 0.685

// Fixed time axis for the size-versus-time curves (covers the oldest age the slider can give, ~17.9
// billion years), so the graph's axis does not jump when the learner moves the slider.
export const GRAPH_MAX_YEARS = 20e9
const CURVE_SAMPLES = 41

// Hubble time for any Hubble constant, scaling Experiment 2's value (which uses Experiment 1's constant).
function hubbleTimeForYears(hubbleConstant: number): number {
  return (hubbleTimeYears() * HUBBLE_CONSTANT_KM_PER_S_PER_MPC) / hubbleConstant
}

// Age of a flat universe (matter share 1 - L, dark energy share L). Exact closed forms:
//   L = 0: t0 = (2/3) x Hubble time
//   L > 0: t0 = Hubble time x (2 / (3 sqrt(L))) x asinh(sqrt(L / (1 - L)))
export function universeAgeYears(
  darkEnergyFraction: number,
  hubbleConstantKmPerSPerMpc: number = HUBBLE_CONSTANT_KM_PER_S_PER_MPC,
): number {
  const hubbleTime = hubbleTimeForYears(hubbleConstantKmPerSPerMpc)
  if (darkEnergyFraction <= 0) return (2 / 3) * hubbleTime
  const root = Math.sqrt(darkEnergyFraction)
  return (
    hubbleTime *
    (2 / (3 * root)) *
    Math.asinh(Math.sqrt(darkEnergyFraction / (1 - darkEnergyFraction)))
  )
}

// Relative size of the universe (today = 1) a given time after the Big Bang. Exact closed forms:
//   L = 0: a = ((3/2) H0 t)^(2/3)
//   L > 0: a = ((1 - L) / L)^(1/3) x sinh((3/2) sqrt(L) H0 t)^(2/3)
export function relativeSizeAtTime(
  yearsAfterBigBang: number,
  darkEnergyFraction: number,
  hubbleConstantKmPerSPerMpc: number = HUBBLE_CONSTANT_KM_PER_S_PER_MPC,
): number {
  if (yearsAfterBigBang <= 0) return 0
  const h0TimesT = yearsAfterBigBang / hubbleTimeForYears(hubbleConstantKmPerSPerMpc)
  if (darkEnergyFraction <= 0) return Math.pow(1.5 * h0TimesT, 2 / 3)
  const root = Math.sqrt(darkEnergyFraction)
  return (
    Math.pow((1 - darkEnergyFraction) / darkEnergyFraction, 1 / 3) *
    Math.pow(Math.sinh(1.5 * root * h0TimesT), 2 / 3)
  )
}

// Experiment 2's constant-speed picture: size grows in a straight line, reaching 1 at the Hubble time.
export function constantSpeedRelativeSize(yearsAfterBigBang: number): number {
  return Math.max(0, yearsAfterBigBang) / hubbleTimeYears()
}

export interface UniverseAgeResult {
  darkEnergyFraction: number
  ageYears: number
  matterOnlyAgeYears: number
  hubbleTimeYears: number
  realAgeYears: number
  ageOverHubbleTime: number
  isOlderThanOldestStars: boolean
  curves: Array<{
    yearsAfterBigBang: number
    matterOnlySize: number
    chosenSize: number
    constantSpeedSize: number
  }>
}

export function runUniverseAgeExperiment(darkEnergyFraction: number): UniverseAgeResult {
  const ageYears = universeAgeYears(darkEnergyFraction)
  return {
    darkEnergyFraction,
    ageYears,
    matterOnlyAgeYears: universeAgeYears(0),
    hubbleTimeYears: hubbleTimeYears(),
    realAgeYears: REAL_UNIVERSE_AGE_YEARS,
    ageOverHubbleTime: ageYears / hubbleTimeYears(),
    isOlderThanOldestStars: ageYears > OLDEST_STARS_AGE_YEARS,
    curves: Array.from({ length: CURVE_SAMPLES }, (_, i) => {
      const yearsAfterBigBang = (i / (CURVE_SAMPLES - 1)) * GRAPH_MAX_YEARS
      return {
        yearsAfterBigBang,
        matterOnlySize: relativeSizeAtTime(yearsAfterBigBang, 0),
        chosenSize: relativeSizeAtTime(yearsAfterBigBang, darkEnergyFraction),
        constantSpeedSize: constantSpeedRelativeSize(yearsAfterBigBang),
      }
    }),
  }
}

export { BEST_FIT_DARK_ENERGY_FRACTION, MAX_DARK_ENERGY_FRACTION }


// ---------------------------------------------------------------------------------------------
// Added in the audit (2026-11-15): guess marks, tutor marking, the published comparisons, the check-up,
// the tables and the worked examples. The interface only displays what these functions return
// (CLAUDE.md §9, §14 "Predictions and the Real Results"). The age and size physics above is unchanged.
// ---------------------------------------------------------------------------------------------

// Published values read on 2026-11-15 (through helper digests; to be rechecked against the live pages
// before they are printed).
// Planck 2018 VI (arXiv:1807.06209), Table 2, TT,TE,EE+lowE+lensing: age 13.797 +/- 0.023 Gyr,
// H0 = 67.36 +/- 0.54, matter 0.3153 +/- 0.0073, dark energy 0.6847 +/- 0.0073 (flat universe). The
// abstract gives H0 = 67.4 +/- 0.5 and matter 0.315 +/- 0.007 and does not give the age.
export const PUBLISHED_PLANCK = {
  ageYears: 13.797e9,
  ageUncertaintyYears: 0.023e9,
  hubbleConstant: 67.36,
  darkEnergyShare: 0.6847,
}
// NASA, "The Hubble constant and the tension" (4 August 2025): space-telescope measurements "around
// 70-76", the cosmic microwave background "about 67-68", an age of "about 13.8 billion years".
export const PUBLISHED_NASA_HUBBLE_RANGES = {
  spaceTelescopes: { low: 70, high: 76 },
  microwaveBackground: { low: 67, high: 68 },
}
// ESA, Hipparcos press release INFO 04-1997: other estimates gave the oldest stars 14.6 billion years;
// the Hipparcos investigators arrive at 11. Chaboyer and others 1997 (arXiv:astro-ph/9706128), abstract:
// 11.5 +/- 1.3 Gyr, one-sided 95% lower limit 9.5.
export const PUBLISHED_HIPPARCOS = { earlierEstimateYears: 14.6e9, hipparcosYears: 11e9 }
export const PUBLISHED_CHABOYER_1997 = { ageYears: 11.5e9, uncertaintyYears: 1.3e9 }

// A time early in the universe, for the "how steeply each line rises" item of the caption.
export const EARLY_EXAMPLE_YEARS = 4e9

export type MatterOnlyGuess = 'longer' | 'shorter' | 'same'
export type DarkEnergyGuess = 'older' | 'younger' | 'same'

const SAME_TOLERANCE = 1e-9

// ---- What the model actually gives (the tutor marks each guess; Results does not) ----------------

// Guess 1: the matter-only age against Experiment 2's constant-speed estimate (the Hubble time).
export function actualMatterOnlyAge(): MatterOnlyGuess {
  const ratio = universeAgeYears(0) / hubbleTimeYears()
  if (Math.abs(ratio - 1) < SAME_TOLERANCE) return 'same'
  return ratio > 1 ? 'longer' : 'shorter'
}

// Guess 2: the best-fit age against the matter-only age (both at the same Hubble constant).
export function actualDarkEnergyAge(): DarkEnergyGuess {
  const ratio = universeAgeYears(BEST_FIT_DARK_ENERGY_FRACTION) / universeAgeYears(0)
  if (Math.abs(ratio - 1) < SAME_TOLERANCE) return 'same'
  return ratio > 1 ? 'older' : 'younger'
}

export function matterOnlyGuessMatches(guess: MatterOnlyGuess): boolean {
  return guess === actualMatterOnlyAge()
}
export function darkEnergyGuessMatches(guess: DarkEnergyGuess): boolean {
  return guess === actualDarkEnergyAge()
}

// ---- The white guess marks (markers only: three answers carry no size of their own) -------------

// A fixed-length arrow (in years on the graph's time axis) starting at the dot the guess is compared
// with; its length means nothing as a number. A ring round the dot stands for "the same".
export const GUESS_ARROW_LENGTH_YEARS = 1.5e9

export interface AgeGuessMarker {
  // The dot the mark starts from: Experiment 2's purple dot (guess 1) or the matter-only blue dot (guess 2).
  fromDot: 'constant' | 'matter'
  fromYears: number
  toYears: number
  kind: 'left' | 'right' | 'ring'
}

export function matterOnlyGuessMarker(guess: MatterOnlyGuess): AgeGuessMarker {
  const fromYears = hubbleTimeYears()
  const toYears =
    guess === 'shorter' ? fromYears - GUESS_ARROW_LENGTH_YEARS : guess === 'longer' ? fromYears + GUESS_ARROW_LENGTH_YEARS : fromYears
  return { fromDot: 'constant', fromYears, toYears, kind: guess === 'shorter' ? 'left' : guess === 'longer' ? 'right' : 'ring' }
}

export function darkEnergyGuessMarker(guess: DarkEnergyGuess): AgeGuessMarker {
  const fromYears = universeAgeYears(0)
  const toYears =
    guess === 'younger' ? fromYears - GUESS_ARROW_LENGTH_YEARS : guess === 'older' ? fromYears + GUESS_ARROW_LENGTH_YEARS : fromYears
  return { fromDot: 'matter', fromYears, toYears, kind: guess === 'younger' ? 'left' : guess === 'older' ? 'right' : 'ring' }
}

// What the tutor says about each guess: whether it matches, and the numbers it is compared with.
export interface GuessMarking {
  matches: boolean
  actual: MatterOnlyGuess | DarkEnergyGuess
  ageYears: number
  referenceAgeYears: number
}
export function markMatterOnlyGuess(guess: MatterOnlyGuess): GuessMarking {
  return {
    matches: matterOnlyGuessMatches(guess),
    actual: actualMatterOnlyAge(),
    ageYears: universeAgeYears(0),
    referenceAgeYears: hubbleTimeYears(),
  }
}
export function markDarkEnergyGuess(guess: DarkEnergyGuess): GuessMarking {
  return {
    matches: darkEnergyGuessMatches(guess),
    actual: actualDarkEnergyAge(),
    ageYears: universeAgeYears(BEST_FIT_DARK_ENERGY_FRACTION),
    referenceAgeYears: universeAgeYears(0),
  }
}

// ---- Shares at which the age reaches a given value -------------------------------------------------

// The dark energy share (to 1e-6) at which the age equals `ageYears`, found by bisection; the age rises
// with the share, so there is one answer. Null if the age is outside what 0 to the maximum share gives.
export function shareForAge(ageYears: number, hubbleConstant: number = HUBBLE_CONSTANT_KM_PER_S_PER_MPC): number | null {
  const lowAge = universeAgeYears(0, hubbleConstant)
  const highAge = universeAgeYears(MAX_DARK_ENERGY_FRACTION, hubbleConstant)
  if (ageYears < lowAge || ageYears > highAge) return null
  let low = 0
  let high = MAX_DARK_ENERGY_FRACTION
  for (let i = 0; i < 60; i++) {
    const middle = (low + high) / 2
    if (universeAgeYears(middle, hubbleConstant) < ageYears) low = middle
    else high = middle
  }
  return (low + high) / 2
}

// The share from which a universe passes the star test (age above the oldest clusters' lower limit).
export function starTestPassShare(): number {
  return shareForAge(OLDEST_STARS_AGE_YEARS)!
}
// The share at which the age equals the real measured age (13.8 billion years), at H0 = 70.
export function measuredAgeShare(): number {
  return shareForAge(REAL_UNIVERSE_AGE_YEARS)!
}

// ---- The early-time example (caption item 2) --------------------------------------------------------

export interface EarlySizes {
  yearsAfterBigBang: number
  matterOnlySize: number
  bestFitSize: number
  constantSpeedSize: number
}
export function earlySizes(yearsAfterBigBang: number = EARLY_EXAMPLE_YEARS): EarlySizes {
  return {
    yearsAfterBigBang,
    matterOnlySize: relativeSizeAtTime(yearsAfterBigBang, 0),
    bestFitSize: relativeSizeAtTime(yearsAfterBigBang, BEST_FIT_DARK_ENERGY_FRACTION),
    constantSpeedSize: constantSpeedRelativeSize(yearsAfterBigBang),
  }
}

// ---- Worked examples quoted in the page -----------------------------------------------------------

// Matter only: (2 / 3) x the Hubble time.
export interface MatterOnlyExample {
  hubbleTimeYears: number
  fraction: number
  ageYears: number
}
export function matterOnlyExample(): MatterOnlyExample {
  const hubbleTime = hubbleTimeYears()
  return { hubbleTimeYears: hubbleTime, fraction: 2 / 3, ageYears: (2 / 3) * hubbleTime }
}

// With dark energy share L: age = Hubble time x (2 / (3 sqrt L)) x asinh(sqrt(L / (1 - L))), step by step.
export interface DarkEnergyExample {
  share: number
  hubbleTimeYears: number
  root: number
  factor: number
  argument: number
  asinhValue: number
  ageYears: number
}
export function darkEnergyExample(darkEnergyFraction: number = BEST_FIT_DARK_ENERGY_FRACTION): DarkEnergyExample {
  const hubbleTime = hubbleTimeYears()
  const root = Math.sqrt(darkEnergyFraction)
  const factor = 2 / (3 * root)
  const argument = Math.sqrt(darkEnergyFraction / (1 - darkEnergyFraction))
  const asinhValue = Math.asinh(argument)
  return { share: darkEnergyFraction, hubbleTimeYears: hubbleTime, root, factor, argument, asinhValue, ageYears: hubbleTime * factor * asinhValue }
}

// ---- Readings (no accepted range, so only "less", "more" or "the same") -----------------------------

export type CheckUpReading = 'less' | 'more' | 'the same' | 'calculated here only'

// "the same" only when the difference is inside the published value's own uncertainty; otherwise
// "less" or "more". No other cut-off is used.
export function readingAgainst(value: number, reference: number, uncertainty = 0): 'less' | 'more' | 'the same' {
  const difference = value - reference
  if (Math.abs(difference) <= uncertainty) return 'the same'
  return difference < 0 ? 'less' : 'more'
}

// ---- The check-up (Table 1): every row independent of the learner's Part 2 share ----------------------

export interface CheckUpRow {
  // a: best fit against the measured age, b: the Planck-like pair against it, c: matter only against the
  // oldest clusters, d: the Hubble time against the measured age, e: matter only against the Hubble time.
  id: 'a' | 'b' | 'c' | 'd' | 'e'
  thisPageYears: number
  // The reference, or null where no published or independent value exists.
  besideYears: number | null
  uncertaintyYears: number
  differenceYears: number | null
  reading: CheckUpReading
}

export function checkUp(): CheckUpRow[] {
  const published = PUBLISHED_PLANCK.ageYears
  const uncertainty = PUBLISHED_PLANCK.ageUncertaintyYears
  const bestFit = universeAgeYears(BEST_FIT_DARK_ENERGY_FRACTION)
  const pair = universeAgeYears(PLANCK_LIKE_DARK_ENERGY_FRACTION, PLANCK_LIKE_HUBBLE_CONSTANT_KM_PER_S_PER_MPC)
  const matterOnly = universeAgeYears(0)
  const hubbleTime = hubbleTimeYears()
  return [
    { id: 'a', thisPageYears: bestFit, besideYears: published, uncertaintyYears: uncertainty, differenceYears: bestFit - published, reading: readingAgainst(bestFit, published, uncertainty) },
    { id: 'b', thisPageYears: pair, besideYears: published, uncertaintyYears: uncertainty, differenceYears: pair - published, reading: readingAgainst(pair, published, uncertainty) },
    { id: 'c', thisPageYears: matterOnly, besideYears: OLDEST_STARS_AGE_YEARS, uncertaintyYears: 0, differenceYears: matterOnly - OLDEST_STARS_AGE_YEARS, reading: readingAgainst(matterOnly, OLDEST_STARS_AGE_YEARS) },
    { id: 'd', thisPageYears: hubbleTime, besideYears: published, uncertaintyYears: uncertainty, differenceYears: hubbleTime - published, reading: readingAgainst(hubbleTime, published, uncertainty) },
    { id: 'e', thisPageYears: matterOnly, besideYears: null, uncertaintyYears: 0, differenceYears: null, reading: 'calculated here only' },
  ]
}

// ---- Table 2 and "What your numbers show": the learner's own share (Part 2) ----------------------------

export interface YourComparison {
  share: number
  ageYears: number
  ageOverHubbleTime: number
  againstMeasured: { differenceYears: number; reading: 'less' | 'more' | 'the same' }
  againstOldestStars: { differenceYears: number; older: boolean }
}
export function yourComparison(darkEnergyFraction: number): YourComparison {
  const ageYears = universeAgeYears(darkEnergyFraction)
  return {
    share: darkEnergyFraction,
    ageYears,
    ageOverHubbleTime: ageYears / hubbleTimeYears(),
    againstMeasured: {
      differenceYears: ageYears - PUBLISHED_PLANCK.ageYears,
      reading: readingAgainst(ageYears, PUBLISHED_PLANCK.ageYears, PUBLISHED_PLANCK.ageUncertaintyYears),
    },
    againstOldestStars: { differenceYears: ageYears - OLDEST_STARS_AGE_YEARS, older: ageYears > OLDEST_STARS_AGE_YEARS },
  }
}

// ---- Table 3: which values give 13.8? --------------------------------------------------------------------

export interface ValuesRow {
  hubbleConstant: number
  share: number
  ageYears: number
}
export function valuesTable(): ValuesRow[] {
  const h0 = HUBBLE_CONSTANT_KM_PER_S_PER_MPC
  const pairH0 = PLANCK_LIKE_HUBBLE_CONSTANT_KM_PER_S_PER_MPC
  const best = BEST_FIT_DARK_ENERGY_FRACTION
  return [
    { hubbleConstant: h0, share: best, ageYears: universeAgeYears(best, h0) },
    { hubbleConstant: pairH0, share: best, ageYears: universeAgeYears(best, pairH0) },
    { hubbleConstant: pairH0, share: PLANCK_LIKE_DARK_ENERGY_FRACTION, ageYears: universeAgeYears(PLANCK_LIKE_DARK_ENERGY_FRACTION, pairH0) },
  ]
}

// (value - reference) / reference, in percent (for the notes under the check-up).
export function percentDifference(value: number, reference: number): number {
  return ((value - reference) / reference) * 100
}
