// Cosmic Horizons, Experiment 6: where is the dark matter? (the LZ experiment's null results and one unexplained event).
// See docs/experiments/cosmic-horizons/06-where-is-the-dark-matter.md, "Physics Model".
//
// No new physics beyond standard textbook statistics: Poisson counting (the chance of seeing no events when N are expected is e^-N), the
// zero-event 90 percent rule (N = -ln 0.10 = 2.30), and two idealised rules for how a limit improves with more data. The normal-curve
// functions (oneSidedChance, chanceOfAtLeastOne, sigmaLabel) are reused unchanged from Experiment 2 of this group. This model does NOT
// reproduce LZ's limits, which come from a more detailed statistical method, and it does not say what the 248 keV event is.
import { chanceOfAtLeastOne, oneSidedChance, sigmaLabel } from './evolvingDarkEnergy'
import type { SigmaLabel } from './evolvingDarkEnergy'

// The chance of seeing nothing at the limit, and so the number of events expected there: -ln 0.10 = 2.3026.
export const ZERO_EVENT_CHANCE = 0.1
export const EXPECTED_AT_LIMIT = -Math.log(ZERO_EVENT_CHANCE)

// LZ, December 2025: 417 live days of data (March 2023 to April 2025), no WIMPs between 3 and 9 GeV/c^2, and the first strong detection
// of boron-8 solar neutrinos (4.5 sigma). SLAC news release of 8 December 2025, through a fetch summary. The collaboration's own paper was
// not found (the specification's source table).
export const LZ_DECEMBER_2025 = {
  liveDays: 417,
  massRangeGeV: { low: 3, high: 9 },
  boron8Sigma: 4.5,
  detectorTonnesOfXenon: 10,
  plannedLiveDaysBy2028: 1000,
  source: 'SLAC news release, 8 December 2025 (LZ Collaboration)',
}

// LZ's published limit at high mass: arXiv:2410.17036, Physical Review Letters 135, 011802 (2025), through a fetch summary of the abstract.
export const LZ_LIMIT_2025 = {
  crossSectionCm2: 2.2e-48,
  massGeV: 40,
  exposureTonneYears: 4.2,
  liveDays: 280,
  source: 'LZ Collaboration, arXiv:2410.17036, Physical Review Letters 135, 011802 (2025)',
}

// The earlier hints of boron-8 neutrinos (as the SLAC release states them): PandaX-4T and XENONnT.
export const OTHER_BORON8_SIGMAS = { pandaX4T: 2.64, xenonNT: 2.73 }

// The XENONnT limit (arXiv:2502.18005, 3.1 tonne-years), through a search summary of the abstract.
export const XENONNT_LIMIT = { crossSectionCm2: 1.7e-47, massGeV: 30, exposureTonneYears: 3.1, source: 'XENONnT Collaboration, arXiv:2502.18005' }

// The LZ event of September 2026 (arXiv:2609.02823, abstract through a fetch summary, and as quoted by arXiv:2609.08893).
export const LZ230616 = {
  energyKeV: 248,
  statisticalKeV: 23,
  systematicKeV: 23,
  exposureTonneYears: 2.84,
  localSigma: 3.4,
  globalSigma: 2.6,
  source: 'LZ Collaboration, arXiv:2609.02823 (2 September 2026)',
}

export type Background = 'none' | 'grows'
export const MIN_TRIES = 1
export const MAX_TRIES = 100

function requirePositive(value: number, what: string): void {
  if (!Number.isFinite(value) || value <= 0) throw new RangeError(`${what} must be positive`)
}

// Expected number of events: N = (events expected at the limit) x (strength, in units of the limit) x (exposure, in units of the reference).
export function expectedEvents(strength: number, exposure: number): number {
  requirePositive(strength, 'The strength')
  requirePositive(exposure, 'The exposure')
  return EXPECTED_AT_LIMIT * strength * exposure
}

// Poisson: the chance of seeing no events when N are expected on average, and of seeing at least one.
export function chanceOfNoEvents(expected: number): number {
  if (!Number.isFinite(expected) || expected < 0) throw new RangeError('The expected number of events must not be negative')
  return Math.exp(-expected)
}
export function chanceOfAtLeastOneEvent(expected: number): number {
  return 1 - chanceOfNoEvents(expected)
}

// How the limit (the weakest strength ruled out) changes when the exposure is multiplied by `exposure`: 1 / exposure when there is no
// background, and about 1 / sqrt(exposure) when a background grows with the data (idealised rules of thumb, not LZ's projection).
export function limitAfter(exposure: number, background: Background): number {
  requirePositive(exposure, 'The exposure')
  if (background === 'none') return 1 / exposure
  if (background === 'grows') return 1 / Math.sqrt(exposure)
  throw new RangeError('The background must be none or grows')
}

// LZ's published limit scaled to a number of live days under one of the two rules, in cm^2 (an illustration).
export function limitAtLiveDays(liveDays: number, background: Background): number {
  requirePositive(liveDays, 'The number of live days')
  return LZ_LIMIT_2025.crossSectionCm2 * limitAfter(liveDays / LZ_LIMIT_2025.liveDays, background)
}

