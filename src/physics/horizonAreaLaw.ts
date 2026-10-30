// Cosmic Horizons, Experiment 18: does a black hole's surface area ever shrink? (GW250114 and Hawking's area theorem)
// See docs/experiments/frontier-and-beyond/18-does-a-black-holes-area-ever-shrink.md, "Physics Model".
//
// One formula, given and not derived (the Kerr horizon, Black Holes 8): the area of a spinning black hole's horizon is
//   A = 8 pi (G M / c^2)^2 (1 + sqrt(1 - chi^2)) = 16 pi (G M / c^2)^2 h(chi),   h(chi) = (1 + sqrt(1 - chi^2)) / 2,
// where h is Black Holes 8's `horizonRadius` (the horizon in units of the non-spinning radius 2GM/c^2). The rest is arithmetic on
// the published masses and spins of GW250114. The module does not simulate the merger, fit a signal, give uncertainties on the areas,
// derive the area theorem, or include Hawking radiation (which lies outside the theorem's classical assumptions).
// This module imports only the Black Holes 1 and Black Holes 8 modules.

import { horizonRadiusKm } from './blackHoleSizeExperiment'
import { horizonRadius } from './spinningBlackHoleExperiment'

// ---- The published data (read 2026-10-25 from summaries: see the specification's "Sources read"; the paper itself was not read) ----

export const GW250114 = {
  // Source-frame masses in Suns, from the PRL abstract through summaries and Wikipedia's summary of the paper's supplement.
  massesSolar: [33.6, 32.2] as const,
  finalMassSolar: 62.7,
  finalSpin: 0.68,
  // "Small spins", at most about 0.25 each (another summary says 0.26).
  initialSpinMax: 0.25,
  // The energy radiated, 3.1 +/- 2.2 Suns, as a summary of the paper's supplement gives it (Wikipedia; the supplement was not read).
  radiatedUncertaintySolar: 2.2,
  // The signal: detected 14 January 2025 by the two LIGO detectors with a signal-to-noise ratio of about 80 (the PRL abstract through summaries), three to four times
  // stronger than the previous strongest signals (the ICRR summary), at about 1.14 billion light-years (Wikipedia's summary, from the paper's supplement).
  detected: '14 January 2025',
  signalToNoise: 80,
  strongerThanPreviousBest: [3, 4] as const,
  distanceBillionLightYears: 1.14,
  // The press figures (University of Birmingham release; Ars Technica as quoted by Wikipedia), in km^2.
  pressAreaBeforeKm2: 240_000,
  pressAreaAfterKm2: 400_000,
}

// The learner's trial choices.
export const SHARE_CHOICES_PERCENT = [0, 2.5, 4.7, 10, 20, 30] as const
export const SPIN_CHOICES = [0, 0.5, 0.68, 0.9] as const

export const DIRECTION_CHOICES = ['down', 'same', 'up'] as const
export type DirectionChoice = (typeof DIRECTION_CHOICES)[number]
// The sizes the three buttons stand for: the area after, with the area before as 1.
// Mirrored about 1 on a log scale (1 / 1.05 = 0.95, 1 / 1.6 = 0.6, 1 / 6 = 0.17), so three buttons are below 1 and three above.
export const SIZE_CHOICES = [0.17, 0.6, 0.95, 1.05, 1.6, 6] as const
export type SizeChoice = (typeof SIZE_CHOICES)[number]

// Floating-point sums such as 33.6 + 32.2 - 62.7 come out as 3.1000000000000085; the page shows the rounded number.
function round9(x: number): number {
  return Math.round(x * 1e9) / 1e9
}

function checkMass(massSolar: number) {
  if (!Number.isFinite(massSolar) || !(massSolar > 0)) {
    throw new RangeError('The mass must be a positive, finite number of Suns.')
  }
}

// G M / c^2 in km for a mass in Suns (half of Black Holes 1's horizon radius).
function gmOverCSquaredKm(massSolar: number): number {
  return horizonRadiusKm(massSolar) / 2
}

// ---- The area of one horizon, and the totals ----

// Spins from 0 up to, but not including, 1 (Black Holes 8's rule, which `horizonRadius` enforces).
export function horizonAreaKm2(massSolar: number, spin: number): number {
  checkMass(massSolar)
  const g = gmOverCSquaredKm(massSolar)
  return 16 * Math.PI * g * g * horizonRadius(spin)
}

export function totalMassBeforeSolar(): number {
  return round9(GW250114.massesSolar[0] + GW250114.massesSolar[1])
}

