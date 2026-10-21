import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  ALPHA_2023,
  combinedUncertainty,
  compatibility,
  fallDistance,
  fallsUpAnswer,
  G_EARTH,
  readingAnswer,
  runAntimatterGravity,
  sigmaNeeded,
  sigmasFrom,
  timeToFall,
  TRAP_LENGTH_M,
  upOrDown,
} from './antimatterGravity'

// Tests for Frontier and Beyond Experiment 8 (docs/experiments/frontier-and-beyond/08-does-antimatter-fall-down.md, "Required Physics Tests").
// The expected values are worked out by hand with g = 9.81 m/s^2, so a wrong formula in the module cannot make a test pass. For example, in one
// second a ratio of 1 falls 0.5 x 1 x 9.81 x 1^2 = 4.905 m, and a ratio of 0.75 falls 0.5 x 0.75 x 9.81 = 3.67875 m. The time to fall 0.256 m at
// ratio 1 is sqrt(2 x 0.256 / 9.81) = sqrt(0.052192) = 0.22845 s, and at 0.75 it is sqrt(0.512 / 7.3575) = sqrt(0.069589) = 0.26380 s. The combined
// uncertainty is sqrt(0.13^2 + 0.16^2) = sqrt(0.0169 + 0.0256) = sqrt(0.0425) = 0.20616, and (1 - 0.75) / 0.20616 = 1.2126, 0.75 / 0.20616 = 3.638,
// 1.75 / 0.20616 = 8.488.

const SIGMA = 0.2062 // the combined uncertainty, as the specification writes it

describe('the distance fallen (test 1)', () => {
  it('is 4.905 m for ratio 1, 3.679 m for 0.75, 0 for ratio 0 and -4.905 m for ratio -1, in one second', () => {
    expect(fallDistance(1, 1)).toBeCloseTo(4.905, 3)
    expect(fallDistance(0.75, 1)).toBeCloseTo(3.67875, 4)
    expect(fallDistance(0, 1)).toBe(0)
    expect(fallDistance(-1, 1)).toBeCloseTo(-4.905, 3)
  })
  it('grows as the square of the time and in proportion to the ratio', () => {
    expect(fallDistance(1, 2)).toBeCloseTo(4 * fallDistance(1, 1), 9)
    expect(fallDistance(0.5, 3)).toBeCloseTo(0.5 * fallDistance(1, 3), 9)
    expect(fallDistance(1, 0)).toBe(0)
  })
})

describe('the time to fall a height (test 2)', () => {
  it('is 0.2285 s for ratio 1 and 0.2638 s for 0.75, over the trap length', () => {
    expect(timeToFall(1, TRAP_LENGTH_M)).toBeCloseTo(0.22845, 4)
    expect(timeToFall(0.75, TRAP_LENGTH_M)).toBeCloseTo(0.2638, 4)
  })
  it('is null when the ratio is zero or negative (it does not fall)', () => {
    expect(timeToFall(0, 0.256)).toBeNull()
    expect(timeToFall(-1, 0.256)).toBeNull()
  })
  it('falls as 1 over the square root of the ratio, and fits the distance formula', () => {
    expect(timeToFall(0.25, 1)! / timeToFall(1, 1)!).toBeCloseTo(2, 9)
    const t = timeToFall(0.6, 0.5)!
    expect(fallDistance(0.6, t)).toBeCloseTo(0.5, 9)
  })
})

describe('the combined uncertainty (test 3)', () => {
  it('is 0.2062 for 0.13 and 0.16', () => {
    expect(combinedUncertainty(0.13, 0.16)).toBeCloseTo(0.2062, 4)
  })
  it('is at least the larger of the two, and equals one when the other is zero', () => {
    expect(combinedUncertainty(0.13, 0.16)).toBeGreaterThanOrEqual(0.16)
    expect(combinedUncertainty(0.3, 0)).toBeCloseTo(0.3, 12)
    expect(combinedUncertainty(0, 0.3)).toBeCloseTo(0.3, 12)
  })
})

describe('the sigma from a possibility (tests 4 and 5)', () => {
  it('is 1.21 from 1, 3.64 from 0 and 8.49 from -1 for 0.75 with 0.2062', () => {
    expect(sigmasFrom(0.75, SIGMA, 1)).toBeCloseTo(1.2124, 2)
    expect(sigmasFrom(0.75, SIGMA, 0)).toBeCloseTo(3.6372, 2)
    expect(sigmasFrom(0.75, SIGMA, -1)).toBeCloseTo(8.4869, 2)
  })
  it('is symmetric, and doubles when the uncertainty halves', () => {
    expect(sigmasFrom(0.75, SIGMA, 1)).toBeCloseTo(sigmasFrom(1, SIGMA, 0.75), 12)
    expect(sigmasFrom(0.75, SIGMA / 2, 1)).toBeCloseTo(2 * sigmasFrom(0.75, SIGMA, 1), 9)
  })
  it('is 2.5 from 1 for 0.75 with an uncertainty of 0.10', () => {
    expect(sigmasFrom(0.75, 0.1, 1)).toBeCloseTo(2.5, 9)
  })
})

