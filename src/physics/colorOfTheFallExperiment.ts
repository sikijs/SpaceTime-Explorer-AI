import { OBJECT_PRESETS, horizonRadiusKm } from './blackHoleSizeExperiment'
import type { ObjectPreset } from './blackHoleSizeExperiment'

// A small traveler released from rest at a distance r0 from a non-rotating, uncharged black hole, falling straight in
// (as in Experiments 5 and 6), carrying a lamp that shines a steady beam of green light straight outward. An observer at
// rest, very far away, receives the light. Distances are in horizon radii (r_s = 1). With E = sqrt(1 - 1/r0):
//   the stretch factor (Experiment 6):  1 + z = [E + sqrt(1/r - 1/r0)] / (1 - 1/r) = gravity part x motion part
//   the received wavelength:            lambda_received = lambda_emitted x (1 + z)
// The crests of a light wave behave like Experiment 6's flashes: the lamp sends one crest at equal steps of its own
// period, they arrive stretched apart by the same factor, and the wavelength is the speed of light times the time between
// crests. This is standard general relativity for this case and is given, not derived. The stretch factor is restated
// here, not imported from Experiment 6.

export const MIN_START_IN_HORIZON_RADII = 2
export const MAX_START_IN_HORIZON_RADII = 100
export const LAMP_WAVELENGTH_NM = 550 // green
// Where the graph ends, as in Experiment 6, because the stretch factor and the wavelength have no limit.
export const SMALLEST_GAP_IN_HORIZON_RADII = 0.0001
// The speed of light (exact in the SI definition of the meter), for the period of the light.
const SPEED_OF_LIGHT_KM_PER_S = 299_792.458
const NM_PER_KM = 1e12
const CURVE_POINTS = 161

// The three black holes only (Experiment 1's presets that have no real radius).
export const BLACK_HOLE_PRESETS: ObjectPreset[] = OBJECT_PRESETS.filter((p) => p.realRadiusKm === null)

export type BandName = 'ultraviolet' | 'visible' | 'infrared' | 'microwave' | 'radio'

// The usual ranges of light, in nm. General knowledge, not checked against a primary source; the edges are conventions.
// Each range includes its lower edge, except that the visible range also includes 750 nm, its upper edge.
export const BANDS: Array<{ name: BandName; fromNm: number; toNm: number }> = [
  { name: 'ultraviolet', fromNm: 10, toNm: 380 },
  { name: 'visible', fromNm: 380, toNm: 750 },
  { name: 'infrared', fromNm: 750, toNm: 1e6 }, // up to 1 millimeter
  { name: 'microwave', fromNm: 1e6, toNm: 1e9 }, // 1 millimeter up to 1 meter
  { name: 'radio', fromNm: 1e9, toNm: Infinity }, // 1 meter and longer
]

function checkWavelength(wavelengthNm: number) {
  if (!Number.isFinite(wavelengthNm) || !(wavelengthNm > 0)) {
    throw new RangeError('The wavelength must be a positive, finite number of nanometers.')
  }
}

export function bandOf(wavelengthNm: number): BandName {
  checkWavelength(wavelengthNm)
  if (wavelengthNm < 380) return 'ultraviolet'
  if (wavelengthNm <= 750) return 'visible'
  if (wavelengthNm < 1e6) return 'infrared'
  if (wavelengthNm < 1e9) return 'microwave'
  return 'radio'
}

function checkStart(startInHorizonRadii: number) {
  if (!Number.isFinite(startInHorizonRadii) || !(startInHorizonRadii > 1)) {
    throw new RangeError('The release distance must be a finite distance outside the horizon (more than 1 horizon radius).')
  }
}

function checkBetween(startInHorizonRadii: number, rInHorizonRadii: number) {
  checkStart(startInHorizonRadii)
  if (!Number.isFinite(rInHorizonRadii) || !(rInHorizonRadii > 1)) {
    throw new RangeError('The distance must be outside the horizon (more than 1 horizon radius).')
  }
  if (rInHorizonRadii > startInHorizonRadii) {
    throw new RangeError('The distance must be no more than the release distance.')
  }
}

