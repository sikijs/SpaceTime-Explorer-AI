import { SPEED_OF_LIGHT } from './movingClockExperiment'
import {
  MIRROR_SEPARATION,
  REST_TICK_DURATION,
  pulseHeightAtPhase,
  runLightClockExperiment,
} from './lightClockExperiment'

// Units: distances in light-seconds, times in seconds, velocity as a fraction of c.
// The light clock has its mirrors in a line along the direction of motion. Its length at rest is
// L0 = 0.5 light-second, so one rest tick is exactly 1 second (the same clock as Experiment 4).
export const REST_LENGTH = MIRROR_SEPARATION

export interface ClockVersionResult {
  lengthInLab: number
  lengthRatio: number
  forwardLegDuration: number
  returnLegDuration: number
  tickDuration: number
  // What the moving clock's own display shows after this one tick: lab time times the time dilation factor.
  ownClockReadingAtEnd: number
  forwardLegPath: number
  returnLegPath: number
  lightSpeedForward: number
  lightSpeedReturn: number
  sidewaysDistancePerTick: number
  differenceFromTimeDilationTick: number
}

export interface LengthContractionResult {
  velocity: number
  restLength: number
  restTickDuration: number
  timeDilationTick: number
  timeDilationFactor: number
  sameLength: ClockVersionResult
  shorterLength: ClockVersionResult
}

// One round trip of a pulse in a clock of length L (seen from the lab) that moves along its own length
// at speed v. The pulse chases the moving front mirror, then meets the moving back mirror head on.
export interface RoundTrip {
  forwardLegDuration: number
  returnLegDuration: number
  tickDuration: number
}

// How long the pulse's trips take for a clock of a given length (light-seconds, seen from the lab) moving along its own
// length at speed v. Light goes at c in the lab, so each trip is a distance divided by a closing speed: c - v going
// forward, c + v coming back. Each length gives its own round trip.
export function roundTripForLength(lengthInLab: number, velocity: number): RoundTrip {
  const c = SPEED_OF_LIGHT
  if (!isFinite(lengthInLab) || lengthInLab < 0) {
    throw new Error('The length must be a finite, non-negative number of light-seconds')
  }
  if (!isFinite(velocity) || velocity < 0 || velocity >= c) {
    throw new Error('Velocity must satisfy 0 <= v < c')
  }
  const forwardLegDuration = lengthInLab / (c - velocity)
  const returnLegDuration = lengthInLab / (c + velocity)
  return { forwardLegDuration, returnLegDuration, tickDuration: forwardLegDuration + returnLegDuration }
}

// The reverse reading: the length that gives a particular round trip (tick) at speed v. This is how the page finds the length
// from the tick time dilation gives. tick = 2L / (c (1 - v^2 / c^2)), so L = tick (1 - v^2 / c^2) / 2 in units where c = 1.
export function lengthForTick(tickDuration: number, velocity: number): number {
  const c = SPEED_OF_LIGHT
  if (!isFinite(tickDuration) || tickDuration < 0) {
    throw new Error('The tick must be a finite, non-negative number of seconds')
  }
  if (!isFinite(velocity) || velocity < 0 || velocity >= c) {
    throw new Error('Velocity must satisfy 0 <= v < c')
  }
  return (tickDuration * c * (1 - (velocity * velocity) / (c * c))) / 2
}

function runClockVersion(
  lengthInLab: number,
  velocity: number,
  timeDilationTick: number,
  timeDilationFactor: number
): ClockVersionResult {
  const c = SPEED_OF_LIGHT
  const { forwardLegDuration, returnLegDuration, tickDuration } = roundTripForLength(lengthInLab, velocity)
  // Light travels at c in the lab, so each leg's path is c times its duration.
  const forwardLegPath = c * forwardLegDuration
  const returnLegPath = c * returnLegDuration

  return {
    lengthInLab,
    lengthRatio: lengthInLab / REST_LENGTH,
    forwardLegDuration,
    returnLegDuration,
    tickDuration,
    ownClockReadingAtEnd: tickDuration * timeDilationFactor,
    forwardLegPath,
    returnLegPath,
    lightSpeedForward: forwardLegPath / forwardLegDuration / c,
    lightSpeedReturn: returnLegPath / returnLegDuration / c,
    sidewaysDistancePerTick: velocity * tickDuration,
    differenceFromTimeDilationTick: tickDuration - timeDilationTick,
  }
}