// The sum of the two areas before. By default both are taken as non-spinning (the page says so); the paper's spins of at most 0.25 lower it.
export function totalAreaBeforeKm2(spins: readonly [number, number] = [0, 0]): number {
  return horizonAreaKm2(GW250114.massesSolar[0], spins[0]) + horizonAreaKm2(GW250114.massesSolar[1], spins[1])
}

export function areaAfterKm2(): number {
  return horizonAreaKm2(GW250114.finalMassSolar, GW250114.finalSpin)
}

export interface AreaChange {
  beforeKm2: number
  afterKm2: number
  ratio: number
  percent: number
}

function change(beforeKm2: number, afterKm2: number): AreaChange {
  const ratio = afterKm2 / beforeKm2
  return { beforeKm2, afterKm2, ratio, percent: (ratio - 1) * 100 }
}

// By the formula, for the published masses and spins.
export function areaChange(): AreaChange {
  return change(totalAreaBeforeKm2(), areaAfterKm2())
}

// By the press figures (they differ from the formula's: the page shows both).
export function pressAreaChange(): AreaChange {
  return change(GW250114.pressAreaBeforeKm2, GW250114.pressAreaAfterKm2)
}

// ---- The mass radiated ----

export function radiatedSolar(): number {
  return round9(totalMassBeforeSolar() - GW250114.finalMassSolar)
}

export function radiatedFraction(): number {
  return radiatedSolar() / totalMassBeforeSolar()
}

// ---- The ceiling ----

// The largest share of the starting mass that could be radiated before the area after falls below the area before (the two taken as
// non-spinning), for a given spin after. Setting 16 pi g^2 M_f^2 h(chi) equal to the sum before gives M_f^2 = (m1^2 + m2^2) / h(chi).
// With no spin after and equal masses this is 1 - 1/sqrt(2), 29.3 percent: the simplest case of Hawking's bound (not read at a source).
export function maxRadiatedFraction(spinAfter: number): number {
  const sumOfSquares = GW250114.massesSolar[0] ** 2 + GW250114.massesSolar[1] ** 2
  const massAfter = Math.sqrt(sumOfSquares / horizonRadius(spinAfter))
  return 1 - massAfter / totalMassBeforeSolar()
}

// ---- A trial merger (the learner's two settings) ----

export interface TrialMerger {
  share: number // the share of the starting mass radiated, 0 up to but not including 1
  spinAfter: number
  massAfterSolar: number
  areaAfterKm2: number
  ratio: number // area after / area before
  areaWentDown: boolean // true if the trial area is below the real area before: the area law forbids such a merger
  ceiling: number // maxRadiatedFraction(spinAfter)
}

export function trialMerger(share: number, spinAfter: number): TrialMerger {
  if (!Number.isFinite(share) || !(share >= 0 && share < 1)) {
    throw new RangeError('The share of the mass radiated must be from 0 up to, but not including, 1.')
  }
  const massAfterSolar = (1 - share) * totalMassBeforeSolar()
  const areaAfter = horizonAreaKm2(massAfterSolar, spinAfter)
  const before = totalAreaBeforeKm2()
  return {
    share,
    spinAfter,
    massAfterSolar,
    areaAfterKm2: areaAfter,
    ratio: areaAfter / before,
    areaWentDown: areaAfter < before,
    ceiling: maxRadiatedFraction(spinAfter),
  }
}

// For the trial drawing's text. How far the trial share is below (positive) or above (negative) the ceiling at the trial spin, in percentage points.
export function ceilingHeadroomPercent(t: TrialMerger): number {
  return (t.ceiling - t.share) * 100
}

// The trial area after as a multiple of the real area after (GW250114's), so the learner can compare their trial with the real event.
export function trialOverRealAfter(t: TrialMerger): number {
  return t.areaAfterKm2 / areaAfterKm2()
}

// The trial drawing's vertical scale, in km^2: tall enough for the largest trial (no radiation, no spin, about 475,000).
export const TRIAL_AXIS_MAX_KM2 = 500_000

// ---- The predictions ----

// The choice whose value is nearest the real value on a log scale (the ratio of areas is a ratio, so equal steps are equal factors).
function nearestLog<T extends number>(real: number, choices: readonly T[]): T {
  let best = choices[0]
  for (const c of choices) {
    if (Math.abs(Math.log(c / real)) < Math.abs(Math.log(best / real))) best = c
  }
  return best
}

