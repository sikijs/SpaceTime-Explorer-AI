import { describe, expect, it } from 'vitest'
import {
  AFTER_GUESS_STEP,
  BASE_ARM_LENGTH,
  RUN_CYCLES,
  TYPICAL_EVENT,
  afterGuessMarkLength,
  afterGuessMatches,
  afterOutcome,
  armLengthRange,
  armLengthsAfterRun,
  LIGO_ARM_KM,
  REAL_STRAIN,
  changeInMetres,
  powersOfTenAboveReal,
  realChangeIn1e18Metres,
  directionGuessArrows,
  directionGuessMatches,
  directionOutcome,
  firstPeakState,
  firstPeakTime,
  gravitationalWaveStateAt,
  periodOf,
  runDuration,
} from './gravitationalWaveExperiment'

describe('gravitationalWaveStateAt', () => {
  it('strain is zero at time = 0, for any valid amplitude/frequency', () => {
    for (const [amplitude, frequency] of [
      [0.1, 1],
      [0.3, 0.5],
      [0.05, 3],
    ]) {
      expect(gravitationalWaveStateAt(0, amplitude, frequency).strain).toBeCloseTo(0, 10)
    }
  })

  it('strain oscillates strictly between -amplitude and +amplitude over a full period', () => {
    const amplitude = 0.2
    const frequency = 1
    const period = 1 / frequency
    let max = -Infinity
    let min = Infinity
    for (let i = 0; i <= 1000; i++) {
      const { strain } = gravitationalWaveStateAt((i / 1000) * period, amplitude, frequency)
      max = Math.max(max, strain)
      min = Math.min(min, strain)
      expect(strain).toBeGreaterThanOrEqual(-amplitude - 1e-9)
      expect(strain).toBeLessThanOrEqual(amplitude + 1e-9)
    }
    expect(max).toBeCloseTo(amplitude, 3)
    expect(min).toBeCloseTo(-amplitude, 3)
  })

  it('the two arms deviate from the rest length by exactly equal and opposite amounts', () => {
    const amplitude = 0.25
    const frequency = 0.7
    for (const time of [0, 0.1, 0.37, 0.9, 1.4142]) {
      const { armXLength, armYLength } = gravitationalWaveStateAt(time, amplitude, frequency)
      const xDeviation = armXLength - BASE_ARM_LENGTH
      const yDeviation = armYLength - BASE_ARM_LENGTH
      expect(xDeviation).toBeCloseTo(-yDeviation, 10)
    }
  })

  it('doubling frequency exactly halves the period', () => {
    const amplitude = 0.2
    const frequency = 1
    const period = 1 / frequency
    const doubledPeriod = 1 / (frequency * 2)
    expect(doubledPeriod).toBeCloseTo(period / 2, 10)
    // Confirm the doubled-frequency wave returns to strain = 0 (rising) after half the period.
    const state = gravitationalWaveStateAt(doubledPeriod, amplitude, frequency * 2)
    expect(state.strain).toBeCloseTo(0, 8)
  })

  it('scaling amplitude scales the peak deviation of both arm lengths proportionally', () => {
    const frequency = 1
    const quarterPeriodTime = 1 / (4 * frequency) // strain is at its peak here
    const small = gravitationalWaveStateAt(quarterPeriodTime, 0.1, frequency)
    const large = gravitationalWaveStateAt(quarterPeriodTime, 0.2, frequency)
    const smallDeviation = small.armXLength - BASE_ARM_LENGTH
    const largeDeviation = large.armXLength - BASE_ARM_LENGTH
    expect(largeDeviation).toBeCloseTo(smallDeviation * 2, 10)
  })

  it('at any time, arm lengths equal BASE_ARM_LENGTH when strain is zero', () => {
    const amplitude = 0.3
    const frequency = 1
    const period = 1 / frequency
    const state = gravitationalWaveStateAt(period, amplitude, frequency) // full period: strain back to 0
    expect(state.strain).toBeCloseTo(0, 8)
    expect(state.armXLength).toBeCloseTo(BASE_ARM_LENGTH, 8)
    expect(state.armYLength).toBeCloseTo(BASE_ARM_LENGTH, 8)
  })

  it('strain returns to its time = 0 value after one full period', () => {
    const amplitude = 0.15
    const frequency = 2
    const period = 1 / frequency
    const start = gravitationalWaveStateAt(0, amplitude, frequency)
    const afterOnePeriod = gravitationalWaveStateAt(period, amplitude, frequency)
    expect(afterOnePeriod.strain).toBeCloseTo(start.strain, 8)
  })

  it('is deterministic across repeated calls for the same inputs', () => {
    const a = gravitationalWaveStateAt(0.42, 0.2, 1.5)
    const b = gravitationalWaveStateAt(0.42, 0.2, 1.5)
    expect(a).toEqual(b)
  })

  it('rejects a non-positive amplitude or frequency', () => {
    expect(() => gravitationalWaveStateAt(0, 0, 1)).toThrow(RangeError)
    expect(() => gravitationalWaveStateAt(0, -0.1, 1)).toThrow(RangeError)
    expect(() => gravitationalWaveStateAt(0, 0.2, 0)).toThrow(RangeError)
    expect(() => gravitationalWaveStateAt(0, 0.2, -1)).toThrow(RangeError)
  })

  it('rejects a negative time', () => {
    expect(() => gravitationalWaveStateAt(-0.01, 0.2, 1)).toThrow(RangeError)
  })
})

