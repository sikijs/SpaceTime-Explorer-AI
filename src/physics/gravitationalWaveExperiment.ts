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

// ---------------------------------------------------------------------------------------------
// Numbers for the guess marks, the results table and the Part 2 drawing (audit of Gravitational
// Waves Experiment 1). The interface only displays these; it does not compute them itself.
// ---------------------------------------------------------------------------------------------

// A run plays this many full oscillation cycles (the specification's "Run").
export const RUN_CYCLES = 5

// The fixed wave used in Part 1: the "Typical detected event" preset.
export const TYPICAL_EVENT = { amplitude: 0.2, frequency: 1 } as const

// Two numbers within this distance of the rest length count as "at the rest length".
const REST_TOLERANCE = 1e-9

export type DirectionChoice = 'same-way' | 'opposite-ways'
export type AfterChoice = 'longer' | 'shorter' | 'back-to-original'

export interface ArmRange {
  shortest: number
  longest: number
  stretchedBy: number
  squeezedBy: number
}

export interface ArmLengthRange {
  armX: ArmRange
  armY: ArmRange
}

// Exact lowest and highest lengths each arm reaches over any whole number of cycles. These come
// from the model's own formula (1 +/- amplitude/2), not from sampling animation frames, so they do
// not depend on the frame rate (CLAUDE.md §11).
export function armLengthRange(amplitude: number): ArmLengthRange {
  if (!(amplitude > 0)) {
    throw new RangeError('Amplitude must be positive')
  }
  const half = amplitude / 2
  const range: ArmRange = {
    shortest: BASE_ARM_LENGTH * (1 - half),
    longest: BASE_ARM_LENGTH * (1 + half),
    stretchedBy: BASE_ARM_LENGTH * half,
    squeezedBy: BASE_ARM_LENGTH * half,
  }
  return { armX: { ...range }, armY: { ...range } }
}

// Time units for one full swing.
export function periodOf(frequency: number): number {
  if (!(frequency > 0)) {
    throw new RangeError('Frequency must be positive')
  }
  return 1 / frequency
}

// Time units for a whole run of `cycles` swings.
export function runDuration(frequency: number, cycles: number = RUN_CYCLES): number {
  if (!(cycles > 0)) {
    throw new RangeError('Cycles must be positive')
  }
  return cycles * periodOf(frequency)
}

// The first moment the strain reaches its largest positive value (a quarter of a cycle in).
export function firstPeakTime(frequency: number): number {
  return periodOf(frequency) / 4
}

export function firstPeakState(amplitude: number, frequency: number): GravitationalWaveState {
  return gravitationalWaveStateAt(firstPeakTime(frequency), amplitude, frequency)
}

function snapToRest(length: number): number {
  return Math.abs(length - BASE_ARM_LENGTH) < REST_TOLERANCE ? BASE_ARM_LENGTH : length
}

// Both arm lengths at the end of a run.
export function armLengthsAfterRun(
  amplitude: number,
  frequency: number,
  cycles: number = RUN_CYCLES
): { armXLength: number; armYLength: number } {
  const end = gravitationalWaveStateAt(runDuration(frequency, cycles), amplitude, frequency)
  return { armXLength: snapToRest(end.armXLength), armYLength: snapToRest(end.armYLength) }
}

// What the real wave does, worked out from the model rather than typed in.
export function directionOutcome(amplitude: number, frequency: number): DirectionChoice {
  const { armXLength, armYLength } = firstPeakState(amplitude, frequency)
  const xMove = armXLength - BASE_ARM_LENGTH
  const yMove = armYLength - BASE_ARM_LENGTH
  return xMove * yMove < 0 ? 'opposite-ways' : 'same-way'
}

export function afterOutcome(
  amplitude: number,
  frequency: number,
  cycles: number = RUN_CYCLES
): AfterChoice {
  const { armXLength, armYLength } = armLengthsAfterRun(amplitude, frequency, cycles)
  const move = (armXLength - BASE_ARM_LENGTH) + (armYLength - BASE_ARM_LENGTH)
  const bothAtRest = armXLength === BASE_ARM_LENGTH && armYLength === BASE_ARM_LENGTH
  if (bothAtRest) return 'back-to-original'
  return move > 0 ? 'longer' : 'shorter'
}

export function directionGuessMatches(
  choice: DirectionChoice,
  amplitude: number,
  frequency: number
): boolean {
  return choice === directionOutcome(amplitude, frequency)
}

export function afterGuessMatches(
  choice: AfterChoice,
  amplitude: number,
  frequency: number,
  cycles: number = RUN_CYCLES
): boolean {
  return choice === afterOutcome(amplitude, frequency, cycles)
}

export type ArrowDirection = 'up' | 'down'

// Guess 1's white mark: what the learner's answer says each arm does at the first peak
// (up = the arm gets longer, down = shorter). It is a marker for a choice, not a size.
export function directionGuessArrows(choice: DirectionChoice): {
  armX: ArrowDirection
  armY: ArrowDirection
} {
  return { armX: 'up', armY: choice === 'opposite-ways' ? 'down' : 'up' }
}

// Guess 2's white mark sits this far above or below the rest length. A marker for a choice, so
// the step says nothing about how much longer or shorter.
export const AFTER_GUESS_STEP = 0.05

export function afterGuessMarkLength(choice: AfterChoice): number {
  if (choice === 'longer') return BASE_ARM_LENGTH + AFTER_GUESS_STEP
  if (choice === 'shorter') return BASE_ARM_LENGTH - AFTER_GUESS_STEP
  return BASE_ARM_LENGTH
}

// Worked example for the note under Table 1: a change of `armChange` (in rest lengths) on an arm
// of `restLengthKm`, in metres.
export function changeInMetres(armChange: number, restLengthKm: number): number {
  return armChange * restLengthKm * 1000
}

// ---- The real event the page quotes (its "A real detection" note): GW150914 on LIGO's arms ----
// The strain and the arm length are the page's own quoted figures (specification, "Decisions
// Confirmed" item 5), not new claims.
export const REAL_STRAIN = 1e-21
export const LIGO_ARM_KM = 4

// The wave drawn here is more than 10^n times stronger than the real one (n rounded down).
export function powersOfTenAboveReal(amplitude: number): number {
  if (!(amplitude > 0)) {
    throw new RangeError('Amplitude must be positive')
  }
  return Math.floor(Math.log10(amplitude / REAL_STRAIN))
}

// The change the real strain makes to a LIGO arm, in units of 10^-18 metres.
export function realChangeIn1e18Metres(): number {
  return REAL_STRAIN * LIGO_ARM_KM * 1000 * 1e18
}
