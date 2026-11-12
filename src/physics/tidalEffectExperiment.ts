// Units: acceleration in meters per second squared; height and separation in meters; time in seconds.
import { EARTH_GRAVITY, fixedTimeScaleEndSeconds } from './equivalencePrincipleExperiment'

export { EARTH_GRAVITY, fixedTimeScaleEndSeconds }

export type TidalEffectScene = 'planet' | 'rocket'

export interface TidalEffectExperimentResult {
  accelerationMetersPerSecondSquared: number
  accelerationInG: number
  initialHeightMeters: number
  initialSeparationMeters: number
  convergenceStrength: number
  timeToFloorSeconds: number
}

export interface TidalEffectBallPositions {
  heightAboveFloor: number
  leftBallOffset: number
  rightBallOffset: number
}

// The vertical fall is identical to Experiment 1 (the equivalence principle) in both
// scenes — the only new physics here is the horizontal separation between two balls.
export function runTidalEffectExperiment(
  accelerationMetersPerSecondSquared: number,
  initialHeightMeters: number,
  initialSeparationMeters: number,
  convergenceStrength: number
): TidalEffectExperimentResult {
  if (!(accelerationMetersPerSecondSquared > 0)) {
    throw new RangeError('Acceleration must be greater than 0')
  }
  if (!(initialHeightMeters > 0)) {
    throw new RangeError('Initial height must be greater than 0')
  }
  if (!(initialSeparationMeters > 0)) {
    throw new RangeError('Initial separation must be greater than 0')
  }
  if (!(convergenceStrength > 0 && convergenceStrength < 1)) {
    throw new RangeError('Convergence strength must be between 0 and 1 (exclusive)')
  }

  return {
    accelerationMetersPerSecondSquared,
    accelerationInG: accelerationMetersPerSecondSquared / EARTH_GRAVITY,
    initialHeightMeters,
    initialSeparationMeters,
    convergenceStrength,
    timeToFloorSeconds: Math.sqrt((2 * initialHeightMeters) / accelerationMetersPerSecondSquared),
  }
}

// Ball separation at a given elapsed time: constant in the rocket scene (uniform
// acceleration has no center to converge toward), shrinking in the planet scene
// (first-order tidal approximation, fixed at each ball's starting offset).
export function separationAt(experiment: TidalEffectExperimentResult, elapsedSeconds: number, scene: TidalEffectScene): number {
  if (scene === 'rocket') {
    return experiment.initialSeparationMeters
  }

  const fractionOfFall = elapsedSeconds / experiment.timeToFloorSeconds
  return experiment.initialSeparationMeters * (1 - experiment.convergenceStrength * fractionOfFall * fractionOfFall)
}

export function ballPositionsAt(
  experiment: TidalEffectExperimentResult,
  elapsedSeconds: number,
  scene: TidalEffectScene
): TidalEffectBallPositions {
  if (!(elapsedSeconds >= 0 && elapsedSeconds <= experiment.timeToFloorSeconds)) {
    throw new RangeError('Elapsed time must be between 0 and the time the balls reach the floor')
  }

  const heightAboveFloor =
    experiment.initialHeightMeters -
    0.5 * experiment.accelerationMetersPerSecondSquared * elapsedSeconds * elapsedSeconds
  const separation = separationAt(experiment, elapsedSeconds, scene)

  return {
    heightAboveFloor,
    leftBallOffset: -separation / 2,
    rightBallOffset: separation / 2,
  }
}

// ---- Audit update (2026-11-12): the outcome, the two guesses, their markers, the tutor's marking, the axis and the worked numbers ----
// Nothing above changes. The real outcome never depends on a guess.

export type PredictionChoice = 'converge' | 'same' | 'apart'

// Both scenes call the same formulas: the planet scene converges for any valid strength, and the rocket scene never does.
export function actualOutcomeFor(scene: TidalEffectScene): PredictionChoice {
  return scene === 'planet' ? 'converge' : 'same'
}

// The distance between the two balls when they reach the floor.
export function finalSeparationMeters(experiment: TidalEffectExperimentResult, scene: TidalEffectScene): number {
  return separationAt(experiment, experiment.timeToFloorSeconds, scene)
}

const SCENE_NAME: Record<TidalEffectScene, string> = { planet: 'planet cabin', rocket: 'rocket cabin' }
const CHOICE_PHRASE: Record<PredictionChoice, string> = {
  converge: 'the balls drift together',
  same: 'the balls stay the same distance apart',
  apart: 'the balls drift apart',
}
const CHOICE_PHRASE_PLAIN: Record<PredictionChoice, string> = {
  converge: 'drift together',
  same: 'stay the same distance apart',
  apart: 'drift apart',
}

// The vertical axis of the separation graph runs from 0 to this value, so that a guess of "drift apart" has room above the 1 m start
// (a change of scale only).
export const SEPARATION_AXIS_TOP_METERS = 1.2

