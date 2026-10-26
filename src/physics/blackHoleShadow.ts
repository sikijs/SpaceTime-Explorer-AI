// Frontier and Beyond, Experiment 21: can we photograph a black hole's shadow? (Event Horizon Telescope)
// See docs/experiments/frontier-and-beyond/21-black-hole-shadow.md, "Physics Model".
//
// One formula, given and not derived (Black Holes 4): light aimed closer than 3 sqrt(3) / 2 horizon radii is captured, so the
// ideal shadow of a non-spinning black hole is a disc of diameter 2 x (3 sqrt(3) / 2) x r_s = 6 sqrt(3) G M / c^2. Its angle in the
// sky is that diameter divided by the distance. The module does not model the glowing gas, the effect of spin on the shadow,
// the EHT's calibration between ring and shadow, or the telescope. The published ring sizes are data.
// This module imports only the Black Holes 1 and Black Holes 4 modules.

import { horizonRadiusKm } from './blackHoleSizeExperiment'
import { CRITICAL_AIM_IN_HORIZON_RADII } from './lightNearBlackHoleExperiment'

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
