import { describe, it, expect } from 'vitest'
import { runGravitationalTimeDilationExperiment, tickCountAt } from './gravitationalTimeDilationExperiment'

describe('Gravitational Time Dilation Experiment Physics', () => {
  it('frequencyRatio equals 1 - strength', () => {
    expect(runGravitationalTimeDilationExperiment(0.1).frequencyRatio).toBeCloseTo(0.9, 12)
    expect(runGravitationalTimeDilationExperiment(0.3).frequencyRatio).toBeCloseTo(0.7, 12)
    expect(runGravitationalTimeDilationExperiment(0.6).frequencyRatio).toBeCloseTo(0.4, 12)
  })

  it('is deterministic across repeated runs', () => {
    expect(runGravitationalTimeDilationExperiment(0.3)).toEqual(runGravitationalTimeDilationExperiment(0.3))
  })

  it('rejects strength outside (0, 1)', () => {
    expect(() => runGravitationalTimeDilationExperiment(0)).toThrow(RangeError)
    expect(() => runGravitationalTimeDilationExperiment(1)).toThrow(RangeError)
    expect(() => runGravitationalTimeDilationExperiment(-0.1)).toThrow(RangeError)
    expect(() => runGravitationalTimeDilationExperiment(1.5)).toThrow(RangeError)
    expect(() => runGravitationalTimeDilationExperiment(NaN)).toThrow(RangeError)
  })
})

describe('Tick Count Over Time', () => {
  const result = runGravitationalTimeDilationExperiment(0.3)

  it('floor clock tick count equals elapsed time exactly', () => {
    ;[0, 1, 2.5, 10].forEach((t) => {
      expect(tickCountAt(result, t, 'floor')).toBe(t)
    })
  })

  it('ceiling clock ticks faster than the floor clock for every t > 0', () => {
    ;[0.1, 1, 5, 100].forEach((t) => {
      expect(tickCountAt(result, t, 'ceiling')).toBeGreaterThan(tickCountAt(result, t, 'floor'))
    })
  })

  it('ceiling tick count matches t / frequencyRatio', () => {
    ;[0.1, 1, 5].forEach((t) => {
      expect(tickCountAt(result, t, 'ceiling')).toBeCloseTo(t / result.frequencyRatio, 12)
    })
  })

  it('both clocks read zero at t = 0', () => {
    expect(tickCountAt(result, 0, 'floor')).toBe(0)
    expect(tickCountAt(result, 0, 'ceiling')).toBe(0)
  })

  it('a greater strength produces a bigger gap between the two clocks at the same elapsed time', () => {
    const weak = runGravitationalTimeDilationExperiment(0.1)
    const strong = runGravitationalTimeDilationExperiment(0.6)
    const gapAt = (r: typeof weak, t: number) => tickCountAt(r, t, 'ceiling') - tickCountAt(r, t, 'floor')
    expect(gapAt(strong, 10)).toBeGreaterThan(gapAt(weak, 10))
  })

  it('rejects negative elapsed time', () => {
    expect(() => tickCountAt(result, -0.1, 'floor')).toThrow(RangeError)
    expect(() => tickCountAt(result, NaN, 'ceiling')).toThrow(RangeError)
  })

  it('is deterministic', () => {
    expect(tickCountAt(result, 3, 'ceiling')).toEqual(tickCountAt(result, 3, 'ceiling'))
  })
})
