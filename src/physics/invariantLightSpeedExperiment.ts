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

// ---- Marks for the learner's guesses and numbers for the tutor (audit step, 2026-11-09) ----
// None of these changes a result: each only reads a run and places or compares a guess.

export type RuleChoice = 'everyday' | 'actual' | 'same'
export type Rule = 'everyday' | 'actual'

// Two tick bars run from 0 to twice a tick, so the bar of that tick ends halfway and there is room beyond it.
// Part 1 uses the rest clock's tick (the speed is fixed there); Drawing A uses light's actual rule's tick, which changes with the speed.
export function tickBarsScaleEnd(experiment: InvariantLightSpeedResult, basis: 'rest' | 'actual'): number {
  return 2 * (basis === 'rest' ? experiment.restTickDuration : experiment.actualRule.movingTickDuration)
}

export interface GuessOnTickBars {
  scaleEnd: number
  fraction: number
  offEdge: 'left' | 'right' | null
  differenceFromReal: number
}

// Where the learner's guess for one moving tick under a rule sits on Part 1's bars (scale 0 to twice the rest tick),
// and how far it is from that rule's real tick. Never changes the result.
export function guessPositionOnTickBars(experiment: InvariantLightSpeedResult, rule: Rule, guess: number): GuessOnTickBars {
  if (!isFinite(guess)) {
    throw new Error('The guess must be a finite number of seconds')
  }
  const scaleEnd = tickBarsScaleEnd(experiment, 'rest')
  const raw = scaleEnd > 0 ? guess / scaleEnd : 0
  const real = rule === 'everyday' ? experiment.everydayRule : experiment.actualRule
  return {
    scaleEnd,
    fraction: Math.min(1, Math.max(0, raw)),
    offEdge: raw < 0 ? 'left' : raw > 1 ? 'right' : null,
    differenceFromReal: guess - real.movingTickDuration,
  }
}

export interface ChoiceMarker {
  pointsAt: 'everyday' | 'actual' | 'both'
  longerTick: 'everyday' | 'actual' | 'same'
}

// Where the white marker for the learner's choice points (it has no size of its own), and which rule really gave the longer
// moving tick, for the tutor to name beside the choice. The learner's choice never changes which rule gave the longer tick.
export function choiceMarker(experiment: InvariantLightSpeedResult, choice: RuleChoice): ChoiceMarker {
  const everyday = experiment.everydayRule.movingTickDuration
  const actual = experiment.actualRule.movingTickDuration
  const tolerance = 1e-9
  return {
    pointsAt: choice === 'same' ? 'both' : choice,
    longerTick: Math.abs(actual - everyday) < tolerance ? 'same' : actual > everyday ? 'actual' : 'everyday',
  }
}

export interface EverydayHalfTripNumbers {
  rise: number
  sidewaysHalf: number
  diagonal: number
  roundTrip: number
}

// The numbers for the trip up under the everyday rule and for its round trip, for the tutor's "Working the numbers".
export function everydayHalfTripNumbers(experiment: InvariantLightSpeedResult): EverydayHalfTripNumbers {
  return {
    rise: experiment.mirrorSeparation,
    sidewaysHalf: experiment.sidewaysDistancePerTick.everydayRule / 2,
    diagonal: experiment.everydayRule.lightPath / 2,
    roundTrip: experiment.everydayRule.lightPath,
  }
}
