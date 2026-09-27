import { describe, it, expect } from 'vitest'
import { strengthsForMassAndDistance } from './spacetimeCurvatureSourceExperiment'

describe('What Curves Spacetime? Experiment Physics', () => {
  it('lands exactly on each experiment\'s own middle preset at medium mass, medium distance', () => {
    const { timeDilationStrength, convergenceStrength } = strengthsForMassAndDistance(2, 2)
    expect(timeDilationStrength).toBeCloseTo(0.3, 12)
    expect(convergenceStrength).toBeCloseTo(0.3, 12)
  })

  it('both strengths strictly increase as mass increases, distance held fixed', () => {
    const small = strengthsForMassAndDistance(1, 2)
    const large = strengthsForMassAndDistance(4, 2)
    expect(large.timeDilationStrength).toBeGreaterThan(small.timeDilationStrength)
    expect(large.convergenceStrength).toBeGreaterThan(small.convergenceStrength)
  })

  it('both strengths strictly increase as distance decreases, mass held fixed', () => {
    const far = strengthsForMassAndDistance(2, 4)
    const close = strengthsForMassAndDistance(2, 1)
    expect(close.timeDilationStrength).toBeGreaterThan(far.timeDilationStrength)
    expect(close.convergenceStrength).toBeGreaterThan(far.convergenceStrength)
  })

  it('convergence strength falls off with distance faster than time dilation strength', () => {
    const near = strengthsForMassAndDistance(2, 1)
    const far = strengthsForMassAndDistance(2, 4)

    const dilationRatio = near.timeDilationStrength / far.timeDilationStrength
    const convergenceRatio = near.convergenceStrength / far.convergenceStrength

    expect(convergenceRatio).toBeGreaterThan(dilationRatio)
  })

  it('clamps time dilation strength within Experiment 2\'s own valid custom range (0.05-0.9)', () => {
    const veryStrong = strengthsForMassAndDistance(100, 1)
    const veryWeak = strengthsForMassAndDistance(1, 100)
    expect(veryStrong.timeDilationStrength).toBe(0.9)
    expect(veryWeak.timeDilationStrength).toBe(0.05)
  })

  it('clamps convergence strength within Experiment 3\'s own valid custom range (0.02-0.9)', () => {
    const veryStrong = strengthsForMassAndDistance(100, 1)
    const veryWeak = strengthsForMassAndDistance(1, 100)
    expect(veryStrong.convergenceStrength).toBe(0.9)
    expect(veryWeak.convergenceStrength).toBe(0.02)
  })

  it('rejects non-positive relative mass', () => {
    expect(() => strengthsForMassAndDistance(0, 2)).toThrow(RangeError)
    expect(() => strengthsForMassAndDistance(-1, 2)).toThrow(RangeError)
    expect(() => strengthsForMassAndDistance(NaN, 2)).toThrow(RangeError)
  })

  it('rejects non-positive relative distance', () => {
    expect(() => strengthsForMassAndDistance(2, 0)).toThrow(RangeError)
    expect(() => strengthsForMassAndDistance(2, -1)).toThrow(RangeError)
    expect(() => strengthsForMassAndDistance(2, NaN)).toThrow(RangeError)
  })

  it('is deterministic across repeated calls', () => {
    expect(strengthsForMassAndDistance(2, 2)).toEqual(strengthsForMassAndDistance(2, 2))
  })
})
