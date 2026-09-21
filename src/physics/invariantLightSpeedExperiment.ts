import { SPEED_OF_LIGHT } from './movingClockExperiment'
import { pulseHeightAtPhase, runLightClockExperiment } from './lightClockExperiment'

// Units: distances in light-seconds, times in seconds, velocity as a fraction of c.
// The moving light clock of Experiment 4 is run under two rules for how light behaves.
export interface RuleResult {
  movingTickDuration: number
  lightPath: number
  lightSpeedInLab: number
  timeDilationFactor: number
}

export interface InvariantLightSpeedResult {
  velocity: number
  mirrorSeparation: number
  restTickDuration: number
  restLightPath: number
  lightSpeedRest: number
  sidewaysDistancePerTick: { everydayRule: number; actualRule: number }
  everydayRule: RuleResult
  actualRule: RuleResult
}

export function runInvariantLightSpeedExperiment(velocity: number): InvariantLightSpeedResult {
  // Light's actual rule is Experiment 4's model: light travels at c in the lab.
  const actual = runLightClockExperiment(velocity)
  const L = actual.mirrorSeparation
  const c = SPEED_OF_LIGHT

  // Everyday rule (a hypothetical): light travels at c relative to the clock, straight across the gap,
  // so one round trip takes the same time as at rest. The lab sees that motion combined with the
  // clock's sideways motion, so the light's speed in the lab is sqrt(c^2 + v^2).
  const everydayTick = actual.restTickDuration
  const everydaySideways = velocity * everydayTick
  const everydayPath = 2 * Math.sqrt(L * L + (everydaySideways / 2) ** 2)

  return {
    velocity,
    mirrorSeparation: L,
    restTickDuration: actual.restTickDuration,
    restLightPath: actual.restLightPath,
    lightSpeedRest: actual.lightSpeedRest / c,
    sidewaysDistancePerTick: {
      everydayRule: everydaySideways,
      actualRule: actual.sidewaysDistancePerTick,
    },
    everydayRule: {
      movingTickDuration: everydayTick,
      lightPath: everydayPath,
      lightSpeedInLab: everydayPath / everydayTick / c,
      timeDilationFactor: actual.restTickDuration / everydayTick,
    },
    actualRule: {
      movingTickDuration: actual.movingTickDuration,
      lightPath: actual.movingLightPath,
      lightSpeedInLab: actual.lightSpeedMoving / c,
      timeDilationFactor: actual.timeDilationFactor,
    },
  }
}

export interface RuleClockState {
  clockReading: number
  pulseHeight: number
  phase: number
  sidewaysOffset: number
}

export interface InvariantLightSpeedState {
  labTime: number
  restClock: { clockReading: number; pulseHeight: number; phase: number }
  everydayRule: RuleClockState
  actualRule: RuleClockState
}

// State of the three clocks at a lab time. The rest clock keeps ticking; each moving clock is followed
// for its one tick and then held. The run lasts until the actual-rule clock finishes its tick, which is
// never shorter than the everyday-rule tick.
export function invariantLightSpeedStateAt(
  experiment: InvariantLightSpeedResult,
  labTime: number
): InvariantLightSpeedState {
  if (!(labTime >= 0) || !isFinite(labTime)) {
    throw new RangeError('Lab time must be a finite number >= 0')
  }

  const { restTickDuration, mirrorSeparation, velocity } = experiment
  const restPhase = (labTime / restTickDuration) % 1

  const movingClock = (rule: RuleResult): RuleClockState => {
    const heldLabTime = Math.min(labTime, rule.movingTickDuration)
    const phase = heldLabTime / rule.movingTickDuration
    return {
      clockReading: heldLabTime * rule.timeDilationFactor,
      pulseHeight: pulseHeightAtPhase(mirrorSeparation, phase),
      phase,
      sidewaysOffset: velocity * SPEED_OF_LIGHT * heldLabTime,
    }
  }

  return {
    labTime,
    restClock: {
      clockReading: labTime,
      pulseHeight: pulseHeightAtPhase(mirrorSeparation, restPhase),
      phase: restPhase,
    },
    everydayRule: movingClock(experiment.everydayRule),
    actualRule: movingClock(experiment.actualRule),
  }
}