export function directionAnswer(): DirectionChoice {
  const r = areaChange().ratio
  return r > 1 ? 'up' : r < 1 ? 'down' : 'same'
}

// The optional argument lets the log rule be tested away from the real ratio (where a plain-distance rule gives the same button).
export function sizeAnswer(ratio: number = areaChange().ratio): SizeChoice {
  return nearestLog(ratio, SIZE_CHOICES)
}

// For drawing the guess in white. A direction has no size of its own: -1, 0 or +1 for an arrow pointing down, flat or up (only a marker).
export function directionMarker(choice: DirectionChoice): -1 | 0 | 1 {
  return choice === 'down' ? -1 : choice === 'up' ? 1 : 0
}

// The area after that a size guess stands for: the guessed ratio times the real area before.
export function guessAreaAfterKm2(choice: SizeChoice): number {
  return choice * totalAreaBeforeKm2()
}

// ---- The numbers the three pictures draw (the interface only draws them: CLAUDE.md §9) ----

// Picture 2's vertical scale tops out here, so that the real bars are large enough to compare; a guess above it is drawn cut off and marked "off the scale".
export const AREA_AXIS_MAX_KM2 = 800_000
// Picture 3's horizontal scale (the share radiated, in percent) and its vertical scale (the ratio of areas).
export const CEILING_SHARE_MAX_PERCENT = 35
export const CEILING_RATIO_MAX = 2.2
const CEILING_STEP_PERCENT = 0.5

export interface MassPicture {
  massesBeforeSolar: readonly [number, number]
  totalBeforeSolar: number
  massAfterSolar: number
  radiatedSolar: number
  radiatedPercent: number
  spinBeforeMax: number
  spinAfter: number
}

export function massPicture(): MassPicture {
  return {
    massesBeforeSolar: GW250114.massesSolar,
    totalBeforeSolar: totalMassBeforeSolar(),
    massAfterSolar: GW250114.finalMassSolar,
    radiatedSolar: radiatedSolar(),
    radiatedPercent: radiatedFraction() * 100,
    spinBeforeMax: GW250114.initialSpinMax,
    spinAfter: GW250114.finalSpin,
  }
}

export interface AreaPicture {
  segmentsBeforeKm2: readonly [number, number]
  totalBeforeKm2: number
  afterKm2: number
  pressBeforeKm2: number
  pressAfterKm2: number
  axisMaxKm2: number
  // How much lower the total before would be if both black holes spun at the paper's upper limit (a few percent).
  spinsLowerBeforeByPercent: number
}

export function areaPicture(): AreaPicture {
  const first = horizonAreaKm2(GW250114.massesSolar[0], 0)
  const second = horizonAreaKm2(GW250114.massesSolar[1], 0)
  const spun = totalAreaBeforeKm2([GW250114.initialSpinMax, GW250114.initialSpinMax])
  return {
    segmentsBeforeKm2: [first, second],
    totalBeforeKm2: totalAreaBeforeKm2(),
    afterKm2: areaAfterKm2(),
    pressBeforeKm2: GW250114.pressAreaBeforeKm2,
    pressAfterKm2: GW250114.pressAreaAfterKm2,
    axisMaxKm2: AREA_AXIS_MAX_KM2,
    spinsLowerBeforeByPercent: (1 - spun / totalAreaBeforeKm2()) * 100,
  }
}

// The area worked step by step, for the captions' worked moments (so the interface does no physics, CLAUDE.md §9).
export interface AreaSteps {
  massSolar: number
  spin: number
  gmKm: number // G M / c^2 in kilometres
  gmSquaredKm2: number
  sixteenPi: number
  h: number // (1 + sqrt(1 - spin^2)) / 2
  areaKm2: number
}

export function areaSteps(massSolar: number, spin: number): AreaSteps {
  const gmKm = gmOverCSquaredKm(massSolar)
  const h = horizonRadius(spin)
  return { massSolar, spin, gmKm, gmSquaredKm2: gmKm * gmKm, sixteenPi: 16 * Math.PI, h, areaKm2: horizonAreaKm2(massSolar, spin) }
}

export interface GuessBar {
  areaKm2: number // the area after that the guess stands for
  drawnKm2: number // the height drawn: the guess, cut off at the top of the scale
  offScale: boolean
}

export function guessBar(choice: SizeChoice): GuessBar {
  const areaKm2 = guessAreaAfterKm2(choice)
  return { areaKm2, drawnKm2: Math.min(areaKm2, AREA_AXIS_MAX_KM2), offScale: areaKm2 > AREA_AXIS_MAX_KM2 }
}