// How much the gap between two arriving flashes (and the distance between two arriving crests) is stretched, restated
// from Experiment 6. sqrt(1/r - 1/r0) is 0 at the release point and never negative, because r is checked to be at most r0.
export function stretchFactor(startInHorizonRadii: number, rInHorizonRadii: number): number {
  checkBetween(startInHorizonRadii, rInHorizonRadii)
  const energy = Math.sqrt(1 - 1 / startInHorizonRadii)
  const speedTerm = Math.sqrt(1 / rInHorizonRadii - 1 / startInHorizonRadii)
  return (energy + speedTerm) / (1 - 1 / rInHorizonRadii)
}

// The pieces of the stretch factor at one distance, for the worked calculation shown to the learner, so the screen does
// no physics of its own (CLAUDE.md §9): E, the square roots in the formula, the two parts of the stretch factor (gravity
// slowing the traveler's clock, as in Experiment 2, and the traveler moving away) and the wavelength.
export interface StretchFactorSteps {
  energy: number // E = sqrt(1 - 1/r0)
  speedTerm: number // sqrt(1/r - 1/r0)
  rootGravity: number // sqrt(1 - 1/r)
  gravity: number // gravity part = 1 / rootGravity
  motion: number // motion part = (E + speedTerm) / rootGravity
  stretch: number // gravity part x motion part = (E + speedTerm) / rootGravity^2
  wavelengthNm: number // the lamp's wavelength times the stretch factor
}

export function stretchFactorSteps(startInHorizonRadii: number, rInHorizonRadii: number): StretchFactorSteps {
  checkBetween(startInHorizonRadii, rInHorizonRadii)
  const energy = Math.sqrt(1 - 1 / startInHorizonRadii)
  const speedTerm = Math.sqrt(1 / rInHorizonRadii - 1 / startInHorizonRadii)
  const rootGravity = Math.sqrt(1 - 1 / rInHorizonRadii)
  const stretch = (energy + speedTerm) / (1 - 1 / rInHorizonRadii)
  return {
    energy,
    speedTerm,
    rootGravity,
    gravity: 1 / rootGravity,
    motion: (energy + speedTerm) / rootGravity,
    stretch,
    wavelengthNm: LAMP_WAVELENGTH_NM * stretch,
  }
}

// The wavelength the observer receives from the lamp when the traveler is at r.
export function receivedWavelengthNm(startInHorizonRadii: number, rInHorizonRadii: number): number {
  return LAMP_WAVELENGTH_NM * stretchFactor(startInHorizonRadii, rInHorizonRadii)
}

// The time between two crests of light of this wavelength, in seconds: the wavelength divided by the speed of light.
export function lightPeriodSeconds(wavelengthNm: number): number {
  checkWavelength(wavelengthNm)
  return wavelengthNm / NM_PER_KM / SPEED_OF_LIGHT_KM_PER_S
}

// The gap above the horizon, in horizon radii, at which the received wavelength first passes the given value, or null if
// it already does at the release. Found by bisection in the gap (the wavelength only grows as the gap shrinks).
function gapWherePasses(startInHorizonRadii: number, wavelengthNm: number): number | null {
  checkStart(startInHorizonRadii)
  checkWavelength(wavelengthNm)
  if (receivedWavelengthNm(startInHorizonRadii, startInHorizonRadii) >= wavelengthNm) return null
  let near = 0
  let far = startInHorizonRadii - 1
  for (let i = 0; i < 300; i++) {
    const middle = (near + far) / 2
    if (middle === near || middle === far) break
    if (receivedWavelengthNm(startInHorizonRadii, 1 + middle) > wavelengthNm) near = middle
    else far = middle
  }
  return (near + far) / 2
}

// The distance from the center, in horizon radii, at which the received wavelength first passes the given value, or null
// if it already does at the release.
export function distanceWhereWavelengthPasses(startInHorizonRadii: number, wavelengthNm: number): number | null {
  const gap = gapWherePasses(startInHorizonRadii, wavelengthNm)
  return gap === null ? null : 1 + gap
}

