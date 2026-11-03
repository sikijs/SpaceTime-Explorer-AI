// Cosmic Horizons, Experiment 8: does antimatter fall down? ALPHA-g.
// See docs/experiments/cosmic-horizons/08-does-antimatter-fall-down.md, "Physics Model".
//
// No new physics beyond textbook relations: free fall at a constant acceleration (distance = 1/2 x ratio x g x t^2), combining two independent
// uncertainties in quadrature, and the number of sigma between a measurement and a possibility. The experiment's published numbers are ALPHA's 2023
// result. This module does not simulate the ALPHA-g trap and does not re-analyse any data: the way counts of escaping atoms give an acceleration needs
// a detailed simulation that is not modelled here. The two uncertainties are combined as if independent, which is this experiment's own simplification.

// Constants, in SI units.
export const G_EARTH = 9.81 // m/s^2, the acceleration of ordinary matter that the paper uses as its unit
export const TRAP_LENGTH_M = 0.256 // m, between mirror coils A and G of the ALPHA-g trap (Nature 621, 716-722)

// ALPHA's 2023 result: the acceleration of antihydrogen as a ratio to g.
export const ALPHA_2023 = {
  ratio: 0.75,
  statSys: 0.13, // the statistical and systematic uncertainty together
  simulation: 0.16, // the uncertainty from the simulation that links the counts to the acceleration
  source: 'Nature 621, 716-722 (27 September 2023)',
}

function requirePositive(value: number, what: string): void {
  if (!Number.isFinite(value) || value <= 0) throw new RangeError(`${what} must be positive`)
}
function requireFinite(value: number, what: string): void {
  if (!Number.isFinite(value)) throw new RangeError(`${what} must be a number`)
}

// Two independent uncertainties combined in quadrature.
export function combinedUncertainty(a: number, b: number): number {
  if (!Number.isFinite(a) || a < 0) throw new RangeError('An uncertainty must not be negative')
  if (!Number.isFinite(b) || b < 0) throw new RangeError('An uncertainty must not be negative')
  return Math.sqrt(a * a + b * b)
}

// The distance fallen after `seconds`, downward positive; a negative ratio rises, so the distance is negative.
export function fallDistance(ratio: number, seconds: number): number {
  requireFinite(ratio, 'The ratio')
  if (!Number.isFinite(seconds) || seconds < 0) throw new RangeError('The time must not be negative')
  return 0.5 * ratio * G_EARTH * seconds * seconds
}

// The time to fall a height, or null when the ratio is zero or negative (it does not fall).
export function timeToFall(ratio: number, heightM: number): number | null {
  requireFinite(ratio, 'The ratio')
  requirePositive(heightM, 'The height')
  if (ratio <= 0) return null
  return Math.sqrt((2 * heightM) / (ratio * G_EARTH))
}

// How many sigma a possibility is from the measured value.
export function sigmasFrom(measured: number, sigma: number, possibility: number): number {
  requireFinite(measured, 'The measured value')
  requirePositive(sigma, 'The uncertainty')
  requireFinite(possibility, 'The possibility')
  return Math.abs(measured - possibility) / sigma
}

// The chance, from a bell curve (a normal distribution), of a result at least this many sigma from the measured value, in either direction: erfc(z / sqrt 2).
// The complementary error function is Numerical Recipes' erfcc (a Chebyshev fit, relative error below 1.2e-7 everywhere, so the far tail is accurate too).
// A bell curve is this experiment's simplification, as the specification says; the paper's own method for its 2.9e-4 differs slightly.
// Defined for x >= 0 only, which is all that twoSidedChance needs.
function erfc(z: number): number {
  const t = 1 / (1 + 0.5 * z)
  const poly =
    -z * z - 1.26551223 +
    t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277))))))))
  return t * Math.exp(poly)
}
export function twoSidedChance(sigmas: number): number {
  if (!Number.isFinite(sigmas) || sigmas < 0) throw new RangeError('The number of sigma must not be negative')
  return erfc(sigmas / Math.SQRT2)
}

