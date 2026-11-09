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
export function pulseHeightAtPhase(mirrorSeparation: number, phase: number): number {
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

// The tick bars run from 0 to twice a tick, so the bar of that tick ends halfway and there is room beyond it.
// Part 1 uses the rest clock's tick (the speed is fixed there); Drawing A uses the moving clock's tick, which changes with the speed.
export function tickBarsScaleEnd(experiment: LightClockExperimentResult, basis: 'rest' | 'moving'): number {
  return 2 * (basis === 'rest' ? experiment.restTickDuration : experiment.movingTickDuration)
}

export interface GuessOnTickBars {
  scaleEnd: number
  fraction: number
  offEdge: 'left' | 'right' | null
  differenceFromMoving: number
  differenceFromRest: number
}

// Where the learner's guess for one moving tick sits on Part 1's bars, and how far it is from each clock's real tick.
// Never changes the result.
export function guessPositionOnTickBars(experiment: LightClockExperimentResult, guess: number): GuessOnTickBars {
  if (!isFinite(guess)) {
    throw new Error('The guess must be a finite number of seconds')
  }
  const scaleEnd = tickBarsScaleEnd(experiment, 'rest')
  const raw = scaleEnd > 0 ? guess / scaleEnd : 0
  return {
    scaleEnd,
    fraction: Math.min(1, Math.max(0, raw)),
    offEdge: raw < 0 ? 'left' : raw > 1 ? 'right' : null,
    differenceFromMoving: guess - experiment.movingTickDuration,
    differenceFromRest: guess - experiment.restTickDuration,
  }
}

export interface HalfTripNumbers {
  rise: number
  sidewaysHalf: number
  diagonal: number
  roundTrip: number
}

// The numbers for one half of the moving tick (the trip up) and for the whole round trip, for the tutor's "Working out the diagonal".
export function halfTripNumbers(experiment: LightClockExperimentResult): HalfTripNumbers {
  return {
    rise: experiment.mirrorSeparation,
    sidewaysHalf: experiment.sidewaysDistancePerTick / 2,
    diagonal: experiment.movingLightPath / 2,
    roundTrip: experiment.movingLightPath,
  }
}

export interface TriangleSquares {
  riseSquared: number
  sidewaysHalfSquared: number
  sum: number
  diagonalSquared: number
}

// The squares in the right-triangle rule for one trip up: rise x rise + sideways x sideways = diagonal x diagonal.
// The sum and the diagonal's square are equal for the real tick (the introduction's worked example shows this with numbers).
export function triangleSquares(experiment: LightClockExperimentResult): TriangleSquares {
  const { rise, sidewaysHalf, diagonal } = halfTripNumbers(experiment)
  return {
    riseSquared: rise * rise,
    sidewaysHalfSquared: sidewaysHalf * sidewaysHalf,
    sum: rise * rise + sidewaysHalf * sidewaysHalf,
    diagonalSquared: diagonal * diagonal,
  }
}

export interface TrialTickCheck {
  tick: number
  flashHalfPath: number
  sidewaysHalf: number
  triangleHalfPath: number
  verdict: 'too-short' | 'too-long' | 'fits'
}

// The introduction's "try a tick" step: if one tick took `tick` lab seconds, the flash would cover c x tick / 2 up the slant, while the
// clock would slide v x tick / 2 sideways and the mirror would then be hypot(L, v x tick / 2) away along the slant.
// Too short: the flash has not reached the mirror. Too long: it arrives early. Fits: it arrives exactly (the real tick).
export function trialTickCheck(velocity: number, tick: number): TrialTickCheck {
  if (!(velocity >= 0 && velocity < SPEED_OF_LIGHT)) {
    throw new RangeError('Velocity must satisfy 0 <= v < c')
  }
  if (!(tick > 0) || !isFinite(tick)) {
    throw new RangeError('A trial tick must be a finite number of seconds greater than 0')
  }
  const flashHalfPath = (SPEED_OF_LIGHT * tick) / 2
  const sidewaysHalf = (velocity * tick) / 2
  const triangleHalfPath = Math.hypot(MIRROR_SEPARATION, sidewaysHalf)
  const gap = flashHalfPath - triangleHalfPath
  const verdict = Math.abs(gap) < 1e-9 ? 'fits' : gap < 0 ? 'too-short' : 'too-long'
  return { tick, flashHalfPath, sidewaysHalf, triangleHalfPath, verdict }
}

export interface RestClockAtRunEnd {
  reading: number
  wholeTicks: number
  partialTick: number
}

// The rest clock stands still in the lab, so its reading is lab time. The run stops when the moving clock's one tick ends, so by then the
// rest clock has finished some whole ticks and is part-way through the next one.
export function restClockAtRunEnd(experiment: LightClockExperimentResult): RestClockAtRunEnd {
  const reading = experiment.movingTickDuration
  const wholeTicks = Math.floor(reading / experiment.restTickDuration + 1e-9)
  return { reading, wholeTicks, partialTick: Math.max(0, reading - wholeTicks * experiment.restTickDuration) }
}
