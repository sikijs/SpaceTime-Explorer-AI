import { describe, it, expect } from 'vitest'
import {
  curveFor,
  EARLY_MEASUREMENT,
  kidsShift,
  LATE_MEASUREMENTS,
  MEASUREMENTS,
  PLANCK_OWN,
  runLumpiness,
  s8,
  shift,
  sigma8OnCurve,
  tensionRange,
  tensionSigma,
  uncertaintiesFacing,
} from './lumpiness'
import type { S8Measurement } from './lumpiness'

// Tests for Frontier and Beyond Experiment 3 (docs/experiments/frontier-and-beyond/03-how-lumpy-is-the-universe.md, "Required Physics Tests").
// The numbers below were worked out separately, by an independent script and by hand, so a wrong formula in the module cannot make a test pass.

const planck = EARLY_MEASUREMENT
const byName = (name: string) => MEASUREMENTS.find((m) => m.name === name)!
const kids1000 = byName('KiDS-1000')
const kidsLegacy = byName('KiDS-Legacy')
const desNla = byName('DES Y6 (NLA)')
const desTatt = byName('DES Y6 (TATT)')

describe('S8 from its parts (test 1)', () => {
  it("gives 0.8310 from Planck's own sigma8 and matter fraction", () => {
    expect(s8(PLANCK_OWN.sigma8, PLANCK_OWN.omegaMatter)).toBeCloseTo(0.831, 3)
    expect(s8(0.811, 0.315)).toBeCloseTo(0.8310277, 6)
  })

  it('equals sigma8 when the matter fraction is 0.3', () => {
    for (const sigma8 of [0.6, 0.759, 0.9, 1.2]) expect(s8(sigma8, 0.3)).toBeCloseTo(sigma8, 12)
  })

  it('grows with sigma8 and with the matter fraction', () => {
    expect(s8(0.9, 0.3)).toBeGreaterThan(s8(0.8, 0.3))
    expect(s8(0.8, 0.35)).toBeGreaterThan(s8(0.8, 0.25))
  })
})

describe('the curve of equal S8 (tests 2 to 4)', () => {
  it('inverts s8', () => {
    for (const S of [0.759, 0.815, 0.834]) {
      for (const om of [0.2, 0.25, 0.315, 0.4]) expect(s8(sigma8OnCurve(S, om), om)).toBeCloseTo(S, 12)
    }
  })

  it('has the values written in the specification, to three decimals', () => {
    const table: Array<[S8Measurement, number[]]> = [
      [kids1000, [0.831, 0.759, 0.703, 0.657]],
      [kidsLegacy, [0.893, 0.815, 0.755, 0.706]],
      [desNla, [0.874, 0.798, 0.739, 0.691]],
      [planck, [0.914, 0.834, 0.772, 0.722]],
    ]
    for (const [m, expected] of table) {
      ;[0.25, 0.3, 0.35, 0.4].forEach((om, i) => expect(sigma8OnCurve(m.value, om)).toBeCloseTo(expected[i], 3))
    }
  })

  it('falls as the matter fraction grows, strictly', () => {
    for (const m of MEASUREMENTS) {
      const points = curveFor(m)
      for (let i = 1; i < points.length; i++) expect(points[i].sigma8).toBeLessThan(points[i - 1].sigma8)
    }
  })

  it('runs from 0.20 to 0.40 in steps of 0.01, 21 points', () => {
    const points = curveFor(kids1000)
    expect(points).toHaveLength(21)
    expect(points[0].omegaMatter).toBe(0.2)
    expect(points[20].omegaMatter).toBe(0.4)
    expect(points[10].omegaMatter).toBeCloseTo(0.3, 12)
  })
})

