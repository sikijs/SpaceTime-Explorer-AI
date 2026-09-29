import { describe, expect, it } from 'vitest'
import { BASE_ARM_LENGTH, gravitationalWaveStateAt } from './gravitationalWaveExperiment'

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
