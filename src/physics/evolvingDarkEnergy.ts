// Frontier and Beyond, Experiment 2: does dark energy change?
// See docs/experiments/frontier-and-beyond/02-does-dark-energy-change.md, "Physics Model".
//
// No new physical law: a flat universe of matter and dark energy (Cosmology Experiment 5), with the
// dark energy's strength allowed to change through the two-number description
// w(a) = w0 + wa (1 - a), where a = 1 / (1 + z). With w0 = -1 and wa = 0 it is exactly Cosmology
// Experiment 5's constant dark energy. Radiation is left out (stated to the learner); the module
// refuses redshifts above 2, where that is accurate and where the two-number formula has data.
import { HUBBLE_CONSTANT_KM_PER_S_PER_MPC, REAL_SPEED_OF_LIGHT_KM_PER_S } from './hubblesLawExperiment'

export interface DarkEnergyFit {
  name: string
  w0: number
  wa: number
  omegaMatter: number
  sigma: number // the published preference over a constant dark energy; quoted, never computed
  source: string
}

// Best-fit values for DESI BAO + CMB + a supernova collection, in the w0 wa CDM model: DESI
// Collaboration, arXiv:2503.14738, Table 5, checked on 2026-10-19.
export const FITS: DarkEnergyFit[] = [
  { name: 'Pantheon+', w0: -0.838, wa: -0.62, omegaMatter: 0.3114, sigma: 2.8, source: 'DESI Collaboration, arXiv:2503.14738' },
  { name: 'Union3', w0: -0.667, wa: -1.09, omegaMatter: 0.3275, sigma: 3.8, source: 'DESI Collaboration, arXiv:2503.14738' },
  { name: 'DES Y5', w0: -0.752, wa: -0.86, omegaMatter: 0.3191, sigma: 4.2, source: 'DESI Collaboration, arXiv:2503.14738' },
]

// Every published preference shown in Picture 3 (the sigma values are quoted, not computed). The
// last two are not offered as a learner's choice: DESI BAO + CMB alone, and the recalibrated DES
// supernovae (DES-Dovekie, arXiv:2511.07517), whose own w0 and wa were not read (Decision 3).
export interface PublishedSigma {
  name: string
  sigma: number
  source: string
}
export const PUBLISHED_SIGMAS: PublishedSigma[] = [
  { name: 'DESI + CMB alone', sigma: 3.1, source: 'DESI Collaboration, arXiv:2503.14738' },
  ...FITS.map((f) => ({ name: f.name, sigma: f.sigma, source: f.source })),
  { name: 'DES Y5 recalibrated (Dovekie)', sigma: 3.2, source: 'DES Collaboration, arXiv:2511.07517' },
]

export const MAX_REDSHIFT = 2
export const RESULT_REDSHIFTS = [0.3, 0.5, 1, 2]
export const ANCHOR_REDSHIFT = 0.05

// Simpson's rule steps (must be even), as in Cosmology Experiment 5.
const INTEGRATION_STEPS = 2000

function requireRedshift(redshift: number): void {
  if (!(redshift >= 0 && redshift <= MAX_REDSHIFT)) {
    throw new RangeError(`Redshift must be between 0 and ${MAX_REDSHIFT}`)
  }
}

function requireOmegaMatter(omegaMatter: number): void {
  if (!(omegaMatter > 0 && omegaMatter < 1)) {
    throw new RangeError('The matter fraction must be between 0 and 1')
  }
}

// Dark energy's density at redshift z compared with today's: (1 + z)^(3 (1 + w0 + wa)) x
// exp(-3 wa z / (1 + z)). Exactly 1 for a constant dark energy (w0 = -1, wa = 0).
export function darkEnergyDensityRatio(redshift: number, w0: number, wa: number): number {
  requireRedshift(redshift)
  return (1 + redshift) ** (3 * (1 + w0 + wa)) * Math.exp((-3 * wa * redshift) / (1 + redshift))
}

// w at redshift z: w0 + wa z / (1 + z), because 1 - a = z / (1 + z).
export function equationOfState(redshift: number, w0: number, wa: number): number {
  requireRedshift(redshift)
  return w0 + (wa * redshift) / (1 + redshift)
}

// Expansion rate at redshift z compared with today's (a flat universe of matter and dark energy).
export function expansionRate(redshift: number, omegaMatter: number, w0: number, wa: number): number {
  requireOmegaMatter(omegaMatter)
  return Math.sqrt(
    omegaMatter * (1 + redshift) ** 3 + (1 - omegaMatter) * darkEnergyDensityRatio(redshift, w0, wa),
  )
}

// The integral of dz' / E(z') from 0 to z, by Simpson's rule (dimensionless).
function inverseExpansionIntegral(
  redshift: number,
  omegaMatter: number,
  w0: number,
  wa: number,
  steps: number,
): number {
  requireRedshift(redshift)
  requireOmegaMatter(omegaMatter)
  if (redshift === 0) return 0
  const h = redshift / steps
  let sum = 1 / expansionRate(0, omegaMatter, w0, wa) + 1 / expansionRate(redshift, omegaMatter, w0, wa)
  for (let i = 1; i < steps; i++) {
    sum += (i % 2 === 1 ? 4 : 2) / expansionRate(i * h, omegaMatter, w0, wa)
  }
  return (sum * h) / 3
}