// Whether a possibility is compatible with a measurement. The edges are the experiment's own choice: 3 and 5 are the "hint" and "discovery" bars of
// Experiments 1 and 2 of this group, and 2 is the common rule of thumb for "compatible" (the specification's decision 8).
export type Compatibility = 'compatible' | 'borderline' | 'disfavoured' | 'ruledOut'
export function compatibility(sigmas: number): Compatibility {
  if (!Number.isFinite(sigmas) || sigmas < 0) throw new RangeError('The number of sigma must not be negative')
  if (sigmas < 2) return 'compatible'
  if (sigmas < 3) return 'borderline'
  if (sigmas < 5) return 'disfavoured'
  return 'ruledOut'
}

// The error bar that a test needs to see a difference at `sigmas` sigma.
export function sigmaNeeded(difference: number, sigmas: number): number {
  requirePositive(difference, 'The difference')
  requirePositive(sigmas, 'The number of sigma')
  return difference / sigmas
}

export type UpOrDown = 'down' | 'stays' | 'up'
export function upOrDown(ratio: number): UpOrDown {
  requireFinite(ratio, 'The ratio')
  if (ratio > 0) return 'down'
  if (ratio < 0) return 'up'
  return 'stays'
}

// The answers to the two predictions (the specification's "Prediction Activity"), from the module's own numbers.
// Prediction 1: is the measurement compatible with antimatter falling up (ratio -1)? Prediction 2: does 0.75 show a slower fall, or can it not tell?
export type FallsUpAnswer = 'compatible' | 'borderline' | 'ruledOut'
export function fallsUpAnswer(): FallsUpAnswer {
  const verdict = compatibility(sigmasFrom(ALPHA_2023.ratio, combinedUncertainty(ALPHA_2023.statSys, ALPHA_2023.simulation), -1))
  // "disfavoured" and "ruled out" are both "No" for the learner; the three answer buttons are compatible, borderline and ruled out.
  return verdict === 'compatible' ? 'compatible' : verdict === 'borderline' ? 'borderline' : 'ruledOut'
}
export type ReadingAnswer = 'slower' | 'cannotTell' | 'exactlyLikeMatter'
export function readingAnswer(): ReadingAnswer {
  const verdict = compatibility(sigmasFrom(ALPHA_2023.ratio, combinedUncertainty(ALPHA_2023.statSys, ALPHA_2023.simulation), 1))
  // Compatible with 1 means that the measurement cannot say that it falls more slowly; it does not show that it falls exactly like matter either.
  return verdict === 'compatible' ? 'cannotTell' : 'slower'
}

// The numbers of the learner's own ratio, error bar and difference.
export interface AntimatterGravityResult {
  ratio: number
  sigma: number
  difference: number
  distanceInOneSecond: number // m, negative when it rises
  timeToFallTrap: number | null // s, null when it does not fall
  direction: UpOrDown
  sigmasFromMatter: number // sigma from ratio 1, for ALPHA's measured value with `sigma`
  sigmasFromNoGravity: number // sigma from ratio 0
  sigmasFromFallingUp: number // sigma from ratio -1
  verdictMatter: Compatibility
  verdictNoGravity: Compatibility
  verdictFallingUp: Compatibility
  sigmaNeededAt3: number
  sigmaNeededAt5: number
}

export function runAntimatterGravity(ratio: number, sigma: number, difference: number): AntimatterGravityResult {
  const measured = ALPHA_2023.ratio
  const fromMatter = sigmasFrom(measured, sigma, 1)
  const fromNone = sigmasFrom(measured, sigma, 0)
  const fromUp = sigmasFrom(measured, sigma, -1)
  return {
    ratio,
    sigma,
    difference,
    distanceInOneSecond: fallDistance(ratio, 1),
    timeToFallTrap: timeToFall(ratio, TRAP_LENGTH_M),
    direction: upOrDown(ratio),
    sigmasFromMatter: fromMatter,
    sigmasFromNoGravity: fromNone,
    sigmasFromFallingUp: fromUp,
    verdictMatter: compatibility(fromMatter),
    verdictNoGravity: compatibility(fromNone),
    verdictFallingUp: compatibility(fromUp),
    sigmaNeededAt3: sigmaNeeded(difference, 3),
    sigmaNeededAt5: sigmaNeeded(difference, 5),
  }
}

// ---- Audit update (2026-11-03): numbers for the guess marks, the check-up and Part 2's drawing ----

