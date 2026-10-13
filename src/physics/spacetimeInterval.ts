import { SPEED_OF_LIGHT, timeDilationFactorFor } from './movingClockExperiment'
import { lorentzTransform } from './lorentzTransform'
import type { WorldlinePoint } from './spacetimeDiagramView'

// Units: velocity is a fraction of c (c = 1); time in seconds, distance in light-seconds.

// time² − distance², in seconds², for two events. It is the same for every observer.
export function intervalSquared(a: WorldlinePoint, b: WorldlinePoint): number {
  const timeBetween = b.time - a.time
  const distanceBetween = b.position - a.position
  return timeBetween * timeBetween - distanceBetween * distanceBetween
}

export interface ObserverReading {
  timeBetween: number
  distanceBetween: number
  intervalSquared: number
}

export interface IntervalExperimentResult {
  clockSpeed: number
  passingObserverSpeed: number
  // The two events: tick 0 and tick 1 of the moving clock, in the lab's coordinates.
  tickZero: WorldlinePoint
  tickOne: WorldlinePoint
  lab: ObserverReading
  clockFrame: ObserverReading
  passing: ObserverReading
}

function readingFor(a: WorldlinePoint, b: WorldlinePoint): ObserverReading {
  return {
    timeBetween: b.time - a.time,
    distanceBetween: b.position - a.position,
    intervalSquared: intervalSquared(a, b),
  }
}

// The clock ticks once per second of its own time. Tick 0 is at the lab's origin at time zero.
// The lab's numbers come from Experiment 3's time dilation factor; the other two observers'
// numbers come from the Lorentz transformation (Experiment 11), not from any new formula.
export function runIntervalExperiment(clockSpeed: number, passingObserverSpeed: number): IntervalExperimentResult {
  if (!(clockSpeed >= 0 && clockSpeed < SPEED_OF_LIGHT)) {
    throw new RangeError('Clock speed must satisfy 0 <= v < c')
  }
  if (!(Math.abs(passingObserverSpeed) < SPEED_OF_LIGHT)) {
    throw new RangeError('Passing observer speed must satisfy |u| < c')
  }

  const labTimeBetween = 1 / timeDilationFactorFor(clockSpeed)
  const tickZero: WorldlinePoint = { position: 0, time: 0 }
  const tickOne: WorldlinePoint = { position: clockSpeed * labTimeBetween, time: labTimeBetween }

  return {
    clockSpeed,
    passingObserverSpeed,
    tickZero,
    tickOne,
    lab: readingFor(tickZero, tickOne),
    clockFrame: readingFor(lorentzTransform(tickZero, clockSpeed), lorentzTransform(tickOne, clockSpeed)),
    passing: readingFor(lorentzTransform(tickZero, passingObserverSpeed), lorentzTransform(tickOne, passingObserverSpeed)),
  }
}
