import { KM_PER_AU, OBJECT_PRESETS, PUBLISHED, horizonRadiusKm, readAgainstPublished } from './blackHoleSizeExperiment'
import type { ObjectPreset } from './blackHoleSizeExperiment'

// Orbits of a small probe near a non-rotating, uncharged black hole, in the equatorial plane. Two probes are
// followed with the same nudge: one under ordinary (Newtonian) gravity and one under the exact theory. Each is
// launched at the speed that gives a circular orbit by its own rules.
//
// Units here are G = c = 1 and M = GM/c^2 = 1, so the horizon radius is r_s = 2M = 2. Distances are converted to
// and from horizon radii at the edges of this module. With u = 1/r and phi the angle swept, the path obeys
//   ordinary gravity:  u'' = -u + M/L^2
//   exact theory:      u'' = -u + M/L^2 + 3 M u^2
// where L is the angular momentum per unit mass. These are standard (the exact one is general relativity for this
// case) and are given, not derived. The paths are computed by stepping them in equal steps of the angle (fourth-
// order Runge-Kutta), so the resolution is the same at every distance and the plunge comes out of the calculation.

export const NUDGE = 0.001 // d(r)/d(phi) = -NUDGE * r0 at the start
export const MAX_TURNS = 10
export const STEPS_PER_TURN = 720
export const MIN_START_IN_HORIZON_RADII = 1.6
export const MAX_START_IN_HORIZON_RADII = 20
// The last safe circular orbit of the exact theory, 6GM/c^2 = 3 horizon radii (given, not derived).
export const LAST_SAFE_ORBIT_IN_HORIZON_RADII = 3

const M = 1
const HORIZON_RADIUS = 2 * M
const INNERMOST_CIRCULAR_RADIUS = 3 * M // no circular orbit at or inside 1.5 horizon radii

// The three black holes only (Experiment 1's presets that have no real radius).
export const BLACK_HOLE_PRESETS: ObjectPreset[] = OBJECT_PRESETS.filter((p) => p.realRadiusKm === null)

export type Rule = 'ordinary' | 'exact'
export type Outcome = 'keeps-circling' | 'plunges'

// The launch speed for a circular orbit, as measured by someone hovering at that distance, as a fraction of the
// speed of light: sqrt(r_s / (2 (r - r_s))). It reaches 1 at 1.5 horizon radii, so no circular orbit exists there
// or inside for anything slower than light.
export function exactCircularSpeedFractionOfLight(startInHorizonRadii: number): number {
  if (!(startInHorizonRadii > 1.5)) {
    throw new RangeError('No circular orbit exists at or inside 1.5 horizon radii.')
  }
  return Math.sqrt(1 / (2 * (startInHorizonRadii - 1)))
}

// Ordinary gravity's circular-orbit speed, v^2 = GM / r, as a fraction of the speed of light: sqrt(r_s / (2 r)).
export function ordinaryCircularSpeedFractionOfLight(startInHorizonRadii: number): number {
  if (!(startInHorizonRadii > 0)) throw new RangeError('The distance must be greater than zero.')
  return Math.sqrt(1 / (2 * startInHorizonRadii))
}

export interface OrbitPoint {
  turns: number
  distanceInHorizonRadii: number
  x: number // in horizon radii, seen from above, the probe starting on the +x axis
  y: number
  // du/dphi with u = 1/r in the module's own units; kept so the conserved quantities can be checked.
  duDphi: number
}

export interface OrbitPath {
  rule: Rule
  outcome: Outcome
  turnsCompleted: number
  closestInHorizonRadii: number
  farthestInHorizonRadii: number
  points: OrbitPoint[]
}