// The inverse of oneSidedChance: the sigma whose chance (counting one direction) is `chance`. oneSidedChance falls from 0.5 at sigma 0, so a
// bisection finds it.
export function sigmaOfChance(chance: number): number {
  const smallest = oneSidedChance(10)
  if (!(chance <= 0.5 && chance >= smallest)) throw new RangeError('The chance must be between about 7.6e-24 and 0.5')
  let low = 0
  let high = 10
  for (let i = 0; i < 100; i++) {
    const middle = (low + high) / 2
    if (oneSidedChance(middle) > chance) low = middle
    else high = middle
  }
  return (low + high) / 2
}

function requireTries(tries: number): void {
  if (!Number.isInteger(tries) || tries < MIN_TRIES || tries > MAX_TRIES) {
    throw new RangeError(`The number of tries must be a whole number from ${MIN_TRIES} to ${MAX_TRIES}`)
  }
}

// The global chance: the chance that at least one of `tries` independent places gives so strong an excess, by chance alone.
export function globalChance(localSigma: number, tries: number): number {
  requireTries(tries)
  return chanceOfAtLeastOne(oneSidedChance(localSigma), tries)
}

// The global significance, in sigma: 0 if the global chance is above one half (no excess at all).
export function globalSigma(localSigma: number, tries: number): number {
  const chance = globalChance(localSigma, tries)
  return chance >= 0.5 ? 0 : sigmaOfChance(chance)
}

// The number of independent tries (not necessarily a whole number) that turns a local sigma into a smaller global one.
export function triesForGlobalSigma(localSigma: number, globalSigmaValue: number): number {
  if (!(globalSigmaValue <= localSigma)) throw new RangeError('The global sigma cannot be above the local sigma')
  const pLocal = oneSidedChance(localSigma)
  const pGlobal = oneSidedChance(globalSigmaValue)
  return Math.log(1 - pGlobal) / Math.log(1 - pLocal)
}

// The sigma ladder of Picture 3, in the order it is drawn.
export interface SigmaRung {
  name: string
  sigma: number
  kind: 'detection' | 'event'
  label: SigmaLabel
}
const rung = (name: string, sigma: number, kind: SigmaRung['kind']): SigmaRung => ({ name, sigma, kind, label: sigmaLabel(sigma) })
export const SIGMA_LADDER: SigmaRung[] = [
  rung('PandaX-4T, boron-8 neutrinos', OTHER_BORON8_SIGMAS.pandaX4T, 'detection'),
  rung('XENONnT, boron-8 neutrinos', OTHER_BORON8_SIGMAS.xenonNT, 'detection'),
  rung('LZ, boron-8 neutrinos', LZ_DECEMBER_2025.boron8Sigma, 'detection'),
  rung('LZ230616, local', LZ230616.localSigma, 'event'),
  rung('LZ230616, global', LZ230616.globalSigma, 'event'),
]

// The number of tries that reproduces LZ's global 2.6 sigma from its local 3.4 (about 13.9; the learner's slider marks 14).
export const TRIES_FOR_LZ_GLOBAL = triesForGlobalSigma(LZ230616.localSigma, LZ230616.globalSigma)

// Prediction 1: the expected number of events, as the three answers: about 0.23, about 2.3 or about 23. The edges are the middles of the
// answers on a logarithmic scale (0.73 and 7.3).
export type CountRange = 'point23' | 'twoPoint3' | 'twentyThree'
export function countRange(strength: number, exposure: number): CountRange {
  const expected = expectedEvents(strength, exposure)
  if (expected < 0.73) return 'point23'
  if (expected < 7.3) return 'twoPoint3'
  return 'twentyThree'
}

// Prediction 2: is the global significance lower than, the same as or higher than the local one (from the published numbers)?
export type GlobalEffect = 'lower' | 'same' | 'higher'
export function globalEffect(): GlobalEffect {
  const difference = LZ230616.globalSigma - LZ230616.localSigma
  if (Math.abs(difference) < 0.05) return 'same'
  return difference < 0 ? 'lower' : 'higher'
}

// The numbers of the learner's own search ("Try your own search" and "How many places did you look?").
export interface DarkMatterSearchesResult {
  strength: number
  exposure: number
  background: Background
  expected: number
  chanceOfNoEvents: number
  chanceOfAtLeastOneEvent: number
  limitFactor: number // the limit after this exposure, in units of today's limit
  limitCm2: number // LZ's 2.2e-48 cm^2 times limitFactor (an illustration)
  tries: number
  localChance: number
  globalChance: number
  globalSigma: number
  triesForLzGlobal: number
}

export function runDarkMatterSearches(strength: number, exposure: number, background: Background, tries: number): DarkMatterSearchesResult {
  const expected = expectedEvents(strength, exposure)
  const factor = limitAfter(exposure, background)
  return {
    strength,
    exposure,
    background,
    expected,
    chanceOfNoEvents: chanceOfNoEvents(expected),
    chanceOfAtLeastOneEvent: chanceOfAtLeastOneEvent(expected),
    limitFactor: factor,
    limitCm2: LZ_LIMIT_2025.crossSectionCm2 * factor,
    tries,
    localChance: oneSidedChance(LZ230616.localSigma),
    globalChance: globalChance(LZ230616.localSigma, tries),
    globalSigma: globalSigma(LZ230616.localSigma, tries),
    triesForLzGlobal: TRIES_FOR_LZ_GLOBAL,
  }
}

