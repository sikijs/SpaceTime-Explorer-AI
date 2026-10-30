// Cosmic Horizons, Experiment 21: can we photograph a black hole's shadow? (Event Horizon Telescope)
// See docs/experiments/cosmic-horizons/21-black-hole-shadow.md, "Physics Model".
//
// One formula, given and not derived (Black Holes 4): light aimed closer than 3 sqrt(3) / 2 horizon radii is captured, so the
// ideal shadow of a non-spinning black hole is a disc of diameter 2 x (3 sqrt(3) / 2) x r_s = 6 sqrt(3) G M / c^2. Its angle in the
// sky is that diameter divided by the distance. The module does not model the glowing gas, the effect of spin on the shadow,
// the EHT's calibration between ring and shadow, or the telescope. The published ring sizes are data.
// This module imports only the Black Holes 1 and Black Holes 4 modules.

import { horizonRadiusKm } from './blackHoleSizeExperiment'
import { CRITICAL_AIM_IN_HORIZON_RADII, lightPath } from './lightNearBlackHoleExperiment'

export const KM_PER_PARSEC = 3.0856775814913673e13
const MICROARCSEC_PER_RADIAN = (180 / Math.PI) * 3600 * 1e6

// ---- The published data (read 2026-10-26 from abstracts and search summaries; see the specification's "Sources read") ----

export interface RealBlackHole {
  id: 'm87' | 'sgrA'
  name: string
  massSolar: number
  massPlus: number
  massMinus: number
  distancePc: number
  distancePlus: number
  distanceMinus: number
  // The measured ring, in millionths of an arcsecond.
  ringMicroarcsec: number
  ringUncertainty: number
}

export const M87_STAR: RealBlackHole = {
  id: 'm87',
  name: 'M87*',
  massSolar: 6.5e9,
  massPlus: 0.7e9,
  massMinus: 0.7e9,
  distancePc: 16.8e6,
  distancePlus: 0.8e6,
  distanceMinus: 0.7e6,
  ringMicroarcsec: 42,
  ringUncertainty: 3,
}

export const SGR_A_STAR: RealBlackHole = {
  id: 'sgrA',
  name: 'Sagittarius A*',
  massSolar: 4.0e6,
  massPlus: 1.1e6,
  massMinus: 0.6e6,
  distancePc: 8.15e3,
  distancePlus: 0.15e3,
  distanceMinus: 0.15e3,
  ringMicroarcsec: 51.8,
  ringUncertainty: 2.3,
}

export const REAL_BLACK_HOLES = [M87_STAR, SGR_A_STAR] as const

// M87*'s ring from the later analysis of 2017, 2018 and 2021 together, which stays the same from year to year.
export const M87_RING_2017_TO_2021 = { ringMicroarcsec: 43.9, ringUncertainty: 0.6 }

// ---- The shadow ----

function checkPositive(x: number, what: string) {
  if (!Number.isFinite(x) || !(x > 0)) throw new RangeError(`${what} must be a positive, finite number.`)
}

// The shadow's diameter in km: 2 x the critical aim = 6 sqrt(3) G M / c^2 = 2.598 x the horizon's diameter.
export function shadowDiameterKm(massSolar: number): number {
  checkPositive(massSolar, 'The mass')
  return 2 * CRITICAL_AIM_IN_HORIZON_RADII * horizonRadiusKm(massSolar)
}

// The shadow's diameter divided by the horizon's diameter (about 2.6).
export function shadowOverHorizon(): number {
  return CRITICAL_AIM_IN_HORIZON_RADII
}

// An angle in millionths of an arcsecond for a width in km at a distance in km (small angles).
export function angularSizeMicroarcsec(diameterKm: number, distanceKm: number): number {
  checkPositive(diameterKm, 'The diameter')
  checkPositive(distanceKm, 'The distance')
  return (diameterKm / distanceKm) * MICROARCSEC_PER_RADIAN
}

// The ideal shadow's angle in the sky for a mass in Suns and a distance in parsecs.
export function shadowAngleMicroarcsec(massSolar: number, distancePc: number): number {
  checkPositive(distancePc, 'The distance')
  return angularSizeMicroarcsec(shadowDiameterKm(massSolar), distancePc * KM_PER_PARSEC)
}

