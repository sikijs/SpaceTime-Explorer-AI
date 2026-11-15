// This experiment deliberately reuses hubblesLawExperiment.ts's Hubble constant and speed of light
// unchanged rather than redefining them, so this calculation can never silently drift from
// Experiment 1's own values. See the specification's "Physics Model" and "Required Physics Tests".
import { HUBBLE_CONSTANT_KM_PER_S_PER_MPC, REAL_SPEED_OF_LIGHT_KM_PER_S } from './hubblesLawExperiment'

// A given, rounded best-fit value (real fits are close to this); used only for the "observed" reference
// curve, not derived here.
export const BEST_FIT_DARK_ENERGY_FRACTION = 0.7

export const MAX_DARK_ENERGY_FRACTION = 0.9
export const SUPERNOVA_REDSHIFTS = [0.2, 0.5, 0.8]
export const MAX_REDSHIFT = 1

// Number of Simpson's-rule steps (must be even). A standard numerical method used to evaluate an exact
// integral; the matter-only and all-dark-energy cases have closed forms that the tests compare against.
const INTEGRATION_STEPS = 2000

// Expansion rate at redshift z relative to today's, for a flat universe with matter share (1 - L) and
// dark energy share L: E(z) = sqrt((1 - L) * (1 + z)^3 + L). Light and other radiation are left out.
export function expansionRateRatio(redshift: number, darkEnergyFraction: number): number {
  return Math.sqrt((1 - darkEnergyFraction) * (1 + redshift) ** 3 + darkEnergyFraction)
}

// Comoving distance: (c / H0) x the integral from 0 to z of dz' / E(z'), by Simpson's rule.
export function comovingDistanceMpc(
  redshift: number,
  darkEnergyFraction: number,
  steps = INTEGRATION_STEPS,
): number {
  if (redshift <= 0) return 0
  const h = redshift / steps
  let sum =
    1 / expansionRateRatio(0, darkEnergyFraction) + 1 / expansionRateRatio(redshift, darkEnergyFraction)
  for (let i = 1; i < steps; i++) {
    sum += ((i % 2 === 1 ? 4 : 2) * 1) / expansionRateRatio(i * h, darkEnergyFraction)
  }
  const hubbleDistanceMpc = REAL_SPEED_OF_LIGHT_KM_PER_S / HUBBLE_CONSTANT_KM_PER_S_PER_MPC
  return hubbleDistanceMpc * ((sum * h) / 3)
}

// Luminosity distance: the distance a standard candle's dimness implies, (1 + z) x comoving distance.
export function luminosityDistanceMpc(redshift: number, darkEnergyFraction: number): number {
  return (1 + redshift) * comovingDistanceMpc(redshift, darkEnergyFraction)
}

// Observed brightness relative to the matter-only prediction: (d_matter-only / d_chosen)^2. Brightness
// falls with the square of distance. 1 = same as matter-only; below 1 = dimmer, because the source is
// farther than matter-only predicts.
export function brightnessRelativeToMatterOnly(redshift: number, darkEnergyFraction: number): number {
  if (redshift <= 0) return 1
  const ratio = luminosityDistanceMpc(redshift, 0) / luminosityDistanceMpc(redshift, darkEnergyFraction)
  return ratio * ratio
}

// Today's deceleration parameter for this model, q0 = (1 - L) / 2 - L = 0.5 - 1.5 L. Positive = the
// expansion is slowing down; negative = speeding up; zero at a dark energy share of 1/3.
export function decelerationParameter(darkEnergyFraction: number): number {
  return 0.5 - 1.5 * darkEnergyFraction
}

export interface SupernovaResult {
  redshift: number
  matterOnlyDistanceMpc: number
  distanceMpc: number
  brightnessRelativeToMatterOnly: number
}

export interface DarkEnergyResult {
  darkEnergyFraction: number
  supernovae: SupernovaResult[]
  curve: Array<{ redshift: number; brightnessRelativeToMatterOnly: number }>
  decelerationParameter: number
  isExpansionAccelerating: boolean
}

// One curve sample every 0.05 in redshift, from 0 to MAX_REDSHIFT.
const CURVE_REDSHIFTS = Array.from({ length: 21 }, (_, i) => Math.round(i * 5) / 100)

export function runDarkEnergyExperiment(darkEnergyFraction: number): DarkEnergyResult {
  const q0 = decelerationParameter(darkEnergyFraction)
  return {
    darkEnergyFraction,
    supernovae: SUPERNOVA_REDSHIFTS.map((redshift) => ({
      redshift,
      matterOnlyDistanceMpc: luminosityDistanceMpc(redshift, 0),
      distanceMpc: luminosityDistanceMpc(redshift, darkEnergyFraction),
      brightnessRelativeToMatterOnly: brightnessRelativeToMatterOnly(redshift, darkEnergyFraction),
    })),
    curve: CURVE_REDSHIFTS.map((redshift) => ({
      redshift,
      brightnessRelativeToMatterOnly: brightnessRelativeToMatterOnly(redshift, darkEnergyFraction),
    })),
    decelerationParameter: q0,
    isExpansionAccelerating: q0 < 0,
  }
}

