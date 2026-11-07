import { describe, expect, it } from 'vitest'
import { chirpRunFor, chirpStateAt } from './gravitationalWaveChirpExperiment'
import { timeDilationFactorFor } from './movingClockExperiment'
import {
  REDSHIFT_BASE_AMPLITUDE,
  REDSHIFT_BASE_FREQUENCY,
  REDSHIFT_MASS,
  REDSHIFT_MAX_SPEED,
  REDSHIFT_PART1_SPEED,
  REDSHIFT_STRETCH_SCALE_MAX,
  classicalDopplerFactorFor,
  classicalStretchFor,
  compareWord,
  directionGuessMarker,
  directionGuessMatches,
  directionOutcome,
  dopplerFactorFor,
  magnitudeGuessMarker,
  magnitudeGuessMatches,
  magnitudeOutcome,
  realStretchFor,
  redshiftRunSummary,
  stretchFor,
  yourSpeedComparison,
} from './gravitationalWaveRedshiftExperiment'
import type { DirectionChoice, MagnitudeChoice } from './gravitationalWaveRedshiftExperiment'

describe('dopplerFactorFor', () => {
  it('equals exactly 1 at zero speed (no motion, no shift)', () => {
    expect(dopplerFactorFor(0)).toBe(1)
  })

  it('is strictly less than 1 for any receding speed between 0 and 0.9', () => {
    for (const speed of [0.1, 0.3, 0.5, 0.7, 0.9]) {
      expect(dopplerFactorFor(speed)).toBeLessThan(1)
    }
  })

  it('strictly decreases as speed increases', () => {
    const speeds = [0.1, 0.3, 0.5, 0.7, 0.9]
    const factors = speeds.map(dopplerFactorFor)
    for (let i = 1; i < factors.length; i++) {
      expect(factors[i]).toBeLessThan(factors[i - 1])
    }
  })

  it('is strictly less than the classical-alone factor for any speed greater than 0', () => {
    for (const speed of [0.1, 0.3, 0.5, 0.7, 0.9]) {
      expect(dopplerFactorFor(speed)).toBeLessThan(classicalDopplerFactorFor(speed))
    }
  })
})

describe('classicalDopplerFactorFor', () => {
  it('matches 1 / (1 + speed) exactly', () => {
    expect(classicalDopplerFactorFor(0.5)).toBeCloseTo(1 / 1.5, 10)
    expect(classicalDopplerFactorFor(0.2)).toBeCloseTo(1 / 1.2, 10)
  })
})

const DIRECTIONS: DirectionChoice[] = ['higher', 'lower', 'same']
const MAGNITUDES: MagnitudeChoice[] = ['exact', 'more', 'less']

describe('stretch (1 divided by the factor)', () => {
  it('is 1 at zero speed and the everyday stretch is 1 + speed', () => {
    expect(stretchFor(1)).toBe(1)
    expect(classicalStretchFor(0)).toBe(1)
    for (const speed of [0.1, 0.3, 0.5, 0.7, 0.9]) expect(classicalStretchFor(speed)).toBeCloseTo(1 + speed, 12)
  })

  it('gives the numbers the page quotes at 0.3c, 0.5c, 0.7c and 0.9c', () => {
    const expected: Array<[number, number, number]> = [
      [0.3, 1.3, 1.36],
      [0.5, 1.5, 1.73],
      [0.7, 1.7, 2.38],
      [0.9, 1.9, 4.36],
    ]
    for (const [speed, everyday, real] of expected) {
      expect(classicalStretchFor(speed)).toBeCloseTo(everyday, 2)
      expect(realStretchFor(speed)).toBeCloseTo(real, 2)
    }
  })

  it('is never less for the real stretch than for the everyday one, and the gap grows with speed', () => {
    let previousExtra = 1
    for (const speed of [0.05, 0.2, 0.4, 0.6, 0.8, 0.9]) {
      const extra = realStretchFor(speed) / classicalStretchFor(speed)
      expect(extra).toBeGreaterThan(1)
      expect(extra).toBeGreaterThan(previousExtra)
      previousExtra = extra
    }
  })

  it('rejects a factor that is not positive', () => {
    expect(() => stretchFor(0)).toThrow(RangeError)
    expect(() => stretchFor(-1)).toThrow(RangeError)
  })

  it('fits on the panel scale at every speed on the slider', () => {
    expect(realStretchFor(REDSHIFT_MAX_SPEED)).toBeLessThan(REDSHIFT_STRETCH_SCALE_MAX)
    expect(REDSHIFT_STRETCH_SCALE_MAX - realStretchFor(REDSHIFT_MAX_SPEED)).toBeLessThan(0.2)
  })
})