// The possibility each prediction is about: Prediction 1 asks about falling up (ratio -1), Prediction 2 about falling like ordinary matter (ratio 1).
// Both guesses are categories, so each is drawn as a marker only, under the possibility's own marker on Picture 2.
export const FALLS_UP_RATIO = -1
export const LIKE_MATTER_RATIO = 1
export const NO_GRAVITY_RATIO = 0

// The paper's own chance for "no gravity" (ratio 0), by its own method (Nature 621, 716-722), quoted in Table 3.
export const PAPER_CHANCE_NO_GRAVITY = 2.9e-4
// The precision the two reviews state for the same measurement, in percent of g ("about 20%" in March 2025, "~25%" in December 2025).
export const REVIEW_PRECISIONS_PERCENT = { march2025: 20, december2025: 25 }

export type CheckUpReading = 'the same' | 'more' | 'less'
export interface AntimatterCheckUpRow {
  label: string
  expected: number
  found: number
  sigmas: number | null // the gap in sigma, for the possibility rows
  verdict: Compatibility | null // by this experiment's own edges (2, 3 and 5 sigma)
  reading: CheckUpReading // the found value against the expected one; no cut-off is invented
}
function compareValues(found: number, expected: number): CheckUpReading {
  if (found === expected) return 'the same'
  return found > expected ? 'more' : 'less'
}
// The check-up: ALPHA's measured ratio against each of the three possibilities (the same physics predicts each), and the chance this experiment's bell curve
// gives for "no gravity" against the paper's own. It does not depend on the learner's controls or guesses.
export function antimatterCheckUp(): AntimatterCheckUpRow[] {
  const combined = combinedUncertainty(ALPHA_2023.statSys, ALPHA_2023.simulation)
  const row = (label: string, possibility: number): AntimatterCheckUpRow => {
    const sigmas = sigmasFrom(ALPHA_2023.ratio, combined, possibility)
    return { label, expected: possibility, found: ALPHA_2023.ratio, sigmas, verdict: compatibility(sigmas), reading: compareValues(ALPHA_2023.ratio, possibility) }
  }
  const noneSigmas = sigmasFrom(ALPHA_2023.ratio, combined, NO_GRAVITY_RATIO)
  return [
    row('ALPHA’s ratio against ordinary matter’s ratio', LIKE_MATTER_RATIO),
    row('ALPHA’s ratio against no gravity', NO_GRAVITY_RATIO),
    row('ALPHA’s ratio against falling up with the full strength of g', FALLS_UP_RATIO),
    {
      label: 'The chance for “no gravity”: this experiment’s bell curve against the paper’s own method',
      expected: PAPER_CHANCE_NO_GRAVITY,
      found: twoSidedChance(noneSigmas),
      sigmas: noneSigmas,
      verdict: null,
      reading: compareValues(twoSidedChance(noneSigmas), PAPER_CHANCE_NO_GRAVITY),
    },
  ]
}

// Part 2's drawing: the learner's three choices beside a reference value, each on its own scale.
export const DRAWING_SCALES = {
  distanceM: { min: -10, max: 10 }, // metres fallen in one second, linear (negative: it rises)
  sigmas: { min: 0.1, max: 200 }, // logarithmic
  errorBar: { min: 0.001, max: 1 }, // logarithmic
}
export interface AntimatterDrawingValues {
  distanceInOneSecond: number
  sigmas: number
  errorBarNeeded: number
}
export function antimatterDrawingValues(ratio: number, sigma: number, possibility: number, difference: number, nSigma: number): AntimatterDrawingValues {
  return {
    distanceInOneSecond: fallDistance(ratio, 1),
    sigmas: sigmasFrom(ALPHA_2023.ratio, sigma, possibility),
    errorBarNeeded: sigmaNeeded(difference, nSigma),
  }
}
// The reference marks: ordinary matter's fall in one second, ALPHA's own error bar for the same possibility, and ALPHA's combined error bar.
export function antimatterDrawingReference(possibility: number): AntimatterDrawingValues {
  const combined = combinedUncertainty(ALPHA_2023.statSys, ALPHA_2023.simulation)
  return { distanceInOneSecond: fallDistance(1, 1), sigmas: sigmasFrom(ALPHA_2023.ratio, combined, possibility), errorBarNeeded: combined }
}