export interface CeilingPoint {
  sharePercent: number
  ratio: number
}

export interface CeilingPicture {
  shareMaxPercent: number
  ratioMax: number
  measuredSpin: CeilingPoint[] // the area after as a ratio to the area before, for the measured final spin, across the shares
  noSpin: CeilingPoint[] // the same for a final spin of 0
  real: CeilingPoint // GW250114: 4.7 percent radiated, ratio about 1.57
  ceilingMeasuredSpinPercent: number
  ceilingNoSpinPercent: number
}

function ceilingCurve(spin: number): CeilingPoint[] {
  const points: CeilingPoint[] = []
  for (let p = 0; p <= CEILING_SHARE_MAX_PERCENT + 1e-9; p += CEILING_STEP_PERCENT) {
    points.push({ sharePercent: p, ratio: trialMerger(p / 100, spin).ratio })
  }
  return points
}

export function ceilingPicture(): CeilingPicture {
  return {
    shareMaxPercent: CEILING_SHARE_MAX_PERCENT,
    ratioMax: CEILING_RATIO_MAX,
    measuredSpin: ceilingCurve(GW250114.finalSpin),
    noSpin: ceilingCurve(0),
    real: { sharePercent: radiatedFraction() * 100, ratio: areaChange().ratio },
    ceilingMeasuredSpinPercent: maxRadiatedFraction(GW250114.finalSpin) * 100,
    ceilingNoSpinPercent: maxRadiatedFraction(0) * 100,
  }
}

// ---- The results' check-up (CLAUDE.md §14, "Reading the Results"): each comparison has a real reference, and no invented cut-offs ----

export interface CheckUp {
  mass: { beforeSolar: number; afterSolar: number; lessByPercent: number }
  // Positive when the press figure is higher than the formula's.
  areaBefore: { formulaKm2: number; pressKm2: number; pressOverFormulaPercent: number }
  areaAfter: { formulaKm2: number; pressKm2: number; pressOverFormulaPercent: number }
  areaChange: { formulaRatio: number; formulaPercent: number; pressRatio: number; pressPercent: number }
  // The share radiated against the ceiling at the measured final spin: how many times the ceiling is the share, and the share as a fraction of the ceiling.
  ceiling: { sharePercent: number; ceilingPercent: number; shareOverCeiling: number; ceilingOverShare: number }
}

export function checkUp(): CheckUp {
  const m = massPicture()
  const a = areaPicture()
  const f = areaChange()
  const p = pressAreaChange()
  const sharePercent = m.radiatedPercent
  const ceilingPercent = maxRadiatedFraction(GW250114.finalSpin) * 100
  return {
    mass: { beforeSolar: m.totalBeforeSolar, afterSolar: m.massAfterSolar, lessByPercent: m.radiatedPercent },
    areaBefore: { formulaKm2: a.totalBeforeKm2, pressKm2: a.pressBeforeKm2, pressOverFormulaPercent: (a.pressBeforeKm2 / a.totalBeforeKm2 - 1) * 100 },
    areaAfter: { formulaKm2: a.afterKm2, pressKm2: a.pressAfterKm2, pressOverFormulaPercent: (a.pressAfterKm2 / a.afterKm2 - 1) * 100 },
    areaChange: { formulaRatio: f.ratio, formulaPercent: f.percent, pressRatio: p.ratio, pressPercent: p.percent },
    ceiling: { sharePercent, ceilingPercent, shareOverCeiling: sharePercent / ceilingPercent, ceilingOverShare: ceilingPercent / sharePercent },
  }
}

// ---- The tutor's numbers (CLAUDE.md §9: the interface only displays them) ----

export interface DirectionResult {
  matched: boolean
  real: DirectionChoice
}

export function directionGuessResult(choice: DirectionChoice): DirectionResult {
  const real = directionAnswer()
  return { matched: choice === real, real }
}

export interface SizeGap {
  matched: boolean
  verdict: 'matched' | 'below' | 'above' // the guess is below, or above, the real ratio
  realRatio: number
  times: number // how many times the guess is from the real ratio, always 1 or more
}

export function sizeGuessGap(choice: SizeChoice): SizeGap {
  const realRatio = areaChange().ratio
  const answer = sizeAnswer()
  const times = choice >= realRatio ? choice / realRatio : realRatio / choice
  return { matched: choice === answer, verdict: choice === answer ? 'matched' : choice < realRatio ? 'below' : 'above', realRatio, times }
}

