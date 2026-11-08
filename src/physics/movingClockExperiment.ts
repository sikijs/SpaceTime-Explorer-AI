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

// The bars picture runs from 0 to twice the lab duration, so the lab clock's bar ends halfway and there is room beyond it.
export function movingClockStripScaleEnd(experiment: MovingClockExperimentResult): number {
  return 2 * experiment.labTimeDuration
}

export interface GuessOnBars {
  scaleEnd: number
  fraction: number
  offEdge: 'left' | 'right' | null
  differenceFromMoving: number
  differenceFromLab: number
}

// Where the learner's guess sits on the bars, and how far it is from each clock's real elapsed time. Never changes the result.
export function guessPositionOnBars(experiment: MovingClockExperimentResult, guess: number): GuessOnBars {
  if (!isFinite(guess)) {
    throw new Error('The guess must be a finite number of seconds')
  }
  const scaleEnd = movingClockStripScaleEnd(experiment)
  const raw = scaleEnd > 0 ? guess / scaleEnd : 0
  return {
    scaleEnd,
    fraction: Math.min(1, Math.max(0, raw)),
    offEdge: raw < 0 ? 'left' : raw > 1 ? 'right' : null,
    differenceFromMoving: guess - experiment.movingClockElapsedTime,
    differenceFromLab: guess - experiment.observerElapsedTime,
  }
}

export type MovingClockGuessKind = 'close-to-actual' | 'close-to-lab' | 'other'

// Margin: half the size of the effect. This margin is still awaiting the project owner's confirmation (spec, Implementation notes (tutor)).
export function classifyMovingClockGuess(
  experiment: MovingClockExperimentResult,
  guess: number
): MovingClockGuessKind {
  if (!isFinite(guess)) {
    throw new Error('The guess must be a finite number of seconds')
  }
  const margin = experiment.timeDifferential / 2
  if (Math.abs(guess - experiment.movingClockElapsedTime) <= margin) return 'close-to-actual'
  if (Math.abs(guess - experiment.observerElapsedTime) <= margin) return 'close-to-lab'
  return 'other'
}

export interface TimeDilationWorkedNumbers {
  vSquared: number
  oneMinusVSquared: number
  factor: number
}

// The three steps of the factor sqrt(1 - v^2), for the tutor's "Your numbers" paragraph.
export function timeDilationWorkedNumbers(velocity: number): TimeDilationWorkedNumbers {
  if (!(velocity >= 0 && velocity < SPEED_OF_LIGHT)) {
    throw new RangeError('Velocity must satisfy 0 <= v < c')
  }
  const vSquared = (velocity * velocity) / (SPEED_OF_LIGHT * SPEED_OF_LIGHT)
  return { vSquared, oneMinusVSquared: 1 - vSquared, factor: timeDilationFactorFor(velocity) }
}
