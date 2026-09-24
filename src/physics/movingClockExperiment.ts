// Units: velocity is a fraction of the speed of light (c = 1); distances are in light-seconds.
export const SPEED_OF_LIGHT = 1

// Extracted so Experiment 11's Lorentz transformation can reuse this exact factor (by division)
// instead of duplicating the formula. Behavior of runMovingClockExperiment is unchanged.
export function timeDilationFactorFor(velocity: number): number {
  return Math.sqrt(1 - (velocity * velocity) / (SPEED_OF_LIGHT * SPEED_OF_LIGHT))
}

export interface MovingClockExperimentResult {
  labTimeDuration: number
  velocity: number
  observerElapsedTime: number
  movingClockElapsedTime: number
  timeDilationFactor: number
  timeDifferential: number
  distanceTravelled: number
}

export function runMovingClockExperiment(
  labDurationSeconds: number,
  velocity: number
): MovingClockExperimentResult {
  if (!(labDurationSeconds > 0)) {
    throw new RangeError('Lab duration must be greater than 0')
  }
  if (!(velocity >= 0 && velocity < SPEED_OF_LIGHT)) {
    throw new RangeError('Velocity must satisfy 0 <= v < c')
  }

  const timeDilationFactor = timeDilationFactorFor(velocity)
  const observerElapsedTime = labDurationSeconds
  const movingClockElapsedTime = labDurationSeconds * timeDilationFactor

  return {
    labTimeDuration: labDurationSeconds,
    velocity,
    observerElapsedTime,
    movingClockElapsedTime,
    timeDilationFactor,
    timeDifferential: observerElapsedTime - movingClockElapsedTime,
    distanceTravelled: velocity * SPEED_OF_LIGHT * labDurationSeconds,
  }
}

export interface MovingClockState {
  labClockReading: number
  movingClockReading: number
  distanceTravelled: number
}

// State of both clocks at a lab time during the run (0 <= labTime <= the run's lab duration).
export function movingClockStateAt(
  experiment: MovingClockExperimentResult,
  labTime: number
): MovingClockState {
  if (!(labTime >= 0 && labTime <= experiment.labTimeDuration)) {
    throw new RangeError('Lab time must be between 0 and the run duration')
  }

  return {
    labClockReading: labTime,
    movingClockReading: labTime * experiment.timeDilationFactor,
    distanceTravelled: experiment.velocity * SPEED_OF_LIGHT * labTime,
  }
}
