import { SPEED_OF_LIGHT } from './movingClockExperiment'
import { REST_LENGTH, runLengthContractionExperiment } from './lengthContractionExperiment'

// Units: distances in light-seconds, times in seconds, velocity as a fraction of c.
// A flash of light is released from the exact center of the Experiment 6 block (rest length L0 = 0.5
// light-second), moving along its own length at v. Two events follow: the flash reaching the back end
// and the flash reaching the front end. This reuses Experiment 6's length contraction for the block's
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
  // Reuses Experiment 6's length contraction (and its 0 <= v < c check) for the block's lab-frame length.
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

// Playback state, in the lab's reference frame: the block's ends move at v, and the flash spreads out
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

// Playback state in the block's own frame: the block does not move here, and both ends are reached
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

// ---- The guesses and the strip of event times (audit update, docs/audit/relativity-of-time-and-motion/07-draft-wording.md) ----
// The page draws "when was each end reached?" on one time axis, in two rows: the lab's clocks and the block's own clocks. Neither of
// the learner's two guesses has a size, so each is drawn as a marker only. These functions give the positions and the markers' targets;
// none of them changes a real value (CLAUDE.md §9, Rule A item 8).

export type OrderChoice = 'same' | 'back' | 'front'
export type FrameAgreementChoice = 'agree' | 'disagree'

// The strip's scale (seconds): Part 1 runs only at 0.5c; Part 2 must fit every speed up to 0.9c (front end reached at 1.090 s).
export const PART1_STRIP_SCALE_END = 0.5
export const PART2_STRIP_SCALE_END = 1.2

// The back event is never later than the front event (Required Physics Test 2); they coincide only at v = 0.
export function actualOrderFor(result: SimultaneityResult): OrderChoice {
  return result.velocity === 0 ? 'same' : 'back'
}

export interface EventStripPositions {
  scaleEnd: number
  // Each is a fraction of the scale, 0 at the flash and 1 at scaleEnd.
  labBack: number
  labFront: number
  rod: number
  // The lab row's gap, in seconds (0 means the two dots sit on top of each other).
  labGap: number
}

export function eventStripPositions(result: SimultaneityResult, scaleEnd: number): EventStripPositions {
  if (!isFinite(scaleEnd) || scaleEnd <= 0) {
    throw new RangeError('The strip scale must be a positive, finite number of seconds')
  }
  const latest = Math.max(result.frontEventLabTime, result.rodFrameEventTime)
  if (latest > scaleEnd) {
    throw new RangeError('An event falls beyond the end of the strip')
  }
  return {
    scaleEnd,
    labBack: result.backEventLabTime / scaleEnd,
    labFront: result.frontEventLabTime / scaleEnd,
    rod: result.rodFrameEventTime / scaleEnd,
    labGap: result.labTimeGap,
  }
}

// The order guess is a choice, so it is a marker: it points at one end's dot on the lab row, or joins both dots for "at the same time".
export interface OrderMarkerTarget {
  pointsAt: 'backDot' | 'frontDot' | 'bothDots'
  // The fractions the marker touches: one for a single dot, two (back first, then front) for a bracket.
  fractions: number[]
}

export function orderMarkerTarget(
  result: SimultaneityResult,
  choice: OrderChoice,
  scaleEnd: number,
): OrderMarkerTarget {
  const strip = eventStripPositions(result, scaleEnd)
  if (choice === 'back') return { pointsAt: 'backDot', fractions: [strip.labBack] }
  if (choice === 'front') return { pointsAt: 'frontDot', fractions: [strip.labFront] }
  return { pointsAt: 'bothDots', fractions: [strip.labBack, strip.labFront] }
}

// The agreement guess compares the two rows, so its marker sits between them and is joined to both. It has no size or position.
export interface AgreementMarkerTarget {
  joins: 'bothRows'
  choice: FrameAgreementChoice
}

export function agreementMarkerTarget(choice: FrameAgreementChoice): AgreementMarkerTarget {
  return { joins: 'bothRows', choice }
}

// What the tutor needs to mark the two guesses, with no score: which choice the learner made and what the run showed for it.
export interface GuessMarking {
  orderChoice: OrderChoice
  actualOrder: OrderChoice
  labGap: number
  rodGap: number
  agreementChoice: FrameAgreementChoice
  // True when the lab row and the block row put the two arrivals the same time apart (both 0, as at 0c).
  rowsAgree: boolean
}

export function markGuesses(
  result: SimultaneityResult,
  orderChoice: OrderChoice,
  agreementChoice: FrameAgreementChoice,
): GuessMarking {
  const rodGap = 0 // both ends are reached at rodFrameEventTime in the rod's own frame
  return {
    orderChoice,
    actualOrder: actualOrderFor(result),
    labGap: result.labTimeGap,
    rodGap,
    agreementChoice,
    rowsAgree: result.labTimeGap === rodGap,
  }
}