// The path of a probe launched at the circular-orbit speed for this rule at the given start, with an inward nudge.
export function orbitPath(rule: Rule, startInHorizonRadii: number, nudge: number = NUDGE): OrbitPath {
  if (rule === 'exact' && !(startInHorizonRadii > 1.5)) {
    throw new RangeError('No circular orbit exists at or inside 1.5 horizon radii.')
  }
  if (!(startInHorizonRadii > 0)) throw new RangeError('The distance must be greater than zero.')

  const r0 = startInHorizonRadii * HORIZON_RADIUS
  // 1 / L^2 for a circular orbit under each rule: ordinary L^2 = M r, exact L^2 = M r^2 / (r - 3M).
  const a = rule === 'exact' ? (r0 - INNERMOST_CIRCULAR_RADIUS) / (M * r0 * r0) : 1 / (M * r0)
  const extra = rule === 'exact' ? 3 * M : 0
  const accel = (u: number) => -u + a * M + extra * u * u

  const uHorizon = 1 / HORIZON_RADIUS
  const dphi = (2 * Math.PI) / STEPS_PER_TURN
  const totalSteps = MAX_TURNS * STEPS_PER_TURN

  let u = 1 / r0
  let w = nudge * u // du/dphi: d(r)/d(phi) = -nudge * r0
  let phi = 0

  const toPoint = (uValue: number, wValue: number, angle: number): OrbitPoint => {
    const distance = 1 / uValue / HORIZON_RADIUS
    return {
      turns: angle / (2 * Math.PI),
      distanceInHorizonRadii: distance,
      x: distance * Math.cos(angle),
      y: distance * Math.sin(angle),
      duDphi: wValue,
    }
  }

  const points: OrbitPoint[] = [toPoint(u, w, phi)]
  let closest = startInHorizonRadii
  let farthest = startInHorizonRadii
  let plunged = false

  for (let step = 0; step < totalSteps; step++) {
    const k1u = w
    const k1w = accel(u)
    const k2u = w + (dphi / 2) * k1w
    const k2w = accel(u + (dphi / 2) * k1u)
    const k3u = w + (dphi / 2) * k2w
    const k3w = accel(u + (dphi / 2) * k2u)
    const k4u = w + dphi * k3w
    const k4w = accel(u + dphi * k3u)
    const uNext = u + (dphi / 6) * (k1u + 2 * k2u + 2 * k3u + k4u)
    const wNext = w + (dphi / 6) * (k1w + 2 * k2w + 2 * k3w + k4w)

    if (uNext >= uHorizon) {
      // The probe reached the horizon during this step: end the path exactly there.
      const fraction = (uHorizon - u) / (uNext - u)
      const wAtHorizon = w + fraction * (wNext - w)
      points.push(toPoint(uHorizon, wAtHorizon, phi + fraction * dphi))
      closest = 1
      plunged = true
      break
    }

    u = uNext
    w = wNext
    phi += dphi
    const point = toPoint(u, w, phi)
    points.push(point)
    closest = Math.min(closest, point.distanceInHorizonRadii)
    farthest = Math.max(farthest, point.distanceInHorizonRadii)
  }

  const last = points[points.length - 1]
  return {
    rule,
    outcome: plunged ? 'plunges' : 'keeps-circling',
    turnsCompleted: last.turns,
    closestInHorizonRadii: closest,
    farthestInHorizonRadii: farthest,
    points,
  }
}

export interface OrbitsNearBlackHoleResult {
  preset: ObjectPreset
  horizonRadiusKm: number
  startInHorizonRadii: number
  startKm: number
  lastSafeOrbitKm: number
  exactSpeedFractionOfLight: number
  ordinarySpeedFractionOfLight: number
  ordinary: OrbitPath
  exact: OrbitPath
}

export function runOrbitsNearBlackHoleExperiment(
  presetId: ObjectPreset['id'],
  startInHorizonRadii: number,
): OrbitsNearBlackHoleResult {
  const preset = BLACK_HOLE_PRESETS.find((p) => p.id === presetId)
  if (!preset) throw new Error(`Unknown black hole: ${presetId}`)
  if (!(startInHorizonRadii >= MIN_START_IN_HORIZON_RADII && startInHorizonRadii <= MAX_START_IN_HORIZON_RADII)) {
    throw new RangeError(
      `The start must be between ${MIN_START_IN_HORIZON_RADII} and ${MAX_START_IN_HORIZON_RADII} horizon radii.`,
    )
  }

  const horizon = horizonRadiusKm(preset.massSolarMasses)
  return {
    preset,
    horizonRadiusKm: horizon,
    startInHorizonRadii,
    startKm: startInHorizonRadii * horizon,
    lastSafeOrbitKm: LAST_SAFE_ORBIT_IN_HORIZON_RADII * horizon,
    exactSpeedFractionOfLight: exactCircularSpeedFractionOfLight(startInHorizonRadii),
    ordinarySpeedFractionOfLight: ordinaryCircularSpeedFractionOfLight(startInHorizonRadii),
    ordinary: orbitPath('ordinary', startInHorizonRadii),
    exact: orbitPath('exact', startInHorizonRadii),
  }
}

const edgeCache = new Map<number, number>()

