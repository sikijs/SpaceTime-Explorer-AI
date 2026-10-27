// Frontier and Beyond, Experiment 23: how fast can a black hole grow? (the "little red dots")
// See docs/experiments/frontier-and-beyond/23-how-fast-can-a-black-hole-grow.md, "Physics Model".
//
// The Eddington growth time, exponential growth M(t) = M0 exp[(1 - e) / e x t / t_Edd] at efficiency e, the time to grow from a seed to a
// given mass, the smallest seed that fits in a given time, and the published object CAPERS-LRD-z9 as data. The age of the universe is
// Experiment 5's function; the efficiency of a non-spinning black hole is Black Holes Experiment 8's. The module does NOT model the gas
// or its cocoon, feeding faster than the limit, how seeds form, mergers, or the change of spin (and so of efficiency) as a black hole grows.

import { ageAfterBigBangYears } from './earliestGalaxies'
import { energyReleasedFraction } from './spinningBlackHoleExperiment'

// ---- Constants (SI) ----
export const G = 6.6743e-11 // m^3 kg^-1 s^-2
export const SPEED_OF_LIGHT = 299792458 // m/s
export const THOMSON_CROSS_SECTION = 6.6524587e-29 // m^2
export const PROTON_MASS_KG = 1.67262192e-27
export const SECONDS_PER_YEAR = 365.25 * 86400 // a Julian year

function checkPositive(x: number, what: string) {
  if (!Number.isFinite(x) || !(x > 0)) throw new RangeError(`${what} must be a positive, finite number.`)
}

function checkEfficiency(e: number) {
  if (!Number.isFinite(e) || !(e > 0) || !(e < 1)) throw new RangeError('The efficiency must be between 0 and 1.')
}

// ---- The Eddington growth time ----

// t_Edd = sigma_T c / (4 pi G m_p): about 0.45 billion years (a textbook value, to be checked at a source).
export function eddingtonTimeYears(): number {
  return (THOMSON_CROSS_SECTION * SPEED_OF_LIGHT) / (4 * Math.PI * G * PROTON_MASS_KG) / SECONDS_PER_YEAR
}

// The efficiency of a non-spinning black hole: Black Holes Experiment 8's energy released at the last safe orbit (about 5.7 percent).
export function nonSpinningEfficiency(): number {
  return energyReleasedFraction(0, 'with')
}

// The efficiencies of the control: a non-spinning black hole's, a standard 10 percent, and 40 percent (a trial value near the upper end,
// about 42 percent, of Black Holes Experiment 8's range for a black hole spinning as fast as possible).
export const STANDARD_EFFICIENCY = 0.1
export const HIGH_EFFICIENCY_TRIAL = 0.4
export const MAX_SPIN_EFFICIENCY = 1 - 1 / Math.sqrt(3) // 0.4226, the limit as the spin approaches its largest value (hand value, to be checked)

export function efficiencyChoices(): number[] {
  return [nonSpinningEfficiency(), STANDARD_EFFICIENCY, HIGH_EFFICIENCY_TRIAL]
}

// One e-folding time at efficiency e: e / (1 - e) x t_Edd (50 million years at 10 percent; some texts drop the (1 - e) and quote 45).
export function growthTimeYears(efficiency: number = STANDARD_EFFICIENCY): number {
  checkEfficiency(efficiency)
  return (efficiency / (1 - efficiency)) * eddingtonTimeYears()
}

// ---- Growing at the limit ----

// M(t) = M0 exp(t / growth time).
export function massAfterYears(seedSolar: number, years: number, efficiency: number = STANDARD_EFFICIENCY): number {
  checkPositive(seedSolar, 'The seed mass')
  if (!Number.isFinite(years) || years < 0) throw new RangeError('The time must be zero or more.')
  return seedSolar * Math.exp(years / growthTimeYears(efficiency))
}

// The number of growth times (e-foldings) from a seed to a final mass: ln(final / seed).
export function growthTimesNeeded(seedSolar: number, finalSolar: number): number {
  checkPositive(seedSolar, 'The seed mass')
  checkPositive(finalSolar, 'The final mass')
  return Math.log(finalSolar / seedSolar)
}

