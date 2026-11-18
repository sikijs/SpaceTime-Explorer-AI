import { OBJECT_PRESETS, horizonRadiusKm } from './blackHoleSizeExperiment'
import type { ObjectPreset } from './blackHoleSizeExperiment'

// A spinning, uncharged black hole and a small probe circling in the flat sheet through its equator, either with the spin
// or against it. Distances are in "reference radii": 1 reference radius is the horizon radius r_s = 2M (M = GM/c^2) that
// the same black hole would have with no spin, so the same black hole can be compared at different spins.
// With the spin a* (0 up to, not including, 1), from standard general relativity (the Kerr solution), given and not derived:
//   horizon:           r_h = M (1 + sqrt(1 - a*^2))
//   last safe orbit:   Z1 = 1 + (1 - a*^2)^(1/3) [(1 + a*)^(1/3) + (1 - a*)^(1/3)],  Z2 = sqrt(3 a*^2 + Z1^2),
//                      r_isco = M [3 + Z2 -/+ sqrt((3 - Z1)(3 + Z1 + 2 Z2))]   (minus: with the spin, plus: against it)
//   circular orbit:    E = (1 - 2M/r +/- a*/r^(3/2)) / sqrt(1 - 3M/r +/- 2 a*/r^(3/2))   (r in units of M; + with the spin)
//   energy released:   1 - E at the last safe orbit, for a probe that descends gradually through circular orbits.
// Not checked against the original paper (Bardeen, Press and Teukolsky, 1972); checked against secondary sources and the
// known limits (see the tests).

export const MIN_SPIN = 0
export const MAX_SPIN = 0.99 // the largest spin the learner can choose
const CURVE_POINTS = 101
// Experiment 3's last safe orbit with no spin, in reference radii (6M).
const NO_SPIN_LAST_SAFE = 3

// The three black holes only (Experiment 1's presets that have no real radius).
export const BLACK_HOLE_PRESETS: ObjectPreset[] = OBJECT_PRESETS.filter((p) => p.realRadiusKm === null)

export type Direction = 'with' | 'against'

// The formulas describe spins from 0 up to, but not including, 1.
function checkSpin(spin: number) {
  if (!Number.isFinite(spin) || !(spin >= 0 && spin < 1)) {
    throw new RangeError('The spin must be a number from 0 up to, but not including, 1.')
  }
}

// In units of M.
function horizonInM(spin: number): number {
  return 1 + Math.sqrt(1 - spin * spin)
}

function lastSafeOrbitInM(spin: number, direction: Direction): number {
  const z1 = 1 + Math.cbrt(1 - spin * spin) * (Math.cbrt(1 + spin) + Math.cbrt(1 - spin))
  const z2 = Math.sqrt(3 * spin * spin + z1 * z1)
  const root = Math.sqrt((3 - z1) * (3 + z1 + 2 * z2))
  return direction === 'with' ? 3 + z2 - root : 3 + z2 + root
}

// All radii returned below are in reference radii (r_s = 2M of the same black hole with no spin).
export function horizonRadius(spin: number): number {
  checkSpin(spin)
  return horizonInM(spin) / 2
}

export function lastSafeOrbitRadius(spin: number, direction: Direction): number {
  checkSpin(spin)
  return lastSafeOrbitInM(spin, direction) / 2
}

// The energy released, worked step by step for the Results (so the interface does no physics, CLAUDE.md §9). Here r is the
// last safe orbit in units of M, which is half a reference radius.
export interface EnergyReleasedSteps {
  lastSafeInM: number // r, in units of M
  spinTerm: number // +a/r^(3/2) with the spin, -a/r^(3/2) against it
  numerator: number // 1 - 2/r + spinTerm
  denominator: number // sqrt(1 - 3/r + 2 spinTerm)
  energy: number // E = numerator / denominator
  released: number // 1 - E
}

export function energyReleasedSteps(spin: number, direction: Direction): EnergyReleasedSteps {
  checkSpin(spin)
  const r = lastSafeOrbitInM(spin, direction)
  const spinTerm = ((direction === 'with' ? 1 : -1) * spin) / r ** 1.5
  const numerator = 1 - 2 / r + spinTerm
  const denominator = Math.sqrt(1 - 3 / r + 2 * spinTerm)
  const energy = numerator / denominator
  return { lastSafeInM: r, spinTerm, numerator, denominator, energy, released: 1 - energy }
}

// 1 - E at the last safe orbit: the fraction of its rest-mass energy that a probe gives up on a gradual descent from far away.
export function energyReleasedFraction(spin: number, direction: Direction): number {
  return energyReleasedSteps(spin, direction).released
}

