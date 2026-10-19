import { describe, it, expect } from 'vitest'
import {
  anchoredMagnitudeDifference,
  brightnessPercentChange,
  ANCHOR_REDSHIFT,
  comovingDistanceMpc,
  comovingDistanceRatio,
  darkEnergyDensityRatio,
  distanceDifferencePercent,
  equationOfState,
  expansionRate,
  FITS,
  PUBLISHED_SIGMAS,
  runEvolvingDarkEnergy,
  sigmaLabel,
} from './evolvingDarkEnergy'
import { comovingDistanceMpc as constantComovingDistanceMpc } from './darkEnergyExperiment'

// Tests for Frontier and Beyond Experiment 2 (docs/experiments/frontier-and-beyond/02-does-dark-energy-change.md, "Required Physics Tests").
// The numbers below were worked out separately, by an independent script, so a wrong formula in the module cannot make a test pass.

const byName = (name: string) => FITS.find((f) => f.name === name)!
const pantheon = byName('Pantheon+')
const union3 = byName('Union3')
const desy5 = byName('DES Y5')
const constant = { ...pantheon, w0: -1, wa: 0 }

describe('a constant dark energy (tests 1 and 2)', () => {
  it('has a density ratio of exactly 1 at every redshift', () => {
    for (const z of [0, 0.3, 0.5, 1, 1.7, 2]) expect(darkEnergyDensityRatio(z, -1, 0)).toBe(1)
  })

  it('has a distance ratio of exactly 1', () => {
    for (const z of [0.3, 1, 2]) expect(comovingDistanceRatio(z, constant)).toBe(1)
    expect(distanceDifferencePercent(1, constant)).toBe(0)
  })

  it('reproduces Cosmology Experiment 5 with a dark energy share of 1 - matter fraction', () => {
    for (const om of [0.3, 0.3114, 0.4]) {
      for (const z of [0.2, 0.5, 1, 2]) {
        expect(comovingDistanceMpc(z, om, -1, 0)).toBeCloseTo(constantComovingDistanceMpc(z, 1 - om), 6)
      }
    }
  })
})

describe('today and the equation of state (tests 3 and 4)', () => {
  it('has an expansion rate of 1 today for every fit', () => {
    for (const f of FITS) expect(expansionRate(0, f.omegaMatter, f.w0, f.wa)).toBeCloseTo(1, 12)
  })

  it('has w equal to w0 today and tending to w0 + wa far back', () => {
    for (const f of FITS) {
      expect(equationOfState(0, f.w0, f.wa)).toBe(f.w0)
      expect(equationOfState(2, f.w0, f.wa)).toBeCloseTo(f.w0 + (f.wa * 2) / 3, 12)
    }
    // w = w0 + wa (1 - a) with a = 1 / (1 + z); at z = 1, a = 0.5
    expect(equationOfState(1, -0.838, -0.62)).toBeCloseTo(-0.838 - 0.62 * 0.5, 12)
  })
})

describe('the density ratio (test 5)', () => {
  it('agrees with a direct numerical integral of the equation of state', () => {
    // rho(z) / rho(0) = exp(3 x the integral of (1 + w) d ln(1 + z)), by Simpson's rule here
    for (const f of FITS) {
      for (const z of [0.3, 1, 2]) {
        const n = 4000
        const h = Math.log(1 + z) / n
        const g = (u: number) => 1 + equationOfState(Math.exp(u) - 1, f.w0, f.wa)
        let sum = g(0) + g(Math.log(1 + z))
        for (let i = 1; i < n; i++) sum += (i % 2 === 1 ? 4 : 2) * g(i * h)
        const numeric = Math.exp(3 * ((sum * h) / 3))
        expect(darkEnergyDensityRatio(z, f.w0, f.wa)).toBeCloseTo(numeric, 8)
      }
    }
  })
})

