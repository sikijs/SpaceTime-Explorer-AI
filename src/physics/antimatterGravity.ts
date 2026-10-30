// Cosmic Horizons, Experiment 8: does antimatter fall down? ALPHA-g.
// See docs/experiments/frontier-and-beyond/08-does-antimatter-fall-down.md, "Physics Model".
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
