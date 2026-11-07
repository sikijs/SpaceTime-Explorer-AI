// Models the Doppler redshift of a gravitational wave from a source receding directly along the
// line of sight. Reuses gravitationalWaveChirpExperiment.ts's chirpStateAt/chirpRunFor unchanged
// for the chirp itself, and movingClockExperiment.ts's timeDilationFactorFor unchanged for the
// relativistic part. The only new physics here is the classical (non-relativistic) Doppler
// stretching factor, combined with that reused time dilation factor to produce the exact
// relativistic Doppler formula (see this experiment's specification, "Physics Model").
//
// Audit update (2026-11-07, docs/audit/gravitational-waves/05-draft-wording.md, section 11): the
// functions below the two Doppler functions compute every number the picture, the tables, the
// guess marks and the tutor show. They add no physics: a stretch is 1 divided by a factor, and the
// rest reads the two Doppler functions and the existing chirp.
import { chirpRunFor, chirpStateAt } from './gravitationalWaveChirpExperiment'
import { timeDilationFactorFor, SPEED_OF_LIGHT } from './movingClockExperiment'

// The classical (non-relativistic) Doppler stretching factor for a source receding directly
// along the line of sight — the same relationship a receding sound or light source already
// follows. Not a new physical idea; a direct restatement of the everyday Doppler effect.
export function classicalDopplerFactorFor(speed: number): number {
  return 1 / (1 + speed / SPEED_OF_LIGHT)
}

// The full relativistic Doppler factor: the classical stretching above, combined with this
// project's own time dilation factor (reused unchanged, not reintroduced). This is the exact
// relativistic Doppler formula, built from two pieces the learner already has rather than
// presented as one new, unexplained equation.
export function dopplerFactorFor(speed: number): number {
  return classicalDopplerFactorFor(speed) * timeDilationFactorFor(speed)
}

// ---- Fixed values of this experiment (previously constants inside the component) ----
export const REDSHIFT_PART1_SPEED = 0.5 // the one speed of Part 1, as a fraction of c
export const REDSHIFT_MAX_SPEED = 0.9
export const REDSHIFT_MASS = 2
export const REDSHIFT_BASE_FREQUENCY = 1
export const REDSHIFT_BASE_AMPLITUDE = 0.03
// The stretch panel's fixed scale: a little above the largest stretch on the slider (4.36 at 0.9c).
export const REDSHIFT_STRETCH_SCALE_MAX = 4.5

// How many times longer each wave is when it arrives than when it was sent: 1 divided by the factor.
export function stretchFor(factor: number): number {
  if (!(factor > 0)) throw new RangeError('A Doppler factor must be positive')
  return 1 / factor
}

export const classicalStretchFor = (speed: number): number => stretchFor(classicalDopplerFactorFor(speed))
export const realStretchFor = (speed: number): number => stretchFor(dopplerFactorFor(speed))

export interface RedshiftRunSummary {
  speed: number
  observerWindow: number
  startPitch: number
  classicalFactor: number
  realFactor: number
  timeDilationFactor: number
  classicalStretch: number
  realStretch: number
  // real stretch divided by everyday stretch (1 at zero speed, more than 1 for any receding speed)
  extraStretch: number
  // the same as a percentage above the everyday stretch
  extraStretchPercent: number
  // the pitch the source sent at the final moment (the source's own clock has advanced by the real
  // factor), and the pitch the detector receives then
  finalEmittedFrequency: number
  finalDetectedFrequency: number
}

export function redshiftRunSummary(speed: number): RedshiftRunSummary {
  const realFactor = dopplerFactorFor(speed)
  const classicalFactor = classicalDopplerFactorFor(speed)
  const observerWindow = chirpRunFor(REDSHIFT_MASS, REDSHIFT_BASE_FREQUENCY, REDSHIFT_BASE_AMPLITUDE).cutoffTime
  const atSource = chirpStateAt(observerWindow * realFactor, REDSHIFT_MASS, REDSHIFT_BASE_FREQUENCY, REDSHIFT_BASE_AMPLITUDE)
  const classicalStretch = stretchFor(classicalFactor)
  const realStretch = stretchFor(realFactor)
  const extraStretch = realStretch / classicalStretch
  return {
    speed,
    observerWindow,
    startPitch: chirpStateAt(0, REDSHIFT_MASS, REDSHIFT_BASE_FREQUENCY, REDSHIFT_BASE_AMPLITUDE).frequency,
    classicalFactor,
    realFactor,
    timeDilationFactor: timeDilationFactorFor(speed),
    classicalStretch,
    realStretch,
    extraStretch,
    extraStretchPercent: (extraStretch - 1) * 100,
    finalEmittedFrequency: atSource.frequency,
    finalDetectedFrequency: atSource.frequency * realFactor,
  }
}

