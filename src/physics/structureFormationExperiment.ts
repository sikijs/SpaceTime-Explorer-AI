// This experiment deliberately reuses earlier experiments' code unchanged (imported, not redefined):
// the expansion rate and the dark energy share (Experiment 5), and the time after the Big Bang at a
// given size (Experiment 8). See the specification's "Physics Model" and "Required Physics Tests".
import { BEST_FIT_DARK_ENERGY_FRACTION, expansionRateRatio } from './darkEnergyExperiment'
import { timeAfterBigBangYears } from './observableUniverseExperiment'

// The redshift of the oldest light (Experiment 3). Restated here, with a test that it equals Experiment
// 3's own constant, so this module does not import Experiment 3 (the same choice as Experiment 8).
export const RECOMBINATION_REDSHIFT = 1089.8

// A given, rounded real-world value (about when matter began to outweigh radiation), not computed here
// because this chapter leaves radiation out. Not checked against a primary source; see the
// specification's "Decisions Needing Human Review" item 4.
export const MATTER_RADIATION_EQUALITY_REDSHIFT = 3400

// The density excess at which the small-ripple (linear) model stops being valid: the region is turning
// into a bound clump.
export const CLUMP_THRESHOLD = 1

export type KindOfMatter = 'ordinary' | 'ordinary-plus-dark'

export interface StartSizePreset {
  id: string
  label: string
  startDelta: number
}

export const START_SIZE_PRESETS: StartSizePreset[] = [
  { id: 'one-in-100000', label: '1 part in 100,000', startDelta: 1e-5 },
  { id: 'one-in-10000', label: '1 part in 10,000', startDelta: 1e-4 },
  { id: 'one-in-1000', label: '1 part in 1,000', startDelta: 1e-3 },
  { id: 'one-in-500', label: '1 part in 500', startDelta: 2e-3 },
]

export const MIN_START_DELTA = 1e-5
export const MAX_START_DELTA = 2e-3

const CURVE_SAMPLES = 61
// Number of Simpson's-rule steps (must be even), as in Experiment 5. The integrand is smooth and goes to
// zero at a = 0, so no special handling of the early-time end is needed.
const INTEGRATION_STEPS = 2000

// The redshift from which a kind of matter can start to gather.
export function startRedshiftFor(kind: KindOfMatter): number {
  return kind === 'ordinary' ? RECOMBINATION_REDSHIFT : MATTER_RADIATION_EQUALITY_REDSHIFT
}

// Growth factor of a small density excess in a flat universe with matter share (1 - L) and dark energy
// share L, normalised so that D(a) = a at early times (relative size a, today = 1):
//   D(a) = (5/2) (1 - L) E(a) x the integral from 0 to a of da' / (a' E(a'))^3.
// With L = 0 this is exactly D(a) = a.
export function growthFactor(
  relativeSize: number,
  darkEnergyFraction: number = BEST_FIT_DARK_ENERGY_FRACTION,
  steps: number = INTEGRATION_STEPS,
): number {
  if (relativeSize <= 0) return 0
  const matterFraction = 1 - darkEnergyFraction
  const ratioAt = (a: number) => expansionRateRatio(1 / a - 1, darkEnergyFraction)
  const integrand = (a: number) => (a === 0 ? 0 : (a * ratioAt(a)) ** -3)
  const h = relativeSize / steps
  let sum = integrand(0) + integrand(relativeSize)
  for (let i = 1; i < steps; i++) {
    sum += (i % 2 === 1 ? 4 : 2) * integrand(i * h)
  }
  return 2.5 * matterFraction * ratioAt(relativeSize) * ((sum * h) / 3)
}

const sizeForRedshift = (redshift: number) => 1 / (1 + redshift)

// How many times a small density excess has grown between two redshifts (start earlier than end).
export function growthBetween(
  startRedshift: number,
  endRedshift: number,
  darkEnergyFraction: number = BEST_FIT_DARK_ENERGY_FRACTION,
): number {
  return (
    growthFactor(sizeForRedshift(endRedshift), darkEnergyFraction) /
    growthFactor(sizeForRedshift(startRedshift), darkEnergyFraction)
  )
}