// ---- Audit update (2026-11-03): numbers for the guess marks, the check-up and Part 2's drawing ----

// Prediction 1 is about a fixed case: a strength ten times weaker than the limit and an exposure ten times the reference, with no background.
export const PREDICTION_STRENGTH = 0.1
export const PREDICTION_EXPOSURE = 10
export function predictionCaseExpectedEvents(): number {
  return expectedEvents(PREDICTION_STRENGTH, PREDICTION_EXPOSURE)
}
// The number of events each answer of Prediction 1 names, for the white marker on Picture 1's horizontal axis.
export const COUNT_GUESS_VALUES: Record<CountRange, number> = { point23: 0.23, twoPoint3: 2.3, twentyThree: 23 }
export function countGuessValue(choice: CountRange): number {
  return COUNT_GUESS_VALUES[choice]
}

// Prediction 2's marker has no size of its own: only a side of the local 3.4 sigma (lower = -1, the same = 0, higher = +1).
export function effectGuessSide(choice: GlobalEffect): -1 | 0 | 1 {
  if (choice === 'lower') return -1
  if (choice === 'same') return 0
  return 1
}

// The two conventional bars used throughout this group (Experiments 1 and 2): about 3 sigma is often called evidence, 5 sigma the usual bar for a discovery.
export const EVIDENCE_SIGMA = 3
export const DISCOVERY_SIGMA = 5

export type CheckUpReading = 'the same' | 'more' | 'less'
export interface DarkMatterCheckUpRow {
  label: string
  expected: number // the bar or published value the found value is set beside
  found: number
  reading: CheckUpReading // no cut-off is invented
}
function compareValues(found: number, expected: number): CheckUpReading {
  if (found === expected) return 'the same'
  return found > expected ? 'more' : 'less'
}
// The published significance is quoted to one decimal place, so the illustration's global sigma is compared at that precision.
export const PUBLISHED_SIGMA_DECIMALS = 1
export function roundedToPublished(value: number): number {
  return Number(value.toFixed(PUBLISHED_SIGMA_DECIMALS))
}

// The check-up: four rows that set a published sigma beside the bar it is usually read against, and the illustration's global sigma beside the published one.
// It does not depend on the learner's controls or guesses (the last row uses 14 places looked, the slider's start).
export const START_TRIES = 14
export function darkMatterCheckUp(): DarkMatterCheckUpRow[] {
  const illustration = globalSigma(LZ230616.localSigma, START_TRIES)
  return [
    { label: 'LZ: the boron-8 solar neutrinos, against the discovery bar', expected: DISCOVERY_SIGMA, found: LZ_DECEMBER_2025.boron8Sigma, reading: compareValues(LZ_DECEMBER_2025.boron8Sigma, DISCOVERY_SIGMA) },
    { label: 'LZ: the unexpected event at its own place, against the evidence bar', expected: EVIDENCE_SIGMA, found: LZ230616.localSigma, reading: compareValues(LZ230616.localSigma, EVIDENCE_SIGMA) },
    { label: 'LZ: the unexpected event with all places counted, against the evidence bar', expected: EVIDENCE_SIGMA, found: LZ230616.globalSigma, reading: compareValues(LZ230616.globalSigma, EVIDENCE_SIGMA) },
    {
      label: `This experiment's illustration with ${START_TRIES} places looked, against LZ's published global significance (compared at the published one decimal)`,
      expected: LZ230616.globalSigma,
      found: roundedToPublished(illustration),
      reading: compareValues(roundedToPublished(illustration), LZ230616.globalSigma),
    },
  ]
}

// Part 2's drawing: the values of the learner's own search beside today's, each on its own scale.
export const DRAWING_SCALES = {
  expected: { min: 0.1, max: 100000 }, // logarithmic
  chanceNone: { min: 0, max: 1 }, // linear
  limitCm2: { min: 1e-51, max: 3e-48 }, // logarithmic
  globalSigma: { min: 0, max: 5 }, // linear
}
export interface SearchDrawingValues {
  expected: number
  chanceNone: number
  limitCm2: number
  globalSigma: number
}
export function searchDrawingValues(strength: number, exposure: number, background: Background, tries: number): SearchDrawingValues {
  const r = runDarkMatterSearches(strength, exposure, background, tries)
  return { expected: r.expected, chanceNone: r.chanceOfNoEvents, limitCm2: r.limitCm2, globalSigma: r.globalSigma }
}
// The reference marks of the drawing: today's limit (strength 1, exposure 1, no background) and the published 2.6 sigma.
export function searchDrawingReference(): SearchDrawingValues {
  return { expected: EXPECTED_AT_LIMIT, chanceNone: ZERO_EVENT_CHANCE, limitCm2: LZ_LIMIT_2025.crossSectionCm2, globalSigma: LZ230616.globalSigma }
}
