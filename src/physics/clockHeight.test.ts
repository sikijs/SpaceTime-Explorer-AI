import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  exactRateDifference,
  G_EARTH,
  gapAnswer,
  heightAnswer,
  JILA_2022,
  lengthScale,
  rateDifference,
  runClockHeight,
  SECONDS_PER_YEAR,
  sigmasFromExpected,
  signalToPrecision,
  smallestHeight,
  SPEED_OF_LIGHT,
  timeGap,
  timeScale,
  WISCONSIN_2023,
  yearsToDrift,
} from './clockHeight'

// Tests for Cosmic Horizons Experiment 9 (docs/experiments/frontier-and-beyond/09-can-a-clock-tell-its-height.md, "Required Physics Tests").
// The expected values are worked out by hand, so a wrong formula in the module cannot make a test pass. With g = 9.81 m/s^2 and c = 299,792,458 m/s,
// c^2 = 8.98755 x 10^16, so g / c^2 = 9.81 / 8.98755e16 = 1.09151e-16 per metre. Over a year (31,557,600 s) that is 1.09151e-16 x 31,557,600 =
// 3.4445e-9 s for 1 m. The smallest height for a precision p is p / 1.09151e-16: 1e-16 -> 0.9162 m, 1e-18 -> 0.009162 m, 7.6e-21 -> 6.963e-5 m. JILA's
// effect across 1 mm is 1.09151e-19, which is 1.09151e-19 / 7.6e-21 = 14.36 times its precision. Wisconsin's combined uncertainty is
// sqrt(0.7^2 + 2.5^2) = sqrt(0.49 + 6.25) = sqrt(6.74) = 2.5962, and (12.4 - 10.9) / 2.5962 = 0.5778. The exact formula's reference values below come from
// a separate calculation in Python (GM = 3.986004418e14, R = 6.371e6): 1.09265e-16 at 1 m, 4.69523e-13 at 4,300 m and 1.07576e-11 at 100 km.

const rel = (value: number, reference: number) => Math.abs(value - reference) / Math.abs(reference)

describe('the rate difference (test 1)', () => {
  it('is 1.0915e-16 for 1 m and 1.0915e-19 for 1 mm, and 0 for no height', () => {
    expect(rel(rateDifference(1), 1.0915097e-16)).toBeLessThan(1e-6)
    expect(rel(rateDifference(0.001), 1.0915097e-19)).toBeLessThan(1e-6)
    expect(rateDifference(0)).toBe(0)
  })
  it('is proportional to the height', () => {
    expect(rel(rateDifference(250), 250 * rateDifference(1))).toBeLessThan(1e-12)
    expect(rel(rateDifference(4300), 4300 * rateDifference(1))).toBeLessThan(1e-12)
  })
})

describe('the gap after a time (test 2)', () => {
  it('is 3.4445e-9 s for 1 m over a year and 3.4445e-12 s for 1 mm', () => {
    expect(rel(timeGap(1, SECONDS_PER_YEAR), 3.4445427e-9)).toBeLessThan(1e-6)
    expect(rel(timeGap(0.001, SECONDS_PER_YEAR), 3.4445427e-12)).toBeLessThan(1e-6)
  })
  it('is proportional to both the height and the time', () => {
    expect(rel(timeGap(10, 100), 10 * 100 * rateDifference(1))).toBeLessThan(1e-12)
    expect(rel(timeGap(2, 3), 6 * rateDifference(1))).toBeLessThan(1e-12)
    expect(timeGap(5, 0)).toBe(0)
  })
})

describe('the smallest height (test 3)', () => {
  it('is 0.9162 m for 1e-16, 0.009162 m for 1e-18 and 6.963e-5 m for 7.6e-21', () => {
    expect(rel(smallestHeight(1e-16), 0.9161623)).toBeLessThan(1e-5)
    expect(rel(smallestHeight(1e-18), 0.009161623)).toBeLessThan(1e-5)
    expect(rel(smallestHeight(7.6e-21), 6.962833e-5)).toBeLessThan(1e-5)
  })
  it('is the inverse of the rate difference (a round trip)', () => {
    for (const p of [1e-14, 3.3e-17, 1e-19]) expect(rel(rateDifference(smallestHeight(p)), p)).toBeLessThan(1e-12)
  })
})

