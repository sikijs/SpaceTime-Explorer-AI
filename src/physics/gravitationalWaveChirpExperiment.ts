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
function accumulatedPhaseAt(time: number, baseFrequency: number, mergerTime: number): number {
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
  const phase = accumulatedPhaseAt(time, baseFrequency, mergerTime)
  const strain = amplitude * Math.sin(phase)

  const armXLength = BASE_ARM_LENGTH * (1 + strain / 2)
  const armYLength = BASE_ARM_LENGTH * (1 - strain / 2)

  return { time, frequency, amplitude, phase, strain, armXLength, armYLength }
}

// ---------------------------------------------------------------------------------------------
// Audit additions (Gravitational Waves 2): everything the guess marks, the tables and the notes
// show comes from here, so that the interface only displays it (CLAUDE.md §9). The wave itself
// is unchanged. See docs/audit/gravitational-waves/02-draft-wording.md, section 10.
// ---------------------------------------------------------------------------------------------

// The fixed wave constants the page uses (the same values the component has always used).
export const BASE_FREQUENCY = 1
export const BASE_AMPLITUDE = 0.03

// Part 1 always runs this made-up mass; Picture 3 compares it with a pair ten times heavier.
export const PART1_MASS = 0.3
export const REFERENCE_PAIRS = [0.3, 3.0] as const

export type PitchChoice = 'speeds-up' | 'slows-down' | 'stays-the-same'
export type LoudnessChoice = 'stronger' | 'weaker' | 'stays-the-same'
export type TimingChoice = 'small-mass' | 'large-mass' | 'same-time'

export interface ChirpPeak {
  time: number
  // |strain| at the peak.
  strainSize: number
  // How far each arm is from its rest length at the peak (half the strain, see armMoveForStrain).
  armMove: number
}

export interface ChirpRunSummary {
  mass: number
  mergerTime: number
  // The time to the final moment (the run's cutoff).
  cutoffTime: number
  startFrequency: number
  endFrequency: number
  // endFrequency / startFrequency (and the same number for the amplitude).
  rise: number
  startAmplitude: number
  endAmplitude: number
  // Full swings made during the run (the accumulated phase divided by 2π).
  swings: number
  finalStrain: number
  finalArmXLength: number
  finalArmYLength: number
  // The shortest and longest length each arm reaches at any time in the run.
  armXMin: number
  armXMax: number
  armYMin: number
  armYMax: number
  // The largest distance from the rest length that either arm reaches in the run.
  largestMoveFromRest: number
}

interface TracePoint {
  time: number
  phase: number
  strain: number
}

// One pass over the run with the same step and midpoint rule as accumulatedPhaseAt, so every
// phase here equals chirpStateAt's phase at that time.
function traceRun(mass: number): TracePoint[] {
  const { mergerTime, cutoffTime } = chirpRunFor(mass, BASE_FREQUENCY, BASE_AMPLITUDE)
  const points: TracePoint[] = [{ time: 0, phase: 0, strain: 0 }]
  let t = 0
  let phase = 0
  while (t < cutoffTime) {
    const step = Math.min(PHASE_INTEGRATION_STEP, cutoffTime - t)
    const midpointTime = t + step / 2
    phase += 2 * Math.PI * BASE_FREQUENCY * growthFactorAt(midpointTime, mergerTime) * step
    t += step
    const growth = growthFactorAt(Math.min(t, cutoffTime), mergerTime)
    const amplitude = BASE_AMPLITUDE * growth * (mass / REFERENCE_MASS)
    points.push({ time: t, phase, strain: amplitude * Math.sin(phase) })
  }
  return points
}

export function armMoveForStrain(strain: number): number {
  // Each arm moves by half the strain (Experiment 1's relationship).
  return (BASE_ARM_LENGTH * Math.abs(strain)) / 2
}

