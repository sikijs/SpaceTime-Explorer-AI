import { OBJECT_PRESETS, horizonRadiusKm } from './blackHoleSizeExperiment'
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