describe('the signal against the precision (test 4)', () => {
  it('is 14.36 for 1 mm and JILA\'s 7.6e-21', () => {
    expect(rel(signalToPrecision(0.001, 7.6e-21), 14.362)).toBeLessThan(1e-4)
  })
  it('doubles when the precision halves', () => {
    expect(rel(signalToPrecision(1, 5e-17), 2 * signalToPrecision(1, 1e-16))).toBeLessThan(1e-12)
  })
})

describe('the sigma from the expected value (test 5)', () => {
  it('is 0.578 for the Wisconsin result', () => {
    expect(rel(sigmasFromExpected(12.4, 0.7, 2.5, 10.9), 0.57778)).toBeLessThan(1e-4)
  })
  it('is symmetric in the measured and expected values, and falls when the uncertainty grows', () => {
    expect(sigmasFromExpected(10.9, 0.7, 2.5, 12.4)).toBeCloseTo(sigmasFromExpected(12.4, 0.7, 2.5, 10.9), 12)
    expect(sigmasFromExpected(12.4, 0.7, 5, 10.9)).toBeLessThan(sigmasFromExpected(12.4, 0.7, 2.5, 10.9))
    expect(sigmasFromExpected(5, 1, 0, 5)).toBe(0)
  })
})

describe('the constant-g formula against the exact one (test 6)', () => {
  it('the exact formula matches the separate calculation', () => {
    expect(rel(exactRateDifference(1), 1.09265e-16)).toBeLessThan(1e-4)
    expect(rel(exactRateDifference(4300), 4.69523e-13)).toBeLessThan(1e-4)
    expect(rel(exactRateDifference(1e5), 1.07576e-11)).toBeLessThan(1e-4)
  })
  it('agrees with the constant-g formula within 0.2 percent up to 4,300 m, and differs by more at 100 km', () => {
    expect(Math.abs(rateDifference(1) / exactRateDifference(1) - 1)).toBeLessThan(0.002)
    expect(Math.abs(rateDifference(4300) / exactRateDifference(4300) - 1)).toBeLessThan(0.002)
    expect(Math.abs(rateDifference(1e5) / exactRateDifference(1e5) - 1)).toBeGreaterThan(0.01)
  })
})

describe('the predictions\' answers (test 7)', () => {
  it('Prediction 1 is nanoseconds and Prediction 2 is a millimetre', () => {
    expect(timeScale(timeGap(1, SECONDS_PER_YEAR))).toBe('nanosecond')
    expect(lengthScale(smallestHeight(1e-19))).toBe('millimetre')
    expect(gapAnswer()).toBe('nanosecond')
    expect(heightAnswer()).toBe('millimetre')
  })
  it('the scales pick the nearest size on a logarithmic scale', () => {
    expect(timeScale(2e-6)).toBe('microsecond')
    expect(timeScale(2e-11)).toBe('picosecond')
    expect(timeScale(3e-9)).toBe('nanosecond')
    expect(lengthScale(0.5)).toBe('metre')
    expect(lengthScale(0.15)).toBe('metre') // closer, by ratio, to 1 m than to 1 cm
    expect(lengthScale(0.03)).toBe('centimetre')
    expect(timeScale(1e-7)).toBe('microsecond') // closer, by ratio, to a microsecond than to a nanosecond
    expect(lengthScale(0.02)).toBe('centimetre')
    expect(lengthScale(0.0004)).toBe('millimetre')
  })
})