export function runLengthContractionExperiment(velocity: number): LengthContractionResult {
  // What time dilation says (Experiments 3 and 4). This also checks 0 <= v < c.
  const timeDilation = runLightClockExperiment(velocity)
  const c = SPEED_OF_LIGHT
  const timeDilationTick = timeDilation.movingTickDuration

  return {
    velocity,
    restLength: REST_LENGTH,
    restTickDuration: REST_TICK_DURATION,
    timeDilationTick,
    timeDilationFactor: timeDilation.timeDilationFactor,
    sameLength: runClockVersion(
      REST_LENGTH,
      velocity,
      timeDilationTick,
      timeDilation.timeDilationFactor
    ),
    shorterLength: runClockVersion(
      REST_LENGTH * Math.sqrt(1 - (velocity * velocity) / (c * c)),
      velocity,
      timeDilationTick,
      timeDilation.timeDilationFactor
    ),
  }
}

export type PulseLeg = 'forward' | 'return' | 'finished'

export interface MovingClockState {
  clockReading: number
  leg: PulseLeg
  tickProgress: number
  backMirrorPosition: number
  frontMirrorPosition: number
  pulsePosition: number
}

export interface LengthContractionState {
  labTime: number
  restClock: {
    clockReading: number
    phase: number
    backMirrorPosition: number
    frontMirrorPosition: number
    pulsePosition: number
  }
  sameLength: MovingClockState
  shorterLength: MovingClockState
}

// State of the three clocks at a lab time. Positions are along the direction of motion, in the lab.
// The rest clock keeps ticking; each moving clock is followed for its one tick and then held.
export function lengthContractionStateAt(
  experiment: LengthContractionResult,
  labTime: number
): LengthContractionState {
  if (!(labTime >= 0) || !isFinite(labTime)) {
    throw new RangeError('Lab time must be a finite number >= 0')
  }

  const { velocity, restLength, restTickDuration, timeDilationFactor } = experiment
  const c = SPEED_OF_LIGHT
  const restPhase = (labTime / restTickDuration) % 1

  const movingClock = (version: ClockVersionResult): MovingClockState => {
    const heldTime = Math.min(labTime, version.tickDuration)
    const backMirrorPosition = velocity * heldTime
    const inForwardLeg = heldTime <= version.forwardLegDuration
    const leg: PulseLeg =
      labTime >= version.tickDuration ? 'finished' : inForwardLeg ? 'forward' : 'return'
    const pulsePosition = inForwardLeg
      ? c * heldTime
      : version.forwardLegPath - c * (heldTime - version.forwardLegDuration)

    return {
      clockReading: heldTime * timeDilationFactor,
      leg,
      tickProgress: heldTime / version.tickDuration,
      backMirrorPosition,
      frontMirrorPosition: version.lengthInLab + backMirrorPosition,
      pulsePosition,
    }
  }

  return {
    labTime,
    restClock: {
      clockReading: labTime,
      phase: restPhase,
      backMirrorPosition: 0,
      frontMirrorPosition: restLength,
      pulsePosition: pulseHeightAtPhase(restLength, restPhase),
    },
    sameLength: movingClock(experiment.sameLength),
    shorterLength: movingClock(experiment.shorterLength),
  }
}

// ---- The learner's guess, drawn beside the real result (the owner's audit rules). None of this changes a result. ----

export type LengthChoice = 'same' | 'shorter' | 'longer'

