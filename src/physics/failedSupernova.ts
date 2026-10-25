// Frontier and Beyond, Experiment 17: a star that vanished, can a star become a black hole without exploding? (M31-2014-DS1)
// See docs/experiments/frontier-and-beyond/17-a-star-that-vanished.md, "Physics Model".
//
// No new physics: bookkeeping and comparison on published numbers. (1) What stays collapsed, remnant = star - thrown off, set against Black Holes 9's limits and Experiment 15's
// maximum-mass estimate; (2) the weak push of a failed supernova against an ordinary supernova's gas energy (Experiment 13's 1e51 erg); (3) the mass the neutrinos carry off,
// E / c^2, using Experiment 13's own collapse energy (a tutor number only, spec decision 4); (4) how many of every hundred massive stars might fail, with its give-or-take;
// (5) the published timeline and fade of M31-2014-DS1, recorded as data. The module does not simulate the collapse, the shock, the fallback or the dust, does not compute the
// star's binding energy, does not compute X-rays, and does not decide between the black-hole reading and the merger reading.
// This module imports only the Black Holes 9 and Experiment 13 modules.

import { coreOutcome, SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES, SURE_NEUTRON_STAR_TOP_SOLAR_MASSES, type CoreOutcome } from './blackHoleFormationExperiment'
import { collapseEnergyJ, SOLAR_MASS_KG, SUPERNOVA } from './catchingASupernova'

export { coreOutcome, type CoreOutcome, SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES, SURE_NEUTRON_STAR_TOP_SOLAR_MASSES }

export const SPEED_OF_LIGHT_M_S = 299_792_458

// ---- The published data (read 2026-10-25 from abstracts and summarising fetches: see the specification's "Sources read") ----

export const FAILED_SUPERNOVA_DATA = {
  // De and others (2026, Science), arXiv:2410.14778: initial mass about 13, terminal mass about 5, hydrogen-rich envelope about 0.28 Suns; shock 1e47 to 1e48 erg;
  // ejected mass <~ 0.1 Suns; about 98 percent collapses or falls back.
  initialMassSolar: 13,
  terminalMassSolar: 5,
  envelopeMassSolar: 0.28,
  thrownOffSolar: 0.1,
  weakShockErgRange: [1e47, 1e48] as const,
  // Experiment 13's ordinary supernova: the gas's motion, about 1e51 erg.
  supernovaGasErg: SUPERNOVA.gasMotionErg,
  // Experiment 13's literature range for that energy, (0.5 to 2) x 1e51 erg: supernovae differ, and this is how much.
  supernovaGasErgRange: SUPERNOVA.gasMotionRangeErg,
  // A 2026 preprint (Kasza and Wolf, arXiv:2605.00437), as used in Experiment 15: the maximum neutron star mass is 2.2 to 2.3 Suns under its assumptions.
  maximumMassEstimateRangeSolar: [2.2, 2.3] as const,
  // The mass the neutrinos carry off, 0.2 to 0.5 Suns: Lovegrove and Woosley and others, from search summaries only (tutor use).
  neutrinoMassLossRangeSolar: [0.2, 0.5] as const,
  // NASA JPL's NEOWISE release (12 February 2026): Andromeda is "2.5 million light-years" away. OSU news (25 May 2017): the NGC 6946 star was 25 Suns, began to weaken in 2009
  // and had vanished by 2015 (Adams, Kochanek and others).
  m31DistanceMillionLightYears: 2.5,
  ngc6946: { massSolar: 25, brightenedYear: 2009, goneYear: 2015 },
  // The fade. JWST 2024: about 7 percent of the progenitor's light (De and others, ApJL 999 L25, through AAS Nova's summary). Visible light more than 10,000 times fainter than the
  // 2012 progenitor (Hubble, De and others 2026). NGC 6946-BH1: about 10 to 15 percent (JWST, search summary only).
  jwstFractionOfProgenitor: 0.07,
  visibleFadeFactor: 1e4,
  ngc6946FractionRange: [0.1, 0.15] as const,
  // How common. Neustadt and others (2021): f = 0.16 (+0.23, -0.12) at 90 percent; the 7-year survey 0.14 (+0.33, -0.10) (search summary); OSU 2017 "as many as 30 percent".
  failedFraction: { value: 0.16, plus: 0.23, minus: 0.12 },
  failedFractionSevenYear: { value: 0.14, plus: 0.33, minus: 0.1 },
  failedFractionPress2017: 0.3,
  // The ApJL paper's wording, as AAS Nova gives it: "one hundred-millionth to one ten-thousandth" of a typical supernova's energy, as fractions.
  apjlEnergyFractionRange: [1e-8, 1e-4] as const,
  // De and others (ApJ Letters, 2026), as summarised by AAS Nova: X-rays "no sooner than about 27 years" (the discovery team's answer to the lack of X-rays so far).
  xrayWaitYears: 27,
  // The learner's choices.
  thrownOffChoicesSolar: [0, 0.1, 0.28, 1, 3] as const,
  failedPerHundredChoices: [4, 16, 39] as const,
  // The neutron star whose collapse energy gives the tutor's neutrino number: Experiment 13's.
  collapseMassSolar: SUPERNOVA.coreMassSolar,
  collapseRadiusKm: SUPERNOVA.coreRadiusKm,
}