// ---------------------------------------------------------------------------------------------
// Audit update (Cosmology 5, 2026-11-15): guess marks, tutor marking, the verdict moved out of the
// component, the check-up, worked examples and the numbers quoted in the introduction. The
// interface only displays what these functions return (CLAUDE.md §9, §14 "Predictions and the Real
// Results"). The physics above is unchanged.
// ---------------------------------------------------------------------------------------------

// The redshift of the middle supernova: where guess 2 is drawn and its table row is tagged.
export const GUESS_REDSHIFT = 0.5

// The page's own rule for "matches the best fit": within 5 percent at every redshift. A rule of this
// page (used since the first version), not a published cut-off.
export const MATCH_TOLERANCE = 0.05

// A redshift small enough that every model should agree (the link back to Cosmology 1).
export const NEARBY_REDSHIFT = 0.01

// Published values read on 2026-11-15 (through a helper's digest; to be rechecked against the live
// pages before they are printed).
// NASA, "What is Dark Energy?": "approximately 68.3 to 70% of the universe is dark energy".
export const PUBLISHED_DARK_ENERGY_RANGE_PERCENT = { low: 68.3, high: 70 }
// NASA, "Building Blocks": normal matter 5%, dark matter 27%, dark energy 68%.
export const PUBLISHED_UNIVERSE_SHARES_PERCENT = { ordinaryMatter: 5, darkMatter: 27, darkEnergy: 68 }
// Planck 2018 (arXiv:1807.06209), abstract: matter share 0.315 +/- 0.007. A dark energy share of
// 1 - 0.315 for a flat universe is worked out here and is not stated in the abstract.
export const PUBLISHED_MATTER_SHARE_PLANCK = { value: 0.315, uncertainty: 0.007 }
// Riess and others 1998 (arXiv:astro-ph/9805201), abstract: distances of the distant supernovae are
// "on average, 10% to 15% farther than expected in a low mass density (Omega_M=0.2) Universe without
// a cosmological constant". A different comparison from this page's (a universe of all matter).
export const PUBLISHED_RIESS_FARTHER_PERCENT = { low: 10, high: 15 }
// DESI 2025 (arXiv:2503.14738), abstract: a dynamical dark energy model is preferred "over LCDM ...
// 2.8-4.2 sigma depending on which SNe sample is used".
export const PUBLISHED_DESI_SIGMA_RANGE = { low: 2.8, high: 4.2 }

// NASA, "Hubble Completes Eight-Year Effort to Measure Expanding Universe" (read 2026-11-15 through a helper's digest): the Key Project
// observed "almost 800 Cepheid variable stars" in "18 galaxies out to 65 million light-years". Quoted in the introduction's account of
// the Cepheid rung of the distance ladder.
export const PUBLISHED_KEY_PROJECT = { galaxies: 18, reachLightYears: 65e6, cepheids: 800 }

// Units quoted in the introduction.
export const LIGHT_YEARS_PER_MPC = 3.2616e6
export const KM_PER_MPC = 3.0856775814913673e19

export type GravityGuess = 'slow' | 'speed' | 'none'
export type LooksGuess = 'brighter' | 'same' | 'dimmer'

// ---- What the model actually gives (the tutor marks each guess; the Results does not) ----------

export type ExpansionDirection = 'slowing down' | 'speeding up' | 'steady'
export function expansionDirection(darkEnergyFraction: number): ExpansionDirection {
  const q0 = decelerationParameter(darkEnergyFraction)
  if (Math.abs(q0) < 1e-9) return 'steady'
  return q0 > 0 ? 'slowing down' : 'speeding up'
}

// Guess 1: in a matter-only universe, gravity slows the expansion (q0 above zero).
export function actualGravityEffect(): GravityGuess {
  const direction = expansionDirection(0)
  return direction === 'slowing down' ? 'slow' : direction === 'speeding up' ? 'speed' : 'none'
}

// Guess 2: with the best fit, the middle supernova's brightness against the matter-only prediction.
export function actualLooks(): LooksGuess {
  const brightness = brightnessRelativeToMatterOnly(GUESS_REDSHIFT, BEST_FIT_DARK_ENERGY_FRACTION)
  if (Math.abs(brightness - 1) < 1e-9) return 'same'
  return brightness > 1 ? 'brighter' : 'dimmer'
}

export function gravityGuessMatches(guess: GravityGuess): boolean {
  return guess === actualGravityEffect()
}
export function looksGuessMatches(guess: LooksGuess): boolean {
  return guess === actualLooks()
}

