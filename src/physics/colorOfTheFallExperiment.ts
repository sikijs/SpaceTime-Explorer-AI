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
// no physics of its own (CLAUDE.md §9): E, the square roots in the formula, the stretch factor and the wavelength.
export interface StretchFactorSteps {
  energy: number // E = sqrt(1 - 1/r0)
  speedTerm: number // sqrt(1/r - 1/r0)
  rootGravity: number // sqrt(1 - 1/r)
  stretch: number // (E + speedTerm) / rootGravity^2
  wavelengthNm: number // the lamp's wavelength times the stretch factor
}

export function stretchFactorSteps(startInHorizonRadii: number, rInHorizonRadii: number): StretchFactorSteps {
  checkBetween(startInHorizonRadii, rInHorizonRadii)
  const energy = Math.sqrt(1 - 1 / startInHorizonRadii)
  const speedTerm = Math.sqrt(1 / rInHorizonRadii - 1 / startInHorizonRadii)
  const rootGravity = Math.sqrt(1 - 1 / rInHorizonRadii)
  const stretch = (energy + speedTerm) / (1 - 1 / rInHorizonRadii)
  return { energy, speedTerm, rootGravity, stretch, wavelengthNm: LAMP_WAVELENGTH_NM * stretch }
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
