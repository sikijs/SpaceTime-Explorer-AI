import { describe, it, expect } from 'vitest'
import {
  combinedUncertainty,
  EARLY_MEASUREMENT,
  hubbleTimeBillionYears,
  LATE_MEASUREMENTS,
  MEASUREMENTS,
  runTensionExperiment,
  sigmaRange,
  stretchNeeded,
  tensionSigma,
  WEBB_CEPHEID_RESULT,
  webbEffect,
} from './hubbleTension'
import { hubbleTimeYears } from './bigBangExperiment'

// Tests for Cosmic Horizons Experiment 1 (docs/experiments/cosmic-horizons/01-hubble-tension.md, "Required Physics Tests").
// The numbers in the specification's table are written out here by hand, so a wrong formula in the module cannot make a test pass.

const planck = EARLY_MEASUREMENT
const byName = (name: string) => MEASUREMENTS.find((m) => m.name === name)!
const shoes = byName('SH0ES 2022')
const h0dn = byName('H0DN 2026')
const cchp = byName('CCHP 2024')

describe('table values (test 1)', () => {
  it('gives the tension of each nearby-universe measurement against Planck', () => {
    expect(tensionSigma(planck, shoes)).toBeCloseTo(4.89, 2)
    expect(tensionSigma(planck, h0dn)).toBeCloseTo(6.41, 2)
    expect(tensionSigma(planck, cchp)).toBeCloseTo(1.5, 2)
  })

  it('gives the Hubble times in billions of years', () => {
    expect(hubbleTimeBillionYears(67.4)).toBeCloseTo(14.51, 2)
    expect(hubbleTimeBillionYears(73.04)).toBeCloseTo(13.39, 2)
    expect(hubbleTimeBillionYears(73.5)).toBeCloseTo(13.3, 2)
    expect(hubbleTimeBillionYears(70.39)).toBeCloseTo(13.89, 2)
  })

  it('gives the gaps and combined uncertainties of the table', () => {
    expect(runTensionExperiment(shoes).gap).toBeCloseTo(5.64, 2)
    expect(runTensionExperiment(h0dn).gap).toBeCloseTo(6.1, 2)
    expect(runTensionExperiment(cchp).gap).toBeCloseTo(2.99, 2)
    expect(runTensionExperiment(shoes).combinedUncertainty).toBeCloseTo(1.15, 2)
    expect(runTensionExperiment(h0dn).combinedUncertainty).toBeCloseTo(0.95, 2)
    expect(runTensionExperiment(cchp).combinedUncertainty).toBeCloseTo(2.0, 2)
  })
})

describe('combined uncertainty (test 2)', () => {
  it('is the square root of the sum of squares', () => {
    expect(combinedUncertainty(0.5, 1.04)).toBeCloseTo(1.154, 3)
    expect(combinedUncertainty(3, 4)).toBe(5)
  })

  it('reproduces CCHP total of 1.22, 1.33 and 0.70 in quadrature', () => {
    expect(Math.sqrt(1.22 ** 2 + 1.33 ** 2 + 0.7 ** 2)).toBeCloseTo(1.94, 2)
    expect(cchp.uncertainty).toBeCloseTo(1.94, 2)
  })
})

describe('symmetry and zero (tests 3 and 4)', () => {
  it('has the same tension of A against B as of B against A', () => {
    for (const a of MEASUREMENTS) {
      for (const b of MEASUREMENTS) {
        expect(tensionSigma(a, b)).toBeCloseTo(tensionSigma(b, a), 12)
      }
    }
  })

  it('gives 0 sigma for a measurement against itself', () => {
    for (const m of MEASUREMENTS) {
      expect(tensionSigma(m, m)).toBe(0)
    }
  })
})

describe('stretching the error bars (tests 5 and 6)', () => {
  it('divides the tension by the stretch', () => {
    for (const late of LATE_MEASUREMENTS) {
      const base = tensionSigma(planck, late)
      for (const k of [1, 1.5, 2, 3, 5]) {
        expect(tensionSigma(planck, late, k)).toBeCloseTo(base / k, 10)
      }
    }
  })

  it('gives the stretches of the table: SH0ES 1.63, 2.44, 4.89 and H0DN 2.14, 3.20', () => {
    expect(stretchNeeded(planck, shoes, 3)).toBeCloseTo(1.63, 2)
    expect(stretchNeeded(planck, shoes, 2)).toBeCloseTo(2.44, 2)
    expect(stretchNeeded(planck, shoes, 1)).toBeCloseTo(4.89, 2)
    expect(stretchNeeded(planck, h0dn, 3)).toBeCloseTo(2.14, 2)
    expect(stretchNeeded(planck, h0dn, 2)).toBeCloseTo(3.2, 2)
  })

  it('returns the target when the needed stretch is applied', () => {
    for (const late of [shoes, h0dn]) {
      for (const target of [1, 2, 3, 4]) {
        expect(tensionSigma(planck, late, stretchNeeded(planck, late, target))).toBeCloseTo(target, 10)
      }
    }
  })
})

describe('monotonic (test 7)', () => {
  const at = (value: number, uncertainty: number) => ({ name: 'x', side: 'late' as const, value, uncertainty, source: '' })

  it('rises with a larger gap at the same uncertainties', () => {
    expect(tensionSigma(planck, at(72, 1))).toBeGreaterThan(tensionSigma(planck, at(71, 1)))
  })

  it('falls with larger uncertainties at the same gap', () => {
    expect(tensionSigma(planck, at(72, 2))).toBeLessThan(tensionSigma(planck, at(72, 1)))
  })
})