// ---- The white guess marks (markers only: three answers carry no size of their own) -------------

// Guess 1, on the "slowing or speeding up" panel at a dark energy share of 0 (matter only): an arrow
// up, an arrow down, or a dot on the zero line. The arrow's length is fixed and means nothing as a
// number (the real value is the blue dot).
export const GUESS_ARROW_LENGTH_Q0 = 0.3

export interface GravityGuessMarker {
  darkEnergyFraction: number
  fromQ0: number
  toQ0: number
  kind: 'up' | 'down' | 'dot'
}
export function gravityGuessMarker(guess: GravityGuess): GravityGuessMarker {
  const toQ0 = guess === 'slow' ? GUESS_ARROW_LENGTH_Q0 : guess === 'speed' ? -GUESS_ARROW_LENGTH_Q0 : 0
  return {
    darkEnergyFraction: 0,
    fromQ0: 0,
    toQ0,
    kind: guess === 'slow' ? 'up' : guess === 'speed' ? 'down' : 'dot',
  }
}

// Guess 2, (a) on the supernova picture: a white ring round the middle supernova, drawn larger than,
// the same size as, or smaller than the dashed matter-only ring (a fixed factor on its radius).
export const GUESS_RING_RADIUS_FACTORS: Record<LooksGuess, number> = { brighter: 1.3, same: 1, dimmer: 0.7 }
export interface LooksGuessRing {
  redshift: number
  radiusFactor: number
}
export function looksGuessRing(guess: LooksGuess): LooksGuessRing {
  return { redshift: GUESS_REDSHIFT, radiusFactor: GUESS_RING_RADIUS_FACTORS[guess] }
}

// Guess 2, (b) on the brightness graph: a white marker above, on or below the blue line at the same
// redshift (fixed heights).
export const GUESS_GRAPH_BRIGHTNESS: Record<LooksGuess, number> = { brighter: 1.1, same: 1, dimmer: 0.85 }
export interface LooksGuessGraphMarker {
  redshift: number
  brightness: number
}
export function looksGuessGraphMarker(guess: LooksGuess): LooksGuessGraphMarker {
  return { redshift: GUESS_REDSHIFT, brightness: GUESS_GRAPH_BRIGHTNESS[guess] }
}

// ---- The "slowing or speeding up" panel ----------------------------------------------------------

export interface PanelPoint {
  darkEnergyFraction: number
  decelerationParameter: number
}
export function panelPoint(darkEnergyFraction: number): PanelPoint {
  return { darkEnergyFraction, decelerationParameter: decelerationParameter(darkEnergyFraction) }
}

// The curve drawn on the panel: every 0.05 of dark energy share, from 0 to the maximum.
export function decelerationCurve(): PanelPoint[] {
  const steps = Math.round(MAX_DARK_ENERGY_FRACTION / 0.05)
  return Array.from({ length: steps + 1 }, (_, i) => panelPoint(Math.round(i * 5) / 100))
}

// The share at which the expansion stops slowing and starts speeding up: q0 = 0.5 - 1.5 L = 0.
export function zeroCrossingShare(): number {
  return 0.5 / 1.5
}

// ---- The verdict on a chosen share (moved out of the component) ---------------------------------

export type ShareVerdict = 'match' | 'too-little' | 'too-much'

// Whether a share reproduces the best-fit curve within MATCH_TOLERANCE at every redshift.
let bestFitCurveCache: DarkEnergyResult['curve'] | null = null
export function shareVerdict(darkEnergyFraction: number): ShareVerdict {
  const chosen = runDarkEnergyExperiment(darkEnergyFraction).curve
  bestFitCurveCache ??= runDarkEnergyExperiment(BEST_FIT_DARK_ENERGY_FRACTION).curve
  const reference = bestFitCurveCache
  const deviations = chosen.map(
    (p, i) =>
      (p.brightnessRelativeToMatterOnly - reference[i].brightnessRelativeToMatterOnly) /
      reference[i].brightnessRelativeToMatterOnly,
  )
  if (deviations.every((d) => Math.abs(d) <= MATCH_TOLERANCE)) return 'match'
  return Math.max(...deviations) > MATCH_TOLERANCE ? 'too-little' : 'too-much'
}

// The lowest and highest shares (to 0.01) that count as a match. The answer never changes, and finding it runs about 180 full
// calculations, so it is worked out once and kept.
let matchingShareBandCache: { low: number; high: number } | null = null
export function matchingShareBand(): { low: number; high: number } {
  if (matchingShareBandCache) return matchingShareBandCache
  let low = Infinity
  let high = -Infinity
  for (let i = 0; i <= Math.round(MAX_DARK_ENERGY_FRACTION * 100); i++) {
    const share = i / 100
    if (shareVerdict(share) === 'match') {
      low = Math.min(low, share)
      high = Math.max(high, share)
    }
  }
  matchingShareBandCache = { low, high }
  return matchingShareBandCache
}

