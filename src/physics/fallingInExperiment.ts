import { OBJECT_PRESETS, horizonRadiusKm } from './blackHoleSizeExperiment'
import type { ObjectPreset } from './blackHoleSizeExperiment'
import { REAL_SPEED_OF_LIGHT_KM_PER_S } from './hubblesLawExperiment'

// A small traveler released from rest at a distance r0 from a non-rotating, uncharged black hole, falling straight in,
// in the exact theory of gravity. Distances are in horizon radii (r_s = 1) and times in horizon light-times (r_s / c, the
// time light takes to cross one horizon radius). With E = sqrt(1 - 1/r0) the clocks obey
//   traveler's clock:    d(tau)/dr = -1 / sqrt(1/r - 1/r0)
//   far-away clock:      dt/dr     = -E / ((1 - 1/r) sqrt(1/r - 1/r0))
// This is standard general relativity for this case and is given, not derived. The traveler's clock has a closed form
// (a cycloid): with cos(eta) = 2r/r0 - 1, tau = (r0^1.5 / 2) (eta + sin(eta)). The far-away clock is the time on a
// clock at rest far away when the traveler passes each distance (not when the light arrives); it is computed
// numerically and grows without limit as r approaches 1. The stretch across a body of length h along the line to the
// center is 2GM h / r^3, given (the same number as Newton's for this case); since r_s = 2GM/c^2 it is c^2 h / (r_s^2 r^3)
// with r in horizon radii, so no separate value of G is needed.

export const MIN_START_IN_HORIZON_RADII = 2
export const MAX_START_IN_HORIZON_RADII = 100
export const BODY_LENGTH_METERS = 2
export const GRAVITY_AT_EARTH_SURFACE = 9.80665 // m/s^2, for "in g"
// The far-away clock has no limit at the horizon, so it is followed only this far in.
export const FAR_CLOCK_CUTOFF_IN_HORIZON_RADII = 1.0001

// The numerical integration of the far-away clock: Simpson steps, evenly spaced in the logarithm of the distance of the
// parameter eta from its value at the horizon, where the integrand blows up.
const SIMPSON_INTERVALS = 4000
const CURVE_POINTS = 301
const STRETCH_CURVE_POINTS = 101

// The three black holes only (Experiment 1's presets that have no real radius).
export const BLACK_HOLE_PRESETS: ObjectPreset[] = OBJECT_PRESETS.filter((p) => p.realRadiusKm === null)

function checkStart(startInHorizonRadii: number) {
  if (!Number.isFinite(startInHorizonRadii) || !(startInHorizonRadii > 1)) {
    throw new RangeError('The release distance must be a finite distance outside the horizon (more than 1 horizon radius).')
  }
}

// The cycloid parameter at a distance r, for a fall from rest at r0.
const etaAt = (r0: number, r: number) => Math.acos(Math.min(1, Math.max(-1, (2 * r) / r0 - 1)))

// The traveler's clock at a distance r (horizon radii), in horizon light-times, for a fall from rest at r0. Closed form.
export function travelerClock(startInHorizonRadii: number, rInHorizonRadii: number): number {
  checkStart(startInHorizonRadii)
  if (!(rInHorizonRadii >= 1 && rInHorizonRadii <= startInHorizonRadii)) {
    throw new RangeError('The distance must be between the horizon (1) and the release distance.')
  }
  const eta = etaAt(startInHorizonRadii, rInHorizonRadii)
  return 0.5 * startInHorizonRadii ** 1.5 * (eta + Math.sin(eta))
}

// The far-away clock at the same moment, in horizon light-times. Requires r strictly outside the horizon: it has no
// limit as r approaches 1. In the parameter eta the integrand is smooth except at the horizon:
//   t = E * integral from 0 to eta(r) of  r0 cos(eta/2) sqrt(x) / (1 - 1/x) d(eta),   x = (r0/2)(1 + cos(eta)).
export function farAwayClock(startInHorizonRadii: number, rInHorizonRadii: number): number {
  checkStart(startInHorizonRadii)
  if (!(rInHorizonRadii > 1 && rInHorizonRadii <= startInHorizonRadii)) {
    throw new RangeError('The distance must be outside the horizon (more than 1) and no more than the release distance.')
  }
  const r0 = startInHorizonRadii
  const etaHorizon = etaAt(r0, 1)
  const etaEnd = etaAt(r0, rInHorizonRadii)
  if (etaEnd === 0) return 0

  const energy = Math.sqrt(1 - 1 / r0)
  const integrand = (eta: number) => {
    const x = (r0 / 2) * (1 + Math.cos(eta))
    return (r0 * Math.cos(eta / 2) * Math.sqrt(x)) / (1 - 1 / x)
  }

  // With w = eta_horizon - eta and u = ln(w), d(eta) = -w du, so the blow-up at the horizon is spread out evenly.
  const uStart = Math.log(etaHorizon) // eta = 0
  const uEnd = Math.log(etaHorizon - etaEnd)
  const step = (uEnd - uStart) / SIMPSON_INTERVALS
  const value = (u: number) => {
    const w = Math.exp(u)
    return integrand(etaHorizon - w) * w
  }
  let sum = value(uStart) + value(uEnd)
  for (let i = 1; i < SIMPSON_INTERVALS; i++) sum += value(uStart + i * step) * (i % 2 === 0 ? 2 : 4)
  return energy * Math.abs((step / 3) * sum)
}

