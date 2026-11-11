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

// ---- Audit update (2026-11-11): the guess, its marker, the tutor's marking and the fixed scale ----
// Nothing below changes the model above. The real outcome never depends on a guess.

export type PredictionChoice = 'differently' | 'sameWay'

// Scene A and Scene B share one formula, so the ball moves the same way in both, for any
// acceleration. The agreement is built into the model; it is not a measurement.
export function actualOutcome(): PredictionChoice {
  return 'sameWay'
}

const CHOICE_PHRASE: Record<PredictionChoice, string> = {
  differently: 'differently in the two cabins',
  sameWay: 'the same way in the two cabins',
}

export interface GuessMarker {
  // Where the white ring sits on the graph: the end of the two curves (the ball on the floor).
  timeSeconds: number
  heightMeters: number
  // The same place as fractions of the graph's time axis and of its height axis (0 = start, 1 = end).
  fractionAlongTime: number
  fractionDown: number
  boxText: string
}

// A yes or no guess has no size or position of its own, so its marker is placed at the end of
// the curves whichever choice was made. It is only a marker.
export function guessMarkerFor(
  result: EquivalencePrincipleExperimentResult,
  choice: PredictionChoice
): GuessMarker {
  return {
    timeSeconds: result.timeToFloorSeconds,
    heightMeters: 0,
    fractionAlongTime: 1,
    fractionDown: 1,
    boxText: `YOUR GUESS (a marker only): the ball moves ${CHOICE_PHRASE[choice]}`,
  }
}

export interface GuessMarking {
  matched: boolean
  // The tutor's opening block in the explanation: what the guess was and what the graph showed.
  text: string
}

export function markGuess(
  result: EquivalencePrincipleExperimentResult,
  choice: PredictionChoice
): GuessMarking {
  return {
    matched: choice === actualOutcome(),
    text:
      `You guessed that the ball would move ${CHOICE_PHRASE[choice]}. ` +
      'The two lines lie on top of each other: at every moment the ball was at the same height in ' +
      `Cabin A and in Cabin B, and it reached the floor after the same ${result.timeToFloorSeconds.toFixed(2)} seconds in both.`,
  }
}

// Part 2's drawing uses one time scale for every acceleration, so that a different acceleration
// gives a visibly different curve. It must cover the longest fall the control allows
// (0.1g from 2 m: about 2.02 s).
export const FIXED_TIME_SCALE_END_SECONDS = 2.1

export function fixedTimeScaleEndSeconds(): number {
  return FIXED_TIME_SCALE_END_SECONDS
}

// Height at a time on the fixed scale: the same curve as ballHeightAboveFloorAt, and 0 (the ball
// resting on the floor) once the ball has landed.
export function heightOnFixedScaleAt(
  experiment: EquivalencePrincipleExperimentResult,
  elapsedSeconds: number
): number {
  if (!(elapsedSeconds >= 0 && elapsedSeconds <= FIXED_TIME_SCALE_END_SECONDS)) {
    throw new RangeError('Elapsed time must be between 0 and the end of the fixed time scale')
  }
  if (elapsedSeconds >= experiment.timeToFloorSeconds) return 0
  return ballHeightAboveFloorAt(experiment, elapsedSeconds)
}

export interface FallTimeWorkedNumbers {
  oneGFallSeconds: number
  twoGFallSeconds: number
  halfwayTimeSeconds: number
  halfwayHeightMeters: number
}

// The numbers the words box and the caption use, to two decimals, for a 2 m drop.
export function fallTimeWorkedNumbers(startHeightMeters = 2): FallTimeWorkedNumbers {
  const round2 = (x: number) => Math.round(x * 100) / 100
  const oneG = runEquivalencePrincipleExperiment(EARTH_GRAVITY, startHeightMeters)
  const twoG = runEquivalencePrincipleExperiment(2 * EARTH_GRAVITY, startHeightMeters)
  const halfwayTime = round2(oneG.timeToFloorSeconds / 2)
  return {
    oneGFallSeconds: round2(oneG.timeToFloorSeconds),
    twoGFallSeconds: round2(twoG.timeToFloorSeconds),
    halfwayTimeSeconds: halfwayTime,
    halfwayHeightMeters: round2(ballHeightAboveFloorAt(oneG, halfwayTime)),
  }
}
