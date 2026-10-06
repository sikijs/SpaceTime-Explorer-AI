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