export interface CurvePoint {
  spin: number
  horizon: number
  lastSafeWith: number
  lastSafeAgainst: number
  energyReleasedWith: number
  energyReleasedAgainst: number
}

export interface SpinningBlackHoleResult {
  preset: ObjectPreset
  referenceRadiusKm: number // Experiment 1's horizon radius for this black hole
  spin: number
  horizon: number
  lastSafeWith: number
  lastSafeAgainst: number
  noSpinLastSafe: number // Experiment 3's value, for the dashed reference ring
  energyReleasedWith: number
  energyReleasedAgainst: number
  noSpinEnergyReleased: number // for the dashed reference line
  // From spin 0 to the chosen spin, evenly spaced, for the playback and the graphs.
  curve: CurvePoint[]
}

function pointAt(spin: number): CurvePoint {
  return {
    spin,
    horizon: horizonRadius(spin),
    lastSafeWith: lastSafeOrbitRadius(spin, 'with'),
    lastSafeAgainst: lastSafeOrbitRadius(spin, 'against'),
    energyReleasedWith: energyReleasedFraction(spin, 'with'),
    energyReleasedAgainst: energyReleasedFraction(spin, 'against'),
  }
}

export function runSpinningBlackHoleExperiment(presetId: ObjectPreset['id'], spin: number): SpinningBlackHoleResult {
  const preset = BLACK_HOLE_PRESETS.find((p) => p.id === presetId)
  if (!preset) throw new Error(`Unknown black hole: ${presetId}`)
  if (!(spin >= MIN_SPIN && spin <= MAX_SPIN)) {
    throw new RangeError(`The spin must be between ${MIN_SPIN} and ${MAX_SPIN}.`)
  }

  const curve: CurvePoint[] = []
  for (let i = 0; i < CURVE_POINTS; i++) curve.push(pointAt((spin * i) / (CURVE_POINTS - 1)))
  const last = curve[curve.length - 1]

  return {
    preset,
    referenceRadiusKm: horizonRadiusKm(preset.massSolarMasses),
    spin,
    horizon: last.horizon,
    lastSafeWith: last.lastSafeWith,
    lastSafeAgainst: last.lastSafeAgainst,
    noSpinLastSafe: NO_SPIN_LAST_SAFE,
    energyReleasedWith: last.energyReleasedWith,
    energyReleasedAgainst: last.energyReleasedAgainst,
    noSpinEnergyReleased: curve[0].energyReleasedWith,
    curve,
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// Audit update (Black Holes 8, 2026-11-18): the fixed Part 1 run, the answers to the four predictions, the places where the
// white guess marks are drawn, a second route to the energy given up, the check-up rows and kilometers. The interface only
// displays these (CLAUDE.md §9).

// Part 1 spins the 10-Sun black hole up to this spin (the specification's reference case).
export const PART_ONE_PRESET_ID: ObjectPreset['id'] = 'stellar-black-hole'
export const PART_ONE_SPIN = 0.9

export type EdgeAnswer = 'closer' | 'same' | 'farther'
export type HorizonAnswer = 'bigger' | 'same' | 'smaller'
export type EnergyAnswer = 'with' | 'against' | 'same'

// Two numbers are "the same" when they agree to rounding error in the arithmetic, not to a chosen tolerance.
const SAME = 1e-9

function compareTo(value: number, reference: number): -1 | 0 | 1 {
  if (Math.abs(value - reference) <= SAME * Math.max(1, Math.abs(reference))) return 0
  return value < reference ? -1 : 1
}

// Prediction 1 (with the spin) and 2 (against it): the last safe orbit, compared with Black Holes 3's no-spin 3 radii.
export function edgeAnswer(spin: number, direction: Direction): EdgeAnswer {
  const c = compareTo(lastSafeOrbitRadius(spin, direction), NO_SPIN_LAST_SAFE)
  return c < 0 ? 'closer' : c > 0 ? 'farther' : 'same'
}

// Prediction 3: the horizon, compared with the reference radius (1, by definition).
export function horizonAnswer(spin: number): HorizonAnswer {
  const c = compareTo(horizonRadius(spin), 1)
  return c < 0 ? 'smaller' : c > 0 ? 'bigger' : 'same'
}

// Prediction 4: which probe gives up the larger share of its rest-mass energy.
export function energyAnswer(spin: number): EnergyAnswer {
  const c = compareTo(energyReleasedFraction(spin, 'with'), energyReleasedFraction(spin, 'against'))
  return c > 0 ? 'with' : c < 0 ? 'against' : 'same'
}

export interface Guesses {
  with: EdgeAnswer
  against: EdgeAnswer
  horizon: HorizonAnswer
  energy: EnergyAnswer
}

// For the tutor, which marks each guess against the model's answer at the given spin (the Results never do).
export function markGuesses(spin: number, guesses: Guesses): Record<keyof Guesses, boolean> {
  return {
    with: guesses.with === edgeAnswer(spin, 'with'),
    against: guesses.against === edgeAnswer(spin, 'against'),
    horizon: guesses.horizon === horizonAnswer(spin),
    energy: guesses.energy === energyAnswer(spin),
  }
}

// Where each guess mark is drawn, in reference radii from the center. Markers only: a guess has no size of its own, so each
// answer has one fixed place (inside the dashed ring, on it, outside it), and the place shows the kind of answer, not a number.
export const EDGE_MARKER_RADII: Record<EdgeAnswer, number> = { closer: 2, same: NO_SPIN_LAST_SAFE, farther: 4 }
export const HORIZON_MARKER_RADII: Record<HorizonAnswer, number> = { smaller: 0.8, same: 1, bigger: 1.2 }

// A second route to the energy given up, written differently from `energyReleasedFraction`: at the last safe orbit r (in
// units of M) a circular orbit's energy per rest-mass energy is sqrt(1 - 2/(3 r)), so the share given up is
// 1 - sqrt(1 - 2/(3 r)). Given, not derived. It is used for the check-up.
export function energyReleasedSecondRoute(spin: number, direction: Direction): number {
  checkSpin(spin)
  return 1 - Math.sqrt(1 - 2 / (3 * lastSafeOrbitInM(spin, direction)))
}

export type CheckUpReading = 'the same' | 'outside the horizon' | 'not the same'

export interface CheckUpRow {
  id: 'noSpinLastSafe' | 'noSpinHorizon' | 'noSpinEnergy' | 'energyWith' | 'energyAgainst' | 'withOutsideHorizon' | 'againstOutsideHorizon'
  expected: number // a value the same physics or an earlier experiment gives (a radius, or a share as a fraction)
  found: number
  reading: CheckUpReading
}

// The page's own checks, all internal: no published value was read for the last safe orbit or the energy share (CLAUDE.md §29
// rule 3(c)), so none is claimed. `spin` is the spin of the run.
export function checkUp(spin: number): CheckUpRow[] {
  checkSpin(spin)
  const same = (expected: number, found: number): CheckUpReading => (compareTo(found, expected) === 0 ? 'the same' : 'not the same')
  const outside = (found: number, horizon: number): CheckUpReading => (found > horizon ? 'outside the horizon' : 'not the same')
  const horizon = horizonRadius(spin)
  const withR = lastSafeOrbitRadius(spin, 'with')
  const againstR = lastSafeOrbitRadius(spin, 'against')
  const noSpinEnergy = 1 - Math.sqrt(8 / 9) // 1 - sqrt(1 - 2/(3 * 6)): the share at the no-spin last safe orbit, 6M
  return [
    { id: 'noSpinLastSafe', expected: NO_SPIN_LAST_SAFE, found: lastSafeOrbitRadius(0, 'with'), reading: same(NO_SPIN_LAST_SAFE, lastSafeOrbitRadius(0, 'with')) },
    { id: 'noSpinHorizon', expected: 1, found: horizonRadius(0), reading: same(1, horizonRadius(0)) },
    { id: 'noSpinEnergy', expected: noSpinEnergy, found: energyReleasedFraction(0, 'with'), reading: same(noSpinEnergy, energyReleasedFraction(0, 'with')) },
    { id: 'energyWith', expected: energyReleasedSecondRoute(spin, 'with'), found: energyReleasedFraction(spin, 'with'), reading: same(energyReleasedSecondRoute(spin, 'with'), energyReleasedFraction(spin, 'with')) },
    { id: 'energyAgainst', expected: energyReleasedSecondRoute(spin, 'against'), found: energyReleasedFraction(spin, 'against'), reading: same(energyReleasedSecondRoute(spin, 'against'), energyReleasedFraction(spin, 'against')) },
    { id: 'withOutsideHorizon', expected: horizon, found: withR, reading: outside(withR, horizon) },
    { id: 'againstOutsideHorizon', expected: horizon, found: againstR, reading: outside(againstR, horizon) },
  ]
}

// A distance in reference radii, in kilometers, for the chosen black hole.
export function radiiToKm(radii: number, presetId: ObjectPreset['id']): number {
  const preset = BLACK_HOLE_PRESETS.find((p) => p.id === presetId)
  if (!preset) throw new Error(`Unknown black hole: ${presetId}`)
  return radii * horizonRadiusKm(preset.massSolarMasses)
}
