// relativeMass and relativeDistance are dimensionless learner-facing presets, not real
// kilograms or meters. The derived strengths feed directly into Experiment 2's
// runGravitationalTimeDilationExperiment and Experiment 3's runTidalEffectExperiment,
// unmodified, so this file adds no new fundamental physics — only the mapping from
// "how much mass, how far away" to the two experiments' own existing abstracted controls.
//
// timeDilationStrength scales with relativeMass / relativeDistance (first-order weak-field
// potential scaling); convergenceStrength scales with relativeMass / relativeDistance^3
// (first-order tidal-gradient scaling) — so the tidal effect grows faster with proximity
// than time dilation does, matching the real relations these controls stand in for.
const K_DILATION = 0.3
const K_TIDAL = 1.2

// Matches Experiment 2's and Experiment 3's own required strict-(0, 1) range, and the
// custom "Other" ranges documented in each experiment's own UI (0.05-0.9 for time
// dilation, 0.02-0.9 for convergence), so this file can never hand either experiment's
// physics function a value it would reject.
const TIME_DILATION_STRENGTH_MIN = 0.05
const TIME_DILATION_STRENGTH_MAX = 0.9
const CONVERGENCE_STRENGTH_MIN = 0.02
const CONVERGENCE_STRENGTH_MAX = 0.9

export interface SpacetimeCurvatureStrengths {
  timeDilationStrength: number
  convergenceStrength: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function strengthsForMassAndDistance(relativeMass: number, relativeDistance: number): SpacetimeCurvatureStrengths {
  if (!(relativeMass > 0)) {
    throw new RangeError('Relative mass must be greater than 0')
  }
  if (!(relativeDistance > 0)) {
    throw new RangeError('Relative distance must be greater than 0')
  }

  const timeDilationStrength = clamp(
    (K_DILATION * relativeMass) / relativeDistance,
    TIME_DILATION_STRENGTH_MIN,
    TIME_DILATION_STRENGTH_MAX
  )
  const convergenceStrength = clamp(
    (K_TIDAL * relativeMass) / relativeDistance ** 3,
    CONVERGENCE_STRENGTH_MIN,
    CONVERGENCE_STRENGTH_MAX
  )

  return { timeDilationStrength, convergenceStrength }
}
