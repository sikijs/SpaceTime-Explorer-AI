import { describe, expect, it } from 'vitest'
import { classicalDopplerFactorFor, dopplerFactorFor } from './gravitationalWaveRedshiftExperiment'

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
