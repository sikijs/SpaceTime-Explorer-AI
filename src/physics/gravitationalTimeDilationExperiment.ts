// strength is a dimensionless stand-in for the real quantity acceleration * height / c^2,
// exaggerated far beyond any real rocket or building so the effect is visible; time is in
// the floor clock's own seconds (the reference clock for this experiment).
export interface GravitationalTimeDilationExperimentResult {
  strength: number
  frequencyRatio: number
}

// The floor and ceiling clocks share this single calculation: there is exactly one formula,
// not two, which is itself the physics being demonstrated (same pattern as Experiment 1).
export function runGravitationalTimeDilationExperiment(
  strength: number
): GravitationalTimeDilationExperimentResult {
  if (!(strength > 0 && strength < 1)) {
    throw new RangeError('Strength must be strictly between 0 and 1')
  }

  return {
    strength,
    frequencyRatio: 1 - strength,
  }
}

// Tick count registered by a given clock at a given elapsed time, as measured by the
// floor clock (elapsedFloorSeconds >= 0). The floor clock is the reference: its tick
// count equals elapsed time exactly. The ceiling clock runs faster by 1 / frequencyRatio,
// per the first-order light-transit/redshift argument in the specification.
export function tickCountAt(
  experiment: GravitationalTimeDilationExperimentResult,
  elapsedFloorSeconds: number,
  clock: 'floor' | 'ceiling'
): number {
  if (!(elapsedFloorSeconds >= 0)) {
    throw new RangeError('Elapsed time must be greater than or equal to 0')
  }

  return clock === 'floor' ? elapsedFloorSeconds : elapsedFloorSeconds / experiment.frequencyRatio
}

// ---- Audit update (2026-11-12): the guess, its marker, the tutor's marking, the axis and the worked numbers ----
// Nothing above changes. The real outcome never depends on a guess.

// How much floor-clock time a run covers (a presentation choice, not physics: the model has no
// natural stopping point). The component re-exports it so Gravity 5 keeps working.
export const RUN_DURATION_FLOOR_SECONDS = 10

export type PredictionChoice = 'sameRate' | 'differentRates'

// Both clocks share one formula, so the ceiling clock always ticks faster for any valid
// strength. The gap is built into the model; it is not a measurement.
export function actualOutcome(): PredictionChoice {
  return 'differentRates'
}

const CHOICE_PHRASE: Record<PredictionChoice, string> = {
  sameRate: 'the same rate',
  differentRates: 'different rates',
}

// Ceiling ticks counted for every one floor tick (1 / frequencyRatio).
export function ceilingTicksPerFloorTick(experiment: GravitationalTimeDilationExperimentResult): number {
  return 1 / experiment.frequencyRatio
}

export interface GuessMarker {
  // Where the white ring sits on the graph: the two line ends at the end of the run.
  timeSeconds: number
  floorTicks: number
  ceilingTicks: number
  boxText: string
}

// A yes or no guess has no size or position of its own, so its marker is placed at the line
// ends whichever choice was made. It is only a marker.
export function guessMarkerFor(
  experiment: GravitationalTimeDilationExperimentResult,
  choice: PredictionChoice
): GuessMarker {
  return {
    timeSeconds: RUN_DURATION_FLOOR_SECONDS,
    floorTicks: tickCountAt(experiment, RUN_DURATION_FLOOR_SECONDS, 'floor'),
    ceilingTicks: tickCountAt(experiment, RUN_DURATION_FLOOR_SECONDS, 'ceiling'),
    boxText: `YOUR GUESS (a marker only): the clocks tick at ${CHOICE_PHRASE[choice]}`,
  }
}

export interface GuessMarking {
  matched: boolean
  // The tutor's opening block in the explanation: what the guess was and what the graph showed.
  text: string
}

export function markGuess(
  experiment: GravitationalTimeDilationExperimentResult,
  choice: PredictionChoice
): GuessMarking {
  const matched = choice === actualOutcome()
  const floor = tickCountAt(experiment, RUN_DURATION_FLOOR_SECONDS, 'floor').toFixed(2)
  const ceiling = tickCountAt(experiment, RUN_DURATION_FLOOR_SECONDS, 'ceiling').toFixed(2)
  return {
    matched,
    text:
      `You guessed that the clocks would tick at ${CHOICE_PHRASE[choice]}. ` +
      `The two lines pull apart: after ${RUN_DURATION_FLOOR_SECONDS} seconds the floor clock had counted ${floor} ticks and the ceiling clock ${ceiling}. ` +
      (matched
        ? 'So your guess matched what the graph shows.'
        : 'So the graph shows something different from your guess, and that is just what we are here to understand.'),
  }
}

// Drawing A's tick axis: 0 to 25 for the three presets (0.1, 0.3, 0.6; the largest total is 25),
// and for any larger strength the next multiple of 25 that holds the ceiling total.
export const PRESET_TICK_AXIS_TOP = 25

export function tickAxisTop(strength: number): number {
  const total = tickCountAt(runGravitationalTimeDilationExperiment(strength), RUN_DURATION_FLOOR_SECONDS, 'ceiling')
  // 1e-9 guards against floating-point noise just above a multiple of 25 (e.g. 25.000000000000004).
  return Math.max(PRESET_TICK_AXIS_TOP, Math.ceil(total / 25 - 1e-9) * 25)
}

const SPEED_OF_LIGHT_METRES_PER_SECOND = 299_792_458
const GRAVITY_AT_GROUND_METRES_PER_SECOND_SQUARED = 9.8

// The real-world strength of a rocket accelerating at 1g with the clocks 10 m apart:
// g * h / c^2 (the tutor's worked example).
export function worked1g10mStrength(): number {
  return (GRAVITY_AT_GROUND_METRES_PER_SECOND_SQUARED * 10) / SPEED_OF_LIGHT_METRES_PER_SECOND ** 2
}

export interface WorkedNumbers {
  // The 5-second moment at strength 0.3 (caption).
  momentSeconds: number
  momentFloorTicks: number
  momentCeilingTicks: number
  // Ceiling total after 10 s at the three presets (Drawing A caption, words box).
  ceilingTotalAt0p1: number
  ceilingTotalAt0p3: number
  ceilingTotalAt0p6: number
  floorTotal: number
  ceilingPerFloorAt0p3: number
  realStrength1g10m: number
}

export function workedNumbers(): WorkedNumbers {
  const at = (s: number) => runGravitationalTimeDilationExperiment(s)
  return {
    momentSeconds: 5,
    momentFloorTicks: tickCountAt(at(0.3), 5, 'floor'),
    momentCeilingTicks: tickCountAt(at(0.3), 5, 'ceiling'),
    ceilingTotalAt0p1: tickCountAt(at(0.1), RUN_DURATION_FLOOR_SECONDS, 'ceiling'),
    ceilingTotalAt0p3: tickCountAt(at(0.3), RUN_DURATION_FLOOR_SECONDS, 'ceiling'),
    ceilingTotalAt0p6: tickCountAt(at(0.6), RUN_DURATION_FLOOR_SECONDS, 'ceiling'),
    floorTotal: RUN_DURATION_FLOOR_SECONDS,
    ceilingPerFloorAt0p3: ceilingTicksPerFloorTick(at(0.3)),
    realStrength1g10m: worked1g10mStrength(),
  }
}
