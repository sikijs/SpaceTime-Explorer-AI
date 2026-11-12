// Two travelers walk "as straight as possible" (a geodesic) starting a fixed small
// distance apart. On a flat plane, separation never changes. On a sphere, separation
// shrinks with distance traveled, per the standard geodesic-deviation result for a
// surface of constant positive curvature 1/R^2: separation(d) = initialSeparation * cos(d / R).
// This is ordinary, well-established spherical geometry, used only as an analogy for
// spacetime curvature (see the specification) — it is not itself a model of spacetime.
//
// curvatureStrength is a dimensionless, exaggerated stand-in for 1/R (same abstracted-control
// pattern as Experiment 2's `strength` and Experiment 3's `convergenceStrength`), scaled by a
// fixed reference radius so the sphere stays a visualizable size in the animation.
export const REFERENCE_RADIUS_METERS = 10

export type CurvedSpacetimeScene = 'flat' | 'sphere'

export interface CurvedSpacetimeExperimentResult {
  initialSeparationMeters: number
  curvatureStrength: number
  radiusMeters: number
  maxDistanceMeters: number
}

export function runCurvedSpacetimeExperiment(
  initialSeparationMeters: number,
  curvatureStrength: number
): CurvedSpacetimeExperimentResult {
  if (!(initialSeparationMeters > 0)) {
    throw new RangeError('Initial separation must be greater than 0')
  }
  if (!(curvatureStrength > 0 && curvatureStrength < 1)) {
    throw new RangeError('Curvature strength must be strictly between 0 and 1')
  }

  const radiusMeters = REFERENCE_RADIUS_METERS / curvatureStrength

  return {
    initialSeparationMeters,
    curvatureStrength,
    radiusMeters,
    // The two travelers meet at the "pole", a quarter of the way around the sphere.
    maxDistanceMeters: radiusMeters * (Math.PI / 2),
  }
}

// Separation between the two travelers after each has traveled distanceMeters.
// Flat: constant. Sphere: initialSeparation * cos(distance / radius) — using
// radius * thetaZero = initialSeparation to fold the angular separation into meters directly.
export function separationAt(
  experiment: CurvedSpacetimeExperimentResult,
  distanceMeters: number,
  scene: CurvedSpacetimeScene
): number {
  if (!(distanceMeters >= 0 && distanceMeters <= experiment.maxDistanceMeters)) {
    throw new RangeError('Distance traveled must be between 0 and the distance at which the travelers meet')
  }

  if (scene === 'flat') {
    return experiment.initialSeparationMeters
  }

  return experiment.initialSeparationMeters * Math.cos(distanceMeters / experiment.radiusMeters)
}

// ---- Audit update (2026-11-12): the outcome, the guess markers, the tutor's marking, the axes and the worked numbers ----
// Nothing above changes. The real outcome never depends on a guess.

// Mean Earth radius, 6,371 km (the same value Experiment 3's tutor uses). Used only for a comparison in the introduction.
export const EARTH_RADIUS_METERS = 6371000

// The smallest curvature strength the page's "Other" box accepts (a sphere 1,000 m in radius).
export const SMALLEST_CHOOSABLE_STRENGTH = 0.01

export type PredictionChoice = 'converge' | 'same' | 'apart'

// Both scenes call the same separationAt formula: the flat separation never changes, and the sphere separation shrinks for any valid
// curvature strength.
export function actualOutcomeFor(scene: CurvedSpacetimeScene): PredictionChoice {
  return scene === 'sphere' ? 'converge' : 'same'
}

// The distance between the two travelers when they reach the end of the walk (the pole, on the sphere).
export function finalSeparationMeters(experiment: CurvedSpacetimeExperimentResult, scene: CurvedSpacetimeScene): number {
  return separationAt(experiment, experiment.maxDistanceMeters, scene)
}

const SCENE_NAME: Record<CurvedSpacetimeScene, string> = { flat: 'flat surface', sphere: 'curved surface' }
const CHOICE_PHRASE: Record<PredictionChoice, string> = {
  converge: 'the travelers drift closer together',
  same: 'the travelers stay the same distance apart',
  apart: 'the travelers drift farther apart',
}
const CHOICE_PHRASE_PLAIN: Record<PredictionChoice, string> = {
  converge: 'drift closer together',
  same: 'stay the same distance apart',
  apart: 'drift farther apart',
}

// The vertical axis of the separation graph runs from 0 to this value, so that a guess of "drift farther apart" has room above the
// 1 m start (a change of scale only).
export const SEPARATION_AXIS_TOP_METERS = 1.2

// Part 2's Drawing A uses one distance axis for every strength, so that a different strength gives a visibly different curve. It runs
// to 80 m (the pole is 78.5 m away at strength 0.2) and grows in steps of 20 m for a smaller "Other" strength.
export const FIXED_DISTANCE_AXIS_METERS = 80
export function distanceAxisEndMeters(experiment: CurvedSpacetimeExperimentResult): number {
  return Math.max(FIXED_DISTANCE_AXIS_METERS, Math.ceil(experiment.maxDistanceMeters / 20) * 20)
}

