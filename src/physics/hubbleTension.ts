// Cosmic Horizons, Experiment 1: two measurements of the expansion rate (the Hubble tension).
// See docs/experiments/cosmic-horizons/01-hubble-tension.md, "Physics Model".
//
// No new physics: the expansion rate is Cosmology Experiment 1's, the Hubble time is Cosmology
// Experiment 2's. The one new idea is sigma, the gap between two measurements in units of their
// combined uncertainty, treating each as a symmetric, independent error bar (a stated simplification).
import { MPC_TO_KM, SECONDS_PER_YEAR } from './bigBangExperiment'

export interface HubbleMeasurement {
  name: string
  side: 'early' | 'late'
  value: number // km/s/Mpc
  uncertainty: number // km/s/Mpc, total published uncertainty
  source: string
}

// Published values, checked against the original papers' arXiv abstracts on 2026-10-16 (the
// specification's "Real-World Facts Used, and Source Status"). CCHP's total is its statistical,
// systematic and supernova parts (1.22, 1.33, 0.70) in quadrature.
export const MEASUREMENTS: HubbleMeasurement[] = [
  { name: 'Planck 2018', side: 'early', value: 67.4, uncertainty: 0.5, source: 'Planck Collaboration, arXiv:1807.06209' },
  { name: 'SH0ES 2022', side: 'late', value: 73.04, uncertainty: 1.04, source: 'Riess et al., arXiv:2112.04510' },
  { name: 'H0DN 2026', side: 'late', value: 73.5, uncertainty: 0.81, source: 'H0DN Collaboration, arXiv:2510.23823' },
  {
    name: 'CCHP 2024',
    side: 'late',
    value: 70.39,
    uncertainty: Math.sqrt(1.22 ** 2 + 1.33 ** 2 + 0.7 ** 2),
    source: 'Freedman et al., arXiv:2408.06153',
  },
]

export const EARLY_MEASUREMENT: HubbleMeasurement = MEASUREMENTS.find((m) => m.side === 'early')!
export const LATE_MEASUREMENTS: HubbleMeasurement[] = MEASUREMENTS.filter((m) => m.side === 'late')

function requirePositiveUncertainty(uncertainty: number): void {
  if (!(uncertainty > 0)) {
    throw new RangeError('Uncertainty must be greater than zero')
  }
}

// Two independent error bars combine as the square root of the sum of their squares.
export function combinedUncertainty(a: number, b: number): number {
  requirePositiveUncertainty(a)
  requirePositiveUncertainty(b)
  return Math.sqrt(a * a + b * b)
}

// Sigma: the gap divided by the combined uncertainty. A stretch k >= 1 multiplies both
// uncertainties ("what if every error bar had been underestimated k times"), so it divides sigma by k.
export function tensionSigma(a: HubbleMeasurement, b: HubbleMeasurement, stretch = 1): number {
  if (!(stretch >= 1)) {
    throw new RangeError('Stretch must be at least 1')
  }
  const sigma = combinedUncertainty(a.uncertainty * stretch, b.uncertainty * stretch)
  return Math.abs(a.value - b.value) / sigma
}

// The stretch that brings the tension down to targetSigma. Not clamped: below 1 means the tension is
// already smaller than the target.
export function stretchNeeded(a: HubbleMeasurement, b: HubbleMeasurement, targetSigma: number): number {
  if (!(targetSigma > 0)) {
    throw new RangeError('Target sigma must be greater than zero')
  }
  return tensionSigma(a, b) / targetSigma
}

// A rough age if the expansion had always run at today's rate: 1 / H0, in billions of years. Same
// unit conversions as bigBangExperiment.ts's hubbleTimeYears (which is fixed at 70).
export function hubbleTimeBillionYears(hubbleConstant: number): number {
  if (!(hubbleConstant > 0)) {
    throw new RangeError('Hubble constant must be greater than zero')
  }
  const perSecond = hubbleConstant / MPC_TO_KM
  return 1 / perSecond / SECONDS_PER_YEAR / 1e9
}

export interface OtherLateTension {
  measurement: HubbleMeasurement
  tension: number
}

export interface TensionExperimentResult {
  early: HubbleMeasurement
  late: HubbleMeasurement
  stretch: number
  gap: number
  combinedUncertainty: number // after the stretch
  tension: number
  earlyHubbleTimeBillionYears: number
  lateHubbleTimeBillionYears: number
  otherLateTensions: OtherLateTension[] // every other nearby-universe measurement, against the early value
}

