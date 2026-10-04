// Models a gravitational wave whose frequency and amplitude both increase over the run, as an
// inspiraling pair (such as two black holes) spirals closer and orbits faster right up to an
// idealized final moment — the "chirp" Experiment 1's own specification flagged as unmodeled
// there. Reuses Experiment 1's exact strain/arm-length relationship unchanged; the only new
// physics is a simple, explicitly-labeled toy formula for how frequency and amplitude grow, not
// the real post-Newtonian inspiral equations (see this experiment's specification, "Decisions
// Confirmed" item 4).
import { BASE_ARM_LENGTH } from './gravitationalWaveExperiment'

const MERGER_TIME_CONSTANT = 1
const CUTOFF_FRACTION = 0.9
const REFERENCE_MASS = 1
const PHASE_INTEGRATION_STEP = 0.0005

export interface ChirpState {
  time: number
  frequency: number
  amplitude: number
  // The accumulated phase (radians) used internally to compute strain, exposed so consumers can
  // compare cycle counts between two different time inputs (e.g. Experiment 5's "beats behind"
  // comparison) without duplicating accumulatedPhaseAt's own integration.
  phase: number
  strain: number
  armXLength: number
  armYLength: number
}

export interface ChirpRun {
  mergerTime: number
  cutoffTime: number
}

function validateMassAndBase(mass: number, baseFrequency: number, baseAmplitude: number): void {
  if (!(mass > 0)) {
    throw new RangeError('Mass must be greater than 0')
  }
  if (!(baseFrequency > 0)) {
    throw new RangeError('Base frequency must be greater than 0')
  }
  if (!(baseAmplitude > 0)) {
    throw new RangeError('Base amplitude must be greater than 0')
  }
}

export function chirpRunFor(mass: number, baseFrequency: number, baseAmplitude: number): ChirpRun {
  validateMassAndBase(mass, baseFrequency, baseAmplitude)

  const mergerTime = MERGER_TIME_CONSTANT / mass
  const cutoffTime = CUTOFF_FRACTION * mergerTime

  return { mergerTime, cutoffTime }
}

function growthFactorAt(time: number, mergerTime: number): number {
  const s = time / mergerTime
  return 1 / Math.sqrt(1 - s)
}

// Accumulates phase numerically, one simulation step at a time (the same step-based style
// already used by orbitExperiment.ts and blackHoleExperiment.ts), rather than a closed-form
// phase formula, since frequency is no longer constant.
function accumulatedPhaseAt(time: number, mass: number, baseFrequency: number, mergerTime: number): number {
  let phase = 0
  let t = 0

  while (t < time) {
    const step = Math.min(PHASE_INTEGRATION_STEP, time - t)
    const midpointTime = t + step / 2
    const frequency = baseFrequency * growthFactorAt(midpointTime, mergerTime)
    phase += 2 * Math.PI * frequency * step
    t += step
  }

  return phase
}

export function chirpStateAt(
  time: number,
  mass: number,
  baseFrequency: number,
  baseAmplitude: number
): ChirpState {
  validateMassAndBase(mass, baseFrequency, baseAmplitude)
  if (time < 0) {
    throw new RangeError('Time must be non-negative')
  }

  const { mergerTime, cutoffTime } = chirpRunFor(mass, baseFrequency, baseAmplitude)
  if (time > cutoffTime) {
    throw new RangeError('Time must not exceed the run\'s cutoffTime')
  }

  const growthFactor = growthFactorAt(time, mergerTime)

  const frequency = baseFrequency * growthFactor
  const amplitude = baseAmplitude * growthFactor * (mass / REFERENCE_MASS)
  const phase = accumulatedPhaseAt(time, mass, baseFrequency, mergerTime)
  const strain = amplitude * Math.sin(phase)

  const armXLength = BASE_ARM_LENGTH * (1 + strain / 2)
  const armYLength = BASE_ARM_LENGTH * (1 - strain / 2)

  return { time, frequency, amplitude, phase, strain, armXLength, armYLength }
}