describe('the years for a clock to drift by a second (added in Step 2)', () => {
  // 1 / (1e-19 x 31,557,600) = 1e19 / 3.15576e7 = 3.1688e11 years; for 7.6e-21 it is 3.1688e11 / 0.076 = 4.1695e12 years (worked out by hand).
  it('is 3.1688e11 years for one part in 1e19 and 4.1695e12 for 7.6e-21', () => {
    expect(rel(yearsToDrift(1e-19), 3.16881e11)).toBeLessThan(1e-4)
    expect(rel(yearsToDrift(7.6e-21), 4.16949e12)).toBeLessThan(1e-4)
  })
  it('is inversely proportional to the fraction, and throws for a non-positive one', () => {
    expect(rel(yearsToDrift(1e-18), yearsToDrift(1e-19) / 10)).toBeLessThan(1e-12)
    expect(() => yearsToDrift(0)).toThrow(RangeError)
    expect(() => yearsToDrift(-1e-19)).toThrow(RangeError)
  })
})

describe('the published data (test 8)', () => {
  it('equal the module\'s constants', () => {
    expect(JILA_2022.precision).toBe(7.6e-21)
    expect(JILA_2022.millimetres).toBe(1)
    expect(WISCONSIN_2023.measured).toBe(12.4)
    expect(WISCONSIN_2023.statistical).toBe(0.7)
    expect(WISCONSIN_2023.systematic).toBe(2.5)
    expect(WISCONSIN_2023.expected).toBe(10.9)
    expect(G_EARTH).toBe(9.81)
    expect(SPEED_OF_LIGHT).toBe(299_792_458)
    expect(SECONDS_PER_YEAR).toBe(31_557_600)
    expect(JILA_2022.source).toContain('Nature 602')
    expect(WISCONSIN_2023.source).toContain('Nature Communications')
  })
  it('the expected Wisconsin value agrees with the module\'s rate difference per centimetre', () => {
    // 1.0915e-18 per cm is 10.915 in units of 1e-19 per cm, which the paper quotes as 10.9.
    expect(Math.abs(rateDifference(0.01) / 1e-19 - WISCONSIN_2023.expected)).toBeLessThan(0.05)
  })
})

describe('the learner\'s own numbers', () => {
  it('collects the numbers for a height, a time and a precision', () => {
    const r = runClockHeight(1, SECONDS_PER_YEAR, 1e-18)
    expect(rel(r.rateDifference, rateDifference(1))).toBeLessThan(1e-12)
    expect(rel(r.timeGap, timeGap(1, SECONDS_PER_YEAR))).toBeLessThan(1e-12)
    expect(rel(r.smallestHeight, smallestHeight(1e-18))).toBeLessThan(1e-12)
    expect(r.canResolve).toBe(true) // 1 m is far larger than 9.2 mm
  })
  it('says that a clock cannot resolve a height below its smallest height', () => {
    expect(runClockHeight(0.001, 1, 1e-18).canResolve).toBe(false) // 1 mm is below 9.2 mm
    expect(runClockHeight(0.001, 1, 1e-20).canResolve).toBe(true)
  })
})

describe('out-of-range input (test 9)', () => {
  it('throws a RangeError', () => {
    expect(() => rateDifference(-1)).toThrow(RangeError)
    expect(() => rateDifference(Number.NaN)).toThrow(RangeError)
    expect(() => timeGap(1, -1)).toThrow(RangeError)
    expect(() => smallestHeight(0)).toThrow(RangeError)
    expect(() => smallestHeight(-1e-18)).toThrow(RangeError)
    expect(() => signalToPrecision(1, 0)).toThrow(RangeError)
    expect(() => sigmasFromExpected(1, 0, 0, 2)).toThrow(RangeError)
    expect(() => sigmasFromExpected(1, -1, 1, 2)).toThrow(RangeError)
    expect(() => exactRateDifference(-5)).toThrow(RangeError)
    expect(() => lengthScale(0)).toThrow(RangeError)
    expect(() => timeScale(-1)).toThrow(RangeError)
    expect(() => runClockHeight(1, 1, 0)).toThrow(RangeError)
  })
})

describe('the module stands alone (test 10)', () => {
  it('imports nothing from the other experiments\' physics modules', () => {
    const source = readFileSync(new URL('./clockHeight.ts', import.meta.url), 'utf8')
    expect(source).not.toMatch(/^import /m)
  })
})