export type GuessArrow = 'down' | 'none' | 'up'

export interface GuessMarker {
  // Where the white ring sits on the graph: the end of the scene's line.
  distanceMeters: number
  separationMeters: number
  // The direction the learner guessed. It has no length: the guess has no size of its own.
  arrow: GuessArrow
  boxText: string
}

// A three-way guess has a direction but no size, so the ring sits at the end of the line whichever choice was made, and the arrow shows
// only the direction guessed. It is only a marker.
export function guessMarkerFor(
  experiment: CurvedSpacetimeExperimentResult,
  scene: CurvedSpacetimeScene,
  choice: PredictionChoice
): GuessMarker {
  return {
    distanceMeters: experiment.maxDistanceMeters,
    separationMeters: finalSeparationMeters(experiment, scene),
    arrow: choice === 'converge' ? 'down' : choice === 'apart' ? 'up' : 'none',
    boxText: `YOUR GUESS, ${SCENE_NAME[scene]} (a marker only): ${CHOICE_PHRASE[choice]}`,
  }
}

export interface GuessMarking {
  matched: boolean
  // The tutor's opening sentence for this surface: what the guess was and what the graph showed.
  text: string
}

export function markGuess(
  experiment: CurvedSpacetimeExperimentResult,
  scene: CurvedSpacetimeScene,
  choice: PredictionChoice
): GuessMarking {
  const matched = choice === actualOutcomeFor(scene)
  const end = finalSeparationMeters(experiment, scene)
  const start = experiment.initialSeparationMeters
  const shown =
    scene === 'sphere'
      ? `The curved line falls from ${start.toFixed(3)} m to ${end.toFixed(3)} m: the travelers had met at the pole.`
      : `The flat line stays at ${end.toFixed(3)} m: the travelers were exactly as far apart at the end as at the start.`
  return {
    matched,
    text:
      `You guessed that the ${SCENE_NAME[scene]}'s travelers would ${CHOICE_PHRASE_PLAIN[choice]}. ${shown} ` +
      (matched ? 'So your guess matched what the graph shows.' : 'So the graph shows something different from your guess.'),
  }
}

export interface WorkedNumbers {
  // Strength 0.5 (Part 1): the radius, the distance to the pole, and the sphere's separation after 10 m and halfway to the pole.
  radiusAt0p5: number
  poleDistanceAt0p5: number
  separationAfter10mAt0p5: number
  halfwayDistanceAt0p5: number
  halfwaySeparationAt0p5: number
  endSeparationAt0p5: number
  flatEndSeparation: number
  // The three preset strengths: the radius, the distance to the pole and the separation after 10 m.
  radiusAt0p2: number
  radiusAt0p8: number
  poleDistanceAt0p2: number
  poleDistanceAt0p8: number
  separationAfter10mAt0p2: number
  separationAfter10mAt0p8: number
  // The Earth's mean radius (6,371 km) and how many times bigger it is than Part 1's 20 m sphere, for the introduction's comparison.
  earthRadiusMeters: number
  earthRadiusOverPart1Radius: number
  // The curvature strength the Earth would have on this page's scale (10 m ÷ radius), and the smallest strength the page accepts.
  earthStrengthOnThisScale: number
  smallestChoosableStrength: number
}

// The numbers the words box, the captions and the tutor use, for two travelers starting 1 m apart.
export function workedNumbers(): WorkedNumbers {
  const run = (strength: number) => runCurvedSpacetimeExperiment(1, strength)
  const r02 = run(0.2)
  const r05 = run(0.5)
  const r08 = run(0.8)
  return {
    radiusAt0p5: r05.radiusMeters,
    poleDistanceAt0p5: r05.maxDistanceMeters,
    separationAfter10mAt0p5: separationAt(r05, 10, 'sphere'),
    halfwayDistanceAt0p5: r05.maxDistanceMeters / 2,
    halfwaySeparationAt0p5: separationAt(r05, r05.maxDistanceMeters / 2, 'sphere'),
    endSeparationAt0p5: finalSeparationMeters(r05, 'sphere'),
    flatEndSeparation: finalSeparationMeters(r05, 'flat'),
    radiusAt0p2: r02.radiusMeters,
    radiusAt0p8: r08.radiusMeters,
    poleDistanceAt0p2: r02.maxDistanceMeters,
    poleDistanceAt0p8: r08.maxDistanceMeters,
    separationAfter10mAt0p2: separationAt(r02, 10, 'sphere'),
    separationAfter10mAt0p8: separationAt(r08, 10, 'sphere'),
    earthRadiusMeters: EARTH_RADIUS_METERS,
    earthRadiusOverPart1Radius: EARTH_RADIUS_METERS / r05.radiusMeters,
    earthStrengthOnThisScale: REFERENCE_RADIUS_METERS / EARTH_RADIUS_METERS,
    smallestChoosableStrength: SMALLEST_CHOOSABLE_STRENGTH,
  }
}