function requirePositive(value: number, what: string): void {
  if (!Number.isFinite(value) || value <= 0) throw new RangeError(`${what} must be positive`)
}
function requireNonNegative(value: number, what: string): void {
  if (!Number.isFinite(value) || value < 0) throw new RangeError(`${what} must not be negative`)
}

// ---- What stays collapsed ----

// remnant = star - thrown off. The thrown-off mass must be below the star's mass: nothing would stay collapsed otherwise.
export function remnantMassSolar(starSolar: number, thrownOffSolar: number): number {
  requirePositive(starSolar, 'The star’s mass')
  requireNonNegative(thrownOffSolar, 'The thrown-off mass')
  if (thrownOffSolar >= starSolar) throw new RangeError('The thrown-off mass must be below the star’s mass')
  return starSolar - thrownOffSolar
}

// The share of the star that stays collapsed (0 to 1).
export function fractionCollapsed(starSolar: number, thrownOffSolar: number): number {
  return remnantMassSolar(starSolar, thrownOffSolar) / starSolar
}

// What the remnant can be, by Black Holes 9's zones: a neutron star up to 2.0 Suns, uncertain from 2.0 to 3.0, a black hole above 3.0.
export function remnantOutcome(starSolar: number, thrownOffSolar: number): CoreOutcome {
  return coreOutcome(remnantMassSolar(starSolar, thrownOffSolar))
}

// The smallest mass that must be thrown off for the remnant to be a "sure neutron star" (at most 2.0 Suns): star - 2.0, or none if the star is already that light.
export function thrownOffNeededForNeutronStar(starSolar: number): number {
  requirePositive(starSolar, 'The star’s mass')
  return Math.max(0, starSolar - SURE_NEUTRON_STAR_TOP_SOLAR_MASSES)
}

// How many times a remnant is heavier than Black Holes 9's "sure black hole" bottom (3.0) and than the top of the 2.2-to-2.3 maximum-mass estimate (2.3).
export interface RemnantOverLimits {
  overSureBlackHole: number
  overEstimateTop: number
}
export function remnantOverLimits(remnantSolar: number): RemnantOverLimits {
  requirePositive(remnantSolar, 'The remnant’s mass')
  return {
    overSureBlackHole: remnantSolar / SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES,
    overEstimateTop: remnantSolar / FAILED_SUPERNOVA_DATA.maximumMassEstimateRangeSolar[1],
  }
}

// ---- The push compared with an ordinary supernova's ----