export function chirpRunSummary(mass: number): ChirpRunSummary {
  const { mergerTime, cutoffTime } = chirpRunFor(mass, BASE_FREQUENCY, BASE_AMPLITUDE)
  const start = chirpStateAt(0, mass, BASE_FREQUENCY, BASE_AMPLITUDE)
  const trace = traceRun(mass)
  const last = trace[trace.length - 1]
  const growthAtEnd = growthFactorAt(cutoffTime, mergerTime)
  const endFrequency = BASE_FREQUENCY * growthAtEnd
  const endAmplitude = BASE_AMPLITUDE * growthAtEnd * (mass / REFERENCE_MASS)

  let armXMin = BASE_ARM_LENGTH
  let armXMax = BASE_ARM_LENGTH
  for (const point of trace) {
    const armX = BASE_ARM_LENGTH * (1 + point.strain / 2)
    armXMin = Math.min(armXMin, armX)
    armXMax = Math.max(armXMax, armX)
  }
  // Arm Y is Arm X's mirror image about the rest length.
  const armYMin = 2 * BASE_ARM_LENGTH - armXMax
  const armYMax = 2 * BASE_ARM_LENGTH - armXMin

  return {
    mass,
    mergerTime,
    cutoffTime,
    startFrequency: start.frequency,
    endFrequency,
    rise: endFrequency / start.frequency,
    startAmplitude: start.amplitude,
    endAmplitude,
    swings: last.phase / (2 * Math.PI),
    finalStrain: last.strain,
    finalArmXLength: BASE_ARM_LENGTH * (1 + last.strain / 2),
    finalArmYLength: BASE_ARM_LENGTH * (1 - last.strain / 2),
    armXMin,
    armXMax,
    armYMin,
    armYMax,
    largestMoveFromRest: Math.max(armXMax - BASE_ARM_LENGTH, BASE_ARM_LENGTH - armXMin),
  }
}

// The graph's vertical range is the rest length plus and minus this: the largest distance from
// the rest length that either arm reaches in the run, rounded up to the next whole 0.01.
export function graphHalfRange(mass: number): number {
  const move = chirpRunSummary(mass).largestMoveFromRest
  return Math.round(Math.ceil(move / 0.01 - 1e-9) * 0.01 * 100) / 100
}

export interface FirstAndLastSwing {
  // From time 0 until the phase reaches one full swing.
  firstSwingLength: number
  // How long one swing lasts at the final moment: 1 ÷ the frequency there.
  lastSwingLength: number
  // The first and last peaks of the strain inside the run; null when the run ends before one
  // is reached (a very heavy pair, which runs for less than a quarter of a swing).
  firstPeak: ChirpPeak | null
  lastPeak: ChirpPeak | null
}

export function firstAndLastSwing(mass: number): FirstAndLastSwing {
  const trace = traceRun(mass)
  const summary = chirpRunSummary(mass)

  let firstSwingLength = summary.cutoffTime
  for (let i = 1; i < trace.length; i++) {
    if (trace[i].phase >= 2 * Math.PI) {
      const a = trace[i - 1]
      const b = trace[i]
      const share = (2 * Math.PI - a.phase) / (b.phase - a.phase)
      firstSwingLength = a.time + share * (b.time - a.time)
      break
    }
  }

  const peaks: ChirpPeak[] = []
  for (let i = 1; i < trace.length - 1; i++) {
    const before = Math.abs(trace[i - 1].strain)
    const here = Math.abs(trace[i].strain)
    const after = Math.abs(trace[i + 1].strain)
    if (here > before && here >= after) {
      peaks.push({ time: trace[i].time, strainSize: here, armMove: armMoveForStrain(here) })
    }
  }

  return {
    firstSwingLength,
    lastSwingLength: 1 / summary.endFrequency,
    firstPeak: peaks.length > 0 ? peaks[0] : null,
    lastPeak: peaks.length > 0 ? peaks[peaks.length - 1] : null,
  }
}

// The white marks are markers for a choice, not measurements: a fixed step, not the real ratio.
export function pitchGuessRatio(choice: PitchChoice): number {
  return choice === 'speeds-up' ? 0.5 : choice === 'slows-down' ? 2 : 1
}

export function loudnessGuessRatio(choice: LoudnessChoice): number {
  return choice === 'stronger' ? 2 : choice === 'weaker' ? 0.5 : 1
}

// The mass of each pair whose bar the white diamond sits on in Picture 3.
export function timingGuessTargets(choice: TimingChoice): number[] {
  if (choice === 'small-mass') return [REFERENCE_PAIRS[0]]
  if (choice === 'large-mass') return [REFERENCE_PAIRS[1]]
  return [...REFERENCE_PAIRS]
}

