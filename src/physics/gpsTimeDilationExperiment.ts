import { timeDilationFactorFor } from './movingClockExperiment'

// Real Earth/physical constants, in SI units — unlike every experiment before this one in this
// project, which uses abstracted or exaggerated dimensionless controls (see this experiment's
// specification, "Decisions Confirmed" item 1).
export const EARTH_GM = 3.986004418e14 // m^3 / s^2 (standard gravitational parameter, GM)
export const EARTH_RADIUS_METERS = 6.371e6 // m (mean Earth radius)
export const REAL_SPEED_OF_LIGHT = 299_792_458 // m / s

// The altitude at which the speed effect and the gravity effect exactly cancel, for a circular
// orbit under this experiment's first-order approximation. Solving
// gravityEffectFraction(r) = -speedEffectFraction(r) with a circular orbit's v^2 = EARTH_GM / r
// reduces to 1/EARTH_RADIUS_METERS = 3 / (2r), i.e. r = 1.5 * EARTH_RADIUS_METERS exactly.
export const CROSSOVER_ORBITAL_RADIUS_METERS = 1.5 * EARTH_RADIUS_METERS

export interface GpsTimeDilationResult {
  orbitalRadiusMeters: number
  orbitalSpeedMetersPerSecond: number
  speedEffectFraction: number
  gravityEffectFraction: number
  netEffectFraction: number
  netMicrosecondsPerDay: number
}

const SECONDS_PER_DAY = 86400
const MICROSECONDS_PER_SECOND = 1_000_000

export function runGpsTimeDilationExperiment(orbitalRadiusMeters: number): GpsTimeDilationResult {
  if (!(orbitalRadiusMeters > EARTH_RADIUS_METERS)) {
    throw new RangeError('Orbital radius must be greater than Earth\'s radius')
  }

  const orbitalSpeedMetersPerSecond = Math.sqrt(EARTH_GM / orbitalRadiusMeters)

  // Reuses Experiment 3's exact time-dilation formula directly (Decisions Confirmed item 2),
  // evaluated at the real, tiny v/c ratio rather than an exaggerated one.
  const speedEffectFraction =
    timeDilationFactorFor(orbitalSpeedMetersPerSecond / REAL_SPEED_OF_LIGHT) - 1

  // First-order (weak-field) Newtonian-potential difference between the satellite and the
  // ground: the real-unit counterpart to Experiment 2's abstracted `strength` control.
  const gravityEffectFraction =
    (EARTH_GM * (1 / EARTH_RADIUS_METERS - 1 / orbitalRadiusMeters)) /
    (REAL_SPEED_OF_LIGHT * REAL_SPEED_OF_LIGHT)

  const netEffectFraction = gravityEffectFraction + speedEffectFraction
  const netMicrosecondsPerDay = netEffectFraction * SECONDS_PER_DAY * MICROSECONDS_PER_SECOND

  return {
    orbitalRadiusMeters,
    orbitalSpeedMetersPerSecond,
    speedEffectFraction,
    gravityEffectFraction,
    netEffectFraction,
    netMicrosecondsPerDay,
  }
}
