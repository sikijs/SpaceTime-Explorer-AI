import { OBJECT_PRESETS, horizonRadiusKm } from './blackHoleSizeExperiment'
import type { ObjectPreset } from './blackHoleSizeExperiment'
import { REAL_SPEED_OF_LIGHT_KM_PER_S } from './hubblesLawExperiment'

// A small traveler released from rest at a distance r0 from a non-rotating, uncharged black hole, falling straight in
// (as in Experiment 5), sending a short flash of light straight outward at evenly spaced steps of their own watch. An
// observer at rest, very far away, records when each flash arrives. Distances are in horizon radii (r_s = 1) and times in
// horizon light-times (r_s / c). With E = sqrt(1 - 1/r0):
//   the traveler's watch:        tau = (r0^1.5 / 2)(eta + sin(eta)), cos(eta) = 2r/r0 - 1
//   the far-away clock:          dt/dr = -E / ((1 - 1/r) sqrt(1/r - 1/r0))      (when the traveler passes r)
//   an outgoing flash arrives at the observer when the far-away clock reads  t - r - ln(r - 1) + a constant
//   so the gap between two arriving flashes is (1 + z) times the gap between them as sent, where
//   1 + z = d(arrival)/d(tau) = [E + sqrt(1/r - 1/r0)] / (1 - 1/r) = gravity part x motion part,
//   gravity part = 1 / sqrt(1 - 1/r)                       (a clock at rest at r, seen from far away)
//   motion part  = [E + sqrt(1/r - 1/r0)] / sqrt(1 - 1/r)  (the receding-source factor for the traveler's speed
//                                                           relative to an observer at rest at r)
// This is standard general relativity for this case and is given, not derived. Arrival times are counted from the
// arrival of the first flash (sent at the release), so the observer's distance drops out. The far-away clock is computed
// numerically, as in Experiment 5 (restated here, not imported).

export const MIN_START_IN_HORIZON_RADII = 2
export const MAX_START_IN_HORIZON_RADII = 100
// Flashes before the horizon are numbered 0 to FLASH_COUNT - 1; one more, number FLASH_COUNT, is sent at the horizon.
export const FLASH_COUNT = 20
// The graphs follow the traveler to this gap above the horizon, because the arrival time and stretch factor have no limit.
export const SMALLEST_GAP_IN_HORIZON_RADII = 0.0001

const SIMPSON_INTERVALS = 4000
const CURVE_POINTS = 161

// The three black holes only (Experiment 1's presets that have no real radius).
export const BLACK_HOLE_PRESETS: ObjectPreset[] = OBJECT_PRESETS.filter((p) => p.realRadiusKm === null)

function checkStart(startInHorizonRadii: number) {
  if (!Number.isFinite(startInHorizonRadii) || !(startInHorizonRadii > 1)) {
    throw new RangeError('The release distance must be a finite distance outside the horizon (more than 1 horizon radius).')
  }
}

function checkOutside(rInHorizonRadii: number) {
  if (!Number.isFinite(rInHorizonRadii) || !(rInHorizonRadii > 1)) {
    throw new RangeError('The distance must be outside the horizon (more than 1 horizon radius).')
  }
}

// How much slower a clock at rest at distance r ticks, seen from far away (Experiment 2's factor, restated).
export function gravityPart(rInHorizonRadii: number): number {
  checkOutside(rInHorizonRadii)
  return 1 / Math.sqrt(1 - 1 / rInHorizonRadii)
}

const energyAt = (r0: number) => Math.sqrt(1 - 1 / r0)
// sqrt(1/r - 1/r0), which is 0 at the release point (a little rounding there is clamped away).
const speedTerm = (r0: number, r: number) => Math.sqrt(Math.max(0, 1 / r - 1 / r0))

function checkBetween(startInHorizonRadii: number, rInHorizonRadii: number) {
  checkStart(startInHorizonRadii)
  checkOutside(rInHorizonRadii)
  if (rInHorizonRadii > startInHorizonRadii) {
    throw new RangeError('The distance must be no more than the release distance.')
  }
}

// The receding-source factor for the traveler falling from rest at r0, at distance r.
export function motionPart(startInHorizonRadii: number, rInHorizonRadii: number): number {
  checkBetween(startInHorizonRadii, rInHorizonRadii)
  return (energyAt(startInHorizonRadii) + speedTerm(startInHorizonRadii, rInHorizonRadii)) / Math.sqrt(1 - 1 / rInHorizonRadii)
}

