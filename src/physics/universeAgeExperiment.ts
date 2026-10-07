// This experiment deliberately reuses earlier experiments' code unchanged (imported, not redefined):
// the Hubble constant (Experiment 1), the Hubble time and real measured age (Experiment 2), and the
// dark energy share limits (Experiment 5). See the specification's "Physics Model" and "Required
// Physics Tests".
import { HUBBLE_CONSTANT_KM_PER_S_PER_MPC } from './hubblesLawExperiment'
import { REAL_UNIVERSE_AGE_YEARS, hubbleTimeYears } from './bigBangExperiment'
import { BEST_FIT_DARK_ENERGY_FRACTION, MAX_DARK_ENERGY_FRACTION } from './darkEnergyExperiment'

// A given, rounded real-world reference (about the age of the oldest known star clusters), used only as
// a comparison marker. Not checked against a source; see the specification's "Decisions" item 2.
export const OLDEST_STARS_AGE_YEARS = 12.5e9

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
