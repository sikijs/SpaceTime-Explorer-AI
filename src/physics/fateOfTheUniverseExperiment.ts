// This experiment deliberately reuses earlier experiments' code unchanged (imported, not redefined):
// the Hubble constant (Experiment 1), the Hubble time (Experiment 2), the dark energy share limits,
// the expansion-rate ratio and the deceleration parameter (Experiment 5), the size-at-a-time formula
// and today's age (Experiment 6), and the time-at-a-size formula (Experiment 8). See the
// specification's "Physics Model" and "Required Physics Tests".
import { HUBBLE_CONSTANT_KM_PER_S_PER_MPC } from './hubblesLawExperiment'
import { hubbleTimeYears } from './bigBangExperiment'
import {
  BEST_FIT_DARK_ENERGY_FRACTION,
  MAX_DARK_ENERGY_FRACTION,
  decelerationParameter,
  expansionRateRatio,
} from './darkEnergyExperiment'
import { relativeSizeAtTime, universeAgeYears } from './universeAgeExperiment'
import { timeAfterBigBangYears } from './observableUniverseExperiment'

// Fixed axis ranges so the graph does not jump when the learner moves the slider. 100 billion years is
// only an axis choice, not a prediction of any real event (specification's Decision 5). The graph starts
// a little before today so the point where the expansion started to speed up is visible for the real
// case (about 6 billion years ago).
export const FUTURE_GRAPH_MAX_YEARS = 100e9
export const PAST_GRAPH_YEARS = 10e9
export const NUMBER_OF_DOUBLINGS_SHOWN = 4
const CURVE_SAMPLES = 61

export { BEST_FIT_DARK_ENERGY_FRACTION, MAX_DARK_ENERGY_FRACTION }

// Size of the universe (today = 1) a given number of years from now. Every universe is matched to the
// real one today (same expansion rate and size, as in Experiment 6), so "now" is that universe's own age.
export function futureRelativeSize(yearsFromNow: number, darkEnergyFraction: number): number {
  return relativeSizeAtTime(universeAgeYears(darkEnergyFraction) + yearsFromNow, darkEnergyFraction)
}

// Years for the universe to grow from one relative size to a larger one: the difference of two of
// Experiment 8's times after the Big Bang.
export function yearsToGrow(fromSize: number, toSize: number, darkEnergyFraction: number): number {
  return (
    timeAfterBigBangYears(toSize, darkEnergyFraction) - timeAfterBigBangYears(fromSize, darkEnergyFraction)
  )
}

// The expansion rate (the Hubble constant's value at that time), in km/s/Mpc, when the universe has the
// given relative size: H0 x E(z), with 1 + z = 1 / size.
export function expansionRateAtSize(relativeSize: number, darkEnergyFraction: number): number {
  return (
    HUBBLE_CONSTANT_KM_PER_S_PER_MPC * expansionRateRatio(1 / relativeSize - 1, darkEnergyFraction)
  )
}

// The value the expansion rate settles to at late times: H0 x sqrt(L). With no dark energy it falls
// toward zero and never reaches it, so the limit is 0.
export function longTermExpansionRate(darkEnergyFraction: number): number {
  return HUBBLE_CONSTANT_KM_PER_S_PER_MPC * Math.sqrt(Math.max(0, darkEnergyFraction))
}

// The doubling time the universe settles to: ln 2 / (H0 x sqrt(L)) = ln 2 x Hubble time / sqrt(L), in
// years. With no dark energy the doubling time grows without limit.
export function longTermDoublingTimeYears(darkEnergyFraction: number): number {
  if (darkEnergyFraction <= 0) return Infinity
  return (Math.LN2 * hubbleTimeYears()) / Math.sqrt(darkEnergyFraction)
}

// The relative size at which the expansion starts to speed up: ((1 - L) / (2L))^(1/3). It is today
// (size 1) at L = 1/3, in the future for a smaller L, and never happens when L = 0.
export function speedUpSize(darkEnergyFraction: number): number {
  if (darkEnergyFraction <= 0) return Infinity
  return Math.pow((1 - darkEnergyFraction) / (2 * darkEnergyFraction), 1 / 3)
}

export interface Doubling {
  fromSize: number
  toSize: number
  years: number
}

export interface FateCurvePoint {
  yearsFromNow: number
  relativeSize: number
}

export interface FateResult {
  darkEnergyFraction: number
  accelerationToday: boolean
  speedUpSize: number
  speedUpYearsFromNow: number | null
  doublings: Doubling[]
  doublingTimeRatios: number[]
  longTermDoublingTimeYears: number
  expansionRateToday: number
  expansionRateAtEnd: number
  longTermExpansionRate: number
  sizeAtEnd: number
  curve: FateCurvePoint[]
  fate: 'slows-forever' | 'steady-growth'
}

export function runFateOfTheUniverseExperiment(darkEnergyFraction: number): FateResult {
  const L = darkEnergyFraction
  const doublings: Doubling[] = []
  for (let i = 0; i < NUMBER_OF_DOUBLINGS_SHOWN; i++) {
    const fromSize = 2 ** i
    const toSize = 2 ** (i + 1)
    doublings.push({ fromSize, toSize, years: yearsToGrow(fromSize, toSize, L) })
  }

  const switchSize = speedUpSize(L)
  const speedUpYearsFromNow =
    switchSize === Infinity ? null : timeAfterBigBangYears(switchSize, L) - universeAgeYears(L)

  const sizeAtEnd = futureRelativeSize(FUTURE_GRAPH_MAX_YEARS, L)

  const curve: FateCurvePoint[] = []
  for (let i = 0; i < CURVE_SAMPLES; i++) {
    const yearsFromNow =
      -PAST_GRAPH_YEARS + ((FUTURE_GRAPH_MAX_YEARS + PAST_GRAPH_YEARS) * i) / (CURVE_SAMPLES - 1)
    curve.push({ yearsFromNow, relativeSize: futureRelativeSize(yearsFromNow, L) })
  }

  return {
    darkEnergyFraction: L,
    accelerationToday: decelerationParameter(L) < 0,
    speedUpSize: switchSize,
    speedUpYearsFromNow,
    doublings,
    doublingTimeRatios: doublings.slice(1).map((d, i) => d.years / doublings[i].years),
    longTermDoublingTimeYears: longTermDoublingTimeYears(L),
    expansionRateToday: expansionRateAtSize(1, L),
    expansionRateAtEnd: expansionRateAtSize(sizeAtEnd, L),
    longTermExpansionRate: longTermExpansionRate(L),
    sizeAtEnd,
    curve,
    fate: L <= 0 ? 'slows-forever' : 'steady-growth',
  }
}