describe('audit additions: numbers for the marks, the table and Part 2', () => {
  it('armLengthRange gives the exact shortest and longest lengths for the typical event', () => {
    const { armX, armY } = armLengthRange(TYPICAL_EVENT.amplitude)
    for (const arm of [armX, armY]) {
      expect(arm.shortest).toBeCloseTo(0.9, 12)
      expect(arm.longest).toBeCloseTo(1.1, 12)
      expect(arm.stretchedBy).toBeCloseTo(0.1, 12)
      expect(arm.squeezedBy).toBeCloseTo(0.1, 12)
    }
  })

  it('armLengthRange matches the extremes of the model over a whole run', () => {
    for (const [amplitude, frequency] of [[0.08, 0.5], [0.2, 1], [0.35, 1.6]]) {
      let min = Infinity
      let max = -Infinity
      const total = runDuration(frequency)
      for (let i = 0; i <= 20000; i++) {
        const { armXLength } = gravitationalWaveStateAt((i / 20000) * total, amplitude, frequency)
        min = Math.min(min, armXLength)
        max = Math.max(max, armXLength)
      }
      const { armX } = armLengthRange(amplitude)
      expect(armX.shortest).toBeCloseTo(min, 4)
      expect(armX.longest).toBeCloseTo(max, 4)
    }
  })

  it('armLengthRange does not depend on frequency and scales with amplitude', () => {
    expect(armLengthRange(0.4).armX.stretchedBy).toBeCloseTo(2 * armLengthRange(0.2).armX.stretchedBy, 12)
  })

  it('armLengthRange gives the Part 2 pink-line numbers for the strong preset (0.35)', () => {
    const { armX } = armLengthRange(0.35)
    expect(armX.longest).toBeCloseTo(1.175, 12)
    expect(armX.shortest).toBeCloseTo(0.825, 12)
  })

  it('periodOf and runDuration give the Part 2 bracket and run length', () => {
    expect(periodOf(1.6)).toBeCloseTo(0.625, 12)
    expect(runDuration(1.6)).toBeCloseTo(3.125, 12)
    expect(runDuration(1)).toBeCloseTo(RUN_CYCLES, 12)
    expect(runDuration(1, 2)).toBeCloseTo(2, 12)
  })

  it('doubling the frequency halves the period and the run duration', () => {
    expect(periodOf(2)).toBeCloseTo(periodOf(1) / 2, 12)
    expect(runDuration(2)).toBeCloseTo(runDuration(1) / 2, 12)
  })

  it('firstPeakState is the quarter-cycle point with the largest strain', () => {
    expect(firstPeakTime(1)).toBeCloseTo(0.25, 12)
    const peak = firstPeakState(0.2, 1)
    expect(peak.strain).toBeCloseTo(0.2, 12)
    expect(peak.armXLength).toBeCloseTo(1.1, 12)
    expect(peak.armYLength).toBeCloseTo(0.9, 12)
  })

  it('armLengthsAfterRun is exactly the rest length for every preset', () => {
    for (const [amplitude, frequency] of [[0.08, 0.5], [0.2, 1], [0.35, 1.6]]) {
      expect(armLengthsAfterRun(amplitude, frequency)).toEqual({
        armXLength: BASE_ARM_LENGTH,
        armYLength: BASE_ARM_LENGTH,
      })
    }
  })

  it('armLengthsAfterRun is not at rest after half a cycle', () => {
    const half = armLengthsAfterRun(0.2, 1, 0.25)
    expect(half.armXLength).toBeCloseTo(1.1, 9)
    expect(half.armYLength).toBeCloseTo(0.9, 9)
  })

  it('the real outcomes are worked out from the model: opposite, and back to original', () => {
    for (const [amplitude, frequency] of [[0.08, 0.5], [0.2, 1], [0.35, 1.6], [0.4, 2], [0.05, 0.25]]) {
      expect(directionOutcome(amplitude, frequency)).toBe('opposite-ways')
      expect(afterOutcome(amplitude, frequency)).toBe('back-to-original')
    }
  })

  it('afterOutcome reports longer or shorter if a run is stopped part-way', () => {
    expect(afterOutcome(0.2, 1, 0.25)).not.toBe('back-to-original')
  })

  it('guess matching depends only on the choice and the real outcome', () => {
    const { amplitude, frequency } = TYPICAL_EVENT
    expect(directionGuessMatches('opposite-ways', amplitude, frequency)).toBe(true)
    expect(directionGuessMatches('same-way', amplitude, frequency)).toBe(false)
    expect(afterGuessMatches('back-to-original', amplitude, frequency)).toBe(true)
    expect(afterGuessMatches('longer', amplitude, frequency)).toBe(false)
    expect(afterGuessMatches('shorter', amplitude, frequency)).toBe(false)
  })

  it('a guess never changes the real numbers', () => {
    const before = armLengthRange(0.2)
    directionGuessArrows('same-way')
    afterGuessMarkLength('longer')
    directionGuessMatches('same-way', 0.2, 1)
    expect(armLengthRange(0.2)).toEqual(before)
  })

  it('directionGuessArrows draws visibly different marks for the two answers', () => {
    expect(directionGuessArrows('opposite-ways')).toEqual({ armX: 'up', armY: 'down' })
    expect(directionGuessArrows('same-way')).toEqual({ armX: 'up', armY: 'up' })
  })

  it('afterGuessMarkLength puts the three answers at three different heights', () => {
    const longer = afterGuessMarkLength('longer')
    const shorter = afterGuessMarkLength('shorter')
    const back = afterGuessMarkLength('back-to-original')
    expect(back).toBe(BASE_ARM_LENGTH)
    expect(longer).toBeCloseTo(BASE_ARM_LENGTH + AFTER_GUESS_STEP, 12)
    expect(shorter).toBeCloseTo(BASE_ARM_LENGTH - AFTER_GUESS_STEP, 12)
    expect(new Set([longer, shorter, back]).size).toBe(3)
  })

  it('changeInMetres gives the table note example: 0.100 of a 4 km arm is 400 m', () => {
    expect(changeInMetres(0.1, 4)).toBeCloseTo(400, 9)
  })

  it('new functions reject invalid input', () => {
    expect(() => armLengthRange(0)).toThrow(RangeError)
    expect(() => armLengthRange(-0.1)).toThrow(RangeError)
    expect(() => periodOf(0)).toThrow(RangeError)
    expect(() => runDuration(1, 0)).toThrow(RangeError)
  })

  it('the quoted real event: 4 km arms, strain 1e-21, so about 4e-18 metres', () => {
    expect(LIGO_ARM_KM).toBe(4)
    expect(REAL_STRAIN).toBe(1e-21)
    expect(realChangeIn1e18Metres()).toBeCloseTo(4, 9)
  })

  it('the typical event is more than 10^20 times stronger than the real one', () => {
    expect(powersOfTenAboveReal(0.2)).toBe(20)
    expect(powersOfTenAboveReal(0.35)).toBe(20)
    expect(() => powersOfTenAboveReal(0)).toThrow(RangeError)
  })
})
