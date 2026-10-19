// Frontier and Beyond, Experiment 3: how lumpy is the universe? (S8, KiDS and DES).
// See docs/experiments/frontier-and-beyond/03-how-lumpy-is-the-universe.md, "Physics Model".
//
// No new physics: S8 is a definition, S8 = sigma8 x sqrt(Omega_m / 0.3), and the tension is Experiment 1's sigma (the gap divided by the
// combined uncertainty), with the one stated simplification that each published up/down uncertainty is replaced by the one on the side
// facing the other value. The papers' own comparisons use fuller statistics and are quoted alongside, never computed.
import { combinedUncertainty } from './hubbleTension'

export interface S8Measurement {
  name: string
  side: 'early' | 'late'
  year: number // the year the paper was posted on arXiv (Decision 10)
  value: number
  up: number // upward uncertainty
  down: number // downward uncertainty
  paperSigma: string // the paper's own comparison with the microwave background, as quoted (not computed)
  source: string
}

// Published values, checked against the abstracts (and, for Planck's S8, the KiDS-Legacy text) on 2026-10-19: the specification's "Real-World
// Facts Used, and Source Status".
export const MEASUREMENTS: S8Measurement[] = [
  { name: 'Planck Legacy', side: 'early', year: 2018, value: 0.834, up: 0.016, down: 0.016, paperSigma: '', source: 'as quoted by Wright et al., arXiv:2503.19441' },
  { name: 'KiDS-1000', side: 'late', year: 2020, value: 0.759, up: 0.024, down: 0.021, paperSigma: 'about 3', source: 'Asgari et al., arXiv:2007.15633' },
  { name: 'KiDS-Legacy', side: 'late', year: 2025, value: 0.815, up: 0.016, down: 0.021, paperSigma: '0.73', source: 'Wright et al., arXiv:2503.19441' },
  { name: 'DES Y6 (NLA)', side: 'late', year: 2026, value: 0.798, up: 0.014, down: 0.015, paperSigma: '2.0 (against Planck + ACT + SPT)', source: 'DES Collaboration, arXiv:2602.10065' },
  { name: 'DES Y6 (TATT)', side: 'late', year: 2026, value: 0.783, up: 0.019, down: 0.015, paperSigma: '2.3 (against Planck + ACT + SPT)', source: 'DES Collaboration, arXiv:2602.10065' },
]

export const EARLY_MEASUREMENT: S8Measurement = MEASUREMENTS.find((m) => m.side === 'early')!
export const LATE_MEASUREMENTS: S8Measurement[] = MEASUREMENTS.filter((m) => m.side === 'late')

// Planck's own abstract (arXiv:1807.06209): Omega_m = 0.315 +/- 0.007 and sigma8 = 0.811 +/- 0.006.
export const PLANCK_OWN = { omegaMatter: 0.315, sigma8: 0.811, source: 'Planck Collaboration, arXiv:1807.06209' }

export const CURVE_OMEGA_MIN = 0.2
export const CURVE_OMEGA_MAX = 0.4

function requireOmegaMatter(omegaMatter: number): void {
  if (!(omegaMatter > 0 && omegaMatter <= 1)) {
    throw new RangeError('The matter fraction must be greater than 0 and at most 1')
  }
}

function requirePositiveS8(value: number): void {
  if (!(value > 0)) {
    throw new RangeError('S8 must be greater than zero')
  }
}

// S8 from its two ingredients: sigma8 x sqrt(Omega_m / 0.3).
export function s8(sigma8: number, omegaMatter: number): number {
  if (!(sigma8 >= 0)) throw new RangeError('sigma8 must not be negative')
  requireOmegaMatter(omegaMatter)
  return sigma8 * Math.sqrt(omegaMatter / 0.3)
}

// The curve of equal S8: the sigma8 that goes with each Omega_m for one value of S8. Lensing fixes this curve, not a point on it.
export function sigma8OnCurve(s8Value: number, omegaMatter: number): number {
  requirePositiveS8(s8Value)
  requireOmegaMatter(omegaMatter)
  return s8Value / Math.sqrt(omegaMatter / 0.3)
}

// Sigma: the gap divided by the combined uncertainty, using for each value the uncertainty on the side facing the other (the lower value uses
// its upward uncertainty, the higher its downward one). Symmetric in its arguments.
export function tensionSigma(a: S8Measurement, b: S8Measurement): number {
  const [low, high] = a.value <= b.value ? [a, b] : [b, a]
  return (high.value - low.value) / combinedUncertainty(low.up, high.down)
}