// The smallest starting distance (in horizon radii) at which the exact-theory probe keeps circling for MAX_TURNS with
// this nudge, found by bisection on the same calculation. It lies slightly above the exact theory's last safe orbit
// because the nudge is small but not zero, and it approaches 3 as the nudge falls.
export function modelEdgeInHorizonRadii(nudge: number = NUDGE): number {
  const cached = edgeCache.get(nudge)
  if (cached !== undefined) return cached

  let plunges = LAST_SAFE_ORBIT_IN_HORIZON_RADII // a probe starting here plunges
  let circles = 6 // and one starting here keeps circling, for every nudge this experiment uses
  for (let i = 0; i < 30; i++) {
    const middle = (plunges + circles) / 2
    if (orbitPath('exact', middle, nudge).outcome === 'plunges') plunges = middle
    else circles = middle
  }
  edgeCache.set(nudge, circles)
  return circles
}

// ---------------------------------------------------------------------------------------------------------------
// Audit update (Black Holes 3): numbers for the white guess marks, the fixed Part 1 run (a pair at 2 horizon radii and
// a pair at 20), the check-up, and the comparisons the interface and tutor used to work out themselves. No function
// here reads a prediction; the guess functions take the guess as an argument and only describe it or mark it.
// ---------------------------------------------------------------------------------------------------------------

// Part 1 always runs the 10-Sun black hole: a pair at 2 horizon radii (guesses 1 and 2) and a pair at 20 (guess 3).
export const PART_ONE_BLACK_HOLE_ID: ObjectPreset['id'] = 'stellar-black-hole'
export const PART_ONE_START_IN_HORIZON_RADII = 2
export const FAR_START_IN_HORIZON_RADII = 20
// How far the Part 1 pictures reach, in horizon radii: the 2-radii panels reach 4 (so the ring at 3 fits), the graph
// reaches 12 on a log axis (so a ring at 3 or 10 fits), and the compact 20-radii panels reach 25.
export const PART_ONE_PANEL_VIEW_IN_HORIZON_RADII = 4
export const PART_ONE_GRAPH_MAX_IN_HORIZON_RADII = 12
export const FAR_PANEL_VIEW_IN_HORIZON_RADII = 25

export function runPartOne(): OrbitsNearBlackHoleResult {
  return runOrbitsNearBlackHoleExperiment(PART_ONE_BLACK_HOLE_ID, PART_ONE_START_IN_HORIZON_RADII)
}
export function runFarPair(): OrbitsNearBlackHoleResult {
  return runOrbitsNearBlackHoleExperiment(PART_ONE_BLACK_HOLE_ID, FAR_START_IN_HORIZON_RADII)
}

// ---- Guess 1: what a nudged circle at 2 horizon radii does ----
export type NudgeGuess = 'wobbles' | 'spirals-in' | 'flies-off'
// The white marker for each answer is a shape, not a size (an outcome has no position of its own).
export type NudgeMark = 'ring-at-start' | 'inward-arrow' | 'outward-arrow'
export function nudgeGuessMark(guess: NudgeGuess): NudgeMark {
  return guess === 'wobbles' ? 'ring-at-start' : guess === 'spirals-in' ? 'inward-arrow' : 'outward-arrow'
}
// A probe "flies off" if the exact-theory probe ends the run at least this many times as far out as it began. This is
// the page's own marking choice; no run in this experiment comes anywhere near it.
export const FLIES_OFF_AT_LEAST_TIMES_THE_START = 2
// For the tutor only: the answer the exact-theory probe at 2 horizon radii gives.
export function modelNudgeAnswer(): NudgeGuess {
  const path = orbitPath('exact', PART_ONE_START_IN_HORIZON_RADII)
  if (path.outcome === 'plunges') return 'spirals-in'
  const end = path.points[path.points.length - 1].distanceInHorizonRadii
  return end >= FLIES_OFF_AT_LEAST_TIMES_THE_START * PART_ONE_START_IN_HORIZON_RADII ? 'flies-off' : 'wobbles'
}
export function nudgeGuessIsModelAnswer(guess: NudgeGuess): boolean {
  return guess === modelNudgeAnswer()
}

