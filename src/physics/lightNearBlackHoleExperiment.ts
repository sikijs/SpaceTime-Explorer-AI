import { OBJECT_PRESETS, horizonRadiusKm } from './blackHoleSizeExperiment'
import type { ObjectPreset } from './blackHoleSizeExperiment'

// A thin beam of light passing a non-rotating, uncharged black hole, in the equatorial plane, in the exact theory of
// gravity. Distances are in horizon radii (r_s = 1), so with u = 1/r and phi the angle swept around the black hole the
// path of the light obeys
//   u'' = -u + 1.5 u^2
// starting very far away (u = 0) with u' = 1 / b, where b is the aim distance: how close to the center the light would
// pass if gravity did nothing. This is standard general relativity for this case and is given, not derived. The path is
// computed by stepping it in equal steps of the angle (fourth-order Runge-Kutta), so the same calculation gives a small
// bend, a swing around the black hole, and a capture.
//
// The light starts on the +x axis (phi = 0, far away) and sweeps counterclockwise; its incoming straight line, were
// gravity to do nothing, is the line y = b. The total bend is the angle swept minus half a turn.

export const STEPS_PER_TURN = 720
export const MIN_AIM_IN_HORIZON_RADII = 1 // aimed at the horizon's edge
export const MAX_AIM_IN_HORIZON_RADII = 20
// The circular light orbit, 3GM/c^2 = 1.5 horizon radii (given, not derived). It does not last.
export const PHOTON_SPHERE_IN_HORIZON_RADII = 1.5
// The critical aim distance, 3 sqrt(3) / 2 horizon radii (given, not derived): light aimed closer is captured.
export const CRITICAL_AIM_IN_HORIZON_RADII = (3 * Math.sqrt(3)) / 2

// A guard against an aim so close to the critical distance that the light winds more than this many turns.
const MAX_TURNS = 50

// The three black holes only (Experiment 1's presets that have no real radius).
export const BLACK_HOLE_PRESETS: ObjectPreset[] = OBJECT_PRESETS.filter((p) => p.realRadiusKm === null)

export type LightOutcome = 'escapes' | 'captured'

export interface LightPoint {
  phi: number // radians swept so far
  distanceInHorizonRadii: number
  x: number // in horizon radii, seen from above
  y: number
  // du/dphi with u = 1/r in horizon radii; kept so the conserved quantity can be checked.
  duDphi: number
}

export interface LightPath {
  outcome: LightOutcome
  bendRadians: number | null // the total bend if it escapes; null if captured
  turnsAround: number // turns swept around the black hole (more than 0.5 if it swings)
  closestInHorizonRadii: number // closest approach, or 1 if captured
  // From the first step after "very far away" to the end. The first point is already many horizon radii away; the
  // picture draws the part inside its view.
  points: LightPoint[]
}

// The simple formula of Gravity Experiment 8 in horizon radii: the bend is 2 / aim, in radians. It is for weak gravity.
export function weakFieldBendRadians(aimInHorizonRadii: number): number {
  if (!(aimInHorizonRadii > 0) || !Number.isFinite(aimInHorizonRadii)) {
    throw new RangeError('The aim distance must be greater than zero.')
  }
  return 2 / aimInHorizonRadii
}

const accel = (u: number) => -u + 1.5 * u * u