export function realShadowMicroarcsec(bh: RealBlackHole): number {
  return shadowAngleMicroarcsec(bh.massSolar, bh.distancePc)
}

// ---- Ratios of the two real black holes (M87* over Sagittarius A*) ----

export function massRatio(): number {
  return M87_STAR.massSolar / SGR_A_STAR.massSolar
}

export function distanceRatio(): number {
  return M87_STAR.distancePc / SGR_A_STAR.distancePc
}

// M87*'s calculated shadow over Sagittarius A*'s: mass ratio / distance ratio.
export function calculatedSizeRatio(): number {
  return realShadowMicroarcsec(M87_STAR) / realShadowMicroarcsec(SGR_A_STAR)
}

// The measured rings' ratio (2019 M87* ring against Sagittarius A*'s ring), and with the later 43.9 value.
export function measuredSizeRatio(useLaterM87Ring = false): number {
  const m87 = useLaterM87Ring ? M87_RING_2017_TO_2021.ringMicroarcsec : M87_STAR.ringMicroarcsec
  return m87 / SGR_A_STAR.ringMicroarcsec
}

// ---- Calculated against measured ----

export interface Comparison {
  calculated: number
  measured: number
  uncertainty: number
  differenceMicroarcsec: number // calculated - measured
  differencePercent: number // of the measured value
  differenceInUncertainties: number // difference / uncertainty
  withinOneUncertainty: boolean
}

// No cut-off is invented: the number of uncertainties is reported, and `withinOneUncertainty` is only |difference| <= uncertainty.
export function compareWithMeasured(calculated: number, measured: number, uncertainty: number): Comparison {
  checkPositive(measured, 'The measured value')
  checkPositive(uncertainty, 'The uncertainty')
  const difference = calculated - measured
  return {
    calculated,
    measured,
    uncertainty,
    differenceMicroarcsec: difference,
    differencePercent: (difference / measured) * 100,
    differenceInUncertainties: difference / uncertainty,
    withinOneUncertainty: Math.abs(difference) <= uncertainty,
  }
}

export function checkRealBlackHole(bh: RealBlackHole, useLaterM87Ring = false): Comparison {
  const ring =
    bh.id === 'm87' && useLaterM87Ring
      ? M87_RING_2017_TO_2021
      : { ringMicroarcsec: bh.ringMicroarcsec, ringUncertainty: bh.ringUncertainty }
  return compareWithMeasured(realShadowMicroarcsec(bh), ring.ringMicroarcsec, ring.ringUncertainty)
}

// ---- The predictions ----

// Prediction 1: M87*'s shadow against Sagittarius A*'s, as a size ratio the buttons stand for (log-spaced about 1).
export const SIZE_CHOICES = [
  { id: 'much-bigger', label: 'much bigger', ratio: 10 },
  { id: 'a-little-bigger', label: 'a little bigger', ratio: 1.5 },
  { id: 'about-the-same', label: 'about the same', ratio: 1 },
  { id: 'a-little-smaller', label: 'a little smaller', ratio: 1 / 1.5 },
  { id: 'much-smaller', label: 'much smaller', ratio: 0.1 },
] as const
export type SizeChoiceId = (typeof SIZE_CHOICES)[number]['id']

// The real answer: which button is nearest on a log scale to the calculated ratio (about 0.79).
export function sizeAnswer(): SizeChoiceId {
  const real = Math.log(calculatedSizeRatio())
  let best: (typeof SIZE_CHOICES)[number] = SIZE_CHOICES[0]
  for (const c of SIZE_CHOICES) {
    if (Math.abs(Math.log(c.ratio) - real) < Math.abs(Math.log(best.ratio) - real)) best = c
  }
  return best.id
}

export function sizeChoiceRatio(id: SizeChoiceId): number {
  const c = SIZE_CHOICES.find((s) => s.id === id)
  if (!c) throw new RangeError('Unknown size choice.')
  return c.ratio
}