export function runTensionExperiment(late: HubbleMeasurement, stretch = 1): TensionExperimentResult {
  const early = EARLY_MEASUREMENT
  return {
    early,
    late,
    stretch,
    gap: Math.abs(late.value - early.value),
    combinedUncertainty: combinedUncertainty(early.uncertainty * stretch, late.uncertainty * stretch),
    tension: tensionSigma(early, late, stretch),
    earlyHubbleTimeBillionYears: hubbleTimeBillionYears(early.value),
    lateHubbleTimeBillionYears: hubbleTimeBillionYears(late.value),
    otherLateTensions: LATE_MEASUREMENTS.filter((m) => m !== late).map((m) => ({
      measurement: m,
      tension: tensionSigma(early, m, stretch),
    })),
  }
}

// The ranges of Prediction 1 ("about how many sigma apart?"). 2 and 4 and 6 belong to the lower range ("between 2 and 4" includes exactly 2;
// "more than 6" means strictly more), so every tension falls in exactly one range.
export type SigmaRange = 'under2' | 'twoToFour' | 'fourToSix' | 'over6'

export function sigmaRange(tension: number): SigmaRange {
  if (!(tension >= 0)) {
    throw new RangeError('Tension must not be negative')
  }
  if (tension < 2) return 'under2'
  if (tension <= 4) return 'twoToFour'
  if (tension <= 6) return 'fourToSix'
  return 'over6'
}

// The answer to Prediction 2: what the James Webb Space Telescope's second look at the Cepheids found. Published values, checked against
// the arXiv abstract on 2026-10-16 (Riess et al., arXiv:2401.04773): JWST's Cepheid measurements differ from the Hubble Space Telescope's
// by -0.01 +/- 0.03 magnitudes, and "unrecognized crowding" as the explanation is rejected at 8.2 sigma.
export const WEBB_CEPHEID_RESULT = {
  differenceMagnitudes: -0.01,
  uncertaintyMagnitudes: 0.03,
  crowdingRejectedAtSigma: 8.2,
  source: 'Riess et al., arXiv:2401.04773',
}

// The Webb result as an answer to Prediction 2: the difference (-0.01) is smaller than its own uncertainty (0.03), so the nearby-universe
// value was left about the same. A difference larger than its uncertainty would have to be mapped to "lower" or "higher" by a rule this
// project has not defined, so that case throws instead of guessing.
export type WebbEffect = 'lower' | 'same' | 'higher'
export function webbEffect(): WebbEffect {
  const { differenceMagnitudes, uncertaintyMagnitudes } = WEBB_CEPHEID_RESULT
  if (Math.abs(differenceMagnitudes) >= uncertaintyMagnitudes) {
    throw new RangeError('The Webb difference is larger than its uncertainty: no rule maps it to lower or higher')
  }
  return 'same'
}

// ---- Audit update (docs/audit/cosmic-horizons/01-draft-wording.md): numbers for the guess marks and the check-up ----

// Prediction 1's band, in sigma. "under2" is 0 to 2, "twoToFour" is 2 to 4, "fourToSix" is 4 to 6, "over6" starts at 6 and has no upper end (hi is null).
export interface SigmaBand {
  lo: number
  hi: number | null
}

export function sigmaGuessBand(range: SigmaRange): SigmaBand {
  switch (range) {
    case 'under2':
      return { lo: 0, hi: 2 }
    case 'twoToFour':
      return { lo: 2, hi: 4 }
    case 'fourToSix':
      return { lo: 4, hi: 6 }
    case 'over6':
      return { lo: 6, hi: null }
  }
}

// The same band as distances along the gap, in km/s/Mpc, measured from the early value toward the nearby value: one sigma is one combined give-or-take
// long, which is the length of one tick on Picture 2. `to` is null when the band has no upper end.
export function sigmaBandOnLine(range: SigmaRange, combined: number): { from: number; to: number | null } {
  requirePositiveUncertainty(combined)
  const { lo, hi } = sigmaGuessBand(range)
  return { from: lo * combined, to: hi === null ? null : hi * combined }
}

