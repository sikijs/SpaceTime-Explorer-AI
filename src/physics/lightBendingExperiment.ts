// Light passing near a mass, but not aimed at it, still has its path bent by ordinary gravity —
// this experiment integrates that flyby with the same inverse-square law and fixed-step
// symplectic (velocity Verlet) integration as orbitExperiment.ts, starting far to one side and
// offset by aimDistance (the "impact parameter"), moving at exactly SPEED_OF_LIGHT. Unlike every
// other experiment in this chapter, it also states — by formula, not derivation — the real,
// general-relativistic deflection angle, which is exactly double the simulated one, because real
// gravity also curves space itself, an effect this ordinary-gravity engine does not model.
import { evaluateBlackHole, SPEED_OF_LIGHT } from './blackHoleExperiment'

export interface LightBendingPoint {
  t: number
  x: number
  y: number
}

export type LightBendingOutcome = 'deflects' | 'falls-in'

export interface LightBendingResult {
  gravitationalParameter: number
  aimDistance: number
  newtonianDeflectionAngle: number
  generalRelativisticDeflectionAngle: number
  outcome: LightBendingOutcome
  trajectory: LightBendingPoint[]
  simulatedDeflectionAngle: number | null
}

const START_X = -15
const FAR_FIELD_X = 15
const TIME_STEP = 0.01
// Safety margin over the straight-line light-crossing time, since a bent path is longer than a
// straight one.
const MAX_TIME_FACTOR = 3

function accelerationAt(
  x: number,
  y: number,
  gravitationalParameter: number
): { ax: number; ay: number } {
  const r = Math.hypot(x, y)
  const factor = -gravitationalParameter / (r * r * r)
  return { ax: factor * x, ay: factor * y }
}

// The standard weak-field (small-angle) deflection formula for a fast particle under ordinary
// gravity — a known, textbook result, not derived here. Valid when aimDistance is large compared
// to the event-horizon scale.
export function runLightBendingExperiment(
  gravitationalParameter: number,
  aimDistance: number
): LightBendingResult {
  if (!(gravitationalParameter > 0)) {
    throw new RangeError('Gravitational parameter must be greater than 0')
  }
  if (!(aimDistance > 0)) {
    throw new RangeError('Aim distance must be greater than 0')
  }

  const newtonianDeflectionAngle = (2 * gravitationalParameter) / (SPEED_OF_LIGHT ** 2 * aimDistance)
  const generalRelativisticDeflectionAngle = 2 * newtonianDeflectionAngle

  const collisionRadius = evaluateBlackHole(gravitationalParameter, aimDistance).eventHorizonRadius
  const maxTime = (MAX_TIME_FACTOR * (2 * Math.abs(START_X))) / SPEED_OF_LIGHT

  let x = START_X
  let y = aimDistance
  let vx = SPEED_OF_LIGHT
  let vy = 0
  let t = 0

  const trajectory: LightBendingPoint[] = [{ t, x, y }]
  let outcome: LightBendingOutcome = 'falls-in'
  let simulatedDeflectionAngle: number | null = null

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
      simulatedDeflectionAngle = null
      break
    }

    if (x >= FAR_FIELD_X && vx > 0) {
      outcome = 'deflects'
      simulatedDeflectionAngle = Math.abs(Math.atan2(vy, vx))
      break
    }
  }

  return {
    gravitationalParameter,
    aimDistance,
    newtonianDeflectionAngle,
    generalRelativisticDeflectionAngle,
    outcome,
    trajectory,
    simulatedDeflectionAngle,
  }
}
