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