// The Webb panel's real point and bar, in magnitudes (Webb minus Hubble Cepheid brightness).
export function webbPanelPoint(): { value: number; low: number; high: number } {
  const { differenceMagnitudes: d, uncertaintyMagnitudes: u } = WEBB_CEPHEID_RESULT
  return { value: d, low: d - u, high: d + u }
}

// Prediction 2 has no size of its own on the magnitude scale (the project has no rule linking the sign of the brightness difference to the direction
// of H0), so its guess is only a marker in one of three slots, left to right.
export const WEBB_GUESS_SLOTS: WebbEffect[] = ['lower', 'same', 'higher']
export function webbGuessSlot(choice: WebbEffect): number {
  return WEBB_GUESS_SLOTS.indexOf(choice)
}

// Published values the check-up sets beside this page's numbers. SH0ES reports 5 sigma for its comparison with Planck (Riess et al., arXiv:2112.04510,
// abstract, checked 2026-10-16); the page's simple arithmetic gives 4.89.
export const SHOES_PUBLISHED_SIGMA = 5
export const PUBLISHED_VALUES = {
  'Planck 2018': { value: 67.4, uncertainty: 0.5 },
  'SH0ES 2022': { value: 73.04, uncertainty: 1.04 },
} as const

export type CheckUpReading = 'the same' | 'more' | 'less' | 'smaller than its own uncertainty' | 'larger than its own uncertainty'
export interface CheckUpRow {
  label: string
  expected: number
  found: number
  reading: CheckUpReading
}

function compare(found: number, expected: number): CheckUpReading {
  if (found === expected) return 'the same'
  return found > expected ? 'more' : 'less'
}

// The check-up: always at the published error bars (a trial stretch never changes it). Four rows: the two published values, the sigma against
// SH0ES's own quoted 5 (no cut-off is invented: only "the same", "more" or "less"), and the Webb difference against its own uncertainty.
export function hubbleTensionCheckUp(): CheckUpRow[] {
  const planck = EARLY_MEASUREMENT
  const shoes = MEASUREMENTS.find((m) => m.name === 'SH0ES 2022')!
  const sigma = tensionSigma(planck, shoes)
  const { differenceMagnitudes: d, uncertaintyMagnitudes: u } = WEBB_CEPHEID_RESULT
  return [
    { label: 'Planck 2018, value', expected: PUBLISHED_VALUES['Planck 2018'].value, found: planck.value, reading: compare(planck.value, PUBLISHED_VALUES['Planck 2018'].value) },
    { label: 'SH0ES 2022, value', expected: PUBLISHED_VALUES['SH0ES 2022'].value, found: shoes.value, reading: compare(shoes.value, PUBLISHED_VALUES['SH0ES 2022'].value) },
    { label: 'SH0ES 2022 against Planck, sigma', expected: SHOES_PUBLISHED_SIGMA, found: sigma, reading: compare(sigma, SHOES_PUBLISHED_SIGMA) },
    {
      label: 'Webb minus Hubble, Cepheid brightness (magnitudes)',
      expected: 0,
      found: d,
      reading: Math.abs(d) < u ? 'smaller than its own uncertainty' : 'larger than its own uncertainty',
    },
  ]
}

// The working behind the combined give-or-take, for the Picture 2 worked moment: each uncertainty squared, their sum, and its square root.
export function combinedUncertaintySteps(a: number, b: number): { aSquared: number; bSquared: number; sum: number; combined: number } {
  const combined = combinedUncertainty(a, b)
  return { aSquared: a * a, bSquared: b * b, sum: a * a + b * b, combined }
}

// Part 2's drawing: a measurement's error bar with its give-or-take multiplied by a trial stretch k >= 1 (the best value does not move).
export function stretchedBar(m: HubbleMeasurement, stretch: number): { value: number; uncertainty: number; low: number; high: number } {
  if (!(stretch >= 1)) {
    throw new RangeError('Stretch must be at least 1')
  }
  const uncertainty = m.uncertainty * stretch
  return { value: m.value, uncertainty, low: m.value - uncertainty, high: m.value + uncertainty }
}

// Whether the two stretched error bars touch or overlap (the picture-form of a small sigma).
export function stretchedBarsTouch(a: HubbleMeasurement, b: HubbleMeasurement, stretch: number): boolean {
  const x = stretchedBar(a, stretch)
  const y = stretchedBar(b, stretch)
  return x.low <= y.high && y.low <= x.high
}