// t = growth time x ln(final / seed).
export function yearsToGrow(seedSolar: number, finalSolar: number, efficiency: number = STANDARD_EFFICIENCY): number {
  return growthTimesNeeded(seedSolar, finalSolar) * growthTimeYears(efficiency)
}

// The smallest seed that reaches the final mass in the given time: the inverse of massAfterYears.
export function smallestSeedSolar(finalSolar: number, years: number, efficiency: number = STANDARD_EFFICIENCY): number {
  checkPositive(finalSolar, 'The final mass')
  if (!Number.isFinite(years) || years < 0) throw new RangeError('The time must be zero or more.')
  return finalSolar / Math.exp(years / growthTimeYears(efficiency))
}

// ---- The real object: CAPERS-LRD-z9 (arXiv:2505.04609; abstract through summaries, 2026-10-27) ----
export const CAPERS_LRD_Z9 = {
  name: 'CAPERS-LRD-z9',
  redshift: 9.288,
  logMass: 7.58,
  logMassPlusMinus: 0.15,
  minMassSolar: 4.5e6,
  maxMassSolar: 3.16e8,
} as const

export function objectMassSolar(): number {
  return 10 ** CAPERS_LRD_Z9.logMass
}

// The universe's age when the light left the object, in years (Experiment 5's function, Planck's values).
export function objectAgeYears(): number {
  return ageAfterBigBangYears(CAPERS_LRD_Z9.redshift)
}

// The age at which a trial seed begins to feed: a choice for the page, not a measurement (Decision 8).
export const SEED_START_AGE_YEARS = 100e6

// The time available to a seed that starts feeding at the start age.
export function timeAvailableYears(startAgeYears: number = SEED_START_AGE_YEARS): number {
  if (!Number.isFinite(startAgeYears) || startAgeYears < 0 || startAgeYears >= objectAgeYears()) {
    throw new RangeError('The start age must be between zero and the age of the universe at the object.')
  }
  return objectAgeYears() - startAgeYears
}

// ---- Rulers (log scales, each position from 0 to 1) ----

function logPosition(x: number, min: number, max: number): number {
  checkPositive(x, 'The value')
  const pos = (Math.log10(x) - Math.log10(min)) / (Math.log10(max) - Math.log10(min))
  return Math.min(1, Math.max(0, pos))
}

// Picture 1: times from a million years to ten billion years.
export const TIME_RULER_MIN_YEARS = 1e6
export const TIME_RULER_MAX_YEARS = 1e10
export function timeRulerPosition(years: number): number {
  return logPosition(years, TIME_RULER_MIN_YEARS, TIME_RULER_MAX_YEARS)
}

// Picture 2 and Drawing A: masses from 1 Sun to a billion Suns.
export const MASS_RULER_MIN_SOLAR = 1
export const MASS_RULER_MAX_SOLAR = 1e9
export function massRulerPosition(solar: number): number {
  return logPosition(solar, MASS_RULER_MIN_SOLAR, MASS_RULER_MAX_SOLAR)
}

// ---- The predictions ----

// Prediction 1: how long a 10-Sun black hole feeding at the limit at 10 percent efficiency takes to reach the object's mass.
export const PREDICTION_SEED_SOLAR = 10
export const TIME_CHOICES = [
  { id: 't3m', label: 'about 3 million years', years: 3e6 },
  { id: 't30m', label: 'about 30 million years', years: 3e7 },
  { id: 't300m', label: 'about 300 million years', years: 3e8 },
  { id: 't800m', label: 'about 800 million years', years: 8e8 },
  { id: 't8b', label: 'about 8 billion years', years: 8e9 },
] as const
export type TimeChoiceId = (typeof TIME_CHOICES)[number]['id']

export function predictionTimeYears(): number {
  return yearsToGrow(PREDICTION_SEED_SOLAR, objectMassSolar(), STANDARD_EFFICIENCY)
}