// How much the gap between two arriving flashes is stretched compared with the gap as sent, computed directly from the
// formula (the product of the two parts, written in one step).
export function stretchFactor(startInHorizonRadii: number, rInHorizonRadii: number): number {
  checkBetween(startInHorizonRadii, rInHorizonRadii)
  return (energyAt(startInHorizonRadii) + speedTerm(startInHorizonRadii, rInHorizonRadii)) / (1 - 1 / rInHorizonRadii)
}

// The pieces of the stretch factor at one distance, for the worked calculation shown to the learner, so the screen does
// no physics of its own (CLAUDE.md §9): E, the square roots in the formula, the two parts and their product.
export interface StretchFactorSteps {
  energy: number // E = sqrt(1 - 1/r0)
  speedTerm: number // sqrt(1/r - 1/r0)
  rootGravity: number // sqrt(1 - 1/r)
  gravity: number // gravity part = 1 / rootGravity
  motion: number // motion part = (E + speedTerm) / rootGravity
  total: number // gravity part x motion part
}

export function stretchFactorSteps(startInHorizonRadii: number, rInHorizonRadii: number): StretchFactorSteps {
  checkBetween(startInHorizonRadii, rInHorizonRadii)
  const rootGravity = Math.sqrt(1 - 1 / rInHorizonRadii)
  return {
    energy: energyAt(startInHorizonRadii),
    speedTerm: speedTerm(startInHorizonRadii, rInHorizonRadii),
    rootGravity,
    gravity: gravityPart(rInHorizonRadii),
    motion: motionPart(startInHorizonRadii, rInHorizonRadii),
    total: gravityPart(rInHorizonRadii) * motionPart(startInHorizonRadii, rInHorizonRadii),
  }
}

// The cycloid parameter at a distance r, for a fall from rest at r0.
const etaAt = (r0: number, r: number) => Math.acos(Math.min(1, Math.max(-1, (2 * r) / r0 - 1)))

// The traveler's watch at a distance r (1 up to the release distance), in horizon light-times. Closed form.
export function travelerWatch(startInHorizonRadii: number, rInHorizonRadii: number): number {
  checkStart(startInHorizonRadii)
  if (!Number.isFinite(rInHorizonRadii) || !(rInHorizonRadii >= 1 && rInHorizonRadii <= startInHorizonRadii)) {
    throw new RangeError('The distance must be between the horizon (1) and the release distance.')
  }
  const eta = etaAt(startInHorizonRadii, rInHorizonRadii)
  return 0.5 * startInHorizonRadii ** 1.5 * (eta + Math.sin(eta))
}

// The far-away clock when the traveler passes r (r strictly outside the horizon), by integrating in the cycloid
// parameter, where the integrand is smooth except at the horizon (the same method as Experiment 5's, restated):
//   t = E * integral from 0 to eta(r) of  r0 cos(eta/2) sqrt(x) / (1 - 1/x) d(eta),   x = (r0/2)(1 + cos(eta)).
function farAwayClockAtSending(r0: number, r: number): number {
  const etaHorizon = etaAt(r0, 1)
  const etaEnd = etaAt(r0, r)
  if (etaEnd === 0) return 0
  const integrand = (eta: number) => {
    const x = (r0 / 2) * (1 + Math.cos(eta))
    return (r0 * Math.cos(eta / 2) * Math.sqrt(x)) / (1 - 1 / x)
  }
  // With w = eta_horizon - eta and u = ln(w), d(eta) = -w du, so the blow-up at the horizon is spread out evenly.
  const uStart = Math.log(etaHorizon)
  const uEnd = Math.log(etaHorizon - etaEnd)
  const step = (uEnd - uStart) / SIMPSON_INTERVALS
  const value = (u: number) => {
    const w = Math.exp(u)
    return integrand(etaHorizon - w) * w
  }
  let sum = value(uStart) + value(uEnd)
  for (let i = 1; i < SIMPSON_INTERVALS; i++) sum += value(uStart + i * step) * (i % 2 === 0 ? 2 : 4)
  return energyAt(r0) * Math.abs((step / 3) * sum)
}

// How long light takes to climb out from distance r: the observer's clock reading for a flash sent from r is the
// far-away clock at sending, minus this, plus a constant.
const climb = (r: number) => r + Math.log(r - 1)

// The observer's clock when the flash sent as the traveler passes r arrives, in horizon light-times, counted from the
// arrival of the flash sent at the release. It has no limit as r approaches 1, so r must be strictly outside the horizon.
export function arrivalTime(startInHorizonRadii: number, rInHorizonRadii: number): number {
  checkBetween(startInHorizonRadii, rInHorizonRadii)
  return farAwayClockAtSending(startInHorizonRadii, rInHorizonRadii) + climb(startInHorizonRadii) - climb(rInHorizonRadii)
}

