// This experiment deliberately reuses hubblesLawExperiment.ts's HUBBLE_CONSTANT_KM_PER_S_PER_MPC
// unchanged rather than redefining it, so this calculation can never silently drift from
// Experiment 1's own value. See the specification's "Physics Model" and "Required Physics Tests".
import { HUBBLE_CONSTANT_KM_PER_S_PER_MPC } from './hubblesLawExperiment'

// Real, standard unit-conversion constant (kilometers per megaparsec), not an invented value.
export const MPC_TO_KM = 3.0856775814913673e19

// A Julian year in seconds (365.25 days) - the standard astronomical convention for year-scale
// conversions.
export const SECONDS_PER_YEAR = 365.25 * 24 * 60 * 60

// A real, independently measured comparison value (Planck-era LambdaCDM estimate), stated as a
// real-world comparison - not derived by this experiment.
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
