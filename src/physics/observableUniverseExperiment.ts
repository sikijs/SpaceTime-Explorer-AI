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
  { id: 'galaxy-z2', label: 'A distant galaxy (the source in Experiment 7)', redshift: 2 },
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