export function nearestOnLogScale<T>(choices: readonly T[], value: number, valueOf: (c: T) => number): T {
  let best = choices[0]
  for (const c of choices) {
    if (Math.abs(Math.log(valueOf(c)) - Math.log(value)) < Math.abs(Math.log(valueOf(best)) - Math.log(value))) best = c
  }
  return best
}

export function timeAnswer(): TimeChoiceId {
  return nearestOnLogScale(TIME_CHOICES, predictionTimeYears(), (c) => c.years).id
}

export function timeChoiceYears(id: TimeChoiceId): number {
  return TIME_CHOICES.find((c) => c.id === id)!.years
}

// The tutor's mark (§12, §13): used in the explanation only.
export function timeGuessResult(id: TimeChoiceId): 'matched' | 'not matched' {
  return id === timeAnswer() ? 'matched' : 'not matched'
}

export function timeGuessMarker(id: TimeChoiceId): { years: number; position: number } {
  const years = timeChoiceYears(id)
  return { years, position: timeRulerPosition(years) }
}

// Prediction 2: the smallest seed that reaches the object's mass in the time available from the start age, at 10 percent efficiency.
// The buttons are spaced 1.5 decades apart (about a factor of 30) and balanced about the answer (about 8,600 Suns), which the first
// draft of the specification had put at about 40,000 (a hand estimate corrected in this module).
export const SEED_CHOICES = [
  { id: 's10', label: 'about 10 Suns', solar: 10 },
  { id: 's300', label: 'about 300 Suns', solar: 300 },
  { id: 's10k', label: 'about 10,000 Suns', solar: 1e4 },
  { id: 's300k', label: 'about 300,000 Suns', solar: 3e5 },
  { id: 's10m', label: 'about 10 million Suns', solar: 1e7 },
] as const
export type SeedChoiceId = (typeof SEED_CHOICES)[number]['id']

export function predictionSeedSolar(): number {
  return smallestSeedSolar(objectMassSolar(), timeAvailableYears(), STANDARD_EFFICIENCY)
}

export function seedAnswer(): SeedChoiceId {
  return nearestOnLogScale(SEED_CHOICES, predictionSeedSolar(), (c) => c.solar).id
}

export function seedChoiceSolar(id: SeedChoiceId): number {
  return SEED_CHOICES.find((c) => c.id === id)!.solar
}

export function seedGuessResult(id: SeedChoiceId): 'matched' | 'not matched' {
  return id === seedAnswer() ? 'matched' : 'not matched'
}

export function seedGuessMarker(id: SeedChoiceId): { solar: number; position: number } {
  const solar = seedChoiceSolar(id)
  return { solar, position: massRulerPosition(solar) }
}

// ---- Part 2: "Now try it yourself" (trial values, not claims about real seeds) ----

export const TRIAL_SEED_CHOICES_SOLAR = [10, 1e3, 1e5, 1e6] as const

export interface TrialPicture {
  seedSolar: number
  efficiency: number
  growthTimeYears: number
  growthTimes: number // e-foldings from the seed to the object's mass
  doublings: number // the same count, in doublings
  yearsNeeded: number
  yearsAvailable: number
  fits: boolean
  // Time needed divided by time available (above 1 means it does not fit).
  needOverAvailable: number
  seedPosition: number
  objectPosition: number
}

export function trialPicture(seedSolar: number, efficiency: number): TrialPicture {
  const target = objectMassSolar()
  const needed = yearsToGrow(seedSolar, target, efficiency)
  const available = timeAvailableYears()
  const times = growthTimesNeeded(seedSolar, target)
  return {
    seedSolar,
    efficiency,
    growthTimeYears: growthTimeYears(efficiency),
    growthTimes: times,
    doublings: times / Math.LN2,
    yearsNeeded: needed,
    yearsAvailable: available,
    fits: needed <= available,
    needOverAvailable: needed / available,
    seedPosition: massRulerPosition(seedSolar),
    objectPosition: massRulerPosition(target),
  }
}