// weak shock / ordinary supernova gas energy, both in erg. 1e47 / 1e51 = 1e-4.
export function weakShockOverSupernova(weakShockErg: number): number {
  requirePositive(weakShockErg, 'The weak shock’s energy')
  return weakShockErg / FAILED_SUPERNOVA_DATA.supernovaGasErg
}
// The same as "1 time in N".
export function pushOneIn(weakShockErg: number): number {
  return 1 / weakShockOverSupernova(weakShockErg)
}
// The paper's range as "1 time in N": from 1 in 1,000 (1e48 erg) to 1 in 10,000 (1e47 erg).
export function pushOneInRange(): { lowOneIn: number; highOneIn: number } {
  const [low, high] = FAILED_SUPERNOVA_DATA.weakShockErgRange
  return { lowOneIn: pushOneIn(high), highOneIn: pushOneIn(low) }
}
// The ApJL paper's wording, 1 in 10,000 to 1 in 100 million, as "1 time in N" (the sources differ; the spec's conflicts table).
export function apjlPushOneInRange(): { lowOneIn: number; highOneIn: number } {
  const [low, high] = FAILED_SUPERNOVA_DATA.apjlEnergyFractionRange
  return { lowOneIn: 1 / high, highOneIn: 1 / low }
}

// How far a typical supernova's gas energy varies, as a factor either way: the geometric middle of Experiment 13's range (0.5 to 2 x 1e51 erg) is 1e51, and each end is
// a factor of 2 from it. Supernovae differ from one another by about this much, far less than the factor of 100 between Prediction 1's buttons.
export function supernovaSpreadFactor(): number {
  const [low, high] = FAILED_SUPERNOVA_DATA.supernovaGasErgRange
  return Math.sqrt(high / low)
}

// ---- The mass the neutrinos carry off (tutor only) ----

// The collapse energy of Experiment 13's neutron star, E = G M^2 / R, divided by c^2, in Suns: about 0.24.
export function neutrinoMassLossSolar(): number {
  const d = FAILED_SUPERNOVA_DATA
  const energyJ = collapseEnergyJ(d.collapseMassSolar, d.collapseRadiusKm)
  return energyJ / (SPEED_OF_LIGHT_M_S * SPEED_OF_LIGHT_M_S) / SOLAR_MASS_KG
}

// ---- How common ----

// How many of every hundred massive stars are failures, for a fraction.
export function failedCountOutOf100(fraction: number): number {
  if (!Number.isFinite(fraction) || fraction < 0 || fraction > 1) throw new RangeError('The fraction must be between 0 and 1')
  return fraction * 100
}
// The survey's 90 percent range as counts out of 100, 4 to 39 (0.16 - 0.12 and 0.16 + 0.23), and its central count, 16.
export function failedRange(): { low: number; central: number; high: number } {
  const f = FAILED_SUPERNOVA_DATA.failedFraction
  return {
    low: failedCountOutOf100(f.value - f.minus),
    central: failedCountOutOf100(f.value),
    high: failedCountOutOf100(f.value + f.plus),
  }
}

// ---- The timeline of M31-2014-DS1, as published (data, in date order; no curve between the marks) ----

export interface TimelineMark {
  label: string
  startYear: number
  endYear: number | null
  text: string
}
const PLATEAU_START_YEAR = 2014
const PLATEAU_DAYS = 1000
const DAYS_PER_YEAR = 365.25
const TIMELINE: readonly TimelineMark[] = [
  { label: '2012', startYear: 2012, endYear: null, text: 'the star as it was before: about 100,000 times the Sun’s light' },
  { label: '2014 to 2016', startYear: 2014, endYear: 2016, text: 'the mid-infrared light rises by about 50 percent over about 2 years' },
  { label: 'From 2014', startYear: PLATEAU_START_YEAR, endYear: PLATEAU_START_YEAR + PLATEAU_DAYS / DAYS_PER_YEAR, text: 'the total light stays constant for about 1,000 days after the brightening began' },
  { label: '2016 to 2019', startYear: 2016, endYear: 2019, text: 'the star fades by a factor of more than 100' },
  { label: '2022 to 2023', startYear: 2022, endYear: 2023, text: 'the star is not detected in visible light from the ground' },
  { label: '2024', startYear: 2024, endYear: null, text: 'JWST finds about 7 percent of the progenitor’s light, in infrared' },
]
export function timeline(): readonly TimelineMark[] {
  return TIMELINE
}