// The stretch across the body, in g, at a distance r (horizon radii) from a black hole of the given mass: the
// difference between the pull on the two ends, 2GM h / r^3 = c^2 h / (r_s^2 r^3).
export function stretchInG(massSolarMasses: number, rInHorizonRadii: number): number {
  if (!(massSolarMasses > 0) || !Number.isFinite(massSolarMasses)) throw new RangeError('The mass must be greater than zero.')
  if (!(rInHorizonRadii > 0) || !Number.isFinite(rInHorizonRadii)) throw new RangeError('The distance must be greater than zero.')
  const speedOfLight = REAL_SPEED_OF_LIGHT_KM_PER_S * 1000 // m/s
  const horizonMeters = horizonRadiusKm(massSolarMasses) * 1000
  return (speedOfLight ** 2 * BODY_LENGTH_METERS) / (horizonMeters ** 2 * rInHorizonRadii ** 3) / GRAVITY_AT_EARTH_SURFACE
}

export interface FallPoint {
  r: number // distance from the center, in horizon radii
  travelerClock: number // horizon light-times
  farAwayClock: number | null // horizon light-times; null at the horizon, where it has no value
}

export interface FallingInResult {
  preset: ObjectPreset
  horizonRadiusKm: number
  startInHorizonRadii: number
  lightTimeSeconds: number // horizon radius / speed of light
  travelerClockAtHorizon: number // horizon light-times
  travelerSecondsAtHorizon: number
  farAwayClockAtCutoff: number // the reading at the cutoff distance, horizon light-times; it has no limit beyond it
  stretchAtStartInG: number
  stretchAtHorizonInG: number
  stretchOneGRadiusInHorizonRadii: number | null // where the stretch reaches 1 g, if outside the horizon; else null
  // From the release to the horizon. The points crowd toward the end, where the far-away clock changes fastest; the
  // last point is the horizon itself.
  points: FallPoint[]
}

export function runFallingInExperiment(presetId: ObjectPreset['id'], startInHorizonRadii: number): FallingInResult {
  const preset = BLACK_HOLE_PRESETS.find((p) => p.id === presetId)
  if (!preset) throw new Error(`Unknown black hole: ${presetId}`)
  if (!(startInHorizonRadii >= MIN_START_IN_HORIZON_RADII && startInHorizonRadii <= MAX_START_IN_HORIZON_RADII)) {
    throw new RangeError(
      `The release distance must be between ${MIN_START_IN_HORIZON_RADII} and ${MAX_START_IN_HORIZON_RADII} horizon radii.`,
    )
  }

  const horizon = horizonRadiusKm(preset.massSolarMasses)
  const lightTimeSeconds = horizon / REAL_SPEED_OF_LIGHT_KM_PER_S
  const atHorizon = travelerClock(startInHorizonRadii, 1)

  // The release, then points spaced geometrically in (eta_horizon - eta) down to the cutoff, then the horizon.
  const etaHorizon = etaAt(startInHorizonRadii, 1)
  const etaCutoff = etaAt(startInHorizonRadii, FAR_CLOCK_CUTOFF_IN_HORIZON_RADII)
  const wFirst = etaHorizon
  const wLast = etaHorizon - etaCutoff
  const points: FallPoint[] = []
  for (let k = 0; k < CURVE_POINTS; k++) {
    const eta = k === 0 ? 0 : etaHorizon - wFirst * (wLast / wFirst) ** (k / (CURVE_POINTS - 1))
    const r = (startInHorizonRadii / 2) * (1 + Math.cos(eta))
    points.push({
      r: k === 0 ? startInHorizonRadii : r,
      travelerClock: k === 0 ? 0 : travelerClock(startInHorizonRadii, r),
      farAwayClock: k === 0 ? 0 : farAwayClock(startInHorizonRadii, r),
    })
  }
  points.push({ r: 1, travelerClock: atHorizon, farAwayClock: null })

  const oneG = Math.cbrt(
    ((REAL_SPEED_OF_LIGHT_KM_PER_S * 1000) ** 2 * BODY_LENGTH_METERS) /
      (GRAVITY_AT_EARTH_SURFACE * (horizon * 1000) ** 2),
  )

  return {
    preset,
    horizonRadiusKm: horizon,
    startInHorizonRadii,
    lightTimeSeconds,
    travelerClockAtHorizon: atHorizon,
    travelerSecondsAtHorizon: atHorizon * lightTimeSeconds,
    farAwayClockAtCutoff: farAwayClock(startInHorizonRadii, FAR_CLOCK_CUTOFF_IN_HORIZON_RADII),
    stretchAtStartInG: stretchInG(preset.massSolarMasses, startInHorizonRadii),
    stretchAtHorizonInG: stretchInG(preset.massSolarMasses, 1),
    stretchOneGRadiusInHorizonRadii: oneG > 1 ? oneG : null,
    points,
  }
}

// For the stretch graph: the stretch in g from the horizon out to the largest release distance, spaced evenly in the
// logarithm of the distance.
export function stretchCurve(presetId: ObjectPreset['id']): Array<{ r: number; stretchInG: number }> {
  const preset = BLACK_HOLE_PRESETS.find((p) => p.id === presetId)
  if (!preset) throw new Error(`Unknown black hole: ${presetId}`)
  return Array.from({ length: STRETCH_CURVE_POINTS }, (_, i) => {
    const r = MAX_START_IN_HORIZON_RADII ** (i / (STRETCH_CURVE_POINTS - 1))
    return { r, stretchInG: stretchInG(preset.massSolarMasses, r) }
  })
}
