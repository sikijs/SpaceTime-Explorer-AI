// Ordinary Newtonian gravity in two dimensions, numerically integrated (not a shortcut
// formula), so falling-in, escaping, and orbiting all fall out of the same single
// calculation, exactly as they do for a real body under real gravity. gravitationalParameter
// (GM) and distances are dimensionless, relative quantities, as in Experiment 5 — not real
// kilograms, meters, or seconds.
//
// The body starts at (initialDistance, 0) moving in the +y direction at initialSpeed, and its
// position and velocity are advanced with velocity Verlet (a symplectic integrator), which
// conserves orbital energy far better than plain Euler over many steps. Plain Euler would make
// a circular orbit visibly spiral due to integration error alone — not a real physical effect.
//
// The outcome is decided by the body's conserved specific orbital energy
// (E = 1/2 v^2 - GM/r), which is what actually determines a trajectory's fate in real
// two-body gravity, together with the collision radius: negative energy means a bound orbit
// (which still falls in if its path ever reaches the collision radius); non-negative energy
// once past periapsis (moving outward) means it never returns.
export interface OrbitPoint {
  t: number
  x: number
  y: number
}

export type OrbitOutcome = 'falls-in' | 'escapes' | 'orbits'

export interface OrbitExperimentResult {
  gravitationalParameter: number
  initialDistance: number
  initialSpeed: number
  circularSpeed: number
  escapeSpeed: number
  outcome: OrbitOutcome
  trajectory: OrbitPoint[]
}

const COLLISION_RADIUS_FACTOR = 0.1
const MAX_ORBIT_PERIODS = 8
const TIME_STEP = 0.01
// Specific orbital energy above this (in units of GM / initialDistance) counts as "unbound",
// allowing for the integrator's small energy drift over many steps.
const ENERGY_TOLERANCE_FACTOR = 1e-6

function accelerationAt(
  x: number,
  y: number,
  gravitationalParameter: number
): { ax: number; ay: number } {
  const r = Math.hypot(x, y)
  const factor = -gravitationalParameter / (r * r * r)
  return { ax: factor * x, ay: factor * y }
}

function specificEnergy(
  x: number,
  y: number,
  vx: number,
  vy: number,
  gravitationalParameter: number
): number {
  const r = Math.hypot(x, y)
  return 0.5 * (vx * vx + vy * vy) - gravitationalParameter / r
}

export function runOrbitExperiment(
  gravitationalParameter: number,
  initialDistance: number,
  initialSpeed: number
): OrbitExperimentResult {
  if (!(gravitationalParameter > 0)) {
    throw new RangeError('Gravitational parameter must be greater than 0')
  }
  if (!(initialDistance > 0)) {
    throw new RangeError('Initial distance must be greater than 0')
  }
  if (!(initialSpeed >= 0)) {
    throw new RangeError('Initial speed must be greater than or equal to 0')
  }

  const circularSpeed = Math.sqrt(gravitationalParameter / initialDistance)
  const escapeSpeed = Math.sqrt((2 * gravitationalParameter) / initialDistance)
  const circularPeriod = (2 * Math.PI * initialDistance) / circularSpeed
  const maxTime = MAX_ORBIT_PERIODS * circularPeriod
  const collisionRadius = COLLISION_RADIUS_FACTOR * initialDistance
  const energyTolerance = (ENERGY_TOLERANCE_FACTOR * gravitationalParameter) / initialDistance

  let x = initialDistance
  let y = 0
  let vx = 0
  let vy = initialSpeed
  let t = 0

  const trajectory: OrbitPoint[] = [{ t, x, y }]
  let outcome: OrbitOutcome = 'orbits'

  while (t < maxTime) {
    const { ax, ay } = accelerationAt(x, y, gravitationalParameter)
    const vxHalf = vx + (ax * TIME_STEP) / 2
    const vyHalf = vy + (ay * TIME_STEP) / 2
    x += vxHalf * TIME_STEP
    y += vyHalf * TIME_STEP
    const { ax: ax2, ay: ay2 } = accelerationAt(x, y, gravitationalParameter)
    vx = vxHalf + (ax2 * TIME_STEP) / 2
    vy = vyHalf + (ay2 * TIME_STEP) / 2
    t += TIME_STEP
    trajectory.push({ t, x, y })

    const r = Math.hypot(x, y)
    if (r <= collisionRadius) {
      outcome = 'falls-in'
      break
    }

    const radialVelocity = (x * vx + y * vy) / r
    const energy = specificEnergy(x, y, vx, vy, gravitationalParameter)
    if (energy > energyTolerance && radialVelocity > 0) {
      outcome = 'escapes'
      break
    }
  }

  return {
    gravitationalParameter,
    initialDistance,
    initialSpeed,
    circularSpeed,
    escapeSpeed,
    outcome,
    trajectory,
  }
}
