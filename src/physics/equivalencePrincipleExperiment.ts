// Units: acceleration in meters per second squared; height in meters; time in seconds.
// Earth's surface gravity, used both as the "1g" preset and to express any chosen
// acceleration in g-multiples for the learner.
export const EARTH_GRAVITY = 9.8

export interface EquivalencePrincipleExperimentResult {
  accelerationMetersPerSecondSquared: number
  accelerationInG: number
  initialHeightMeters: number
  timeToFloorSeconds: number
}

// Scene A (gravity) and Scene B (accelerating cabin) share this single calculation:
// there is exactly one formula, not two, which is itself the physics being demonstrated.
export function runEquivalencePrincipleExperiment(
  accelerationMetersPerSecondSquared: number,
  initialHeightMeters: number
): EquivalencePrincipleExperimentResult {
  if (!(accelerationMetersPerSecondSquared > 0)) {
    throw new RangeError('Acceleration must be greater than 0')
  }
  if (!(initialHeightMeters > 0)) {
    throw new RangeError('Initial height must be greater than 0')
  }

  return {
    accelerationMetersPerSecondSquared,
    accelerationInG: accelerationMetersPerSecondSquared / EARTH_GRAVITY,
    initialHeightMeters,
    timeToFloorSeconds: Math.sqrt((2 * initialHeightMeters) / accelerationMetersPerSecondSquared),
  }
}

// Ball's height above the cabin floor at a given elapsed time during the run
// (0 <= elapsedSeconds <= timeToFloorSeconds), identical for both scenes.
export function ballHeightAboveFloorAt(
  experiment: EquivalencePrincipleExperimentResult,
  elapsedSeconds: number
): number {
  if (!(elapsedSeconds >= 0 && elapsedSeconds <= experiment.timeToFloorSeconds)) {
    throw new RangeError('Elapsed time must be between 0 and the time the ball reaches the floor')
  }

  return (
    experiment.initialHeightMeters -
    0.5 * experiment.accelerationMetersPerSecondSquared * elapsedSeconds * elapsedSeconds
  )
}