// ---- Numbers for the pictures ----

// The other paper's wording for the push, as erg: one hundred-millionth to one ten-thousandth of a typical supernova's gas energy (AAS Nova's summary of the ApJL paper).
export function apjlPushErgRange(): [number, number] {
  const [low, high] = FAILED_SUPERNOVA_DATA.apjlEnergyFractionRange
  return [low * FAILED_SUPERNOVA_DATA.supernovaGasErg, high * FAILED_SUPERNOVA_DATA.supernovaGasErg]
}

// The 100-dot picture: how many dots are filled for the low end, the central count and the high end of the survey's 90 percent range (4, 16 and 39).
export function failedDots(): { low: number; central: number; high: number } {
  const r = failedRange()
  return { low: Math.round(r.low), central: Math.round(r.central), high: Math.round(r.high) }
}
// The dots a guess outlines, counted from 1: its band of counts, so "about 10 to 20" is dots 11 to 20. A guess of "fewer than 1" has no dots of its own, so it outlines only the first,
// as a marker.
export function guessDots(answer: CountAnswer): { first: number; last: number } {
  const [from, to] = guessCountBand(answer)
  return { first: Math.floor(from) + 1, last: Math.max(1, Math.round(to)) }
}

// The mass picture: the star's weight at the end of its life, what stays collapsed and what is thrown off, and the limits it is set against (all in Suns).
export interface MassPicture {
  initialSolar: number
  starSolar: number
  thrownOffSolar: number
  remnantSolar: number
  collapsedPercent: number
  thrownOffPercent: number
  neutronStarTopSolar: number
  estimateLowSolar: number
  estimateHighSolar: number
  blackHoleBottomSolar: number
}
export function massPicture(): MassPicture {
  const d = FAILED_SUPERNOVA_DATA
  const remnantSolar = remnantMassSolar(d.terminalMassSolar, d.thrownOffSolar)
  return {
    initialSolar: d.initialMassSolar,
    starSolar: d.terminalMassSolar,
    thrownOffSolar: d.thrownOffSolar,
    remnantSolar,
    collapsedPercent: (remnantSolar / d.terminalMassSolar) * 100,
    thrownOffPercent: (d.thrownOffSolar / d.terminalMassSolar) * 100,
    neutronStarTopSolar: SURE_NEUTRON_STAR_TOP_SOLAR_MASSES,
    estimateLowSolar: d.maximumMassEstimateRangeSolar[0],
    estimateHighSolar: d.maximumMassEstimateRangeSolar[1],
    blackHoleBottomSolar: SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES,
  }
}

// ---- The predictions ----

export function nearestPlain<T extends { value: number }>(answers: T[], truth: number): T {
  let best = answers[0]
  for (const a of answers) if (Math.abs(a.value - truth) < Math.abs(best.value - truth)) best = a
  return best
}
export function nearestLog<T extends { value: number }>(answers: T[], truth: number): T {
  let best = answers[0]
  for (const a of answers) if (Math.abs(Math.log10(a.value) - Math.log10(truth)) < Math.abs(Math.log10(best.value) - Math.log10(truth))) best = a
  return best
}

