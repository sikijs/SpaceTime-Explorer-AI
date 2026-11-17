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

// The steps of the closed form for the traveler's clock at the horizon, for the Results' worked example, so that the
// interface shows the module's numbers and does not repeat the calculation: tau = (r0^1.5 / 2)(eta + sin(eta)) with
// cos(eta) = 2 / r0 - 1.
export interface TravelerClockSteps {
  startPower: number // r0^1.5
  cosEta: number // 2 / r0 - 1
  etaRadians: number
  sinEta: number
  clockAtHorizon: number // in horizon light-times
}

export function travelerClockSteps(startInHorizonRadii: number): TravelerClockSteps {
  checkStart(startInHorizonRadii)
  const cosEta = 2 / startInHorizonRadii - 1
  const etaRadians = Math.acos(cosEta)
  const sinEta = Math.sin(etaRadians)
  const startPower = startInHorizonRadii ** 1.5
  return { startPower, cosEta, etaRadians, sinEta, clockAtHorizon: 0.5 * startPower * (etaRadians + sinEta) }
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

// The stretch across the body, in meters per second squared, at a distance r (horizon radii) from a black hole of the
// given mass: the difference between the pull on the two ends, 2GM h / r^3 = c^2 h / (r_s^2 r^3).
export function stretchInMetersPerSecondSquared(massSolarMasses: number, rInHorizonRadii: number): number {
  if (!(massSolarMasses > 0) || !Number.isFinite(massSolarMasses)) throw new RangeError('The mass must be greater than zero.')
  if (!(rInHorizonRadii > 0) || !Number.isFinite(rInHorizonRadii)) throw new RangeError('The distance must be greater than zero.')
  const speedOfLight = REAL_SPEED_OF_LIGHT_KM_PER_S * 1000 // m/s
  const horizonMeters = horizonRadiusKm(massSolarMasses) * 1000
  return (speedOfLight ** 2 * BODY_LENGTH_METERS) / (horizonMeters ** 2 * rInHorizonRadii ** 3)
}

// The same, in g (Earth's gravity at the surface).
export function stretchInG(massSolarMasses: number, rInHorizonRadii: number): number {
  return stretchInMetersPerSecondSquared(massSolarMasses, rInHorizonRadii) / GRAVITY_AT_EARTH_SURFACE
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

// ---------------------------------------------------------------------------------------------------------------
// Audit update (Black Holes 5): numbers for the white guess marks, the fixed Part 1 fall (the 10-Sun black hole,
// released from rest at 10 horizon radii), the check-up, and the comparisons and worked-math numbers the interface and
// tutor used to work out or type themselves. No function here reads a prediction; the guess functions take the guess as
// an argument and only describe it or mark it. Every existing export above is unchanged.
// ---------------------------------------------------------------------------------------------------------------

export const PART_ONE_BLACK_HOLE_ID: ObjectPreset['id'] = 'stellar-black-hole'
export const PART_ONE_START_IN_HORIZON_RADII = 10
export const SGR_A_STAR_ID: ObjectPreset['id'] = 'sgr-a-star'

// The fall is the same every time and costs a few hundred numerical integrals, so the new functions share one copy.
let partOneCache: FallingInResult | null = null
export function runPartOne(): FallingInResult {
  if (!partOneCache) partOneCache = runFallingInExperiment(PART_ONE_BLACK_HOLE_ID, PART_ONE_START_IN_HORIZON_RADII)
  return partOneCache
}

// ---- the readings near the horizon (the Results and the tutor used to assemble these themselves) ----
export const NEAR_HORIZON_GAPS = [0.01, 0.001, 0.0001] // horizon radii above the horizon
export interface NearHorizonReading {
  gapInHorizonRadii: number
  travelerClock: number
  farAwayClock: number
}
export function nearHorizonReadings(startInHorizonRadii: number): NearHorizonReading[] {
  return NEAR_HORIZON_GAPS.map((gap) => ({
    gapInHorizonRadii: gap,
    travelerClock: travelerClock(startInHorizonRadii, 1 + gap),
    farAwayClock: farAwayClock(startInHorizonRadii, 1 + gap),
  }))
}
// How much more the far-away clock reads each time the gap above the horizon shrinks to a tenth, in horizon light-times.
export function farClockIncreasesPerTenfoldGap(startInHorizonRadii: number): number[] {
  const readings = nearHorizonReadings(startInHorizonRadii)
  return readings.slice(1).map((reading, i) => reading.farAwayClock - readings[i].farAwayClock)
}
export const LN_10 = Math.log(10)

// ---- Guess 1: does the trip to the horizon come to an end on the traveler's own watch? ----
export type EndChoice = 'finite' | 'never' | 'depends'
// "Finite" if the traveler's clock reaches the horizon after a finite time for all three black holes (in horizon
// light-times it is the same for every hole; only the seconds differ); "depends" if it did for some and not others.
export function modelEndAnswer(startInHorizonRadii: number = PART_ONE_START_IN_HORIZON_RADII): EndChoice {
  const finite = BLACK_HOLE_PRESETS.map((p) =>
    Number.isFinite((travelerClock(startInHorizonRadii, 1) * horizonRadiusKm(p.massSolarMasses)) / REAL_SPEED_OF_LIGHT_KM_PER_S),
  )
  if (finite.every(Boolean)) return 'finite'
  return finite.some(Boolean) ? 'depends' : 'never'
}
export function endGuessIsModelAnswer(guess: EndChoice): boolean {
  return guess === modelEndAnswer()
}
// The white marker for each answer is a shape and a place, not a size (an outcome has no size of its own).
export type EndMarker = { kind: 'at-horizon' } | { kind: 'past-right-edge' } | { kind: 'beside-horizon' }
export function endGuessMarker(guess: EndChoice): EndMarker {
  return guess === 'finite' ? { kind: 'at-horizon' } : guess === 'never' ? { kind: 'past-right-edge' } : { kind: 'beside-horizon' }
}

// ---- Guess 2: what does the far-away clock read as the traveler nears the horizon? ----
export type FarClockChoice = 'same' | 'settles' | 'no-limit'
// The page's own marking limits, not physical limits (the real fall is nowhere near either): "about the same" means the
// far-away clock is within this percent of the traveler's clock; "settles" means the latest tenfold increase is under
// this fraction of the one before.
export const SAME_WITHIN_PERCENT = 1
export const SETTLES_BELOW_FRACTION = 0.5
export function modelFarClockAnswer(startInHorizonRadii: number = PART_ONE_START_IN_HORIZON_RADII): FarClockChoice {
  const readings = nearHorizonReadings(startInHorizonRadii)
  const last = readings[readings.length - 1]
  if (Math.abs(last.farAwayClock / last.travelerClock - 1) * 100 <= SAME_WITHIN_PERCENT) return 'same'
  const increases = farClockIncreasesPerTenfoldGap(startInHorizonRadii)
  return increases[increases.length - 1] < SETTLES_BELOW_FRACTION * increases[increases.length - 2] ? 'settles' : 'no-limit'
}
export function farClockGuessIsModelAnswer(guess: FarClockChoice): boolean {
  return guess === modelFarClockAnswer()
}
// "Without limit" is marked at the orange curve's end; the other two are marked in the gap between the curves.
export type FarClockMarker = { kind: 'orange-end' } | { kind: 'between-curves' }
export function farClockGuessMarker(guess: FarClockChoice): FarClockMarker {
  return guess === 'no-limit' ? { kind: 'orange-end' } : { kind: 'between-curves' }
}

// ---- Guess 3: the stretch at the horizon, the 10-Sun black hole against Sagittarius A* ----
export type StretchChoice = 'small' | 'same' | 'giant'
// "Much stronger" means more than this many times as strong (the page's own marking limit).
export const MUCH_STRONGER_AT_LEAST_TIMES = 10
// The stretch at the horizon at the 10-Sun hole divided by the stretch at Sagittarius A*'s.
export function stretchRatioBetweenHoles(): number {
  const small = BLACK_HOLE_PRESETS.find((p) => p.id === PART_ONE_BLACK_HOLE_ID)!
  const giant = BLACK_HOLE_PRESETS.find((p) => p.id === SGR_A_STAR_ID)!
  return stretchInG(small.massSolarMasses, 1) / stretchInG(giant.massSolarMasses, 1)
}
// The square of the ratio of the two masses, which the stretch ratio should equal (at the same number of horizon radii).
export function massRatioSquared(): number {
  const small = BLACK_HOLE_PRESETS.find((p) => p.id === PART_ONE_BLACK_HOLE_ID)!
  const giant = BLACK_HOLE_PRESETS.find((p) => p.id === SGR_A_STAR_ID)!
  return (giant.massSolarMasses / small.massSolarMasses) ** 2
}
export function modelStretchAnswer(): StretchChoice {
  const ratio = stretchRatioBetweenHoles()
  return ratio >= MUCH_STRONGER_AT_LEAST_TIMES ? 'small' : ratio <= 1 / MUCH_STRONGER_AT_LEAST_TIMES ? 'giant' : 'same'
}
export function stretchGuessIsModelAnswer(guess: StretchChoice): boolean {
  return guess === modelStretchAnswer()
}
// The pointer at the horizon edge of the stretch graph: to the 10-Sun curve, to Sagittarius A*'s, or a bracket joining both.
export type StretchMarker = { target: 'stellar'; presetId: ObjectPreset['id'] } | { target: 'sgr'; presetId: ObjectPreset['id'] } | { target: 'both' }
export function stretchGuessMarker(guess: StretchChoice): StretchMarker {
  return guess === 'small'
    ? { target: 'stellar', presetId: PART_ONE_BLACK_HOLE_ID }
    : guess === 'giant'
      ? { target: 'sgr', presetId: SGR_A_STAR_ID }
      : { target: 'both' }
}

// ---- Comparisons the interface used to work out itself ----
// How many times larger the stretch is at the horizon than at the release distance (the distance ratio cubed).
export function stretchGrowth(result: FallingInResult): number {
  return result.stretchAtHorizonInG / result.stretchAtStartInG
}

// ---- The check-up: a separate route to the same numbers ----
// The traveler's clock by integrating d(tau)/dr = -1 / sqrt(1/r - 1/r0) with r = r0 - s^2, which removes the singularity at the
// release point: tau = 2 sqrt(r0) times the integral of sqrt(r0 - s^2) ds. A different route from the closed form.
export function travelerClockByIntegration(startInHorizonRadii: number, rInHorizonRadii: number): number {
  checkStart(startInHorizonRadii)
  const sEnd = Math.sqrt(startInHorizonRadii - rInHorizonRadii)
  const steps = 20000
  let sum = 0
  for (let i = 0; i < steps; i++) {
    const s = ((i + 0.5) / steps) * sEnd
    sum += Math.sqrt(startInHorizonRadii - s * s)
  }
  return (2 * Math.sqrt(startInHorizonRadii) * sum * sEnd) / steps
}

// The stretch from 2GM h / r^3 with G and the solar mass written out in SI units, not through the c-squared form above.
const G_SI = 6.674e-11
const SOLAR_MASS_KG = 1.98847e30
export function stretchFromGMInG(massSolarMasses: number, rInHorizonRadii: number): number {
  const rMeters = rInHorizonRadii * horizonRadiusKm(massSolarMasses) * 1000
  return (2 * G_SI * massSolarMasses * SOLAR_MASS_KG * BODY_LENGTH_METERS) / rMeters ** 3 / GRAVITY_AT_EARTH_SURFACE
}

// ---- A plain reading of one number against a reference; no cut-offs ----
export type Reading = 'the same' | 'more' | 'less'
export function readAgainst(found: number, reference: number): Reading {
  if (Math.abs(found - reference) <= 1e-9 * Math.max(Math.abs(reference), 1e-300)) return 'the same'
  return found > reference ? 'more' : 'less'
}
// "The same" once both are rounded to the same number of significant figures (the way they are printed).
export function readAgainstRounded(found: number, reference: number, significantFigures: number): Reading {
  const round = (x: number) => Number(x.toPrecision(significantFigures))
  if (round(found) === round(reference)) return 'the same'
  return found > reference ? 'more' : 'less'
}
export function percentAbove(found: number, reference: number): number {
  return (found / reference - 1) * 100
}

export interface FallCheckUpRow {
  what: string
  expected: number
  found: number
  unit: string
  reading: Reading
  // How far above the reference the found number is, in percent (not a cut-off, only the gap).
  percentAbove: number
}
// Each row's reference is a formula the calculation is built from, or a separate route to the same number; none is a measurement.
export function checkUpRows(): FallCheckUpRow[] {
  const r0 = PART_ONE_START_IN_HORIZON_RADII
  const part = runPartOne()
  const stellar = part.preset
  const increases = farClockIncreasesPerTenfoldGap(r0)
  const increase = increases[increases.length - 1]
  return [
    {
      what: `The traveler's clock at the horizon, from rest at ${r0} horizon radii: the closed form against a separate integration`,
      expected: travelerClockByIntegration(r0, 1),
      found: part.travelerClockAtHorizon,
      unit: 'light-times',
      reading: readAgainstRounded(part.travelerClockAtHorizon, travelerClockByIntegration(r0, 1), 5),
      percentAbove: percentAbove(part.travelerClockAtHorizon, travelerClockByIntegration(r0, 1)),
    },
    {
      what: 'The far-away clock: extra reading when the gap above the horizon shrinks to a tenth (0.001 to 0.0001), against ln 10',
      expected: LN_10,
      found: increase,
      unit: 'light-times',
      reading: readAgainst(increase, LN_10),
      percentAbove: percentAbove(increase, LN_10),
    },
    {
      what: 'The stretch at the 10-Sun black hole’s horizon: the formula as the page computes it against 2GM × h ÷ r³ from G and M',
      expected: stretchFromGMInG(stellar.massSolarMasses, 1),
      found: part.stretchAtHorizonInG,
      unit: 'g',
      reading: readAgainstRounded(part.stretchAtHorizonInG, stretchFromGMInG(stellar.massSolarMasses, 1), 3),
      percentAbove: percentAbove(part.stretchAtHorizonInG, stretchFromGMInG(stellar.massSolarMasses, 1)),
    },
    {
      what: 'The stretch at the horizon, 10-Sun black hole against Sagittarius A*: the ratio against the square of the ratio of their masses',
      expected: massRatioSquared(),
      found: stretchRatioBetweenHoles(),
      unit: 'times',
      reading: readAgainstRounded(stretchRatioBetweenHoles(), massRatioSquared(), 6),
      percentAbove: percentAbove(stretchRatioBetweenHoles(), massRatioSquared()),
    },
  ]
}

// ---- The tables ----
export interface FallRow {
  presetId: ObjectPreset['id']
  startInHorizonRadii: number
  startKm: number
  clockAtHorizonLightTimes: number
  clockAtHorizonSeconds: number
  farClockAtCutoffLightTimes: number
  stretchAtStartInG: number
  stretchAtHorizonInG: number
  oneGRadiusInHorizonRadii: number | null
  lightTimeSeconds: number
}
export function fallRow(result: FallingInResult): FallRow {
  return {
    presetId: result.preset.id,
    startInHorizonRadii: result.startInHorizonRadii,
    startKm: result.startInHorizonRadii * result.horizonRadiusKm,
    clockAtHorizonLightTimes: result.travelerClockAtHorizon,
    clockAtHorizonSeconds: result.travelerSecondsAtHorizon,
    farClockAtCutoffLightTimes: result.farAwayClockAtCutoff,
    stretchAtStartInG: result.stretchAtStartInG,
    stretchAtHorizonInG: result.stretchAtHorizonInG,
    oneGRadiusInHorizonRadii: result.stretchOneGRadiusInHorizonRadii,
    lightTimeSeconds: result.lightTimeSeconds,
  }
}
export function partOneRow(): FallRow {
  return fallRow(runPartOne())
}

// Table 4: the three black holes for a fall from the Part 1 release distance (10 horizon radii).
export interface HoleRow {
  preset: ObjectPreset
  horizonRadiusKm: number
  tripSeconds: number
  stretchAtHorizonInG: number
}
const threeHoleCache = new Map<number, HoleRow[]>()
export function threeHoleRows(startInHorizonRadii: number = PART_ONE_START_IN_HORIZON_RADII): HoleRow[] {
  const cached = threeHoleCache.get(startInHorizonRadii)
  if (cached) return cached
  const rows = BLACK_HOLE_PRESETS.map((preset) => {
    const result = runFallingInExperiment(preset.id, startInHorizonRadii)
    return { preset, horizonRadiusKm: result.horizonRadiusKm, tripSeconds: result.travelerSecondsAtHorizon, stretchAtHorizonInG: result.stretchAtHorizonInG }
  })
  threeHoleCache.set(startInHorizonRadii, rows)
  return rows
}

// The worked-math numbers the Results typed ("9.81") and the unit conversion: Earth's gravity at its surface, to 3 figures.
export const GRAVITY_AT_EARTH_SURFACE_ROUNDED = Number(GRAVITY_AT_EARTH_SURFACE.toPrecision(3))