describe('redshiftRunSummary', () => {
  it('reproduces the Part 1 numbers the draft wording quotes (0.5c)', () => {
    const run = redshiftRunSummary(REDSHIFT_PART1_SPEED)
    expect(REDSHIFT_PART1_SPEED).toBe(0.5)
    expect(run.observerWindow).toBeCloseTo(0.45, 3)
    expect(run.startPitch).toBeCloseTo(1, 12)
    expect(run.classicalFactor).toBeCloseTo(0.667, 3)
    expect(run.realFactor).toBeCloseTo(0.577, 3)
    expect(run.timeDilationFactor).toBeCloseTo(0.866, 3)
    expect(run.classicalFactor * run.timeDilationFactor).toBeCloseTo(run.realFactor, 12)
    expect(run.classicalStretch).toBeCloseTo(1.5, 12)
    expect(run.realStretch).toBeCloseTo(1.732, 3)
    expect(run.extraStretch).toBeCloseTo(1.155, 3)
    expect(run.extraStretchPercent).toBeCloseTo(15.47, 1)
    expect(run.finalEmittedFrequency).toBeCloseTo(1.443, 3)
    expect(run.finalDetectedFrequency).toBeCloseTo(0.833, 3)
  })

  it('has detected = emitted x the real factor, so the two waves differ by exactly the factor', () => {
    for (const speed of [0, 0.3, 0.5, 0.9]) {
      const run = redshiftRunSummary(speed)
      expect(run.finalDetectedFrequency / run.finalEmittedFrequency).toBeCloseTo(run.realFactor, 12)
    }
  })

  it('matches the chirp module for the emitted pitch and the window', () => {
    const run = redshiftRunSummary(0.7)
    const window = chirpRunFor(REDSHIFT_MASS, REDSHIFT_BASE_FREQUENCY, REDSHIFT_BASE_AMPLITUDE).cutoffTime
    const atSource = chirpStateAt(window * dopplerFactorFor(0.7), REDSHIFT_MASS, REDSHIFT_BASE_FREQUENCY, REDSHIFT_BASE_AMPLITUDE)
    expect(run.observerWindow).toBe(window)
    expect(run.finalEmittedFrequency).toBe(atSource.frequency)
    expect(run.timeDilationFactor).toBe(timeDilationFactorFor(0.7))
  })

  it('at zero speed nothing is stretched: both factors 1, both stretches 1, emitted = detected = the no-motion final pitch', () => {
    const run = redshiftRunSummary(0)
    expect(run.realFactor).toBe(1)
    expect(run.realStretch).toBe(1)
    expect(run.extraStretch).toBe(1)
    expect(run.extraStretchPercent).toBe(0)
    expect(run.finalEmittedFrequency).toBe(run.finalDetectedFrequency)
    expect(run.finalEmittedFrequency).toBeCloseTo(3.162, 3)
  })

  it('gives the 0.9c numbers the draft wording quotes (real stretch 4.36 against 1.90, a ratio of 2.29)', () => {
    const run = redshiftRunSummary(0.9)
    expect(run.classicalStretch).toBeCloseTo(1.9, 12)
    expect(run.realStretch).toBeCloseTo(4.36, 2)
    expect(run.extraStretch).toBeCloseTo(2.29, 2)
    expect(run.finalDetectedFrequency).toBeCloseTo(0.258, 3)
  })
})