// The real answers, computed from the model (not typed in), for the results and the tutor only.
export function pitchOutcome(): PitchChoice {
  const { startFrequency, endFrequency } = chirpRunSummary(PART1_MASS)
  return endFrequency > startFrequency ? 'speeds-up' : endFrequency < startFrequency ? 'slows-down' : 'stays-the-same'
}

export function loudnessOutcome(): LoudnessChoice {
  const { startAmplitude, endAmplitude } = chirpRunSummary(PART1_MASS)
  return endAmplitude > startAmplitude ? 'stronger' : endAmplitude < startAmplitude ? 'weaker' : 'stays-the-same'
}

export function timingOutcome(): TimingChoice {
  const small = chirpRunSummary(REFERENCE_PAIRS[0]).cutoffTime
  const large = chirpRunSummary(REFERENCE_PAIRS[1]).cutoffTime
  return small < large ? 'small-mass' : large < small ? 'large-mass' : 'same-time'
}

export const pitchGuessMatches = (choice: PitchChoice): boolean => choice === pitchOutcome()
export const loudnessGuessMatches = (choice: LoudnessChoice): boolean => choice === loudnessOutcome()
export const timingGuessMatches = (choice: TimingChoice): boolean => choice === timingOutcome()

export interface ChirpTracePoint {
  time: number
  armXLength: number
  armYLength: number
}

// The two arm lengths at evenly spaced times across the whole run, from one pass over the run,
// for drawing the graph (the same numbers as chirpStateAt at those times).
export function chirpArmTrace(mass: number, samples = 600): ChirpTracePoint[] {
  const trace = traceRun(mass)
  const points: ChirpTracePoint[] = []
  for (let i = 0; i <= samples; i++) {
    const point = trace[Math.round((i / samples) * (trace.length - 1))]
    points.push({
      time: point.time,
      armXLength: BASE_ARM_LENGTH * (1 + point.strain / 2),
      armYLength: BASE_ARM_LENGTH * (1 - point.strain / 2),
    })
  }
  return points
}

// ---------------------------------------------------------------------------------------------
// The check-up in Part 3: this page's run beside the one real chirp it can be compared with,
// GW150914 (arXiv 1602.03837: "sweeps upwards in frequency from 35 to 250 Hz with a peak
// gravitational-wave strain of 1.0 × 10⁻²¹"; LIGO Lab: a signal "just two-tenths of a second long").
// ---------------------------------------------------------------------------------------------
export const REAL_CHIRP = { startHz: 35, endHz: 250, peakStrain: 1.0e-21, signalSeconds: 0.2 } as const

export interface ChirpCheckUp {
  realRise: number
  toyRise: number
  // log2 of each rise: how many octaves higher (each octave doubles the pitch).
  realOctaves: number
  toyOctaves: number
  // The loudest this page's wave gets in the Part 1 run, beside the real peak strain.
  toyEndAmplitude: number
  realPeakStrain: number
  timesLargerThanReal: number
  powerOfTenLarger: number
}

export function chirpCheckUp(): ChirpCheckUp {
  const summary = chirpRunSummary(PART1_MASS)
  const realRise = REAL_CHIRP.endHz / REAL_CHIRP.startHz
  const timesLargerThanReal = summary.endAmplitude / REAL_CHIRP.peakStrain
  return {
    realRise,
    toyRise: summary.rise,
    realOctaves: Math.log2(realRise),
    toyOctaves: Math.log2(summary.rise),
    toyEndAmplitude: summary.endAmplitude,
    realPeakStrain: REAL_CHIRP.peakStrain,
    timesLargerThanReal,
    powerOfTenLarger: Math.floor(Math.log10(timesLargerThanReal)),
  }
}

// Part 2's Drawing C compares two pairs: [Part 1's pair, the learner's pair]. Which of the two the
// learner's guess 3 names depends on which is lighter. Returns indices into [massA, massB]; when the
// two masses are equal there is no lighter or heavier pair, so the guess sits on both bars.
export function timingGuessTargetsBetween(choice: TimingChoice, massA: number, massB: number): number[] {
  if (choice === 'same-time' || massA === massB) return [0, 1]
  const lighter = massA < massB ? 0 : 1
  return choice === 'small-mass' ? [lighter] : [1 - lighter]
}