// ---- Guess 2: the last safe place to circle ----
export type LastSafeGuess = 'anywhere' | 'three' | 'ten'
export const GUESSED_LAST_SAFE_IN_HORIZON_RADII: Record<LastSafeGuess, number | null> = {
  anywhere: null, // no distance of its own: drawn as a marker only
  three: 3,
  ten: 10,
}
export function guessedLastSafeInHorizonRadii(guess: LastSafeGuess): number | null {
  return GUESSED_LAST_SAFE_IN_HORIZON_RADII[guess]
}
// True if the guessed ring lies beyond what a picture reaches, so the page draws an arrow at its edge instead.
export function lastSafeGuessIsOffView(guess: LastSafeGuess, viewInHorizonRadii: number): boolean {
  const radii = guessedLastSafeInHorizonRadii(guess)
  return radii !== null && radii > viewInHorizonRadii
}
export function lastSafeGuessIsModelAnswer(guess: LastSafeGuess): boolean {
  return guessedLastSafeInHorizonRadii(guess) === LAST_SAFE_ORBIT_IN_HORIZON_RADII
}

// ---- Guess 3: far out, do the two rules give different orbits? ----
export type FarGuess = 'very-different' | 'nearly-same'
export type FarMark = 'not-equal-sign' | 'about-equal-sign'
export function farGuessMark(guess: FarGuess): FarMark {
  return guess === 'very-different' ? 'not-equal-sign' : 'about-equal-sign'
}
// "Nearly the same" is marked when both probes keep circling and their launch speeds differ by no more than this
// percent. The page's own marking choice, not a physical limit.
export const NEARLY_THE_SAME_WITHIN_PERCENT = 5
export function speedGapPercent(startInHorizonRadii: number): number {
  return (exactCircularSpeedFractionOfLight(startInHorizonRadii) / ordinaryCircularSpeedFractionOfLight(startInHorizonRadii) - 1) * 100
}
export function farGuessIsModelAnswer(guess: FarGuess): boolean {
  const far = runFarPair()
  const same =
    far.ordinary.outcome === far.exact.outcome && Math.abs(speedGapPercent(FAR_START_IN_HORIZON_RADII)) <= NEARLY_THE_SAME_WITHIN_PERCENT
  return guess === (same ? 'nearly-same' : 'very-different')
}

// How far a path wanders from its starting distance, as a percent of that distance (the tutor and Results used to work
// this out themselves).
export function wobblePercent(path: OrbitPath, startInHorizonRadii: number): number {
  return Math.max(1 - path.closestInHorizonRadii / startInHorizonRadii, path.farthestInHorizonRadii / startInHorizonRadii - 1) * 100
}

// ---- The check-up: a plain reading of one number against a reference; no cut-offs ----
export type Reading = 'the same' | 'more' | 'less'
export function readAgainst(found: number, reference: number): Reading {
  if (Math.abs(found - reference) <= 1e-9 * Math.max(Math.abs(reference), 1e-300)) return 'the same'
  return found > reference ? 'more' : 'less'
}
export interface OrbitCheckUpRow {
  what: string
  expected: string
  found: number
  // "the same", "more", "less", or, for a rounded published figure, "the same, to the rounding" / "a different value".
  reading: string
}
// Each row's reference is a formula the model is built from, or a figure already published for Black Holes 1; none is a
// measurement of an orbit.
export function checkUpRows(): OrbitCheckUpRow[] {
  const two = runPartOne()
  const far = runFarPair()
  const closedExact = (x: number) => Math.sqrt(1 / (2 * (x - 1)))
  const closedOrdinary = (x: number) => Math.sqrt(1 / (2 * x))
  return [
    {
      what: 'Last safe orbit: this model\'s edge against the exact theory\'s 6GM/c² (horizon radii)',
      expected: String(LAST_SAFE_ORBIT_IN_HORIZON_RADII),
      found: modelEdgeInHorizonRadii(),
      reading: readAgainst(modelEdgeInHorizonRadii(), LAST_SAFE_ORBIT_IN_HORIZON_RADII),
    },
    {
      what: 'Launch speed at 2 horizon radii, exact theory (fraction of light speed)',
      expected: closedExact(PART_ONE_START_IN_HORIZON_RADII).toFixed(3),
      found: two.exactSpeedFractionOfLight,
      reading: readAgainst(two.exactSpeedFractionOfLight, closedExact(PART_ONE_START_IN_HORIZON_RADII)),
    },
    {
      what: 'Launch speed at 2 horizon radii, ordinary gravity (fraction of light speed)',
      expected: closedOrdinary(PART_ONE_START_IN_HORIZON_RADII).toFixed(3),
      found: two.ordinarySpeedFractionOfLight,
      reading: readAgainst(two.ordinarySpeedFractionOfLight, closedOrdinary(PART_ONE_START_IN_HORIZON_RADII)),
    },
    {
      what: 'Launch speed at 20 horizon radii, exact theory (fraction of light speed)',
      expected: closedExact(FAR_START_IN_HORIZON_RADII).toFixed(3),
      found: far.exactSpeedFractionOfLight,
      reading: readAgainst(far.exactSpeedFractionOfLight, closedExact(FAR_START_IN_HORIZON_RADII)),
    },
    {
      what: 'Horizon radius of 10 Suns (km), against the figure used in Black Holes 1',
      expected: String(PUBLISHED.tenSunsHorizonKm),
      found: two.horizonRadiusKm,
      reading: readAgainstPublished(two.horizonRadiusKm, PUBLISHED.tenSunsHorizonKm),
    },
  ]
}