// Prediction 1: how strong is the push compared with an ordinary supernova's? The three buttons, by "1 time in N".
export type PushAnswer = 'about the same' | 'about 1 in 100' | 'about 1 in 10,000'
export const PUSH_ANSWERS: { label: PushAnswer; value: number }[] = [
  { label: 'about the same', value: 1 },
  { label: 'about 1 in 100', value: 100 },
  { label: 'about 1 in 10,000', value: 10_000 },
]
// The paper's range is 1 in 1,000 to 1 in 10,000; its middle on a log scale is 1 in about 3,162, and the nearest button is 1 in 10,000.
export function pushMiddleOneIn(): number {
  const { lowOneIn, highOneIn } = pushOneInRange()
  return Math.sqrt(lowOneIn * highOneIn)
}
export function pushAnswer(): PushAnswer {
  return nearestLog(PUSH_ANSWERS, pushMiddleOneIn()).label
}
// What a push button says, as the "1 time in N" and as an energy in erg, so the guess can be drawn on the same log scale as the real range.
export function guessPushOneIn(answer: PushAnswer): number {
  const found = PUSH_ANSWERS.find((a) => a.label === answer)
  if (!found) throw new RangeError('Not one of the answers')
  return found.value
}
export function guessPushErg(answer: PushAnswer): number {
  return FAILED_SUPERNOVA_DATA.supernovaGasErg / guessPushOneIn(answer)
}

// Prediction 2: of every 100 massive stars, about how many might fail? The three buttons, each a band of counts out of 100 (a marker for the guess, not a measurement).
export type CountAnswer = 'fewer than 1' | 'about 10 to 20' | 'about half'
export const COUNT_ANSWERS: { label: CountAnswer; value: number; band: [number, number] }[] = [
  { label: 'fewer than 1', value: 0.5, band: [0, 1] },
  { label: 'about 10 to 20', value: 15, band: [10, 20] },
  { label: 'about half', value: 50, band: [40, 60] },
]
// The button nearest to a count, by plain distance (a count out of 100, not a power of ten). With no argument, the survey's central count.
export function countAnswer(count: number = failedRange().central): CountAnswer {
  return nearestPlain(COUNT_ANSWERS, count).label
}
export function guessCountBand(answer: CountAnswer): [number, number] {
  const found = COUNT_ANSWERS.find((a) => a.label === answer)
  if (!found) throw new RangeError('Not one of the answers')
  return found.band
}
// How many times larger the real central count is than the button's value (the tutor's words for a guess that missed). Under 1 means the real count is smaller.
export function countRealOverGuess(answer: CountAnswer): number {
  const found = COUNT_ANSWERS.find((a) => a.label === answer)
  if (!found) throw new RangeError('Not one of the answers')
  return failedRange().central / found.value
}

// Where a value sits along a log scale from 10^minPower to 10^maxPower: 0 at the left end, 1 at the right end (clamped).
export function logScalePosition(value: number, minPower: number, maxPower: number): number {
  requirePositive(value, 'value')
  if (!(maxPower > minPower)) throw new RangeError('maxPower must be above minPower')
  const t = (Math.log10(value) - minPower) / (maxPower - minPower)
  return Math.min(1, Math.max(0, t))
}

// ---- The learner's choices (the defaults are the paper's values) ----

export interface FailedSupernovaSettings {
  thrownOffSolar?: number
  failedPerHundred?: number
}
export interface FailedSupernovaResult {
  starSolar: number
  thrownOffSolar: number
  remnantSolar: number
  fractionCollapsed: number
  collapsedPercent: number
  thrownOffPercent: number
  outcome: CoreOutcome
  overLimits: RemnantOverLimits
  thrownOffNeededForNeutronStarSolar: number
  failedPerHundred: number
  // The dots filled in the 100-dot drawing for the learner's count, and "1 massive star in every N" (none when the count is 0).
  filledDots: number
  oneStarInEvery: number | null
  // Whether the learner's count is below, inside or above the survey's 90 percent range (4 to 39).
  failedVersusRange: 'below' | 'inside' | 'above'
  failedRange: { low: number; central: number; high: number }
  pushOneInRange: { lowOneIn: number; highOneIn: number }
  neutrinoMassLossSolar: number
}