describe('the compatibility edges (test 6)', () => {
  it('is compatible below 2, borderline from 2 to below 3, disfavoured from 3 to below 5 and ruled out from 5', () => {
    expect(compatibility(0)).toBe('compatible')
    expect(compatibility(1.99)).toBe('compatible')
    expect(compatibility(2)).toBe('borderline')
    expect(compatibility(2.99)).toBe('borderline')
    expect(compatibility(3)).toBe('disfavoured')
    expect(compatibility(4.99)).toBe('disfavoured')
    expect(compatibility(5)).toBe('ruledOut')
    expect(compatibility(100)).toBe('ruledOut')
  })
  it('gives compatible, disfavoured and ruled out for 1, 0 and -1 with the published value', () => {
    expect(compatibility(sigmasFrom(0.75, SIGMA, 1))).toBe('compatible')
    expect(compatibility(sigmasFrom(0.75, SIGMA, 0))).toBe('disfavoured')
    expect(compatibility(sigmasFrom(0.75, SIGMA, -1))).toBe('ruledOut')
  })
})

describe('the precision a test needs (test 7)', () => {
  it('is 0.00333 for a difference of 0.01 at 3 sigma, and 0.04 for 0.2 at 5 sigma', () => {
    expect(sigmaNeeded(0.01, 3)).toBeCloseTo(0.003333, 5)
    expect(sigmaNeeded(0.2, 5)).toBeCloseTo(0.04, 9)
  })
  it('is proportional to the difference and inversely proportional to the sigma', () => {
    expect(sigmaNeeded(0.2, 3)).toBeCloseTo(2 * sigmaNeeded(0.1, 3), 12)
    expect(sigmaNeeded(0.1, 6)).toBeCloseTo(sigmaNeeded(0.1, 3) / 2, 12)
  })
})

describe('up or down (test 8)', () => {
  it('is down for 1, stays for 0 and up for a negative ratio', () => {
    expect(upOrDown(1)).toBe('down')
    expect(upOrDown(0.001)).toBe('down')
    expect(upOrDown(0)).toBe('stays')
    expect(upOrDown(-0.2)).toBe('up')
  })
})

describe('the published data (test 9)', () => {
  it('matches the specification, so that a typing error is caught', () => {
    expect(ALPHA_2023.ratio).toBe(0.75)
    expect(ALPHA_2023.statSys).toBe(0.13)
    expect(ALPHA_2023.simulation).toBe(0.16)
    expect(G_EARTH).toBe(9.81)
    expect(TRAP_LENGTH_M).toBe(0.256)
    expect(ALPHA_2023.source).toContain('Nature 621')
  })
})

describe('the answers to the predictions', () => {
  it('Prediction 1: falling up is ruled out; Prediction 2: the measurement cannot tell a slower fall', () => {
    expect(fallsUpAnswer()).toBe('ruledOut')
    expect(readingAnswer()).toBe('cannotTell')
  })
})

describe('the learner\'s own numbers', () => {
  it('collects the fall, the sigma and the precision for a ratio, an error bar and a difference', () => {
    const r = runAntimatterGravity(0.75, SIGMA, 0.01)
    expect(r.distanceInOneSecond).toBeCloseTo(3.67875, 4)
    expect(r.timeToFallTrap).toBeCloseTo(0.2638, 4)
    expect(r.direction).toBe('down')
    expect(r.sigmasFromMatter).toBeCloseTo(1.2124, 2)
    expect(r.verdictMatter).toBe('compatible')
    expect(r.verdictNoGravity).toBe('disfavoured')
    expect(r.verdictFallingUp).toBe('ruledOut')
    expect(r.sigmaNeededAt3).toBeCloseTo(0.003333, 5)
    expect(r.sigmaNeededAt5).toBeCloseTo(0.002, 9)
  })
  it('reads a smaller error bar as a bigger number of sigma, and a rising ratio as null time', () => {
    const r = runAntimatterGravity(-1, 0.1, 0.2)
    expect(r.sigmasFromMatter).toBeCloseTo(2.5, 9)
    expect(r.verdictMatter).toBe('borderline')
    expect(r.timeToFallTrap).toBeNull()
    expect(r.direction).toBe('up')
    expect(r.distanceInOneSecond).toBeCloseTo(-4.905, 3)
  })
})

describe('out-of-range input (test 10)', () => {
  it('throws a RangeError', () => {
    expect(() => fallDistance(1, -1)).toThrow(RangeError)
    expect(() => fallDistance(Number.NaN, 1)).toThrow(RangeError)
    expect(() => timeToFall(1, 0)).toThrow(RangeError)
    expect(() => timeToFall(1, -2)).toThrow(RangeError)
    expect(() => combinedUncertainty(-0.1, 0.2)).toThrow(RangeError)
    expect(() => sigmasFrom(0.75, 0, 1)).toThrow(RangeError)
    expect(() => sigmasFrom(0.75, -0.1, 1)).toThrow(RangeError)
    expect(() => compatibility(-1)).toThrow(RangeError)
    expect(() => sigmaNeeded(0, 3)).toThrow(RangeError)
    expect(() => sigmaNeeded(0.1, 0)).toThrow(RangeError)
    expect(() => upOrDown(Number.POSITIVE_INFINITY)).toThrow(RangeError)
    expect(() => runAntimatterGravity(1, 0, 0.1)).toThrow(RangeError)
  })
})

describe('the module stands alone (test 11)', () => {
  it('imports nothing from the other experiments\' physics modules', () => {
    const source = readFileSync(new URL('./antimatterGravity.ts', import.meta.url), 'utf8')
    expect(source).not.toMatch(/^import /m)
  })
})
