import { describe, it, expect } from 'vitest'
import {
  anchoredMagnitudeDifference,
  brightnessPercentChange,
  brightnessSteps,
  chanceOfAtLeastOne,
  DES_RECALIBRATION,
  distanceRange,
  NEWER_RESULT_NAME,
  oneSidedChance,
  recalibrationEffect,
  densityRatioSteps,
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

// Tests for Cosmic Horizons Experiment 2 (docs/experiments/cosmic-horizons/02-does-dark-energy-change.md, "Required Physics Tests").
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
      ['DESI + CMB, with the July 2026 Lyman-alpha analysis', 2.7],
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

describe('the worked-example steps (added in Step 4)', () => {
  it('multiplies out to the density ratio, with the exponents written in the specification', () => {
    // Pantheon+ at z = 1: exponent 3 (1 - 0.838 - 0.62) = -1.374; 2^-1.374 = 0.3860; exp(-3 x -0.62 x 0.5) = exp(0.93) = 2.5345
    const steps = densityRatioSteps(1, -0.838, -0.62)
    expect(steps.exponent).toBeCloseTo(-1.374, 10)
    expect(steps.powerFactor).toBeCloseTo(0.386, 3)
    expect(steps.exponentialFactor).toBeCloseTo(2.5345, 3)
    expect(steps.ratio).toBeCloseTo(0.9779, 3)
    expect(steps.ratio).toBe(darkEnergyDensityRatio(1, -0.838, -0.62))
  })

  it('has a density ratio of 1 for a constant dark energy', () => {
    expect(densityRatioSteps(1.5, -1, 0).ratio).toBe(1)
  })

  it('turns a magnitude difference into an exponent, a factor and a percentage', () => {
    // Union3 at z = 0.5: -0.0514 magnitudes -> exponent 0.02056 -> factor 1.0485 -> 4.85 percent brighter
    const steps = brightnessSteps(-0.0514)
    expect(steps.exponent).toBeCloseTo(0.02056, 5)
    expect(steps.factor).toBeCloseTo(1.0485, 4)
    expect(steps.percent).toBeCloseTo(4.85, 2)
    expect(steps.percent).toBe(brightnessPercentChange(-0.0514))
  })

  it('throws a RangeError outside the redshift range', () => {
    expect(() => densityRatioSteps(2.5, -1, 0)).toThrow(RangeError)
  })
})

describe('the answers to the predictions (added in Step 5)', () => {
  it('puts each collection in the range the specification gives at z = 0.5', () => {
    expect(distanceRange(runEvolvingDarkEnergy(pantheon, 0.5).atChosenRedshift.distanceDifferencePercent)).toBe('between05and2') // 1.37
    expect(distanceRange(runEvolvingDarkEnergy(union3, 0.5).atChosenRedshift.distanceDifferencePercent)).toBe('between2and5') // 3.08
    expect(distanceRange(runEvolvingDarkEnergy(desy5, 0.5).atChosenRedshift.distanceDifferencePercent)).toBe('between2and5') // 2.24
  })

  it('uses the size of the difference, not its sign, and puts the edges where documented', () => {
    expect(distanceRange(-0.49)).toBe('under05')
    expect(distanceRange(0.5)).toBe('between05and2')
    expect(distanceRange(-2)).toBe('between05and2')
    expect(distanceRange(2.01)).toBe('between2and5')
    expect(distanceRange(-5)).toBe('between2and5')
    expect(distanceRange(5.01)).toBe('over5')
    expect(() => distanceRange(Number.NaN)).toThrow(RangeError)
  })

  it('says the recalibration made the preference weaker (4.2 to 3.2)', () => {
    expect(DES_RECALIBRATION.beforeSigma).toBe(4.2)
    expect(DES_RECALIBRATION.afterSigma).toBe(3.2)
    expect(recalibrationEffect()).toBe('weaker')
  })

  it('has the one-sided chances of 1, 3 and 5 sigma from the normal curve', () => {
    expect(oneSidedChance(0)).toBeCloseTo(0.5, 8)
    expect(oneSidedChance(1)).toBeCloseTo(0.158655, 5)
    expect(oneSidedChance(3)).toBeCloseTo(0.0013499, 6)
    expect(1 / oneSidedChance(5)).toBeCloseTo(3.4885e6, -3)
    expect(() => oneSidedChance(-1)).toThrow(RangeError)
  })

  it('works out the chance that at least one of several tries gives the event', () => {
    expect(chanceOfAtLeastOne(0.5, 1)).toBe(0.5)
    expect(chanceOfAtLeastOne(0.5, 3)).toBeCloseTo(0.875, 12)
    expect(chanceOfAtLeastOne(oneSidedChance(3), 100)).toBeCloseTo(0.1264, 3)
    expect(() => chanceOfAtLeastOne(1.5, 2)).toThrow(RangeError)
    expect(() => chanceOfAtLeastOne(0.1, 0)).toThrow(RangeError)
  })
})

describe('the newer result (added when Decision 10 was settled)', () => {
  it('is the last published value, 2.7 sigma, and is a hint by the 3 and 5 lines', () => {
    const last = PUBLISHED_SIGMAS[PUBLISHED_SIGMAS.length - 1]
    expect(last.name).toBe(NEWER_RESULT_NAME)
    expect(last.sigma).toBe(2.7)
    expect(last.source).toContain('2607.27410')
    expect(sigmaLabel(last.sigma)).toBe('hint')
  })

  it('is lower than the DESI + CMB value it updates (3.1)', () => {
    const before = PUBLISHED_SIGMAS.find((p) => p.name === 'DESI + CMB alone')!
    expect(PUBLISHED_SIGMAS.find((p) => p.name === NEWER_RESULT_NAME)!.sigma).toBeLessThan(before.sigma)
  })
})