describe('the tension in sigma (tests 5 and 6)', () => {
  it('has the values worked out by hand for each survey against Planck', () => {
    // KiDS-1000: (0.834 - 0.759) / sqrt(0.024^2 + 0.016^2) = 0.075 / 0.028844 = 2.600
    expect(tensionSigma(kids1000, planck)).toBeCloseTo(2.6, 2)
    // KiDS-Legacy: 0.019 / sqrt(0.016^2 + 0.016^2) = 0.019 / 0.022627 = 0.840
    expect(tensionSigma(kidsLegacy, planck)).toBeCloseTo(0.84, 2)
    // DES Y6 NLA: 0.036 / sqrt(0.014^2 + 0.016^2) = 0.036 / 0.021260 = 1.693
    expect(tensionSigma(desNla, planck)).toBeCloseTo(1.69, 2)
    // DES Y6 TATT: 0.051 / sqrt(0.019^2 + 0.016^2) = 0.051 / 0.024839 = 2.053
    expect(tensionSigma(desTatt, planck)).toBeCloseTo(2.05, 2)
  })

  it('uses the uncertainty on the side facing the other value', () => {
    // a constructed survey ABOVE Planck: it uses its downward uncertainty (0.02), and Planck its upward one (0.016)
    const above: S8Measurement = { ...kidsLegacy, name: 'constructed', value: 0.86, up: 0.03, down: 0.02 }
    expect(tensionSigma(above, planck)).toBeCloseTo(0.026 / Math.sqrt(0.02 ** 2 + 0.016 ** 2), 10)
    expect(tensionSigma(above, planck)).toBeCloseTo(1.0152, 3)
    // a survey BELOW Planck uses its upward uncertainty, not its downward one
    const below: S8Measurement = { ...kidsLegacy, name: 'constructed', value: 0.8, up: 0.03, down: 0.001 }
    expect(tensionSigma(below, planck)).toBeCloseTo(0.034 / Math.sqrt(0.03 ** 2 + 0.016 ** 2), 10)
  })

  it('is the same whichever is given first', () => {
    for (const m of LATE_MEASUREMENTS) expect(tensionSigma(m, planck)).toBe(tensionSigma(planck, m))
  })

  it('is 0 for a value against itself', () => {
    expect(tensionSigma(planck, planck)).toBe(0)
  })
})

describe('the KiDS shift and the answer to Prediction 1 (test 7)', () => {
  it('is +0.056 from KiDS-1000 to KiDS-Legacy', () => {
    expect(shift(kids1000, kidsLegacy)).toBeCloseTo(0.056, 10)
    expect(shift(kidsLegacy, kids1000)).toBeCloseTo(-0.056, 10)
  })

  it('says KiDS came out higher', () => {
    expect(kidsShift()).toBe('higher')
  })
})

describe('the answer to Prediction 2 (test 8)', () => {
  it('puts each survey in its range', () => {
    expect(tensionRange(tensionSigma(kidsLegacy, planck))).toBe('under1')
    expect(tensionRange(tensionSigma(desNla, planck))).toBe('oneToTwoAndAHalf')
    expect(tensionRange(tensionSigma(desTatt, planck))).toBe('oneToTwoAndAHalf')
    expect(tensionRange(tensionSigma(kids1000, planck))).toBe('over2AndAHalf')
  })

  it('has its edges where documented', () => {
    expect(tensionRange(0.99)).toBe('under1')
    expect(tensionRange(1)).toBe('oneToTwoAndAHalf')
    expect(tensionRange(2.5)).toBe('oneToTwoAndAHalf')
    expect(tensionRange(2.51)).toBe('over2AndAHalf')
    expect(() => tensionRange(-0.1)).toThrow(RangeError)
  })
})

describe('the story the data tell (test 9)', () => {
  it('has KiDS-Legacy closer to Planck than KiDS-1000, and DES Y6 further than KiDS-Legacy', () => {
    expect(tensionSigma(kidsLegacy, planck)).toBeLessThan(tensionSigma(kids1000, planck))
    expect(tensionSigma(desNla, planck)).toBeGreaterThan(tensionSigma(kidsLegacy, planck))
    expect(tensionSigma(desTatt, planck)).toBeGreaterThan(tensionSigma(kidsLegacy, planck))
  })

  it('has DES Y6 closer to Planck than KiDS-1000 was', () => {
    expect(tensionSigma(desNla, planck)).toBeLessThan(tensionSigma(kids1000, planck))
  })
})

describe("Planck's own numbers agree with the value used (test 10)", () => {
  it('has S8 from the abstract within 0.01 of 0.834', () => {
    expect(Math.abs(s8(PLANCK_OWN.sigma8, PLANCK_OWN.omegaMatter) - planck.value)).toBeLessThan(0.01)
  })

  it("puts Planck's own point near its curve", () => {
    const own = runLumpiness(kids1000).planckOwnPoint
    expect(Math.abs(sigma8OnCurve(planck.value, own.omegaMatter) - own.sigma8)).toBeLessThan(0.01)
  })
})

