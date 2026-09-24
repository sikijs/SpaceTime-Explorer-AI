import { timeDilationFactorFor } from './movingClockExperiment'
import type { WorldlinePoint } from './spacetimeDiagramView'

// Units: velocity is a fraction of c (c = 1); position in light-seconds, time in seconds — same
// convention as the rest of the app. Converts an event's lab-frame (position, time) into the
// (position, time) a frame moving at `velocity` (relative to the lab) would assign to that same
// event. Reuses Experiment 3's own time dilation factor by division, rather than introducing a
// separately named gamma or duplicating the underlying √(1 − v²) formula.
export function lorentzTransform(event: WorldlinePoint, velocity: number): WorldlinePoint {
  const timeDilationFactor = timeDilationFactorFor(velocity)
  const gammaFactor = 1 / timeDilationFactor

  return {
    time: gammaFactor * (event.time - velocity * event.position),
    position: gammaFactor * (event.position - velocity * event.time),
  }
}