describe('Hubble time (test 8)', () => {
  it('falls as H0 rises', () => {
    expect(hubbleTimeBillionYears(73)).toBeLessThan(hubbleTimeBillionYears(67))
  })

  it('equals Cosmology Experiment 2 at H0 = 70', () => {
    expect(hubbleTimeBillionYears(70)).toBeCloseTo(hubbleTimeYears() / 1e9, 10)
  })
})

describe('the module data (test 9)', () => {
  it('has exactly one early measurement, Planck, and the three nearby-universe ones', () => {
    expect(MEASUREMENTS.filter((m) => m.side === 'early').map((m) => m.name)).toEqual(['Planck 2018'])
    expect(LATE_MEASUREMENTS.map((m) => m.name)).toEqual(['SH0ES 2022', 'H0DN 2026', 'CCHP 2024'])
  })

  it('has positive values and uncertainties, and a source for each', () => {
    for (const m of MEASUREMENTS) {
      expect(m.value).toBeGreaterThan(0)
      expect(m.uncertainty).toBeGreaterThan(0)
      expect(m.source.length).toBeGreaterThan(0)
    }
  })
})

describe('the between result (test 10)', () => {
  it('puts CCHP below 2 sigma from both SH0ES and H0DN', () => {
    expect(tensionSigma(cchp, shoes)).toBeCloseTo(1.21, 2)
    expect(tensionSigma(cchp, h0dn)).toBeCloseTo(1.48, 2)
    expect(tensionSigma(cchp, shoes)).toBeLessThan(2)
    expect(tensionSigma(cchp, h0dn)).toBeLessThan(2)
  })

  it('puts CCHP between Planck and the other two', () => {
    expect(cchp.value).toBeGreaterThan(planck.value)
    expect(cchp.value).toBeLessThan(shoes.value)
  })
})

describe('result record (test 11)', () => {
  it('matches the individual functions', () => {
    const result = runTensionExperiment(shoes, 2)
    expect(result.early).toBe(planck)
    expect(result.late).toBe(shoes)
    expect(result.stretch).toBe(2)
    expect(result.tension).toBeCloseTo(tensionSigma(planck, shoes, 2), 12)
    expect(result.combinedUncertainty).toBeCloseTo(combinedUncertainty(1, 2.08), 12)
    expect(result.earlyHubbleTimeBillionYears).toBeCloseTo(hubbleTimeBillionYears(67.4), 12)
    expect(result.lateHubbleTimeBillionYears).toBeCloseTo(hubbleTimeBillionYears(73.04), 12)
  })

  it('lists every other nearby-universe measurement, and not the chosen one', () => {
    const result = runTensionExperiment(shoes, 3)
    expect(result.otherLateTensions.map((o) => o.measurement.name)).toEqual(['H0DN 2026', 'CCHP 2024'])
    for (const o of result.otherLateTensions) {
      expect(o.tension).toBeCloseTo(tensionSigma(planck, o.measurement, 3), 12)
    }
  })
})

describe('out-of-range inputs (test 12)', () => {
  const at = (uncertainty: number) => ({ name: 'x', side: 'late' as const, value: 70, uncertainty, source: '' })

  it('throws RangeError for a non-positive uncertainty', () => {
    expect(() => combinedUncertainty(0, 1)).toThrow(RangeError)
    expect(() => combinedUncertainty(1, -1)).toThrow(RangeError)
    expect(() => tensionSigma(planck, at(0))).toThrow(RangeError)
  })

  it('throws RangeError for a non-positive Hubble constant', () => {
    expect(() => hubbleTimeBillionYears(0)).toThrow(RangeError)
    expect(() => hubbleTimeBillionYears(-70)).toThrow(RangeError)
  })

  it('throws RangeError for a stretch below 1', () => {
    expect(() => tensionSigma(planck, shoes, 0.5)).toThrow(RangeError)
    expect(() => runTensionExperiment(shoes, 0.9)).toThrow(RangeError)
  })

  it('throws RangeError for a non-positive target sigma', () => {
    expect(() => stretchNeeded(planck, shoes, 0)).toThrow(RangeError)
    expect(() => stretchNeeded(planck, shoes, -1)).toThrow(RangeError)
  })
})

describe('the prediction answers (tutor marking)', () => {
  it('puts each tension of the table in the range the specification names', () => {
    expect(sigmaRange(tensionSigma(planck, shoes))).toBe('fourToSix')
    expect(sigmaRange(tensionSigma(planck, h0dn))).toBe('over6')
    expect(sigmaRange(tensionSigma(planck, cchp))).toBe('under2')
  })

  it('puts the boundaries in exactly one range: 2 and 4 and 6 belong to the lower range of the pair, and 0 to under 2', () => {
    expect(sigmaRange(0)).toBe('under2')
    expect(sigmaRange(1.999)).toBe('under2')
    expect(sigmaRange(2)).toBe('twoToFour')
    expect(sigmaRange(4)).toBe('twoToFour')
    expect(sigmaRange(4.001)).toBe('fourToSix')
    expect(sigmaRange(6)).toBe('fourToSix')
    expect(sigmaRange(6.001)).toBe('over6')
  })

  it('throws RangeError for a negative tension', () => {
    expect(() => sigmaRange(-1)).toThrow(RangeError)
  })

  it('records the Webb result as written in the source: -0.01 +/- 0.03 magnitudes, crowding rejected at 8.2 sigma, so about the same', () => {
    expect(WEBB_CEPHEID_RESULT.differenceMagnitudes).toBe(-0.01)
    expect(WEBB_CEPHEID_RESULT.uncertaintyMagnitudes).toBe(0.03)
    expect(WEBB_CEPHEID_RESULT.crowdingRejectedAtSigma).toBe(8.2)
    expect(webbEffect()).toBe('same')
  })
})