// ---- Worked examples quoted in the page ----------------------------------------------------------

// The inverse-square rule: an object `distanceRatio` times as far looks 1 / ratio^2 as bright.
// Twice as far gives 1/4; ten times as far gives 1/100.
export function inverseSquareBrightness(distanceRatio: number): number {
  return 1 / (distanceRatio * distanceRatio)
}

export interface BrightnessExample {
  redshift: number
  matterOnlyDistanceMpc: number
  distanceMpc: number
  distanceRatio: number
  brightness: number
  percentDimmer: number
  percentFarther: number
}
// The worked moment at the middle supernova: (matter-only distance / your distance)^2.
export function brightnessExample(darkEnergyFraction: number, redshift = GUESS_REDSHIFT): BrightnessExample {
  const matterOnlyDistanceMpc = luminosityDistanceMpc(redshift, 0)
  const distanceMpc = luminosityDistanceMpc(redshift, darkEnergyFraction)
  const distanceRatio = matterOnlyDistanceMpc / distanceMpc
  const brightness = distanceRatio * distanceRatio
  return {
    redshift,
    matterOnlyDistanceMpc,
    distanceMpc,
    distanceRatio,
    brightness,
    percentDimmer: (1 - brightness) * 100,
    percentFarther: (distanceMpc / matterOnlyDistanceMpc - 1) * 100,
  }
}

// How far apart the best fit and matter-only put a nearby supernova, in percent (about half of one).
export function nearbyAgreementPercent(redshift = NEARBY_REDSHIFT): number {
  return (
    (luminosityDistanceMpc(redshift, BEST_FIT_DARK_ENERGY_FRACTION) / luminosityDistanceMpc(redshift, 0) - 1) *
    100
  )
}

// Brightness in magnitudes (a logarithmic scale astronomers use; each 1 magnitude is a factor of
// about 2.512 in brightness), for the check-up note. Positive = dimmer.
export function magnitudesDimmer(brightnessRatio: number): number {
  return -2.5 * Math.log10(brightnessRatio)
}

// ---- The check-up (Table 1): every row independent of the learner's Part 2 share ----------------

export type CheckUpReading =
  | 'less'
  | 'more'
  | 'the same'
  | 'calculated here only'
  | 'same direction as observed'
  | 'within the published range'
  | 'outside the published range'

// A plain reading of a difference with no accepted range: "less", "more" or "the same".
export function readingFor(differencePercent: number): 'less' | 'more' | 'the same' {
  if (differencePercent === 0) return 'the same'
  return differencePercent < 0 ? 'less' : 'more'
}

export interface CheckUpRow {
  // a: matter-only q0, b: best-fit q0, c: brightness at redshift 0.5, d: where the speed-up begins,
  // e: the best-fit share against NASA's range.
  id: 'a' | 'b' | 'c' | 'd' | 'e'
  thisPage: number
  // The reference, or null where no published or independent value exists.
  beside: number | null
  differencePercent: number | null
  reading: CheckUpReading
}

export function checkUp(): CheckUpRow[] {
  const bestShare = BEST_FIT_DARK_ENERGY_FRACTION
  const example = brightnessExample(bestShare)
  const { low, high } = PUBLISHED_DARK_ENERGY_RANGE_PERCENT
  const bestPercent = bestShare * 100
  const crossing = zeroCrossingShare()
  const differenceFromCrossing = ((bestShare - crossing) / crossing) * 100
  return [
    { id: 'a', thisPage: decelerationParameter(0), beside: null, differencePercent: null, reading: 'calculated here only' },
    {
      // The observed result (NASA; the 1998 and 1999 papers) is that the expansion is speeding up.
      id: 'b',
      thisPage: decelerationParameter(bestShare),
      beside: null,
      differencePercent: null,
      reading: expansionDirection(bestShare) === 'speeding up' ? 'same direction as observed' : 'calculated here only',
    },
    {
      id: 'c',
      thisPage: example.brightness,
      beside: 1,
      differencePercent: percentDifference(example.brightness, 1),
      reading: readingFor(percentDifference(example.brightness, 1)),
    },
    {
      id: 'd',
      thisPage: bestShare,
      beside: crossing,
      differencePercent: differenceFromCrossing,
      reading: 'calculated here only',
    },
    {
      id: 'e',
      thisPage: bestPercent,
      beside: high,
      differencePercent: percentDifference(bestPercent, high),
      reading: bestPercent >= low - 1e-9 && bestPercent <= high + 1e-9 ? 'within the published range' : 'outside the published range',
    },
  ]
}

// (value - reference) / reference, in percent.
export function percentDifference(value: number, reference: number): number {
  return ((value - reference) / reference) * 100
}