// Why the mass can fall while the area rises: the area goes as the square of the mass (and falls with spin). With the masses of GW250114.
export interface AreaScalingWorked {
  massesSolar: readonly [number, number]
  squaresBefore: readonly [number, number]
  sumOfSquares: number // m1^2 + m2^2: the area before, in units of 16 pi (G/c^2)^2 for black holes that do not spin
  totalMassSquared: number // (m1 + m2)^2: the area of one black hole of the whole mass with no spin and nothing radiated
  ratioNoLossNoSpin: number // totalMassSquared / sumOfSquares
  afterMassSolar: number
  afterMassSquared: number
  spinFactorAfter: number // h(0.68)
  afterInSameUnits: number // afterMassSquared * h
  ratio: number // afterInSameUnits / sumOfSquares: the same as areaChange().ratio
}

export function areaScalingWorked(): AreaScalingWorked {
  const [m1, m2] = GW250114.massesSolar
  const sumOfSquares = m1 * m1 + m2 * m2
  const total = totalMassBeforeSolar()
  const h = horizonRadius(GW250114.finalSpin)
  const afterSq = GW250114.finalMassSolar * GW250114.finalMassSolar
  return {
    massesSolar: GW250114.massesSolar,
    squaresBefore: [m1 * m1, m2 * m2],
    sumOfSquares,
    totalMassSquared: total * total,
    ratioNoLossNoSpin: (total * total) / sumOfSquares,
    afterMassSolar: GW250114.finalMassSolar,
    afterMassSquared: afterSq,
    spinFactorAfter: h,
    afterInSameUnits: afterSq * h,
    ratio: (afterSq * h) / sumOfSquares,
  }
}

// The raindrop comparison (an analogy, not black-hole physics): two equal drops merge. A drop's mass goes as its radius cubed, so its surface goes as mass^(2/3); the
// merged drop has less surface than the two had. For black holes the horizon radius goes as the mass, so the area goes as mass^2, and for equal masses (no spin,
// nothing radiated) the one black hole has twice the area of the two.
export function raindropMergerRatio(): number {
  return 2 ** (2 / 3) / 2
}

export function blackHoleEqualMergerRatio(): number {
  return 4 / 2
}

// The ceiling, step by step, for a chosen spin after: the smallest mass after that keeps the area at least equal, and the share that leaves.
export interface CeilingWorked {
  spinAfter: number
  sumOfSquares: number
  h: number
  minMassAfterSolar: number
  massBeforeSolar: number
  sharePercent: number
}

export function ceilingWorked(spinAfter: number): CeilingWorked {
  const sumOfSquares = GW250114.massesSolar[0] ** 2 + GW250114.massesSolar[1] ** 2
  const h = horizonRadius(spinAfter)
  const minMassAfterSolar = Math.sqrt(sumOfSquares / h)
  return {
    spinAfter,
    sumOfSquares,
    h,
    minMassAfterSolar,
    massBeforeSolar: totalMassBeforeSolar(),
    sharePercent: maxRadiatedFraction(spinAfter) * 100,
  }
}

// ---- Everything the learner sees, at once ----

export interface HorizonAreaLawSettings {
  sharePercent: number
  spinAfter: number
}

export interface HorizonAreaLawResult {
  real: {
    massBeforeSolar: number
    massAfterSolar: number
    radiatedSolar: number
    radiatedFraction: number
    areaBeforeKm2: number
    areaAfterKm2: number
    change: AreaChange
    press: AreaChange
    ceilingAtMeasuredSpin: number
    ceilingNoSpin: number
  }
  trial: TrialMerger
}

export function runHorizonAreaLaw(settings: HorizonAreaLawSettings): HorizonAreaLawResult {
  return {
    real: {
      massBeforeSolar: totalMassBeforeSolar(),
      massAfterSolar: GW250114.finalMassSolar,
      radiatedSolar: radiatedSolar(),
      radiatedFraction: radiatedFraction(),
      areaBeforeKm2: totalAreaBeforeKm2(),
      areaAfterKm2: areaAfterKm2(),
      change: areaChange(),
      press: pressAreaChange(),
      ceilingAtMeasuredSpin: maxRadiatedFraction(GW250114.finalSpin),
      ceilingNoSpin: maxRadiatedFraction(0),
    },
    trial: trialMerger(settings.sharePercent / 100, settings.spinAfter),
  }
}