// The tutor's mark (§12, §13): used in the explanation only.
export function sizeGuessResult(id: SizeChoiceId): 'matched' | 'not matched' {
  return id === sizeAnswer() ? 'matched' : 'not matched'
}

// Prediction 2: how many times wider than the horizon the shadow is. Six buttons balanced about 2.6 on a log scale.
export const HORIZON_CHOICES = [1, 1.5, 2, 3, 5, 10] as const
export type HorizonChoice = (typeof HORIZON_CHOICES)[number]

export function horizonAnswer(): HorizonChoice {
  const real = Math.log(shadowOverHorizon())
  let best: HorizonChoice = HORIZON_CHOICES[0]
  for (const c of HORIZON_CHOICES) {
    if (Math.abs(Math.log(c) - real) < Math.abs(Math.log(best) - real)) best = c
  }
  return best
}

export function horizonGuessResult(choice: HorizonChoice): 'matched' | 'not matched' {
  return choice === horizonAnswer() ? 'matched' : 'not matched'
}

// A guess drawn as a shadow: its diameter in km for a given mass, if the shadow were `times` the horizon's width.
export function guessShadowDiameterKm(massSolar: number, times: number): number {
  checkPositive(times, 'The guess')
  return times * 2 * horizonRadiusKm(massSolar)
}

// ---- Picture 1 (Step 5): both black holes on one angular scale, and the ratio ruler for Prediction 1's guess ----

// Picture 1's panel A runs from 0 to this many millionths of an arcsecond across; a bar of PICTURE_ONE_BAR_MICROARCSEC is drawn as a scale.
export const PICTURE_ONE_AXIS_MAX_MICROARCSEC = 60
export const PICTURE_ONE_BAR_MICROARCSEC = 10

// The horizon's angular width in the sky (its diameter, 2 r_s, over the distance).
export function horizonAngleMicroarcsec(massSolar: number, distancePc: number): number {
  checkPositive(distancePc, 'The distance')
  return angularSizeMicroarcsec(2 * horizonRadiusKm(massSolar), distancePc * KM_PER_PARSEC)
}

export interface PictureOneRow {
  id: RealBlackHole['id']
  name: string
  massSolar: number
  distancePc: number
  horizonMicroarcsec: number // calculated here
  shadowMicroarcsec: number // calculated here
  ringMicroarcsec: number // measured
  ringUncertainty: number // measured
}

export interface PictureOne {
  axisMaxMicroarcsec: number
  barMicroarcsec: number
  // Sagittarius A* first, then M87* (the ratio is M87* over Sagittarius A*).
  rows: [PictureOneRow, PictureOneRow]
  calculatedRatio: number
  measuredRatio: number
}

export function pictureOne(): PictureOne {
  const row = (bh: RealBlackHole): PictureOneRow => ({
    id: bh.id,
    name: bh.name,
    massSolar: bh.massSolar,
    distancePc: bh.distancePc,
    horizonMicroarcsec: horizonAngleMicroarcsec(bh.massSolar, bh.distancePc),
    shadowMicroarcsec: realShadowMicroarcsec(bh),
    ringMicroarcsec: bh.ringMicroarcsec,
    ringUncertainty: bh.ringUncertainty,
  })
  return {
    axisMaxMicroarcsec: PICTURE_ONE_AXIS_MAX_MICROARCSEC,
    barMicroarcsec: PICTURE_ONE_BAR_MICROARCSEC,
    rows: [row(SGR_A_STAR), row(M87_STAR)],
    calculatedRatio: calculatedSizeRatio(),
    measuredRatio: measuredSizeRatio(),
  }
}

// Panel B's ruler is a log scale from 0.1 to 10: a ratio of 1 is in the middle, each step to the right multiplies.
export const RATIO_RULER_MIN = 0.1
export const RATIO_RULER_MAX = 10

// Where a ratio sits on the ruler, from 0 (left end) to 1 (right end).
export function ratioRulerPosition(ratio: number): number {
  checkPositive(ratio, 'The ratio')
  const pos = (Math.log10(ratio) - Math.log10(RATIO_RULER_MIN)) / (Math.log10(RATIO_RULER_MAX) - Math.log10(RATIO_RULER_MIN))
  return Math.min(1, Math.max(0, pos))
}