export function runFailedSupernova(settings: FailedSupernovaSettings = {}): FailedSupernovaResult {
  const d = FAILED_SUPERNOVA_DATA
  const thrownOffSolar = settings.thrownOffSolar ?? d.thrownOffSolar
  const failedPerHundred = settings.failedPerHundred ?? failedRange().central
  if (!Number.isFinite(failedPerHundred) || failedPerHundred < 0 || failedPerHundred > 100) throw new RangeError('The count must be between 0 and 100')
  const remnantSolar = remnantMassSolar(d.terminalMassSolar, thrownOffSolar)
  const range = failedRange()
  return {
    starSolar: d.terminalMassSolar,
    thrownOffSolar,
    remnantSolar,
    fractionCollapsed: remnantSolar / d.terminalMassSolar,
    collapsedPercent: (remnantSolar / d.terminalMassSolar) * 100,
    thrownOffPercent: (thrownOffSolar / d.terminalMassSolar) * 100,
    outcome: coreOutcome(remnantSolar),
    overLimits: remnantOverLimits(remnantSolar),
    thrownOffNeededForNeutronStarSolar: thrownOffNeededForNeutronStar(d.terminalMassSolar),
    failedPerHundred,
    filledDots: Math.round(failedPerHundred),
    oneStarInEvery: failedPerHundred > 0 ? 100 / failedPerHundred : null,
    failedVersusRange: failedPerHundred < range.low - 1e-9 ? 'below' : failedPerHundred > range.high + 1e-9 ? 'above' : 'inside',
    failedRange: range,
    pushOneInRange: pushOneInRange(),
    neutrinoMassLossSolar: neutrinoMassLossSolar(),
  }
}

// ---- The reading guide's comparisons (CLAUDE.md §14, "Reading the Results") ----

// Where a value lies against a published range: inside it, or below or above it by this distance (in the value's own unit, to the nearest edge). No cut-off such as "close enough".
export interface RangeCheck {
  verdict: 'inside' | 'below' | 'above'
  distance: number
}
export function rangeCheck(value: number, low: number, high: number): RangeCheck {
  if (!Number.isFinite(value)) throw new RangeError('The value must be a finite number')
  if (!Number.isFinite(low) || !Number.isFinite(high) || low > high) throw new RangeError('A range must run from its low end to its high end')
  if (value < low) return { verdict: 'below', distance: low - value }
  if (value > high) return { verdict: 'above', distance: value - high }
  return { verdict: 'inside', distance: 0 }
}

// The interval a value with a give-or-take covers, [value - minus, value + plus], in the value's own unit.
export function giveOrTakeInterval(value: number, plus: number, minus: number): [number, number] {
  if (!Number.isFinite(value) || !Number.isFinite(plus) || !Number.isFinite(minus) || plus < 0 || minus < 0) throw new RangeError('A give-or-take must be finite and not negative')
  return [value - minus, value + plus]
}