// The two uncertainties that tensionSigma uses for a pair: for each value, the one on the side facing the other value. Returned as
// { first, second } for the arguments in the order given, so a worked example can show them.
export function uncertaintiesFacing(a: S8Measurement, b: S8Measurement): { first: number; second: number } {
  const aIsLow = a.value <= b.value
  return aIsLow ? { first: a.up, second: b.down } : { first: a.down, second: b.up }
}

// The change in S8 from one measurement to another (positive = the second is higher).
export function shift(from: S8Measurement, to: S8Measurement): number {
  return to.value - from.value
}

// The answer to Prediction 2, in the three ranges the buttons offer. Below 1 sigma; up to and including 2.5; above 2.5.
export type TensionRange = 'under1' | 'oneToTwoAndAHalf' | 'over2AndAHalf'
export function tensionRange(sigma: number): TensionRange {
  if (!(sigma >= 0)) throw new RangeError('Tension must not be negative')
  if (sigma < 1) return 'under1'
  if (sigma <= 2.5) return 'oneToTwoAndAHalf'
  return 'over2AndAHalf'
}

// The answer to Prediction 1: did S8 come out lower, about the same or higher when KiDS was re-analysed (KiDS-1000 to KiDS-Legacy)?
// "Same" only if the two quoted values (three decimals) differ by less than 0.001.
export type ShiftDirection = 'lower' | 'same' | 'higher'
export function kidsShift(): ShiftDirection {
  const change = shift(MEASUREMENTS.find((m) => m.name === 'KiDS-1000')!, MEASUREMENTS.find((m) => m.name === 'KiDS-Legacy')!)
  if (Math.abs(change) < 0.001) return 'same'
  return change > 0 ? 'higher' : 'lower'
}

export interface CurvePoint {
  omegaMatter: number
  sigma8: number
}

// The equal-S8 curve for one measurement, at Omega_m from 0.20 to 0.40 in steps of 0.01.
const CURVE_OMEGAS = Array.from({ length: 21 }, (_, i) => Math.round(20 + i) / 100)
export function curveFor(measurement: S8Measurement): CurvePoint[] {
  return CURVE_OMEGAS.map((omegaMatter) => ({ omegaMatter, sigma8: sigma8OnCurve(measurement.value, omegaMatter) }))
}

export interface OtherTension {
  measurement: S8Measurement
  tension: number
}

export interface LumpinessResult {
  early: S8Measurement
  focus: S8Measurement
  gap: number
  surveyUncertaintyUsed: number // the survey's uncertainty on the side facing the early value
  earlyUncertaintyUsed: number // the early value's uncertainty on the side facing the survey
  combinedUncertainty: number
  tension: number
  paperSigma: string
  otherTensions: OtherTension[] // every late measurement except the focus, against the early one
  kidsShift: number // KiDS-1000 to KiDS-Legacy
  kidsShiftDirection: ShiftDirection
  curves: Array<{ measurement: S8Measurement; points: CurvePoint[] }> // the early value's curve and every late one's
  planckOwnPoint: { omegaMatter: number; sigma8: number; s8: number } // Planck's own sigma8 and Omega_m, and the S8 they make
}

export function runLumpiness(focus: S8Measurement): LumpinessResult {
  if (focus.side !== 'late') throw new RangeError('The measurement to look closer at must be a survey (a late measurement)')
  const early = EARLY_MEASUREMENT
  const facing = uncertaintiesFacing(focus, early)
  return {
    early,
    focus,
    gap: Math.abs(early.value - focus.value),
    surveyUncertaintyUsed: facing.first,
    earlyUncertaintyUsed: facing.second,
    combinedUncertainty: combinedUncertainty(facing.first, facing.second),
    tension: tensionSigma(focus, early),
    paperSigma: focus.paperSigma,
    otherTensions: LATE_MEASUREMENTS.filter((m) => m !== focus).map((m) => ({ measurement: m, tension: tensionSigma(m, early) })),
    kidsShift: shift(MEASUREMENTS.find((m) => m.name === 'KiDS-1000')!, MEASUREMENTS.find((m) => m.name === 'KiDS-Legacy')!),
    kidsShiftDirection: kidsShift(),
    curves: [early, ...LATE_MEASUREMENTS].map((m) => ({ measurement: m, points: curveFor(m) })),
    planckOwnPoint: { omegaMatter: PLANCK_OWN.omegaMatter, sigma8: PLANCK_OWN.sigma8, s8: s8(PLANCK_OWN.sigma8, PLANCK_OWN.omegaMatter) },
  }
}