describe('the published values (test 11)', () => {
  it('matches the table in the specification', () => {
    expect(MEASUREMENTS.map((m) => [m.name, m.side, m.year, m.value, m.up, m.down])).toEqual([
      ['Planck Legacy', 'early', 2018, 0.834, 0.016, 0.016],
      ['KiDS-1000', 'late', 2020, 0.759, 0.024, 0.021],
      ['KiDS-Legacy', 'late', 2025, 0.815, 0.016, 0.021],
      ['DES Y6 (NLA)', 'late', 2026, 0.798, 0.014, 0.015],
      ['DES Y6 (TATT)', 'late', 2026, 0.783, 0.019, 0.015],
    ])
    expect(MEASUREMENTS.map((m) => m.paperSigma)).toEqual([
      '',
      'about 3',
      '0.73',
      '2.0 (against Planck + ACT + SPT)',
      '2.3 (against Planck + ACT + SPT)',
    ])
    expect(EARLY_MEASUREMENT.name).toBe('Planck Legacy')
    expect(LATE_MEASUREMENTS).toHaveLength(4)
  })
})

describe('the whole result for one survey', () => {
  it('reports the gap, the combined uncertainty, the tension and the others', () => {
    const r = runLumpiness(desNla)
    expect(r.early).toBe(planck)
    expect(r.focus).toBe(desNla)
    expect(r.gap).toBeCloseTo(0.036, 10)
    expect(r.combinedUncertainty).toBeCloseTo(0.02126, 5)
    expect(r.tension).toBeCloseTo(1.69, 2)
    expect(r.paperSigma).toBe('2.0 (against Planck + ACT + SPT)')
    expect(r.otherTensions.map((o) => o.measurement.name)).toEqual(['KiDS-1000', 'KiDS-Legacy', 'DES Y6 (TATT)'])
    expect(r.kidsShift).toBeCloseTo(0.056, 10)
    expect(r.kidsShiftDirection).toBe('higher')
    expect(r.curves).toHaveLength(5)
    expect(r.curves[0].measurement).toBe(planck)
    expect(r.planckOwnPoint.s8).toBeCloseTo(0.831, 3)
  })

  it('gives the same numbers whichever survey is looked at, for the shift and the curves', () => {
    const a = runLumpiness(kids1000)
    const b = runLumpiness(kidsLegacy)
    expect(a.kidsShift).toBe(b.kidsShift)
    expect(a.curves.map((c) => c.measurement.name)).toEqual(b.curves.map((c) => c.measurement.name))
  })
})

describe('out-of-range inputs (test 12)', () => {
  it('throws a RangeError', () => {
    expect(() => s8(-0.1, 0.3)).toThrow(RangeError)
    expect(() => s8(0.8, 0)).toThrow(RangeError)
    expect(() => s8(0.8, 1.1)).toThrow(RangeError)
    expect(() => sigma8OnCurve(0, 0.3)).toThrow(RangeError)
    expect(() => sigma8OnCurve(0.8, -0.2)).toThrow(RangeError)
    expect(() => runLumpiness(planck)).toThrow(RangeError)
    const bad: S8Measurement = { ...kidsLegacy, name: 'bad', up: 0 }
    expect(() => tensionSigma(bad, planck)).toThrow(RangeError)
  })
})

describe('the uncertainties used (added in Step 4)', () => {
  it('gives the one on the side facing the other value, in the order of the arguments', () => {
    // a survey below Planck: its upward uncertainty, and Planck's downward one
    expect(uncertaintiesFacing(kids1000, planck)).toEqual({ first: 0.024, second: 0.016 })
    expect(uncertaintiesFacing(desTatt, planck)).toEqual({ first: 0.019, second: 0.016 })
    // the other order: Planck first, so its downward one first, then the survey's upward one
    expect(uncertaintiesFacing(planck, kids1000)).toEqual({ first: 0.016, second: 0.024 })
    // a constructed survey above Planck: its downward uncertainty, and Planck's upward one
    const above: S8Measurement = { ...kidsLegacy, name: 'constructed', value: 0.86, up: 0.03, down: 0.02 }
    expect(uncertaintiesFacing(above, planck)).toEqual({ first: 0.02, second: 0.016 })
  })

  it('is what the result reports, and what the combined uncertainty is made of', () => {
    const r = runLumpiness(kids1000)
    expect(r.surveyUncertaintyUsed).toBe(0.024)
    expect(r.earlyUncertaintyUsed).toBe(0.016)
    expect(r.combinedUncertainty).toBeCloseTo(Math.sqrt(0.024 ** 2 + 0.016 ** 2), 12)
    expect(r.gap / r.combinedUncertainty).toBeCloseTo(r.tension, 12)
  })
})