describe('the specification tables (test 6)', () => {
  const rows: Array<[string, typeof pantheon, number[], number[], number[], number[]]> = [
    ['Pantheon+', pantheon, [-1.2734, -1.3728, -0.9952, -0.3762], [-0.0197, -0.0219, -0.0136, -0.0001], [1.0649, 0.9779, 0.7638], [-0.838, -1.0447, -1.148]],
    ['Union3', union3, [-2.712, -3.0768, -2.6131, -1.5254], [-0.0433, -0.0514, -0.0411, -0.0169], [1.1843, 1.0628, 0.7298], [-0.667, -1.0303, -1.212]],
    ['DES Y5', desy5, [-2.0049, -2.2362, -1.808, -0.9465], [-0.0316, -0.0368, -0.0273, -0.0083], [1.1225, 1.0175, 0.743], [-0.752, -1.0387, -1.182]],
  ]
  for (const [name, fit, percent, mag, density, w] of rows) {
    it(`gives ${name}'s distance differences, magnitudes, density ratios and w`, () => {
      const result = runEvolvingDarkEnergy(fit, 0.5)
      const at = (z: number) => result.atEachRedshift.find((r) => r.redshift === z)!
      ;[0.3, 0.5, 1, 2].forEach((z, i) => {
        expect(at(z).distanceDifferencePercent).toBeCloseTo(percent[i], 3)
        expect(at(z).magnitudeDifference).toBeCloseTo(mag[i], 3)
      })
      ;[0.5, 1, 2].forEach((z, i) => expect(at(z).densityRatio).toBeCloseTo(density[i], 3))
      ;[0, 0.5, 1].forEach((z, i) => expect(equationOfState(z, fit.w0, fit.wa)).toBeCloseTo(w[i], 3))
    })
  }

  it('says the chosen redshift result is the same as the matching entry', () => {
    const result = runEvolvingDarkEnergy(union3, 1)
    expect(result.atChosenRedshift.distanceDifferencePercent).toBeCloseTo(-2.6131, 3)
    expect(result.equationOfStateToday).toBe(-0.667)
  })

  it('gives the curve from 0 to 2 in steps of 0.1', () => {
    const { curve } = runEvolvingDarkEnergy(desy5, 0.5)
    expect(curve).toHaveLength(21)
    expect(curve[0].redshift).toBe(0)
    expect(curve[20].redshift).toBe(2)
    expect(curve[5].redshift).toBeCloseTo(0.5, 12)
    expect(curve[5].distanceDifferencePercent).toBeCloseTo(-2.2362, 3)
  })
})

describe('nearby objects cannot tell the models apart (test 7)', () => {
  it('has a distance ratio within 0.2 percent of 1 at z = 0.01 for every fit', () => {
    for (const f of FITS) expect(Math.abs(comovingDistanceRatio(0.01, f) - 1)).toBeLessThan(0.002)
  })
})

describe('the anchored magnitude difference (test 8)', () => {
  it('is exactly 0 at the anchor redshift', () => {
    for (const f of FITS) expect(anchoredMagnitudeDifference(ANCHOR_REDSHIFT, f)).toBe(0)
  })

  it('is negative at z = 0.5 for every fit (brighter than the constant case)', () => {
    for (const f of FITS) expect(anchoredMagnitudeDifference(0.5, f)).toBeLessThan(0)
  })
})

describe('the integral is accurate (test 9)', () => {
  it('changes by a negligible amount when the number of steps doubles', () => {
    for (const f of FITS) {
      const coarse = comovingDistanceMpc(2, f.omegaMatter, f.w0, f.wa, 2000)
      const fine = comovingDistanceMpc(2, f.omegaMatter, f.w0, f.wa, 4000)
      expect(Math.abs(coarse - fine) / fine).toBeLessThan(1e-9)
    }
  })
})