export interface CurvePoint {
  gap: number // distance above the horizon, in horizon radii
  stretch: number
  wavelengthNm: number
  band: BandName
}

export interface ColorOfTheFallResult {
  preset: ObjectPreset
  horizonRadiusKm: number
  startInHorizonRadii: number
  wavelengthAtReleaseNm: number
  leavesVisibleAt: number | null // distance from the center, horizon radii; null if already past at the release
  becomesMicrowaveAtGap: number // gap above the horizon, horizon radii
  // From the release to SMALLEST_GAP above the horizon, spaced geometrically in the gap, for the graph.
  curve: CurvePoint[]
}

export function runColorOfTheFallExperiment(presetId: ObjectPreset['id'], startInHorizonRadii: number): ColorOfTheFallResult {
  const preset = BLACK_HOLE_PRESETS.find((p) => p.id === presetId)
  if (!preset) throw new Error(`Unknown black hole: ${presetId}`)
  if (!(startInHorizonRadii >= MIN_START_IN_HORIZON_RADII && startInHorizonRadii <= MAX_START_IN_HORIZON_RADII)) {
    throw new RangeError(
      `The release distance must be between ${MIN_START_IN_HORIZON_RADII} and ${MAX_START_IN_HORIZON_RADII} horizon radii.`,
    )
  }

  const widest = startInHorizonRadii - 1
  const curve: CurvePoint[] = []
  for (let i = 0; i < CURVE_POINTS; i++) {
    const gap = SMALLEST_GAP_IN_HORIZON_RADII * (widest / SMALLEST_GAP_IN_HORIZON_RADII) ** (1 - i / (CURVE_POINTS - 1))
    const r = Math.min(1 + gap, startInHorizonRadii) // the widest gap is the release itself; rounding must not pass it
    const wavelengthNm = receivedWavelengthNm(startInHorizonRadii, r)
    curve.push({ gap, stretch: stretchFactor(startInHorizonRadii, r), wavelengthNm, band: bandOf(wavelengthNm) })
  }

  // The wavelength at release is at most 1.42 times the lamp's (a release at 2), so it never starts as microwave and the
  // gap is always found; the fallback only keeps the type simple.
  const microwaveGap = gapWherePasses(startInHorizonRadii, 1e6)
  return {
    preset,
    horizonRadiusKm: horizonRadiusKm(preset.massSolarMasses),
    startInHorizonRadii,
    wavelengthAtReleaseNm: receivedWavelengthNm(startInHorizonRadii, startInHorizonRadii),
    leavesVisibleAt: distanceWhereWavelengthPasses(startInHorizonRadii, 750),
    becomesMicrowaveAtGap: microwaveGap ?? widest,
    curve,
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Audit update (2026-11-18): the fixed Part 1 fall, the learner's guess markers and their marking, the check-up, and the
// numbers the interface used to compute or type itself. New functions only; everything above is unchanged.
// (docs/audit/black-holes-and-strong-gravity/07-draft-wording.md)
// ---------------------------------------------------------------------------------------------------------------

export const PART_ONE_BLACK_HOLE_ID: ObjectPreset['id'] = 'stellar-black-hole'
export const PART_ONE_START_IN_HORIZON_RADII = 10
// The distance from the center, in horizon radii, at which guess 3's two columns are compared.
export const MASS_PANEL_DISTANCE_IN_HORIZON_RADII = 5

let partOneCache: ColorOfTheFallResult | null = null
export function runPartOne(): ColorOfTheFallResult {
  if (!partOneCache) partOneCache = runColorOfTheFallExperiment(PART_ONE_BLACK_HOLE_ID, PART_ONE_START_IN_HORIZON_RADII)
  return partOneCache
}

// The page's own marking limit for "stays green" and "does not matter" (a limit of the marking, not of the physics: the
// real fall is nowhere near it): within this percent.
export const SAME_WITHIN_PERCENT = 1
// The page's own marking limit for "very close to the horizon" (guess 2): the traveler is within this many horizon radii
// of the horizon. A limit of the marking, not of the physics.
export const NEAR_THE_HORIZON_WITHIN_HORIZON_RADII = 1

// The curve's last point, nearest the horizon (the right-hand end of Picture 2).
export function curveEnd(result: ColorOfTheFallResult = runPartOne()): CurvePoint {
  return result.curve[result.curve.length - 1]
}

// ---- Guess 1: what happens to the color the observer receives? ----
export type ColorChoice = 'same' | 'bluer' | 'limit' | 'no-limit'
// The wavelength gained over the last tenfold closing of the gap (0.001 to 0.0001), found from the curve's own points.
function lastTenfoldRatio(result: ColorOfTheFallResult): number {
  const end = curveEnd(result)
  const earlier = receivedWavelengthNm(result.startInHorizonRadii, 1 + end.gap * 10)
  return end.wavelengthNm / earlier
}
// "Stays green" if the received wavelength at the nearest end is within SAME_WITHIN_PERCENT of the lamp's; "bluer" if it is
// shorter; "redder with no limit" if it is still growing at that end, by more than SAME_WITHIN_PERCENT over the last
// tenfold closing; otherwise "redder, but only up to a point".
export function modelColorAnswer(result: ColorOfTheFallResult = runPartOne()): ColorChoice {
  const end = curveEnd(result)
  if (Math.abs(end.wavelengthNm / LAMP_WAVELENGTH_NM - 1) * 100 <= SAME_WITHIN_PERCENT) return 'same'
  if (end.wavelengthNm < LAMP_WAVELENGTH_NM) return 'bluer'
  return (lastTenfoldRatio(result) - 1) * 100 > SAME_WITHIN_PERCENT ? 'no-limit' : 'limit'
}
export function colorGuessIsModelAnswer(guess: ColorChoice): boolean {
  return guess === modelColorAnswer()
}
// A marker on the color strip (and at the right-hand end of the curve on Picture 2): a place, not a size.
export type ColorMarker = { kind: 'at-lamp' } | { kind: 'left-of-lamp' } | { kind: 'stop-bar' } | { kind: 'arrow-to-right-edge' }
export function colorGuessMarker(guess: ColorChoice): ColorMarker {
  return guess === 'same'
    ? { kind: 'at-lamp' }
    : guess === 'bluer'
      ? { kind: 'left-of-lamp' }
      : guess === 'limit'
        ? { kind: 'stop-bar' }
        : { kind: 'arrow-to-right-edge' }
}

// ---- Guess 2: does the light stay visible to the horizon? ----
export type VisibleChoice = 'all-the-way' | 'near-horizon' | 'well-before'
// "All the way" if the wavelength is still 750 nm or shorter at the nearest end; "well before the horizon" if it passes
// 750 nm more than NEAR_THE_HORIZON_WITHIN_HORIZON_RADII above the horizon (or is already past at the release); otherwise
// "until very close".
export function modelVisibleAnswer(result: ColorOfTheFallResult = runPartOne()): VisibleChoice {
  if (curveEnd(result).wavelengthNm <= 750) return 'all-the-way'
  if (result.leavesVisibleAt === null) return 'well-before'
  return result.leavesVisibleAt - 1 > NEAR_THE_HORIZON_WITHIN_HORIZON_RADII ? 'well-before' : 'near-horizon'
}
export function visibleGuessIsModelAnswer(guess: VisibleChoice): boolean {
  return guess === modelVisibleAnswer()
}
// A marker on Picture 2 at the 750 nm line, along the gap axis: at the right-hand end, near it, or in the left half.
export type VisibleMarker = { kind: 'right-end' } | { kind: 'near-right-end' } | { kind: 'left-half' }
export function visibleGuessMarker(guess: VisibleChoice): VisibleMarker {
  return guess === 'all-the-way' ? { kind: 'right-end' } : guess === 'near-horizon' ? { kind: 'near-right-end' } : { kind: 'left-half' }
}

// ---- Guess 3: is the color at 5 horizon radii different for a 10-Sun black hole and M87*? ----
export type MassChoice = 'small' | 'big' | 'same'
export interface MassColumn {
  presetId: ObjectPreset['id']
  wavelengthNm: number
  distanceKm: number // 5 horizon radii, in kilometers for this black hole
}
// The two columns of Picture 2's small panel. The wavelength is found for each black hole's own run, at the same
// distance in horizon radii; only the distance in kilometers differs.
export function massPanelColumns(): MassColumn[] {
  return ['stellar-black-hole', 'm87-star'].map((id) => {
    const run = runColorOfTheFallExperiment(id as ObjectPreset['id'], PART_ONE_START_IN_HORIZON_RADII)
    return {
      presetId: run.preset.id,
      wavelengthNm: receivedWavelengthNm(run.startInHorizonRadii, MASS_PANEL_DISTANCE_IN_HORIZON_RADII),
      distanceKm: MASS_PANEL_DISTANCE_IN_HORIZON_RADII * run.horizonRadiusKm,
    }
  })
}
// "The same" if the two columns are within SAME_WITHIN_PERCENT of each other; otherwise the one with the longer
// wavelength ("small" is the 10-Sun black hole, "big" is M87*).
export function massAnswerFromWavelengths(smallNm: number, bigNm: number): MassChoice {
  if (Math.abs(smallNm / bigNm - 1) * 100 <= SAME_WITHIN_PERCENT) return 'same'
  return smallNm > bigNm ? 'small' : 'big'
}
export function modelMassAnswer(): MassChoice {
  const [small, big] = massPanelColumns()
  return massAnswerFromWavelengths(small.wavelengthNm, big.wavelengthNm)
}
export function massGuessIsModelAnswer(guess: MassChoice): boolean {
  return guess === modelMassAnswer()
}
// The mark in the small panel: joined to both columns, to the small-hole column, or to the big-hole column.
export type MassMarker = { target: 'both-columns' } | { target: 'small-column' } | { target: 'big-column' }
export function massGuessMarker(guess: MassChoice): MassMarker {
  return guess === 'same' ? { target: 'both-columns' } : guess === 'small' ? { target: 'small-column' } : { target: 'big-column' }
}

// ---- a plain reading of one number against a reference; no cut-offs ----
export type Reading = 'the same' | 'more' | 'less'
export function readAgainstRounded(found: number, reference: number, significantFigures: number): Reading {
  const round = (x: number) => Number(x.toPrecision(significantFigures))
  if (round(found) === round(reference)) return 'the same'
  return found > reference ? 'more' : 'less'
}
export function percentAbove(found: number, reference: number): number {
  return (found / reference - 1) * 100
}

// ---- the worked calculation and the near-horizon readings ----
// The worked wavelength is shown at 5 horizon radii, or halfway down the gap when the release is at 5 or nearer.
export function workedDistance(startInHorizonRadii: number): number {
  checkStart(startInHorizonRadii)
  return startInHorizonRadii > MASS_PANEL_DISTANCE_IN_HORIZON_RADII ? MASS_PANEL_DISTANCE_IN_HORIZON_RADII : 1 + (startInHorizonRadii - 1) / 2
}
export function workedSteps(startInHorizonRadii: number): StretchFactorSteps {
  return stretchFactorSteps(startInHorizonRadii, workedDistance(startInHorizonRadii))
}

export const NEAR_HORIZON_GAPS = [0.01, 0.001, 0.0001] // horizon radii above the horizon
export interface NearHorizonReading {
  gap: number
  stretch: number
  wavelengthNm: number
  band: BandName
}
export function nearHorizonReadings(startInHorizonRadii: number): NearHorizonReading[] {
  return NEAR_HORIZON_GAPS.map((gap) => {
    const wavelengthNm = receivedWavelengthNm(startInHorizonRadii, 1 + gap)
    return { gap, stretch: stretchFactor(startInHorizonRadii, 1 + gap), wavelengthNm, band: bandOf(wavelengthNm) }
  })
}
// How many times longer the wavelength is at each tenfold closing of the gap (0.01 to 0.001, then 0.001 to 0.0001).
export function wavelengthRatiosPerTenfoldGap(startInHorizonRadii: number): number[] {
  const readings = nearHorizonReadings(startInHorizonRadii)
  return readings.slice(1).map((reading, i) => reading.wavelengthNm / readings[i].wavelengthNm)
}

// ---- Table 1: the check-up ----
export interface ColorCheckUpRow {
  what: string
  expected: number
  found: number
  unit: string
  reading: Reading
  // How far above the reference the found number is, in percent (not a cut-off, only the gap).
  percentAbove: number
}
// Each row's reference is a formula the calculation is built from, or a separate route to the same number; none is a measurement.
export function checkUpRows(): ColorCheckUpRow[] {
  const r0 = PART_ONE_START_IN_HORIZON_RADII
  const r = workedDistance(r0)
  const worked = workedSteps(r0)
  const direct = receivedWavelengthNm(r0, r)
  const stretchAtR = stretchFactor(r0, r)
  const periodRatio = lightPeriodSeconds(direct) / lightPeriodSeconds(LAMP_WAVELENGTH_NM)
  const atRelease = receivedWavelengthNm(r0, r0)
  const releaseFormula = LAMP_WAVELENGTH_NM / Math.sqrt(1 - 1 / r0)
  const tenfold = wavelengthRatiosPerTenfoldGap(r0)
  const lastRatio = tenfold[tenfold.length - 1]
  const found1 = LAMP_WAVELENGTH_NM * worked.gravity * worked.motion
  return [
    {
      what: `The wavelength at ${r} horizon radii: 550 nm × (gravity part × motion part) against the formula in one step`,
      expected: direct,
      found: found1,
      unit: 'nm',
      reading: readAgainstRounded(found1, direct, 6),
      percentAbove: percentAbove(found1, direct),
    },
    {
      what: `The period of the light at ${r} horizon radii, as received divided as sent, against the stretch factor`,
      expected: stretchAtR,
      found: periodRatio,
      unit: 'times',
      reading: readAgainstRounded(periodRatio, stretchAtR, 6),
      percentAbove: percentAbove(periodRatio, stretchAtR),
    },
    {
      what: 'The wavelength at the release: the formula against 550 nm ÷ √(1 − 1/r0) for a traveler not yet moving',
      expected: releaseFormula,
      found: atRelease,
      unit: 'nm',
      reading: readAgainstRounded(atRelease, releaseFormula, 6),
      percentAbove: percentAbove(atRelease, releaseFormula),
    },
    {
      what: 'Near the horizon: how many times longer the wavelength is when the gap above the horizon shrinks to a tenth (0.001 to 0.0001), against 10',
      expected: 10,
      found: lastRatio,
      unit: 'times',
      reading: readAgainstRounded(lastRatio, 10, 2),
      percentAbove: percentAbove(lastRatio, 10),
    },
  ]
}

// ---- Tables 2 and 3: a fall in one row ----
export interface ColorFallRow {
  presetId: ObjectPreset['id']
  startInHorizonRadii: number
  startKm: number
  wavelengthAtReleaseNm: number
  bandAtRelease: BandName
  leavesVisibleAt: number | null
  becomesMicrowaveAtGap: number
  nearHorizon: NearHorizonReading[]
  endWavelengthNm: number
  endBand: BandName
}
export function fallRow(result: ColorOfTheFallResult): ColorFallRow {
  const end = curveEnd(result)
  return {
    presetId: result.preset.id,
    startInHorizonRadii: result.startInHorizonRadii,
    startKm: result.startInHorizonRadii * result.horizonRadiusKm,
    wavelengthAtReleaseNm: result.wavelengthAtReleaseNm,
    bandAtRelease: bandOf(result.wavelengthAtReleaseNm),
    leavesVisibleAt: result.leavesVisibleAt,
    becomesMicrowaveAtGap: result.becomesMicrowaveAtGap,
    nearHorizon: nearHorizonReadings(result.startInHorizonRadii),
    endWavelengthNm: end.wavelengthNm,
    endBand: end.band,
  }
}
export function partOneRow(): ColorFallRow {
  return fallRow(runPartOne())
}