// Everything the check-up and the tables show, for the paper's own numbers (the page's defaults), in one place. Nothing here follows the learner's guesses or settings.
export interface CheckUp {
  // What stays collapsed.
  starSolar: number
  thrownOffSolar: number
  remnantSolar: number
  collapsedPercent: number
  thrownOffPercent: number
  remnantOutcome: CoreOutcome
  overSureBlackHole: number
  overEstimateTop: number
  thrownOffNeededSolar: number
  thrownOffNeededPercent: number
  thrownOffNeededOverPaper: number // how many times more than the paper's thrown-off mass would have to be thrown off
  // The push against an ordinary supernova's.
  pushOneIn: { lowOneIn: number; highOneIn: number }
  pushTimesWeaker: { low: number; high: number }
  apjlPushOneIn: { lowOneIn: number; highOneIn: number }
  pushRangesOverlapAtOneIn: number | null // where the two papers' ranges touch (1 in N), or null if they do not overlap
  // The fade.
  jwstPercent: number
  ngc6946PercentRange: [number, number]
  fadeVersusNgc6946: RangeCheck // in percentage points
  ngc6946TimesJwst: { low: number; high: number }
  visibleFadeFactor: number
  // How common.
  failedRange: { low: number; central: number; high: number }
  sevenYear: { central: number; low: number; high: number }
  press2017Percent: number
  press2017VersusRange: RangeCheck
  sevenYearCentralVersusRange: RangeCheck
  centralVersusSevenYearRange: RangeCheck
  topOverBottom: number
  oneStarInEvery: number
}
export function runCheckUp(): CheckUp {
  const d = FAILED_SUPERNOVA_DATA
  const r = runFailedSupernova()
  const push = pushOneInRange()
  const apjl = apjlPushOneInRange()
  const range = failedRange()
  const [ngcLowFraction, ngcHighFraction] = d.ngc6946FractionRange
  const sevenYearInterval = giveOrTakeInterval(d.failedFractionSevenYear.value * 100, d.failedFractionSevenYear.plus * 100, d.failedFractionSevenYear.minus * 100)
  // The two papers' "1 in N" ranges: ours runs from 1,000 to 10,000, theirs from 10,000 to 100 million. They share the point 1 in 10,000, and no more.
  const overlapLow = Math.max(push.lowOneIn, apjl.lowOneIn)
  const overlapHigh = Math.min(push.highOneIn, apjl.highOneIn)
  return {
    starSolar: r.starSolar,
    thrownOffSolar: r.thrownOffSolar,
    remnantSolar: r.remnantSolar,
    collapsedPercent: r.collapsedPercent,
    thrownOffPercent: r.thrownOffPercent,
    remnantOutcome: r.outcome,
    overSureBlackHole: r.overLimits.overSureBlackHole,
    overEstimateTop: r.overLimits.overEstimateTop,
    thrownOffNeededSolar: r.thrownOffNeededForNeutronStarSolar,
    thrownOffNeededPercent: (r.thrownOffNeededForNeutronStarSolar / r.starSolar) * 100,
    thrownOffNeededOverPaper: r.thrownOffNeededForNeutronStarSolar / r.thrownOffSolar,
    pushOneIn: push,
    pushTimesWeaker: { low: push.lowOneIn, high: push.highOneIn },
    apjlPushOneIn: apjl,
    pushRangesOverlapAtOneIn: overlapLow <= overlapHigh ? overlapLow : null,
    jwstPercent: d.jwstFractionOfProgenitor * 100,
    ngc6946PercentRange: [ngcLowFraction * 100, ngcHighFraction * 100],
    fadeVersusNgc6946: rangeCheck(d.jwstFractionOfProgenitor * 100, ngcLowFraction * 100, ngcHighFraction * 100),
    ngc6946TimesJwst: { low: ngcLowFraction / d.jwstFractionOfProgenitor, high: ngcHighFraction / d.jwstFractionOfProgenitor },
    visibleFadeFactor: d.visibleFadeFactor,
    failedRange: range,
    sevenYear: { central: d.failedFractionSevenYear.value * 100, low: sevenYearInterval[0], high: sevenYearInterval[1] },
    press2017Percent: d.failedFractionPress2017 * 100,
    press2017VersusRange: rangeCheck(d.failedFractionPress2017 * 100, range.low, range.high),
    sevenYearCentralVersusRange: rangeCheck(d.failedFractionSevenYear.value * 100, range.low, range.high),
    centralVersusSevenYearRange: rangeCheck(range.central, sevenYearInterval[0], sevenYearInterval[1]),
    topOverBottom: range.high / range.low,
    oneStarInEvery: 100 / range.central,
  }
}

// ---- The two readings (data only: what each team says, with no calculation and no verdict) ----

