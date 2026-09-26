// Units: acceleration in meters per second squared; height and separation in meters; time in seconds.
import { EARTH_GRAVITY } from './equivalencePrincipleExperiment'

export { EARTH_GRAVITY }

export type TidalEffectScene = 'planet' | 'rocket'

export interface TidalEffectExperimentResult {
  accelerationMetersPerSecondSquared: number
  accelerationInG: number
  initialHeightMeters: number
  initialSeparationMeters: number
  convergenceStrength: number
  timeToFloorSeconds: number
}

export interface TidalEffectBallPositions {
  heightAboveFloor: number
  leftBallOffset: number
  rightBallOffset: number
}

// The vertical fall is identical to Experiment 1 (the equivalence principle) in both
// scenes — the only new physics here is the horizontal separation between two balls.
export function runTidalEffectExperiment(
  accelerationMetersPerSecondSquared: number,
  initialHeightMeters: number,
  initialSeparationMeters: number,
  convergenceStrength: number
): TidalEffectExperimentResult {
  if (!(accelerationMetersPerSecondSquared > 0)) {
    throw new RangeError('Acceleration must be greater than 0')
  }
  if (!(initialHeightMeters > 0)) {
    throw new RangeError('Initial height must be greater than 0')
  }
  if (!(initialSeparationMeters > 0)) {
    throw new RangeError('Initial separation must be greater than 0')
  }
  if (!(convergenceStrength > 0 && convergenceStrength < 1)) {
    throw new RangeError('Convergence strength must be between 0 and 1 (exclusive)')
  }

  return {
    accelerationMetersPerSecondSquared,
    accelerationInG: accelerationMetersPerSecondSquared / EARTH_GRAVITY,
    initialHeightMeters,
    initialSeparationMeters,
    convergenceStrength,
    timeToFloorSeconds: Math.sqrt((2 * initialHeightMeters) / accelerationMetersPerSecondSquared),
  }
}

// Ball separation at a given elapsed time: constant in the rocket scene (uniform
// acceleration has no center to converge toward), shrinking in the planet scene
// (first-order tidal approximation, fixed at each ball's starting offset).
function separationAt(experiment: TidalEffectExperimentResult, elapsedSeconds: number, scene: TidalEffectScene): number {
  if (scene === 'rocket') {
    return experiment.initialSeparationMeters
  }

  const fractionOfFall = elapsedSeconds / experiment.timeToFloorSeconds
  return experiment.initialSeparationMeters * (1 - experiment.convergenceStrength * fractionOfFall * fractionOfFall)
}

export function ballPositionsAt(
  experiment: TidalEffectExperimentResult,
  elapsedSeconds: number,
  scene: TidalEffectScene
): TidalEffectBallPositions {
  if (!(elapsedSeconds >= 0 && elapsedSeconds <= experiment.timeToFloorSeconds)) {
    throw new RangeError('Elapsed time must be between 0 and the time the balls reach the floor')
  }

  const heightAboveFloor =
    experiment.initialHeightMeters -
    0.5 * experiment.accelerationMetersPerSecondSquared * elapsedSeconds * elapsedSeconds
  const separation = separationAt(experiment, elapsedSeconds, scene)

  return {
    heightAboveFloor,
    leftBallOffset: -separation / 2,
    rightBallOffset: separation / 2,
  }
}
