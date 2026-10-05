// A single detector can only say a wave arrived — not which direction it came from. This
// experiment reuses no chirp/strain physics from Experiments 1-5; it is entirely about plane-wave
// arrival-time geometry, driven by the real, invariant speed of light already established in the
// Relativity of Time and Motion chapter (Experiment 5).
//
// Three real detectors (Hanford, Livingston, Virgo) are placed on a flat, illustrative schematic
// plane (not a real map or real 3D Earth coordinates), at positions chosen only so their pairwise
// straight-line separations approximate their real, published separations:
// Hanford-Livingston ~3,000 km, Hanford-Virgo ~8,700 km, Livingston-Virgo ~7,500 km.

export interface DetectorPosition {
  name: string
  x: number // km, schematic flat-plane coordinates
  y: number // km
}

export const REAL_SPEED_OF_LIGHT_KM_PER_S = 299_792.458 // km / s

export const DETECTORS: DetectorPosition[] = [
  { name: 'Hanford', x: 0, y: 0 },
  { name: 'Livingston', x: 3000, y: 0 },
  { name: 'Virgo', x: 4740, y: 7295.4 },
]

export interface DirectionPreset {
  label: string
  directionDegrees: number
}

// Chosen so each preset produces a different detector reached first, and a different full
// arrival order overall (verified by this module's tests) - the premise the prediction activity
// depends on.
export const DIRECTION_PRESETS: DirectionPreset[] = [
  { label: 'Direction A', directionDegrees: 0 },
  { label: 'Direction B', directionDegrees: 250 },
  { label: 'Direction C', directionDegrees: 280 },
]

function centroidOf(detectors: DetectorPosition[]): { x: number; y: number } {
  const x = detectors.reduce((sum, d) => sum + d.x, 0) / detectors.length
  const y = detectors.reduce((sum, d) => sum + d.y, 0) / detectors.length
  return { x, y }
}

// Time at which the wavefront reaches a detector, relative to the detector array's centroid
// (t = 0 at the centroid). directionDegrees is the direction the wave travels FROM, measured as a
// standard math angle (0 deg = +x axis, counterclockwise). A detector further toward that
// direction is reached earlier (a negative time); one further away is reached later (a positive
// time). This is the standard plane-wave arrival-time relationship,
// t(detector) = -(detectorPosition relative to centroid) . (unit vector toward the source) / c.
export function arrivalTimeSeconds(detector: DetectorPosition, directionDegrees: number): number {
  const centroid = centroidOf(DETECTORS)
  const relativeX = detector.x - centroid.x
  const relativeY = detector.y - centroid.y

  const radians = (directionDegrees * Math.PI) / 180
  const towardSourceX = Math.cos(radians)
  const towardSourceY = Math.sin(radians)

  const projectionKm = relativeX * towardSourceX + relativeY * towardSourceY

  return -projectionKm / REAL_SPEED_OF_LIGHT_KM_PER_S
}

export interface DetectorArrival {
  detector: DetectorPosition
  arrivalTimeSeconds: number
}

// Arrival times for all three fixed detectors under one direction preset, sorted earliest to
// latest.
export function arrivalOrderFor(directionDegrees: number): DetectorArrival[] {
  return DETECTORS.map((detector) => ({
    detector,
    arrivalTimeSeconds: arrivalTimeSeconds(detector, directionDegrees),
  })).sort((a, b) => a.arrivalTimeSeconds - b.arrivalTimeSeconds)
}
