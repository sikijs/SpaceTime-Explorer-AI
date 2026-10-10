import { OBJECT_PRESETS, horizonRadiusKm, type ObjectPreset } from './blackHoleSizeExperiment'

// Simulated time on the far-away clock for one run. Presentation only: the factor does not depend on it.
export const FAR_CLOCK_RUN_SECONDS = 60
// The closest a clock can be placed. A clock cannot hover at or inside the horizon, so the controls stop short of 1.
export const MIN_DISTANCE_IN_HORIZON_RADII = 1.001
export const MAX_DISTANCE_IN_HORIZON_RADII = 100

const CURVE_POINTS = 101

// The three black holes only: Experiment 1's presets that have no real radius.
export const BLACK_HOLE_PRESETS: ObjectPreset[] = OBJECT_PRESETS.filter((p) => p.realRadiusKm === null)

// The exact slowing factor sqrt(1 - r_s / r) for a clock held at rest at distance r from a non-rotating, uncharged
// black hole, compared with a clock far away. Given by general relativity; used here, not derived. The distance is
// in horizon radii (r / r_s). Exactly 0 at the horizon; a clock cannot hover inside it.
export function exactSlowingFactor(distanceInHorizonRadii: number): number {
  if (!(distanceInHorizonRadii >= 1)) {
    throw new RangeError('A clock cannot hover inside the horizon: the distance must be at least 1 horizon radius.')
  }
  return Math.sqrt(1 - 1 / distanceInHorizonRadii)
}

// The first-order (weak-gravity) factor, 1 - r_s / (2r) = 1 - GM / (r c^2): the idea behind Gravity Experiments 2 and 9,
// restated in horizon radii. For comparison only; it is always above the exact factor.
export function firstOrderSlowingFactor(distanceInHorizonRadii: number): number {
  if (!(distanceInHorizonRadii > 0)) throw new RangeError('The distance must be greater than zero.')
  return 1 - 1 / (2 * distanceInHorizonRadii)
}

export interface TimeNearBlackHoleResult {
  preset: ObjectPreset
  horizonRadiusKm: number
  distanceInHorizonRadii: number
  distanceKm: number
  exactFactor: number
  firstOrderFactor: number
  farClockReadingSeconds: number
  hoveringClockReadingSeconds: number
  // Log-spaced from MIN to MAX horizon radii, ascending, for the factor-against-distance graph.
  curve: Array<{ distanceInHorizonRadii: number; exact: number; firstOrder: number }>
}

export function runTimeNearBlackHoleExperiment(
  presetId: ObjectPreset['id'],
  distanceInHorizonRadii: number,
): TimeNearBlackHoleResult {
  const preset = BLACK_HOLE_PRESETS.find((p) => p.id === presetId)
  if (!preset) throw new Error(`Unknown black hole: ${presetId}`)
  if (!(distanceInHorizonRadii >= MIN_DISTANCE_IN_HORIZON_RADII && distanceInHorizonRadii <= MAX_DISTANCE_IN_HORIZON_RADII)) {
    throw new RangeError(
      `The distance must be between ${MIN_DISTANCE_IN_HORIZON_RADII} and ${MAX_DISTANCE_IN_HORIZON_RADII} horizon radii.`,
    )
  }

  const horizon = horizonRadiusKm(preset.massSolarMasses)
  const exactFactor = exactSlowingFactor(distanceInHorizonRadii)

  const logMin = Math.log(MIN_DISTANCE_IN_HORIZON_RADII)
  const logMax = Math.log(MAX_DISTANCE_IN_HORIZON_RADII)
  const curve = Array.from({ length: CURVE_POINTS }, (_, i) => {
    // Pin the ends exactly so the curve starts and ends at the stated distances.
    const d =
      i === 0
        ? MIN_DISTANCE_IN_HORIZON_RADII
        : i === CURVE_POINTS - 1
          ? MAX_DISTANCE_IN_HORIZON_RADII
          : Math.exp(logMin + ((logMax - logMin) * i) / (CURVE_POINTS - 1))
    return { distanceInHorizonRadii: d, exact: exactSlowingFactor(d), firstOrder: firstOrderSlowingFactor(d) }
  })

  return {
    preset,
    horizonRadiusKm: horizon,
    distanceInHorizonRadii,
    distanceKm: distanceInHorizonRadii * horizon,
    exactFactor,
    firstOrderFactor: firstOrderSlowingFactor(distanceInHorizonRadii),
    farClockReadingSeconds: FAR_CLOCK_RUN_SECONDS,
    hoveringClockReadingSeconds: exactFactor * FAR_CLOCK_RUN_SECONDS,
    curve,
  }
}

// The two clocks' readings after an elapsed span of far-away time, for the animation and the graph.
export function clockReadingsAt(
  result: TimeNearBlackHoleResult,
  farElapsedSeconds: number,
): { far: number; hovering: number } {
  if (!(farElapsedSeconds >= 0)) throw new RangeError('Elapsed time must be zero or more.')
  return { far: farElapsedSeconds, hovering: result.exactFactor * farElapsedSeconds }
}

// Real surfaces for scale: the factor at an object's real radius, from the same formula. Defined for the three
// real objects of Experiment 1 (Earth, the Sun, a neutron star); the formula applies outside the surface.
export function surfaceSlowing(presetId: 'earth' | 'sun' | 'neutron-star'): {
  rsOverR: number
  exactFactor: number
  fractionSlower: number
} {
  const preset = OBJECT_PRESETS.find((p) => p.id === presetId)
  if (!preset || preset.realRadiusKm === null) throw new Error(`No real surface for: ${presetId}`)
  const distanceInHorizonRadii = preset.realRadiusKm / horizonRadiusKm(preset.massSolarMasses)
  const exactFactor = exactSlowingFactor(distanceInHorizonRadii)
  return { rsOverR: 1 / distanceInHorizonRadii, exactFactor, fractionSlower: 1 - exactFactor }
}