// Prediction 1's guess as a ratio and as a place on the ruler (a marker only: the guess has its own size in the sky, but the picture compares ratios).
export function sizeGuessMarker(id: SizeChoiceId): { ratio: number; position: number } {
  const ratio = sizeChoiceRatio(id)
  return { ratio, position: ratioRulerPosition(ratio) }
}

// ---- Picture 2 (Step 5b): beams of light past one black hole, the capture limit, and Prediction 2's guess ----

// The beams drawn: aims in horizon radii (r_s = 1), three below the capture limit (2.598) and four above it. They are imagined for the picture.
export const PICTURE_TWO_BEAM_AIMS = [1.5, 2, 2.5, 2.7, 3.2, 4, 6] as const
// The picture's view runs out to this many horizon radii from the centre (enough for the biggest guess, 10 times as wide).
export const PICTURE_TWO_VIEW_RADIUS = 11

export interface PictureTwoBeam {
  aim: number
  outcome: 'captured' | 'escapes'
  bendDegrees: number | null // the total bend if it escapes
  // The part of the path inside the view, in horizon radii, seen from above with the light coming in from the right.
  points: Array<{ x: number; y: number }>
}

export interface PictureTwo {
  viewRadius: number
  horizonRadius: 1
  shadowRadius: number // the capture limit, in horizon radii
  shadowOverHorizon: number
  beams: PictureTwoBeam[]
}

function beamInView(aim: number): PictureTwoBeam {
  const path = lightPath(aim)
  let first = path.points.findIndex((p) => p.distanceInHorizonRadii <= PICTURE_TWO_VIEW_RADIUS)
  if (first < 0) first = path.points.length - 1
  let last = path.points.length - 1
  while (last > first && path.points[last].distanceInHorizonRadii > PICTURE_TWO_VIEW_RADIUS) last--
  first = Math.max(first - 1, 0)
  const points: Array<{ x: number; y: number }> = []
  for (let i = first; i <= last; i += 3) points.push({ x: path.points[i].x, y: path.points[i].y })
  points.push({ x: path.points[last].x, y: path.points[last].y })
  return {
    aim,
    outcome: path.outcome,
    bendDegrees: path.bendRadians === null ? null : (path.bendRadians * 180) / Math.PI,
    points,
  }
}

export function pictureTwo(): PictureTwo {
  return {
    viewRadius: PICTURE_TWO_VIEW_RADIUS,
    horizonRadius: 1,
    shadowRadius: CRITICAL_AIM_IN_HORIZON_RADII,
    shadowOverHorizon: shadowOverHorizon(),
    beams: PICTURE_TWO_BEAM_AIMS.map(beamInView),
  }
}

// Prediction 2's guess as a circle round the same centre: if the dark patch is `times` as wide as the edge, its radius is `times` horizon radii.
export function horizonGuessMarker(choice: HorizonChoice): { times: number; radiusInHorizonRadii: number } {
  return { times: choice, radiusInHorizonRadii: choice }
}

// ---- Part 2 (Step 6): "Now try it yourself" — a trial black hole's shadow, on a ruler of angles (trial values, not real black holes) ----

// The buttons: masses in Suns and distances in parsecs. Two of each are the real black holes' own values (Sagittarius A* and M87*); the others are between.
export const TRIAL_MASS_CHOICES_SOLAR = [4e6, 1e8, 1e9, 6.5e9] as const
export const TRIAL_DISTANCE_CHOICES_PC = [8150, 100000, 1e6, 16.8e6] as const

// Drawing A's ruler of angles runs from 0.01 to 100,000 millionths of an arcsecond, going up in steps of ten. It holds every trial the buttons can give
// (the smallest is about 0.02 and the largest about 82,000).
export const TRIAL_RULER_MIN_MICROARCSEC = 0.01
export const TRIAL_RULER_MAX_MICROARCSEC = 1e5