describe('sigma labels (test 10)', () => {
  it('labels each published sigma, with 3 and 5 as the reference lines', () => {
    expect(sigmaLabel(2.8)).toBe('hint')
    expect(sigmaLabel(3)).toBe('evidence')
    expect(sigmaLabel(3.1)).toBe('evidence')
    expect(sigmaLabel(3.2)).toBe('evidence')
    expect(sigmaLabel(3.8)).toBe('evidence')
    expect(sigmaLabel(4.2)).toBe('evidence')
    expect(sigmaLabel(5)).toBe('discovery')
    expect(sigmaLabel(6.4)).toBe('discovery')
  })

  it('never calls any published result a discovery', () => {
    for (const p of PUBLISHED_SIGMAS) expect(sigmaLabel(p.sigma)).not.toBe('discovery')
  })
})

describe('out-of-range inputs (test 11)', () => {
  it('throws a RangeError', () => {
    expect(() => darkEnergyDensityRatio(-0.1, -1, 0)).toThrow(RangeError)
    expect(() => darkEnergyDensityRatio(2.1, -1, 0)).toThrow(RangeError)
    expect(() => equationOfState(3, -1, 0)).toThrow(RangeError)
    expect(() => expansionRate(0.5, 0, -1, 0)).toThrow(RangeError)
    expect(() => expansionRate(0.5, 1, -1, 0)).toThrow(RangeError)
    expect(() => comovingDistanceMpc(1, 1.2, -1, 0)).toThrow(RangeError)
    expect(() => runEvolvingDarkEnergy(pantheon, 2.5)).toThrow(RangeError)
    expect(() => anchoredMagnitudeDifference(-1, pantheon)).toThrow(RangeError)
    expect(() => sigmaLabel(-1)).toThrow(RangeError)
  })
})

describe('the published values (test 12)', () => {
  it('matches the table in the specification', () => {
    expect(FITS.map((f) => [f.name, f.w0, f.wa, f.omegaMatter, f.sigma])).toEqual([
      ['Pantheon+', -0.838, -0.62, 0.3114, 2.8],
      ['Union3', -0.667, -1.09, 0.3275, 3.8],
      ['DES Y5', -0.752, -0.86, 0.3191, 4.2],
    ])
    expect(PUBLISHED_SIGMAS.map((p) => [p.name, p.sigma])).toEqual([
      ['DESI + CMB alone', 3.1],
      ['Pantheon+', 2.8],
      ['Union3', 3.8],
      ['DES Y5', 4.2],
      ['DES Y5 recalibrated (Dovekie)', 3.2],
    ])
  })
})

describe('the curve is finite everywhere (added in Step 3)', () => {
  it('has a finite value at every point of the curve, including today (z = 0)', () => {
    for (const f of FITS) {
      for (const point of runEvolvingDarkEnergy(f, 0.5).curve) {
        expect(Number.isFinite(point.distanceDifferencePercent)).toBe(true)
        expect(Number.isFinite(point.magnitudeDifference)).toBe(true)
        expect(Number.isFinite(point.densityRatio)).toBe(true)
        expect(Number.isFinite(point.equationOfState)).toBe(true)
      }
    }
  })

  it('lines the nearby supernovae up at the anchor, so the value there is 0 and the values beyond it are below 0', () => {
    for (const f of FITS) {
      expect(anchoredMagnitudeDifference(ANCHOR_REDSHIFT, f)).toBe(0)
      for (const z of [0.1, 0.5, 1]) expect(anchoredMagnitudeDifference(z, f)).toBeLessThan(0)
    }
  })
})

describe('magnitudes and brightness (added in Step 3)', () => {
  it('turns a magnitude difference into a percentage change in brightness', () => {
    expect(brightnessPercentChange(0)).toBe(0)
    // 2.5 magnitudes brighter is a factor of 10, which is 900 percent more; 2.5 magnitudes fainter leaves 10 percent
    expect(brightnessPercentChange(-2.5)).toBeCloseTo(900, 8)
    expect(brightnessPercentChange(2.5)).toBeCloseTo(-90, 8)
    expect(brightnessPercentChange(-0.0219)).toBeCloseTo(2.04, 2)
  })

  it('makes a brighter (more negative) difference a larger percentage', () => {
    expect(brightnessPercentChange(-0.05)).toBeGreaterThan(brightnessPercentChange(-0.02))
  })
})