// ---- The learner's two guesses ----
export type DirectionChoice = 'higher' | 'lower' | 'same'
export type MagnitudeChoice = 'exact' | 'more' | 'less'

const SAME_TOLERANCE = 1e-9

// Guess 1 (higher, lower or the same): computed from the model, not typed in the component.
export function directionOutcome(speed: number): DirectionChoice {
  const factor = dopplerFactorFor(speed)
  if (Math.abs(factor - 1) <= SAME_TOLERANCE) return 'same'
  return factor < 1 ? 'lower' : 'higher'
}

// Guess 2 (exactly, more or less than the everyday stretch).
export function magnitudeOutcome(speed: number): MagnitudeChoice {
  const real = realStretchFor(speed)
  const everyday = classicalStretchFor(speed)
  if (Math.abs(real - everyday) <= SAME_TOLERANCE) return 'exact'
  return real > everyday ? 'more' : 'less'
}

export const directionGuessMatches = (choice: DirectionChoice, speed: number): boolean => choice === directionOutcome(speed)
export const magnitudeGuessMatches = (choice: MagnitudeChoice, speed: number): boolean => choice === magnitudeOutcome(speed)

// The white marks are markers only: a guess here has no size of its own, so each mark says which
// choice was made, never how much. Guess 1: an arrow beside the Detected wave (down, up, or an
// equals sign). Guess 2: an arrow from the everyday bar's tip (past it, back inside it, or none with
// the outline closed round the bar).
export type DirectionMarker = 'down' | 'up' | 'equals'
export type MagnitudeMarker = 'past' | 'inside' | 'closed'

export function directionGuessMarker(choice: DirectionChoice): DirectionMarker {
  return choice === 'lower' ? 'down' : choice === 'higher' ? 'up' : 'equals'
}

export function magnitudeGuessMarker(choice: MagnitudeChoice): MagnitudeMarker {
  return choice === 'more' ? 'past' : choice === 'less' ? 'inside' : 'closed'
}

// ---- Table 2: the learner's own speed beside the Part 1 speed ----
export type ComparisonWord = 'the same' | 'more' | 'less'

// A plain word for how a learner's value compares with the Part 1 value (no invented cut-off: only
// exact equality, to rounding, counts as "the same").
export function compareWord(yours: number, part1: number): ComparisonWord {
  if (Math.abs(yours - part1) <= SAME_TOLERANCE) return 'the same'
  return yours > part1 ? 'more' : 'less'
}

export interface YourSpeedComparison {
  yours: RedshiftRunSummary
  part1: RedshiftRunSummary
  // the word for each Table 2 row
  words: {
    speed: ComparisonWord
    classicalStretch: ComparisonWord
    realStretch: ComparisonWord
    extraStretch: ComparisonWord
    realFactor: ComparisonWord
    finalDetectedFrequency: ComparisonWord
  }
  // Check 1 of the check-up ("the real stretch is more than the everyday one") at the learner's speed
  realStretchExceedsEveryday: boolean
  atPart1Speed: boolean
}

export function yourSpeedComparison(speed: number): YourSpeedComparison {
  const yours = redshiftRunSummary(speed)
  const part1 = redshiftRunSummary(REDSHIFT_PART1_SPEED)
  return {
    yours,
    part1,
    words: {
      speed: compareWord(yours.speed, part1.speed),
      classicalStretch: compareWord(yours.classicalStretch, part1.classicalStretch),
      realStretch: compareWord(yours.realStretch, part1.realStretch),
      extraStretch: compareWord(yours.extraStretch, part1.extraStretch),
      realFactor: compareWord(yours.realFactor, part1.realFactor),
      finalDetectedFrequency: compareWord(yours.finalDetectedFrequency, part1.finalDetectedFrequency),
    },
    realStretchExceedsEveryday: yours.realStretch > yours.classicalStretch,
    atPart1Speed: Math.abs(speed - REDSHIFT_PART1_SPEED) <= SAME_TOLERANCE,
  }
}
