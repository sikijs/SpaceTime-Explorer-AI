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
function runClockVersion(
  lengthInLab: number,
  velocity: number,
  timeDilationTick: number
): ClockVersionResult {
  const c = SPEED_OF_LIGHT
  const forwardLegDuration = lengthInLab / (c - velocity)
  const returnLegDuration = lengthInLab / (c + velocity)
  const tickDuration = forwardLegDuration + returnLegDuration
  // Light travels at c in the lab, so each leg's path is c times its duration.
  const forwardLegPath = c * forwardLegDuration
  const returnLegPath = c * returnLegDuration

  return {
    lengthInLab,
    lengthRatio: lengthInLab / REST_LENGTH,
    forwardLegDuration,
    returnLegDuration,
    tickDuration,
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
    sameLength: runClockVersion(REST_LENGTH, velocity, timeDilationTick),
    shorterLength: runClockVersion(
      REST_LENGTH * Math.sqrt(1 - (velocity * velocity) / (c * c)),
      velocity,
      timeDilationTick
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
