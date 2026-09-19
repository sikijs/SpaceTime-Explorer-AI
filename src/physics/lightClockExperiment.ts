import { SPEED_OF_LIGHT } from './movingClockExperiment'

// Units: distances in light-seconds, times in seconds, velocity as a fraction of c.
// L = 0.5 light-second makes one round trip of the rest clock exactly 1 second.
export const MIRROR_SEPARATION = 0.5
export const REST_TICK_DURATION = (2 * MIRROR_SEPARATION) / SPEED_OF_LIGHT

export interface LightClockExperimentResult {
  velocity: number
  mirrorSeparation: number
  restTickDuration: number
  movingTickDuration: number
  restLightPath: number
  movingLightPath: number
  sidewaysDistancePerTick: number
  lightSpeedRest: number
  lightSpeedMoving: number
  timeDilationFactor: number
}

export function runLightClockExperiment(velocity: number): LightClockExperimentResult {
  if (!(velocity >= 0 && velocity < SPEED_OF_LIGHT)) {
    throw new RangeError('Velocity must satisfy 0 <= v < c')
  }

  const L = MIRROR_SEPARATION
  const c = SPEED_OF_LIGHT

  const restLightPath = 2 * L
  const restTickDuration = restLightPath / c

  // Light travels at c in the lab, so path = c * dt. With path = 2 * sqrt(L^2 + (v*dt/2)^2), dt = 2L / (c * sqrt(1 - v^2/c^2)).
  const movingTickDuration = (2 * L) / (c * Math.sqrt(1 - (velocity * velocity) / (c * c)))
  const sidewaysDistancePerTick = velocity * movingTickDuration
  const movingLightPath = 2 * Math.sqrt(L * L + (sidewaysDistancePerTick / 2) ** 2)

  return {
    velocity,
    mirrorSeparation: L,
    restTickDuration,
    movingTickDuration,
    restLightPath,
    movingLightPath,
    sidewaysDistancePerTick,
    lightSpeedRest: restLightPath / restTickDuration,
    lightSpeedMoving: movingLightPath / movingTickDuration,
    timeDilationFactor: restTickDuration / movingTickDuration,
  }
}

export interface LightClockState {
  labTime: number
  restClockReading: number
  movingClockReading: number
  restPulseHeight: number
  movingPulseHeight: number
  restPhase: number
  movingPhase: number
  movingSidewaysOffset: number
}

// Height of the pulse above the bottom mirror at a given phase (0..1) of one tick: up for the first half, down for the second.
function pulseHeightAtPhase(mirrorSeparation: number, phase: number): number {
  return mirrorSeparation * (1 - Math.abs(2 * phase - 1))
}

// State of both clocks at a lab time. The rest clock keeps ticking; the moving clock is followed for its one tick and then held.
export function lightClockStateAt(
  experiment: LightClockExperimentResult,
  labTime: number
): LightClockState {
  if (!(labTime >= 0) || !isFinite(labTime)) {
    throw new RangeError('Lab time must be a finite number >= 0')
  }

  const { restTickDuration, movingTickDuration, timeDilationFactor, mirrorSeparation, velocity } =
    experiment
  const movingLabTime = Math.min(labTime, movingTickDuration)
  const restPhase = (labTime / restTickDuration) % 1
  const movingPhase = movingLabTime / movingTickDuration

  return {
    labTime,
    restClockReading: labTime,
    movingClockReading: movingLabTime * timeDilationFactor,
    restPulseHeight: pulseHeightAtPhase(mirrorSeparation, restPhase),
    movingPulseHeight: pulseHeightAtPhase(mirrorSeparation, movingPhase),
    restPhase,
    movingPhase,
    movingSidewaysOffset: velocity * SPEED_OF_LIGHT * movingLabTime,
  }
}