// The path of a beam of light aimed to pass the center at the given distance (in horizon radii) if gravity did nothing.
export function lightPath(aimInHorizonRadii: number): LightPath {
  if (!(aimInHorizonRadii > 0) || !Number.isFinite(aimInHorizonRadii)) {
    throw new RangeError('The aim distance must be greater than zero.')
  }

  const dphi = (2 * Math.PI) / STEPS_PER_TURN
  const totalSteps = MAX_TURNS * STEPS_PER_TURN

  let u = 0
  let w = 1 / aimInHorizonRadii // du/dphi
  let phi = 0

  const toPoint = (uValue: number, wValue: number, angle: number): LightPoint => {
    const distance = 1 / uValue
    return { phi: angle, distanceInHorizonRadii: distance, x: distance * Math.cos(angle), y: distance * Math.sin(angle), duDphi: wValue }
  }

  const points: LightPoint[] = []
  let highestU = 0

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

    if (uNext >= 1) {
      // The light reached the horizon during this step: end the path exactly there.
      const fraction = (1 - u) / (uNext - u)
      const wAtHorizon = w + fraction * (wNext - w)
      const end = phi + fraction * dphi
      points.push(toPoint(1, wAtHorizon, end))
      return { outcome: 'captured', bendRadians: null, turnsAround: end / (2 * Math.PI), closestInHorizonRadii: 1, points }
    }

    if (uNext <= 0) {
      // The light is far away again: the angle at which u returns to zero, found by interpolating this step.
      const end = phi + (u / (u - uNext)) * dphi
      return {
        outcome: 'escapes',
        bendRadians: end - Math.PI,
        turnsAround: end / (2 * Math.PI),
        closestInHorizonRadii: 1 / highestU,
        points,
      }
    }

    u = uNext
    w = wNext
    phi += dphi
    points.push(toPoint(u, w, phi))
    if (u > highestU) highestU = u
  }

  throw new Error('The light wound around the black hole too many times to follow.')
}

export interface LightNearBlackHoleResult {
  preset: ObjectPreset
  horizonRadiusKm: number
  aimInHorizonRadii: number
  aimKm: number
  criticalAimKm: number
  photonSphereKm: number
  path: LightPath
  weakFieldBendRadians: number
}

export function runLightNearBlackHoleExperiment(
  presetId: ObjectPreset['id'],
  aimInHorizonRadii: number,
): LightNearBlackHoleResult {
  const preset = BLACK_HOLE_PRESETS.find((p) => p.id === presetId)
  if (!preset) throw new Error(`Unknown black hole: ${presetId}`)
  if (!(aimInHorizonRadii >= MIN_AIM_IN_HORIZON_RADII && aimInHorizonRadii <= MAX_AIM_IN_HORIZON_RADII)) {
    throw new RangeError(`The aim must be between ${MIN_AIM_IN_HORIZON_RADII} and ${MAX_AIM_IN_HORIZON_RADII} horizon radii.`)
  }

  const horizon = horizonRadiusKm(preset.massSolarMasses)
  return {
    preset,
    horizonRadiusKm: horizon,
    aimInHorizonRadii,
    aimKm: aimInHorizonRadii * horizon,
    criticalAimKm: CRITICAL_AIM_IN_HORIZON_RADII * horizon,
    photonSphereKm: PHOTON_SPHERE_IN_HORIZON_RADII * horizon,
    path: lightPath(aimInHorizonRadii),
    weakFieldBendRadians: weakFieldBendRadians(aimInHorizonRadii),
  }
}

let curveCache: Array<{ aim: number; bendRadians: number }> | null = null

// The exact bend at many aim distances from the critical aim to the largest aim, from the same calculation, for the
// graph. The spacing is geometric in (aim - critical aim), so the steep rise near the critical aim is drawn finely.
export function bendCurve(): Array<{ aim: number; bendRadians: number }> {
  if (curveCache) return curveCache
  const count = 160
  const widest = MAX_AIM_IN_HORIZON_RADII - CRITICAL_AIM_IN_HORIZON_RADII
  const narrowest = 0.0005
  const curve: Array<{ aim: number; bendRadians: number }> = []
  for (let i = 0; i < count; i++) {
    const offset = narrowest * (widest / narrowest) ** (1 - i / (count - 1)) // from the widest (i = 0) down to the narrowest
    const aim = CRITICAL_AIM_IN_HORIZON_RADII + offset
    const bend = lightPath(aim).bendRadians
    if (bend !== null) curve.push({ aim, bendRadians: bend })
  }
  curveCache = curve
  return curve
}