export interface ReadingRow {
  topic: string
  blackHole: string
  merger: string
  source: string
}
const READINGS: readonly ReadingRow[] = [
  {
    topic: 'What the object is',
    blackHole: 'a star that collapsed into a black hole, with most of its outer layers falling back in and a little thrown out, hidden in dust',
    merger: 'two stars that merged, leaving a dust-covered star that still shines',
    source: 'De and others (2026); Beasor and others (2026); Soker (2026)',
  },
  {
    topic: 'X-rays',
    blackHole: 'none seen so far, because the dust blocks them; they should appear in about 27 years',
    merger: 'none seen, which the authors say disfavours a black hole powering the light',
    source: 'De and others (2026, as summarised by AAS Nova); Beasor and others (2026)',
  },
  {
    topic: 'The dust',
    blackHole: 'the dust and the weak ejection together hide the black hole',
    merger: 'asymmetric dust, thrown out by a pair of stars',
    source: 'De and others (2026); Beasor and others (2026); Soker (2026)',
  },
  {
    topic: 'What each team says about the other’s reading',
    blackHole: 'the discovery team answers that the weak ejection and the dust hide a black hole, and that X-rays should appear in about 27 years',
    merger: 'Soker says the black-hole reading needs less than 1 percent of the bound material to be accreted and a backflow that is not shut off for over 10 years, and that it predicts radiation about ten times above what is seen',
    source: 'De and others (2026); Soker (2026)',
  },
]
export function readings(): readonly ReadingRow[] {
  return READINGS
}

// ---- The tutor's worked numbers (tutor only) ----

// The neutrino sum written out: E = G M^2 / R for Experiment 13's neutron star (in joules), c^2, and the mass E / c^2 in kilograms and in Suns (about 0.24; the published range
// is about 0.2 to 0.5).
export interface NeutrinoMassWorked {
  energyJ: number
  cSquared: number
  massKg: number
  massSolar: number
}
export function neutrinoMassWorked(): NeutrinoMassWorked {
  const d = FAILED_SUPERNOVA_DATA
  const energyJ = collapseEnergyJ(d.collapseMassSolar, d.collapseRadiusKm)
  const cSquared = SPEED_OF_LIGHT_M_S * SPEED_OF_LIGHT_M_S
  const massKg = energyJ / cSquared
  return { energyJ, cSquared, massKg, massSolar: massKg / SOLAR_MASS_KG }
}

// How a push guess compares with the paper's range (1 in 1,000 to 1 in 10,000): "stronger" means the guess is a stronger push than the whole range, by this many times at the
// near end and at the far end; "inside" means the guess's "1 in N" lies in the range.
export interface PushGuessGap {
  verdict: 'stronger' | 'inside' | 'weaker'
  nearTimes: number
  farTimes: number
}
export function pushGuessGap(answer: PushAnswer): PushGuessGap {
  const n = guessPushOneIn(answer)
  const { lowOneIn, highOneIn } = pushOneInRange()
  if (n < lowOneIn) return { verdict: 'stronger', nearTimes: lowOneIn / n, farTimes: highOneIn / n }
  if (n > highOneIn) return { verdict: 'weaker', nearTimes: n / highOneIn, farTimes: n / lowOneIn }
  return { verdict: 'inside', nearTimes: 1, farTimes: 1 }
}

// How a count guess compares with the survey's central count: "below" means the guess's whole band is under the central count, and the central count is this many times the top of
// the band; "above" means the band is over it, and the bottom of the band is this many times the central count; "inside" means the band holds the central count.
export interface CountGuessGap {
  verdict: 'below' | 'inside' | 'above'
  times: number
}
export function countGuessGap(answer: CountAnswer): CountGuessGap {
  const [low, high] = guessCountBand(answer)
  const central = failedRange().central
  if (central >= low && central <= high) return { verdict: 'inside', times: 1 }
  if (high < central) return { verdict: 'below', times: central / high }
  return { verdict: 'above', times: low / central }
}
