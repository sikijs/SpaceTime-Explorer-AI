import { SPEED_OF_LIGHT } from './movingClockExperiment'
import { REST_LENGTH, runLengthContractionExperiment } from './lengthContractionExperiment'

// Units: distances in light-seconds, times in seconds, velocity as a fraction of c.
// A flash of light is released from the exact center of the Experiment 6 rod (rest length L0 = 0.5
// light-second), moving along its own length at v. Two events follow: the flash reaching the back end
// and the flash reaching the front end. This reuses Experiment 6's length contraction for the rod's
// length in the lab, rather than recomputing it.
export interface SimultaneityResult {
  velocity: number
  restLength: number
  labLength: number
  backEventLabTime: number
  frontEventLabTime: number
  labTimeGap: number
  rodFrameEventTime: number
}

export function runSimultaneityExperiment(velocity: number): SimultaneityResult {
  const c = SPEED_OF_LIGHT
  // Reuses Experiment 6's length contraction (and its 0 <= v < c check) for the rod's lab-frame length.
  const labLength = runLengthContractionExperiment(velocity).shorterLength.lengthInLab
  const halfLength = labLength / 2

  const backEventLabTime = halfLength / (c + velocity)
  const frontEventLabTime = halfLength / (c - velocity)

  return {
    velocity,
    restLength: REST_LENGTH,
    labLength,
    backEventLabTime,
    frontEventLabTime,
    labTimeGap: frontEventLabTime - backEventLabTime,
    rodFrameEventTime: REST_LENGTH / 2 / c,
  }
}

// Playback state, in the lab's reference frame: the rod's ends move at v, and the flash spreads out
// from the emission point (position 0 at t = 0) at c in both directions. Once a pulse reaches an end,
// it is held at the position where the event happened (the end keeps moving on).
export interface SimultaneityViewState {
  time: number
  backMirrorPosition: number
  frontMirrorPosition: number
  leftPulsePosition: number
  rightPulsePosition: number
  backEventFired: boolean
  frontEventFired: boolean
}

export function labViewStateAt(result: SimultaneityResult, labTime: number): SimultaneityViewState {
  if (!(labTime >= 0) || !isFinite(labTime)) {
    throw new RangeError('Lab time must be a finite number >= 0')
  }

  const c = SPEED_OF_LIGHT
  const { velocity, labLength, backEventLabTime, frontEventLabTime } = result
  const halfLength = labLength / 2
  const heldTime = Math.min(labTime, frontEventLabTime)

  const backEventFired = labTime >= backEventLabTime
  const frontEventFired = labTime >= frontEventLabTime

  return {
    time: labTime,
    backMirrorPosition: -halfLength + velocity * heldTime,
    frontMirrorPosition: halfLength + velocity * heldTime,
    leftPulsePosition: backEventFired
      ? -halfLength + velocity * backEventLabTime
      : -c * labTime,
    rightPulsePosition: frontEventFired
      ? halfLength + velocity * frontEventLabTime
      : c * labTime,
    backEventFired,
    frontEventFired,
  }
}

// Playback state in the rod's own frame: the rod does not move here, and both ends are reached
// together at rodFrameEventTime, by symmetry.
export function rodViewStateAt(result: SimultaneityResult, ownTime: number): SimultaneityViewState {
  if (!(ownTime >= 0) || !isFinite(ownTime)) {
    throw new RangeError('Own time must be a finite number >= 0')
  }

  const c = SPEED_OF_LIGHT
  const { restLength, rodFrameEventTime } = result
  const halfLength = restLength / 2
  const eventFired = ownTime >= rodFrameEventTime

  return {
    time: ownTime,
    backMirrorPosition: -halfLength,
    frontMirrorPosition: halfLength,
    leftPulsePosition: eventFired ? -halfLength : -c * ownTime,
    rightPulsePosition: eventFired ? halfLength : c * ownTime,
    backEventFired: eventFired,
    frontEventFired: eventFired,
  }
}