// Where an angle sits on Drawing A's ruler, from 0 (left end) to 1 (right end).
export function trialRulerPosition(microarcsec: number): number {
  checkPositive(microarcsec, 'The angle')
  const lo = Math.log10(TRIAL_RULER_MIN_MICROARCSEC)
  const hi = Math.log10(TRIAL_RULER_MAX_MICROARCSEC)
  return Math.min(1, Math.max(0, (Math.log10(microarcsec) - lo) / (hi - lo)))
}

export interface TrialRealMark {
  id: RealBlackHole['id']
  name: string
  shadowMicroarcsec: number // calculated here
  position: number
}

export interface TrialPicture {
  massSolar: number
  distancePc: number
  horizonMicroarcsec: number // calculated here
  shadowMicroarcsec: number // calculated here
  horizonPosition: number
  shadowPosition: number
  // The trial shadow's angle divided by each real black hole's calculated shadow angle.
  shadowOverSgrA: number
  shadowOverM87: number
  // The trial's mass and distance divided by Sagittarius A*'s.
  massOverSgrA: number
  distanceOverSgrA: number
  // The real black holes' calculated shadows, for comparison; they do not move with the controls.
  realMarks: [TrialRealMark, TrialRealMark]
  // The real black hole whose mass and distance both equal the trial's, or null.
  sameAs: RealBlackHole['id'] | null
}

export function trialPicture(massSolar: number, distancePc: number): TrialPicture {
  const shadow = shadowAngleMicroarcsec(massSolar, distancePc)
  const horizon = horizonAngleMicroarcsec(massSolar, distancePc)
  const mark = (bh: RealBlackHole): TrialRealMark => {
    const s = realShadowMicroarcsec(bh)
    return { id: bh.id, name: bh.name, shadowMicroarcsec: s, position: trialRulerPosition(s) }
  }
  const same = REAL_BLACK_HOLES.find((bh) => bh.massSolar === massSolar && bh.distancePc === distancePc)
  return {
    massSolar,
    distancePc,
    horizonMicroarcsec: horizon,
    shadowMicroarcsec: shadow,
    horizonPosition: trialRulerPosition(horizon),
    shadowPosition: trialRulerPosition(shadow),
    shadowOverSgrA: shadow / realShadowMicroarcsec(SGR_A_STAR),
    shadowOverM87: shadow / realShadowMicroarcsec(M87_STAR),
    massOverSgrA: massSolar / SGR_A_STAR.massSolar,
    distanceOverSgrA: distancePc / SGR_A_STAR.distancePc,
    realMarks: [mark(SGR_A_STAR), mark(M87_STAR)],
    sameAs: same ? same.id : null,
  }
}

// ---- Part 3 (Step 7): the results ----
// Every number the results tables show comes from here (CLAUDE.md §9, §14 "Reading the Results"). Nothing is marked right or wrong.

export type CheckUpId = 'sgrA' | 'm87-2019' | 'm87-later'

export interface CheckUpRow {
  id: CheckUpId
  blackHole: RealBlackHole
  ringLabel: string
  comparison: Comparison
}

// Calculated shadow against measured ring, for Sagittarius A*, M87* (the 2019 ring) and M87* (the later ring of 2017, 2018 and 2021 together).
export function checkUpRows(): CheckUpRow[] {
  return [
    { id: 'sgrA', blackHole: SGR_A_STAR, ringLabel: '2022 ring', comparison: checkRealBlackHole(SGR_A_STAR) },
    { id: 'm87-2019', blackHole: M87_STAR, ringLabel: '2019 ring', comparison: checkRealBlackHole(M87_STAR) },
    { id: 'm87-later', blackHole: M87_STAR, ringLabel: '2017 to 2021 ring', comparison: checkRealBlackHole(M87_STAR, true) },
  ]
}

// Which side of the measured ring the calculated shadow falls, and whether it is inside the measurement's give-or-take. No cut-off is invented.
export function readingOf(c: Comparison): { side: 'smaller' | 'larger' | 'equal'; withinOneGiveOrTake: boolean } {
  return {
    side: c.differenceMicroarcsec < 0 ? 'smaller' : c.differenceMicroarcsec > 0 ? 'larger' : 'equal',
    withinOneGiveOrTake: c.withinOneUncertainty,
  }
}