// The smallest starting density excess that reaches CLUMP_THRESHOLD by today: 1 / growth since the start.
export function requiredStartDelta(
  startRedshift: number,
  darkEnergyFraction: number = BEST_FIT_DARK_ENERGY_FRACTION,
): number {
  return CLUMP_THRESHOLD / growthBetween(startRedshift, 0, darkEnergyFraction)
}

// The density excess at a redshift, for a ripple that started at startRedshift with startDelta. Before
// the start nothing has grown yet, so it returns startDelta.
export function densityExcessAt(
  redshift: number,
  startRedshift: number,
  startDelta: number,
  darkEnergyFraction: number = BEST_FIT_DARK_ENERGY_FRACTION,
): number {
  if (redshift >= startRedshift) return startDelta
  return startDelta * growthBetween(startRedshift, redshift, darkEnergyFraction)
}

// The first redshift at which the ripple reaches CLUMP_THRESHOLD, found by bisection (the density excess
// only ever grows as the universe grows), or null if it never does by today.
function redshiftOfClumpFor(
  startRedshift: number,
  startDelta: number,
  darkEnergyFraction: number,
): number | null {
  if (startDelta >= CLUMP_THRESHOLD) return startRedshift
  if (densityExcessAt(0, startRedshift, startDelta, darkEnergyFraction) < CLUMP_THRESHOLD) return null
  let early = startRedshift
  let late = 0
  for (let i = 0; i < 60; i++) {
    const middle = (early + late) / 2
    if (densityExcessAt(middle, startRedshift, startDelta, darkEnergyFraction) >= CLUMP_THRESHOLD) {
      late = middle
    } else {
      early = middle
    }
  }
  return late
}

export interface StructureFormationCurvePoint {
  redshift: number
  yearsAfterBigBang: number
  growth: number // how many times the ripple has grown since its start
  densityExcess: number
}

export interface StructureFormationResult {
  kindOfMatter: KindOfMatter
  startRedshift: number
  startDelta: number
  growthSinceStart: number // D(today) / D(start)
  growthWithoutDarkEnergy: number // the same with dark energy share 0, which is 1 + start redshift
  requiredStartDelta: number // the starting excess needed to become a clump by today
  requiredStartDeltaOtherMatter: number // the same for the other kind of matter, for comparison
  densityExcessToday: number
  becameClump: boolean
  redshiftOfClump: number | null
  curve: StructureFormationCurvePoint[]
}

export function runStructureFormationExperiment(
  kindOfMatter: KindOfMatter,
  startDelta: number,
): StructureFormationResult {
  const darkEnergyFraction = BEST_FIT_DARK_ENERGY_FRACTION
  const startRedshift = startRedshiftFor(kindOfMatter)
  const otherStartRedshift = startRedshiftFor(kindOfMatter === 'ordinary' ? 'ordinary-plus-dark' : 'ordinary')

  // Log-spaced in (1 + z) from the start to today, so the early, fast-changing part is sampled well.
  const curve: StructureFormationCurvePoint[] = []
  const logStart = Math.log(1 + startRedshift)
  for (let i = 0; i < CURVE_SAMPLES; i++) {
    const redshift = i === CURVE_SAMPLES - 1 ? 0 : Math.exp(logStart * (1 - i / (CURVE_SAMPLES - 1))) - 1
    const growth = growthBetween(startRedshift, redshift, darkEnergyFraction)
    curve.push({
      redshift,
      yearsAfterBigBang: timeAfterBigBangYears(sizeForRedshift(redshift), darkEnergyFraction),
      growth,
      densityExcess: startDelta * growth,
    })
  }

  const growthSinceStart = growthBetween(startRedshift, 0, darkEnergyFraction)
  const densityExcessToday = startDelta * growthSinceStart
  const redshiftOfClump = redshiftOfClumpFor(startRedshift, startDelta, darkEnergyFraction)
  return {
    kindOfMatter,
    startRedshift,
    startDelta,
    growthSinceStart,
    growthWithoutDarkEnergy: growthBetween(startRedshift, 0, 0),
    requiredStartDelta: requiredStartDelta(startRedshift, darkEnergyFraction),
    requiredStartDeltaOtherMatter: requiredStartDelta(otherStartRedshift, darkEnergyFraction),
    densityExcessToday,
    becameClump: redshiftOfClump !== null,
    redshiftOfClump,
    curve,
  }
}