export type GuessArrow = 'down' | 'none' | 'up'

export interface GuessMarker {
  // Where the white ring sits on the graph: the end of the scene's line.
  timeSeconds: number
  separationMeters: number
  // The direction the learner guessed. It has no length: the guess has no size of its own.
  arrow: GuessArrow
  boxText: string
}

// A three-way guess has a direction but no size, so the ring sits at the end of the line whichever choice was made, and the arrow shows
// only the direction guessed. It is only a marker.
export function guessMarkerFor(
  experiment: TidalEffectExperimentResult,
  scene: TidalEffectScene,
  choice: PredictionChoice
): GuessMarker {
  return {
    timeSeconds: experiment.timeToFloorSeconds,
    separationMeters: finalSeparationMeters(experiment, scene),
    arrow: choice === 'converge' ? 'down' : choice === 'apart' ? 'up' : 'none',
    boxText: `YOUR GUESS, ${SCENE_NAME[scene]} (a marker only): ${CHOICE_PHRASE[choice]}`,
  }
}

export interface GuessMarking {
  matched: boolean
  // The tutor's opening sentence for this cabin: what the guess was and what the graph showed.
  text: string
}

export function markGuess(
  experiment: TidalEffectExperimentResult,
  scene: TidalEffectScene,
  choice: PredictionChoice
): GuessMarking {
  const matched = choice === actualOutcomeFor(scene)
  const end = finalSeparationMeters(experiment, scene)
  const start = experiment.initialSeparationMeters
  const shown =
    scene === 'planet'
      ? `The planet line ends at ${end.toFixed(3)} m, below the ${start.toFixed(3)} m start: the balls were ${(start - end).toFixed(3)} m closer together when they landed.`
      : `The rocket line stays at ${end.toFixed(3)} m: the balls were exactly as far apart when they landed as when they started.`
  return {
    matched,
    text:
      `You guessed that the ${SCENE_NAME[scene]}'s balls would ${CHOICE_PHRASE_PLAIN[choice]}. ${shown} ` +
      (matched ? 'So your guess matched what the graph shows.' : 'So the graph shows something different from your guess.'),
  }
}

export interface WorkedNumbers {
  oneGFallSeconds: number
  twoGFallSeconds: number
  halfGFallSeconds: number
  // Planet separation at 1g and strength 0.3: halfway through the fall (fraction 0.5) and at the end.
  halfwayTimeSeconds: number
  halfwaySeparationMeters: number
  endSeparationAt0p3: number
  // Planet end separation at the three preset strengths, and the rocket's.
  endSeparationAt0p1: number
  endSeparationAt0p6: number
  rocketEndSeparation: number
}

// The numbers the words box, the captions and the tutor use, for a 2 m drop of two balls 1 m apart.
export function workedNumbers(): WorkedNumbers {
  const run = (g: number, strength: number) => runTidalEffectExperiment(g * EARTH_GRAVITY, 2, 1, strength)
  const oneG = run(1, 0.3)
  const halfwayTime = oneG.timeToFloorSeconds / 2
  return {
    oneGFallSeconds: oneG.timeToFloorSeconds,
    twoGFallSeconds: run(2, 0.3).timeToFloorSeconds,
    halfGFallSeconds: run(0.5, 0.3).timeToFloorSeconds,
    halfwayTimeSeconds: halfwayTime,
    halfwaySeparationMeters: separationAt(oneG, halfwayTime, 'planet'),
    endSeparationAt0p3: finalSeparationMeters(oneG, 'planet'),
    endSeparationAt0p1: finalSeparationMeters(run(1, 0.1), 'planet'),
    endSeparationAt0p6: finalSeparationMeters(run(1, 0.6), 'planet'),
    rocketEndSeparation: finalSeparationMeters(oneG, 'rocket'),
  }
}

// Real-Moon numbers for the tutor's "real tides" paragraph. The Moon's pull falls with the square of the distance to its center
// (the same inverse-square law as any gravity), so the side of the Earth facing the Moon is pulled harder than the far side.
// Mean Earth radius 6371 km; mean Earth-Moon center distance 384,400 km.
export interface MoonTidalNumbers {
  earthRadiusKm: number
  moonDistanceKm: number
  nearSideDistanceKm: number
  farSideDistanceKm: number
  nearToFarPullRatio: number
}

export function moonTidalNumbers(): MoonTidalNumbers {
  const earthRadiusKm = 6371
  const moonDistanceKm = 384400
  const nearSideDistanceKm = moonDistanceKm - earthRadiusKm
  const farSideDistanceKm = moonDistanceKm + earthRadiusKm
  return {
    earthRadiusKm,
    moonDistanceKm,
    nearSideDistanceKm,
    farSideDistanceKm,
    nearToFarPullRatio: (farSideDistanceKm / nearSideDistanceKm) ** 2,
  }
}