export interface RatioRow {
  calculated: number // M87*'s calculated shadow over Sagittarius A*'s
  measured2019: number // the rings, with the 2019 M87* ring
  measuredLater: number // the rings, with the later M87* ring
}

export function ratioRow(): RatioRow {
  return { calculated: calculatedSizeRatio(), measured2019: measuredSizeRatio(false), measuredLater: measuredSizeRatio(true) }
}

export interface FromMassRow {
  id: RealBlackHole['id']
  name: string
  massSolar: number
  distancePc: number
  horizonRadiusKm: number
  shadowDiameterKm: number
  shadowOverHorizon: number
  shadowMicroarcsec: number
}

// Table 2: from mass and distance to an angle in the sky, step by step. Sagittarius A* first, then M87*.
export function fromMassRows(): FromMassRow[] {
  return [SGR_A_STAR, M87_STAR].map((bh) => ({
    id: bh.id,
    name: bh.name,
    massSolar: bh.massSolar,
    distancePc: bh.distancePc,
    horizonRadiusKm: horizonRadiusKm(bh.massSolar),
    shadowDiameterKm: shadowDiameterKm(bh.massSolar),
    shadowOverHorizon: shadowDiameterKm(bh.massSolar) / (2 * horizonRadiusKm(bh.massSolar)),
    shadowMicroarcsec: realShadowMicroarcsec(bh),
  }))
}

export interface ShadowRange {
  id: RealBlackHole['id']
  name: string
  centre: number
  // Only the mass at its low and high ends (distance at its published value), then only the distance, then both together (a simple low-to-high range, not a statistical combination).
  massOnly: { low: number; high: number }
  distanceOnly: { low: number; high: number }
  both: { low: number; high: number }
}

// Table 3: how sure the calculated shadow is. The published give-or-takes on the mass and the distance carried through the same formula.
// The heaviest and nearest values give the widest shadow; the lightest and farthest give the narrowest.
export function shadowRange(bh: RealBlackHole): ShadowRange {
  const mLow = bh.massSolar - bh.massMinus
  const mHigh = bh.massSolar + bh.massPlus
  const dLow = bh.distancePc - bh.distanceMinus
  const dHigh = bh.distancePc + bh.distancePlus
  return {
    id: bh.id,
    name: bh.name,
    centre: realShadowMicroarcsec(bh),
    massOnly: { low: shadowAngleMicroarcsec(mLow, bh.distancePc), high: shadowAngleMicroarcsec(mHigh, bh.distancePc) },
    distanceOnly: { low: shadowAngleMicroarcsec(bh.massSolar, dHigh), high: shadowAngleMicroarcsec(bh.massSolar, dLow) },
    both: { low: shadowAngleMicroarcsec(mLow, dHigh), high: shadowAngleMicroarcsec(mHigh, dLow) },
  }
}

// Whether a measured ring (its value) lies inside a range, and how far from the nearest end if not.
export function rangeContains(range: { low: number; high: number }, value: number): { inside: boolean; outsideBy: number } {
  if (value < range.low) return { inside: false, outsideBy: range.low - value }
  if (value > range.high) return { inside: false, outsideBy: value - range.high }
  return { inside: true, outsideBy: 0 }
}

export interface RangeRow {
  checkUp: CheckUpRow
  range: ShadowRange
  ringInsideBoth: boolean
}

// Each check-up row against the calculated shadow's own range.
export function rangeRows(): RangeRow[] {
  return checkUpRows().map((row) => {
    const range = shadowRange(row.blackHole)
    return { checkUp: row, range, ringInsideBoth: rangeContains(range.both, row.comparison.measured).inside }
  })
}

// The learner's two guesses, as numbers to show beside the results (a guess only; nothing is marked), with the real value in the same units.
export function predictionsBeside(size: SizeChoiceId, horizon: HorizonChoice) {
  return {
    sizeGuessRatio: sizeChoiceRatio(size),
    sizeRealRatio: calculatedSizeRatio(),
    horizonGuessTimes: horizon as number,
    horizonRealTimes: shadowOverHorizon(),
  }
}
