// A dimensionless, exaggerated stand-in for the effect of a passing gravitational wave —
// the real strain of a detected event is around 1 part in 10^21, far too small to show at any
// visual scale (see this experiment's specification, "Decisions Confirmed" item 1).
export const BASE_ARM_LENGTH = 1

export interface GravitationalWaveState {
  time: number
  strain: number
  armXLength: number
  armYLength: number
}

export function gravitationalWaveStateAt(
  time: number,
  amplitude: number,
  frequency: number
): GravitationalWaveState {
  if (time < 0) {
    throw new RangeError('Time must be non-negative')
  }
  if (!(amplitude > 0)) {
    throw new RangeError('Amplitude must be positive')
  }
  if (!(frequency > 0)) {
    throw new RangeError('Frequency must be positive')
  }

  const strain = amplitude * Math.sin(2 * Math.PI * frequency * time)

  // The two perpendicular arms stretch and squeeze in exactly opposite directions (the "plus
  // polarization" pattern) — this experiment's version of Experiment 4's geodesic deviation,
  // now oscillating in time instead of staying fixed.
  const armXLength = BASE_ARM_LENGTH * (1 + strain / 2)
  const armYLength = BASE_ARM_LENGTH * (1 - strain / 2)

  return { time, strain, armXLength, armYLength }
}