// The distance from the center at which the traveler's watch reads the given time, by bisection on the closed form.
function distanceAtWatch(startInHorizonRadii: number, watch: number): number {
  let near = 1
  let far = startInHorizonRadii
  for (let i = 0; i < 200; i++) {
    const middle = (near + far) / 2
    if (travelerWatch(startInHorizonRadii, middle) > watch) near = middle
    else far = middle
  }
  return (near + far) / 2
}

export interface Flash {
  index: number // 0 to FLASH_COUNT; the last is sent at the horizon
  sentWatch: number // the traveler's watch when sent, in horizon light-times
  distance: number // distance from the center when sent, in horizon radii
  arrival: number | null // the observer's clock at arrival, counted from the first flash's arrival; null at the horizon
  spacingAsSent: number | null // since the previous flash, on the traveler's watch; null for the first
  spacingAsReceived: number | null // since the previous flash, on the observer's clock; null for the first and the last
  stretchFactor: number | null // spacing as received divided by spacing as sent; null for the first and the last
}

export interface CurvePoint {
  gap: number // distance above the horizon, in horizon radii
  watch: number // the traveler's watch when passing, in horizon light-times
  gravity: number
  motion: number
  total: number
  arrival: number // the observer's clock at arrival of the flash sent here
}

export interface SeeingTheFallResult {
  preset: ObjectPreset
  horizonRadiusKm: number
  startInHorizonRadii: number
  lightTimeSeconds: number // horizon radius / speed of light
  travelerWatchAtHorizon: number // horizon light-times
  flashes: Flash[] // FLASH_COUNT + 1 of them
  // From the release to SMALLEST_GAP above the horizon, spaced geometrically in the gap, for the graphs.
  curve: CurvePoint[]
}

export function runSeeingTheFallExperiment(presetId: ObjectPreset['id'], startInHorizonRadii: number): SeeingTheFallResult {
  const preset = BLACK_HOLE_PRESETS.find((p) => p.id === presetId)
  if (!preset) throw new Error(`Unknown black hole: ${presetId}`)
  if (!(startInHorizonRadii >= MIN_START_IN_HORIZON_RADII && startInHorizonRadii <= MAX_START_IN_HORIZON_RADII)) {
    throw new RangeError(
      `The release distance must be between ${MIN_START_IN_HORIZON_RADII} and ${MAX_START_IN_HORIZON_RADII} horizon radii.`,
    )
  }

  const horizon = horizonRadiusKm(preset.massSolarMasses)
  const watchAtHorizon = travelerWatch(startInHorizonRadii, 1)
  const step = watchAtHorizon / FLASH_COUNT

  const flashes: Flash[] = []
  for (let k = 0; k <= FLASH_COUNT; k++) {
    const sentWatch = k * step
    const distance = k === 0 ? startInHorizonRadii : k === FLASH_COUNT ? 1 : distanceAtWatch(startInHorizonRadii, sentWatch)
    const arrival = k === FLASH_COUNT ? null : k === 0 ? 0 : arrivalTime(startInHorizonRadii, distance)
    const previous = k === 0 ? null : flashes[k - 1]
    const spacingAsReceived =
      previous !== null && arrival !== null && previous.arrival !== null ? arrival - previous.arrival : null
    flashes.push({
      index: k,
      sentWatch,
      distance,
      arrival,
      spacingAsSent: previous === null ? null : step,
      spacingAsReceived,
      stretchFactor: spacingAsReceived === null ? null : spacingAsReceived / step,
    })
  }

  const widest = startInHorizonRadii - 1
  const curve: CurvePoint[] = []
  for (let i = 0; i < CURVE_POINTS; i++) {
    const gap = SMALLEST_GAP_IN_HORIZON_RADII * (widest / SMALLEST_GAP_IN_HORIZON_RADII) ** (1 - i / (CURVE_POINTS - 1))
    const r = Math.min(1 + gap, startInHorizonRadii) // the widest gap is the release itself; rounding must not pass it
    curve.push({
      gap,
      watch: travelerWatch(startInHorizonRadii, r),
      gravity: gravityPart(r),
      motion: motionPart(startInHorizonRadii, r),
      total: stretchFactor(startInHorizonRadii, r),
      arrival: arrivalTime(startInHorizonRadii, r),
    })
  }

  return {
    preset,
    horizonRadiusKm: horizon,
    startInHorizonRadii,
    lightTimeSeconds: horizon / REAL_SPEED_OF_LIGHT_KM_PER_S,
    travelerWatchAtHorizon: watchAtHorizon,
    flashes,
    curve,
  }
}