// Comoving distance, (c / H0) x the integral, with Cosmology Experiment 1's c and H0 unchanged.
export function comovingDistanceMpc(
  redshift: number,
  omegaMatter: number,
  w0: number,
  wa: number,
  steps = INTEGRATION_STEPS,
): number {
  const hubbleDistanceMpc = REAL_SPEED_OF_LIGHT_KM_PER_S / HUBBLE_CONSTANT_KM_PER_S_PER_MPC
  return hubbleDistanceMpc * inverseExpansionIntegral(redshift, omegaMatter, w0, wa, steps)
}

// Evolving dark energy's comoving distance divided by a constant dark energy's, with the same
// matter fraction. It does not depend on H0.
export function comovingDistanceRatio(redshift: number, fit: DarkEnergyFit): number {
  if (redshift === 0) return 1
  return (
    inverseExpansionIntegral(redshift, fit.omegaMatter, fit.w0, fit.wa, INTEGRATION_STEPS) /
    inverseExpansionIntegral(redshift, fit.omegaMatter, -1, 0, INTEGRATION_STEPS)
  )
}

// The distance difference as a percentage: (ratio - 1) x 100. Negative = nearer than a constant
// dark energy would put it.
export function distanceDifferencePercent(redshift: number, fit: DarkEnergyFit): number {
  return (comovingDistanceRatio(redshift, fit) - 1) * 100
}

// The distance modulus 5 log10(luminosity distance), up to a constant that cancels in differences.
function distanceModulus(redshift: number, omegaMatter: number, w0: number, wa: number): number {
  return 5 * Math.log10((1 + redshift) * inverseExpansionIntegral(redshift, omegaMatter, w0, wa, INTEGRATION_STEPS))
}

// The brightness-based difference between evolving and constant dark energy (same matter fraction)
// with the nearby supernovae lined up, so it does not depend on H0. Negative = brighter than the
// constant case. Exactly 0 at the anchor redshift.
export function anchoredMagnitudeDifference(redshift: number, fit: DarkEnergyFit, anchorRedshift = ANCHOR_REDSHIFT): number {
  requireRedshift(redshift)
  // At z = 0 both distances are 0 and their logarithm is undefined; the two models agree for nearby objects, so the difference there is 0.
  const difference = (z: number) =>
    z === 0 ? 0 : distanceModulus(z, fit.omegaMatter, fit.w0, fit.wa) - distanceModulus(z, fit.omegaMatter, -1, 0)
  return difference(redshift) - difference(anchorRedshift)
}

// A magnitude difference as a percentage change in brightness: 10^(-0.4 x difference) - 1, times 100. Astronomers' magnitude scale is
// backwards: a smaller number is brighter, so a negative difference is a positive (brighter) percentage. 2.5 magnitudes is a factor of 10.
export function brightnessPercentChange(magnitudeDifference: number): number {
  return (10 ** (-0.4 * magnitudeDifference) - 1) * 100
}

export type SigmaLabel = 'hint' | 'evidence' | 'discovery'

// Decision 6: only two reference lines, 3 ("often called evidence") and 5 ("the usual bar for a
// discovery"). Below 3 is a hint. The 3 sigma label has not been source-checked.
export function sigmaLabel(sigma: number): SigmaLabel {
  if (!(sigma >= 0)) throw new RangeError('Sigma must not be negative')
  if (sigma >= 5) return 'discovery'
  if (sigma >= 3) return 'evidence'
  return 'hint'
}

export interface RedshiftResult {
  redshift: number
  densityRatio: number
  equationOfState: number
  distanceDifferencePercent: number
  magnitudeDifference: number
}

export interface EvolvingDarkEnergyResult {
  fit: DarkEnergyFit
  redshift: number // the chosen "How far back?" redshift
  equationOfStateToday: number
  atChosenRedshift: RedshiftResult
  atEachRedshift: RedshiftResult[] // 0.3, 0.5, 1 and 2, so the results can show them all
  sigmaLabel: SigmaLabel
  curve: RedshiftResult[] // 0 to 2 in steps of 0.1, for Pictures 1 and 2
}

function resultAt(fit: DarkEnergyFit, redshift: number): RedshiftResult {
  return {
    redshift,
    densityRatio: darkEnergyDensityRatio(redshift, fit.w0, fit.wa),
    equationOfState: equationOfState(redshift, fit.w0, fit.wa),
    distanceDifferencePercent: distanceDifferencePercent(redshift, fit),
    magnitudeDifference: anchoredMagnitudeDifference(redshift, fit),
  }
}

const CURVE_REDSHIFTS = Array.from({ length: 21 }, (_, i) => Math.round(i) / 10)

export function runEvolvingDarkEnergy(fit: DarkEnergyFit, redshift: number): EvolvingDarkEnergyResult {
  requireRedshift(redshift)
  requireOmegaMatter(fit.omegaMatter)
  return {
    fit,
    redshift,
    equationOfStateToday: fit.w0,
    atChosenRedshift: resultAt(fit, redshift),
    atEachRedshift: RESULT_REDSHIFTS.map((z) => resultAt(fit, z)),
    sigmaLabel: sigmaLabel(fit.sigma),
    curve: CURVE_REDSHIFTS.map((z) => resultAt(fit, z)),
  }
}
