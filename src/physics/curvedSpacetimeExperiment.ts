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
