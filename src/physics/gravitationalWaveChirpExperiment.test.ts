import { describe, expect, it } from 'vitest'
import { BASE_ARM_LENGTH } from './gravitationalWaveExperiment'
import { chirpRunFor, chirpStateAt } from './gravitationalWaveChirpExperiment'

describe('chirpStateAt', () => {
  it('at time = 0, frequency and amplitude equal their base values, for any valid mass', () => {
    for (const mass of [0.2, 1, 3.5, 6]) {
      const state = chirpStateAt(0, mass, 2, 0.1)
      expect(state.frequency).toBeCloseTo(2, 10)
      expect(state.amplitude).toBeCloseTo(0.1 * mass, 10)
    }
  })

  it('frequency and amplitude are strictly increasing over the run', () => {
    const mass = 1.5
    const baseFrequency = 2
    const baseAmplitude = 0.1
    const { cutoffTime } = chirpRunFor(mass, baseFrequency, baseAmplitude)
    let previous = chirpStateAt(0, mass, baseFrequency, baseAmplitude)
    for (let i = 1; i <= 20; i++) {
      const time = (i / 20) * cutoffTime
      const current = chirpStateAt(time, mass, baseFrequency, baseAmplitude)
      expect(current.frequency).toBeGreaterThan(previous.frequency)
      expect(current.amplitude).toBeGreaterThan(previous.amplitude)
      previous = current
    }
  })

  it('the two arms deviate from the rest length by exactly equal and opposite amounts', () => {
    const mass = 1
    const baseFrequency = 3
    const baseAmplitude = 0.1
    const { cutoffTime } = chirpRunFor(mass, baseFrequency, baseAmplitude)
    for (const fraction of [0, 0.1, 0.4, 0.7, 0.99]) {
      const { armXLength, armYLength } = chirpStateAt(fraction * cutoffTime, mass, baseFrequency, baseAmplitude)
      const xDeviation = armXLength - BASE_ARM_LENGTH
      const yDeviation = armYLength - BASE_ARM_LENGTH
      expect(xDeviation).toBeCloseTo(-yDeviation, 10)
    }
  })

  it('a larger mass produces a strictly shorter cutoffTime', () => {
    const baseFrequency = 2
    const baseAmplitude = 0.1
    const small = chirpRunFor(0.5, baseFrequency, baseAmplitude)
    const large = chirpRunFor(2, baseFrequency, baseAmplitude)
    expect(large.cutoffTime).toBeLessThan(small.cutoffTime)
  })

  it('a larger mass produces a strictly larger amplitude at the same fraction of its own run', () => {
    const baseFrequency = 2
    const baseAmplitude = 0.1
    const fraction = 0.5
    const smallMass = 0.5
    const largeMass = 2
    const smallRun = chirpRunFor(smallMass, baseFrequency, baseAmplitude)
    const largeRun = chirpRunFor(largeMass, baseFrequency, baseAmplitude)
    const smallState = chirpStateAt(fraction * smallRun.cutoffTime, smallMass, baseFrequency, baseAmplitude)
    const largeState = chirpStateAt(fraction * largeRun.cutoffTime, largeMass, baseFrequency, baseAmplitude)
    expect(largeState.amplitude).toBeGreaterThan(smallState.amplitude)
  })

  it('cutoffTime is strictly less than mergerTime, for any valid mass', () => {
    for (const mass of [0.2, 1, 3.5, 6]) {
      const { mergerTime, cutoffTime } = chirpRunFor(mass, 2, 0.1)
      expect(cutoffTime).toBeLessThan(mergerTime)
    }
  })

  it('rejects a non-positive mass, baseFrequency, baseAmplitude, or a negative time', () => {
    expect(() => chirpRunFor(0, 2, 0.1)).toThrow(RangeError)
    expect(() => chirpRunFor(-1, 2, 0.1)).toThrow(RangeError)
    expect(() => chirpRunFor(1, 0, 0.1)).toThrow(RangeError)
    expect(() => chirpRunFor(1, -2, 0.1)).toThrow(RangeError)
    expect(() => chirpRunFor(1, 2, 0)).toThrow(RangeError)
    expect(() => chirpRunFor(1, 2, -0.1)).toThrow(RangeError)

    expect(() => chirpStateAt(0, 0, 2, 0.1)).toThrow(RangeError)
    expect(() => chirpStateAt(0, -1, 2, 0.1)).toThrow(RangeError)
    expect(() => chirpStateAt(0, 1, 0, 0.1)).toThrow(RangeError)
    expect(() => chirpStateAt(0, 1, -2, 0.1)).toThrow(RangeError)
    expect(() => chirpStateAt(0, 1, 2, 0)).toThrow(RangeError)
    expect(() => chirpStateAt(0, 1, 2, -0.1)).toThrow(RangeError)
    expect(() => chirpStateAt(-0.01, 1, 2, 0.1)).toThrow(RangeError)
  })

  it('rejects a time greater than the run\'s own cutoffTime', () => {
    const mass = 1
    const baseFrequency = 2
    const baseAmplitude = 0.1
    const { cutoffTime } = chirpRunFor(mass, baseFrequency, baseAmplitude)
    expect(() => chirpStateAt(cutoffTime * 1.01, mass, baseFrequency, baseAmplitude)).toThrow(RangeError)
  })

  it('is deterministic across repeated calls for the same inputs', () => {
    const a = chirpStateAt(0.2, 1.3, 2, 0.1)
    const b = chirpStateAt(0.2, 1.3, 2, 0.1)
    expect(a).toEqual(b)
  })

  it('scaling baseFrequency or baseAmplitude alone scales frequency/amplitude proportionally, without changing mergerTime or cutoffTime', () => {
    const mass = 1.2
    const baseFrequency = 2
    const baseAmplitude = 0.1
    const time = 0.3

    const base = chirpRunFor(mass, baseFrequency, baseAmplitude)
    const baseState = chirpStateAt(time, mass, baseFrequency, baseAmplitude)

    const scaledFrequencyRun = chirpRunFor(mass, baseFrequency * 3, baseAmplitude)
    const scaledFrequencyState = chirpStateAt(time, mass, baseFrequency * 3, baseAmplitude)
    expect(scaledFrequencyRun.mergerTime).toBeCloseTo(base.mergerTime, 10)
    expect(scaledFrequencyRun.cutoffTime).toBeCloseTo(base.cutoffTime, 10)
    expect(scaledFrequencyState.frequency).toBeCloseTo(baseState.frequency * 3, 8)

    const scaledAmplitudeRun = chirpRunFor(mass, baseFrequency, baseAmplitude * 4)
    const scaledAmplitudeState = chirpStateAt(time, mass, baseFrequency, baseAmplitude * 4)
    expect(scaledAmplitudeRun.mergerTime).toBeCloseTo(base.mergerTime, 10)
    expect(scaledAmplitudeRun.cutoffTime).toBeCloseTo(base.cutoffTime, 10)
    expect(scaledAmplitudeState.amplitude).toBeCloseTo(baseState.amplitude * 4, 8)
  })
})
