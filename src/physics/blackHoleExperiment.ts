// A black hole isn't a new kind of physics — it's what Experiment 6's escape speed becomes once
// it would need to exceed the speed of light. Since nothing can exceed c ("Relativity of Time and
// Motion," Experiment 5), once escape speed reaches c at some distance, nothing can escape from
// within that distance: the event horizon. SPEED_OF_LIGHT and gravitationalParameter/distance are
// dimensionless, relative quantities in Experiment 6's own units, not real physical values.
export const SPEED_OF_LIGHT = 2

export interface BlackHoleResult {
  gravitationalParameter: number
  distance: number
  escapeSpeed: number
  escapeSpeedFractionOfC: number
  eventHorizonRadius: number
  isInsideHorizon: boolean
}

// escapeSpeed is the exact same formula Experiment 6 defines and tests
// (sqrt(2 * gravitationalParameter / distance)), evaluated here rather than as part of a
// simulated sideways launch. eventHorizonRadius solves escapeSpeed = SPEED_OF_LIGHT for distance —
// numerically identical in form to the real Schwarzschild radius, 2GM/c², a curious historical
// coincidence (Michell, 1783) rather than a derivation of the real, general-relativistic result.
export function evaluateBlackHole(gravitationalParameter: number, distance: number): BlackHoleResult {
  if (!(gravitationalParameter > 0)) {
    throw new RangeError('Gravitational parameter must be greater than 0')
  }
  if (!(distance > 0)) {
    throw new RangeError('Distance must be greater than 0')
  }

  const escapeSpeed = Math.sqrt((2 * gravitationalParameter) / distance)
  const escapeSpeedFractionOfC = escapeSpeed / SPEED_OF_LIGHT
  const eventHorizonRadius = (2 * gravitationalParameter) / SPEED_OF_LIGHT ** 2
  const isInsideHorizon = distance <= eventHorizonRadius

  return {
    gravitationalParameter,
    distance,
    escapeSpeed,
    escapeSpeedFractionOfC,
    eventHorizonRadius,
    isInsideHorizon,
  }
}

export interface RadialLaunchPoint {
  t: number
  distance: number
}

export type RadialLaunchOutcome = 'escapes' | 'falls-back'

export interface RadialLaunchResult {
  outcome: RadialLaunchOutcome
  trajectory: RadialLaunchPoint[]
}

const TIME_STEP = 0.01
const ESCAPE_DISTANCE_FACTOR = 3
// A Kepler-like characteristic time for this (gravitationalParameter, startDistance) pair, used
// to scale the simulation's maximum duration so both near-threshold escapes (which climb slowly)
// and near-threshold falls-back (which take a long time to reach apoapsis) have room to resolve.
const MAX_TIME_FACTOR = 100
const ENERGY_TOLERANCE_FACTOR = 1e-6

// Launches a probe straight outward from startDistance at exactly SPEED_OF_LIGHT — the fastest
// speed anything can ever travel — under the same inverse-square gravity law and the same
// fixed-step symplectic (velocity Verlet) integration as orbitExperiment.ts, reduced to one
// dimension since the launch has no sideways component. Because the motion is purely radial, the
// probe can only ever move directly away or directly back: there is no possibility of an orbit
// forming, so this launch cannot misleadingly suggest a stable orbit exists inside a real event
// horizon (it cannot).
export function runRadialLightSpeedLaunch(
  gravitationalParameter: number,
  startDistance: number
): RadialLaunchResult {
  if (!(gravitationalParameter > 0)) {
    throw new RangeError('Gravitational parameter must be greater than 0')
  }
  if (!(startDistance > 0)) {
    throw new RangeError('Start distance must be greater than 0')
  }

  const characteristicTime = Math.sqrt(startDistance ** 3 / gravitationalParameter)
  const maxTime = MAX_TIME_FACTOR * characteristicTime
  const escapeDistance = ESCAPE_DISTANCE_FACTOR * startDistance
  const energyTolerance = (ENERGY_TOLERANCE_FACTOR * gravitationalParameter) / startDistance

  let r = startDistance
  let v = SPEED_OF_LIGHT
  let t = 0

  const trajectory: RadialLaunchPoint[] = [{ t, distance: r }]
  let outcome: RadialLaunchOutcome = 'falls-back'

  const accelerationAt = (distance: number) => -gravitationalParameter / (distance * distance)

  while (t < maxTime) {
    const a = accelerationAt(r)
    const vHalf = v + (a * TIME_STEP) / 2
    r += vHalf * TIME_STEP
    const a2 = accelerationAt(r)
    v = vHalf + (a2 * TIME_STEP) / 2
    t += TIME_STEP
    trajectory.push({ t, distance: r })

    const energy = 0.5 * v * v - gravitationalParameter / r

    if (energy > energyTolerance && r >= escapeDistance && v > 0) {
      outcome = 'escapes'
      break
    }
    if (v <= 0 && r <= startDistance) {
      outcome = 'falls-back'
      break
    }
  }

  return { outcome, trajectory }
}