describe('the two guesses', () => {
  it('has the answers "lower" and "more" at every receding speed on the slider', () => {
    for (const speed of [0.05, 0.3, 0.5, 0.9]) {
      expect(directionOutcome(speed)).toBe('lower')
      expect(magnitudeOutcome(speed)).toBe('more')
    }
  })

  it('has the answers "the same" and "exactly" at zero speed', () => {
    expect(directionOutcome(0)).toBe('same')
    expect(magnitudeOutcome(0)).toBe('exact')
  })

  it('matches exactly one choice for each question, at the Part 1 speed and at zero', () => {
    for (const speed of [REDSHIFT_PART1_SPEED, 0]) {
      expect(DIRECTIONS.filter((choice) => directionGuessMatches(choice, speed))).toHaveLength(1)
      expect(MAGNITUDES.filter((choice) => magnitudeGuessMatches(choice, speed))).toHaveLength(1)
    }
    expect(directionGuessMatches('lower', 0.5)).toBe(true)
    expect(directionGuessMatches('higher', 0.5)).toBe(false)
    expect(magnitudeGuessMatches('more', 0.5)).toBe(true)
    expect(magnitudeGuessMatches('exact', 0.5)).toBe(false)
  })
})

describe('the guess markers (markers only: they carry a choice, not a size)', () => {
  it('give a different marker for each choice, and never read the speed', () => {
    expect(new Set(DIRECTIONS.map(directionGuessMarker)).size).toBe(3)
    expect(new Set(MAGNITUDES.map(magnitudeGuessMarker)).size).toBe(3)
    expect(directionGuessMarker('lower')).toBe('down')
    expect(directionGuessMarker('higher')).toBe('up')
    expect(directionGuessMarker('same')).toBe('equals')
    expect(magnitudeGuessMarker('more')).toBe('past')
    expect(magnitudeGuessMarker('less')).toBe('inside')
    expect(magnitudeGuessMarker('exact')).toBe('closed')
  })
})

describe('Table 2 (your speed beside the Part 1 speed)', () => {
  it('says "the same" in every row while the slider is on the Part 1 speed', () => {
    const cmp = yourSpeedComparison(REDSHIFT_PART1_SPEED)
    expect(cmp.atPart1Speed).toBe(true)
    for (const word of Object.values(cmp.words)) expect(word).toBe('the same')
  })

  it('says "more" or "less" in every row once the slider moves away, and keeps check 1 true', () => {
    const faster = yourSpeedComparison(0.9)
    expect(faster.atPart1Speed).toBe(false)
    expect(faster.words.speed).toBe('more')
    expect(faster.words.classicalStretch).toBe('more')
    expect(faster.words.realStretch).toBe('more')
    expect(faster.words.extraStretch).toBe('more')
    expect(faster.words.realFactor).toBe('less')
    expect(faster.words.finalDetectedFrequency).toBe('less')
    expect(faster.realStretchExceedsEveryday).toBe(true)
    const slower = yourSpeedComparison(0.3)
    expect(slower.words.speed).toBe('less')
    expect(slower.words.realStretch).toBe('less')
    expect(slower.words.realFactor).toBe('more')
    expect(slower.realStretchExceedsEveryday).toBe(true)
  })

  it('has check 1 false at zero speed (no stretch to exceed)', () => {
    expect(yourSpeedComparison(0).realStretchExceedsEveryday).toBe(false)
  })

  it('compareWord uses only equality for "the same"', () => {
    expect(compareWord(1, 1)).toBe('the same')
    expect(compareWord(1.0001, 1)).toBe('more')
    expect(compareWord(0.9999, 1)).toBe('less')
  })
})