// ---- Where real orbits sit, in horizon radii (calculated here from published distances) ----
// ESO eso2006 (16 Apr 2020): S2 comes "less than 20 billion kilometres" from Sagittarius A* (an upper bound),
// "once every 16 years", at "almost three percent of the speed of light".
// ESO eso2612 (19 Aug 2026): S301 passes "just 1.78 billion km" from it, "just 8.7 years" per orbit, at "25 000 km/s",
// "over 8% of the speed of light", with its next closest passage in 2031. The Nature paper was not read.
export const S2_CLOSEST_APPROACH_KM_UPPER_BOUND = 20e9
// The same page also says "one hundred and twenty times the distance between the Sun and Earth" (about 17.9 billion km,
// which agrees with "less than 20 billion"; 20 billion km itself would be about 134 AU). The page's rounder figures are
// kept as published, and the rows below use the bound.
export const S2_CLOSEST_APPROACH_AU_ESO = 120
export const S2_PERIOD_YEARS = 16
export const S301_CLOSEST_APPROACH_KM = 1.78e9
export const S301_PERIOD_YEARS = 8.7
export const S301_TOP_SPEED_KM_PER_S = 25_000
export const SPEED_OF_LIGHT_KM_PER_SECOND = 299_792.458
export const S301_NEXT_CLOSEST_PASSAGE_YEAR = 2031

export function s301TopSpeedFractionOfLight(): number {
  return S301_TOP_SPEED_KM_PER_S / SPEED_OF_LIGHT_KM_PER_SECOND
}

export interface RealStarRow {
  label: string
  closestApproachKm: number
  closestApproachAu: number
  // True where ESO gives only an upper bound ("less than").
  isUpperBound: boolean
  // In Sagittarius A*'s horizon radii, with this page's 4.3 million Suns and with ESO's rounder four million.
  horizonRadiiThisPage: number
  horizonRadiiEsoMass: number
}
export function realStarRows(): RealStarRow[] {
  const sgr = OBJECT_PRESETS.find((p) => p.id === 'sgr-a-star')
  if (!sgr) throw new Error('Sgr A* preset missing')
  const thisPage = horizonRadiusKm(sgr.massSolarMasses)
  const eso = horizonRadiusKm(PUBLISHED.sgrAStarMassSolarMasses)
  const row = (label: string, km: number, isUpperBound: boolean): RealStarRow => ({
    label,
    closestApproachKm: km,
    closestApproachAu: km / KM_PER_AU,
    isUpperBound,
    horizonRadiiThisPage: km / thisPage,
    horizonRadiiEsoMass: km / eso,
  })
  return [
    row('S2', S2_CLOSEST_APPROACH_KM_UPPER_BOUND, true),
    row('S301', S301_CLOSEST_APPROACH_KM, false),
  ]
}

// The last safe orbit of each black hole, in km and AU (3 horizon radii).
export interface LastSafeOrbitRow {
  preset: ObjectPreset
  horizonRadiusKm: number
  lastSafeOrbitKm: number
  lastSafeOrbitAu: number
}
export function lastSafeOrbitRows(): LastSafeOrbitRow[] {
  return BLACK_HOLE_PRESETS.map((preset) => {
    const horizon = horizonRadiusKm(preset.massSolarMasses)
    const km = LAST_SAFE_ORBIT_IN_HORIZON_RADII * horizon
    return { preset, horizonRadiusKm: horizon, lastSafeOrbitKm: km, lastSafeOrbitAu: km / KM_PER_AU }
  })
}