// The length bars run from 0 to twice the rest length (1 light-second), at every speed, so runs can be compared.
// No length is longer than the rest length, so the real bars always end at or before halfway.
export function lengthBarsScaleEnd(experiment: LengthContractionResult): number {
  return 2 * experiment.restLength
}

export interface GuessOnLengthBars {
  scaleEnd: number
  fraction: number
  offEdge: 'left' | 'right' | null
  differenceFromReal: number
}

// Where the learner's number guess (a length of the moving clock, in light-seconds) sits on the length bars, and how far it
// is from the real length of the shorter clock (the clock whose tick time dilation gives).
export function guessPositionOnLengthBars(experiment: LengthContractionResult, guess: number): GuessOnLengthBars {
  if (!isFinite(guess)) {
    throw new Error('The guess must be a finite number of light-seconds')
  }
  const scaleEnd = lengthBarsScaleEnd(experiment)
  const raw = scaleEnd > 0 ? guess / scaleEnd : 0
  return {
    scaleEnd,
    fraction: Math.min(1, Math.max(0, raw)),
    offEdge: raw < 0 ? 'left' : raw > 1 ? 'right' : null,
    differenceFromReal: guess - experiment.shorterLength.lengthInLab,
  }
}

export interface ChoiceMarker {
  pointsAt: 'sameBar' | 'shorterBar' | 'pastRestBar'
  requiredChoice: 'same' | 'shorter'
}

// Where the white marker for the learner's choice points (it has no size of its own), and which choice time dilation
// really requires, for the tutor to name beside the choice. The choice never changes what is required.
export function choiceMarker(experiment: LengthContractionResult, choice: LengthChoice): ChoiceMarker {
  const tolerance = 1e-9
  return {
    pointsAt: choice === 'same' ? 'sameBar' : choice === 'shorter' ? 'shorterBar' : 'pastRestBar',
    requiredChoice:
      Math.abs(experiment.shorterLength.lengthInLab - experiment.restLength) < tolerance ? 'same' : 'shorter',
  }
}

export interface GuessMark {
  comparison: 'more' | 'less' | 'the same'
  difference: number
}

// How the learner's number compares with the real gap, rounded to the three decimals the page shows. No verdict, no score.
export function markGuess(experiment: LengthContractionResult, guess: number): GuessMark {
  if (!isFinite(guess)) {
    throw new Error('The guess must be a finite number of light-seconds')
  }
  const rounded = Math.round((guess - experiment.shorterLength.lengthInLab) * 1000) / 1000
  return {
    comparison: rounded === 0 ? 'the same' : rounded > 0 ? 'more' : 'less',
    difference: Math.abs(rounded),
  }
}

// The rows of the length strip: each clock's length and the pulse's trips that go with it, so the page can show how each
// length was found. The rest clock's pulse crosses in length / c, and a tick is twice that. Numbers only; no wording.
export interface LengthBarRow {
  key: 'rest' | 'same' | 'shorter'
  lengthInLab: number
  forwardLegDuration: number
  returnLegDuration: number | null
  tickDuration: number
}

export function lengthBarRows(experiment: LengthContractionResult): LengthBarRow[] {
  const crossing = experiment.restLength / SPEED_OF_LIGHT
  return [
    { key: 'rest', lengthInLab: experiment.restLength, forwardLegDuration: crossing, returnLegDuration: null, tickDuration: experiment.restTickDuration },
    { key: 'same', lengthInLab: experiment.sameLength.lengthInLab, forwardLegDuration: experiment.sameLength.forwardLegDuration, returnLegDuration: experiment.sameLength.returnLegDuration, tickDuration: experiment.sameLength.tickDuration },
    { key: 'shorter', lengthInLab: experiment.shorterLength.lengthInLab, forwardLegDuration: experiment.shorterLength.forwardLegDuration, returnLegDuration: experiment.shorterLength.returnLegDuration, tickDuration: experiment.shorterLength.tickDuration },
  ]
}
