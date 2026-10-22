import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  AU_PER_PARSEC,
  BETELGEUSE,
  chanceOfSigma,
  COMPANION,
  DAYS_PER_YEAR,
  keplerPeriodYears,
  modelSeparationAU,
  oneInChance,
  periodDays,
  PLANETS,
  planetsInside,
  radiusAU,
  radiusRangeAU,
  radiusSolarRadii,
  reachOf,
  runBetelgeuseCompanion,
  separationAU,
  separationInRadii,
  sigmaAnswer,
  SOLAR_RADII_PER_AU,
  sizeAnswer,
} from './betelgeuseCompanion'

// Tests for Frontier and Beyond Experiment 12 (docs/experiments/frontier-and-beyond/12-betelgeuse-and-its-companion.md, "Required Physics Tests").
// The expected values are worked out by hand, so a wrong formula in the module cannot make a test pass. One milliarcsecond at one parsec is 0.001 astronomical units, so a
// star of angular diameter 41 mas at 168 pc has a radius of 1/2 x 0.041 x 168 = 3.444 AU, and 42 mas gives 1/2 x 0.042 x 168 = 3.528 AU. One AU is 149,597,870.7 / 695,700 =
// 215.032 solar radii, so 3.444 AU is 740.6 and 3.528 AU is 758.6 solar radii (Joyce and others: 764). The range of the papers: 40 mas at 153 pc, 1/2 x 0.040 x 153 = 3.060 AU,
// to 42 mas at 195 pc, 1/2 x 0.042 x 195 = 4.095 AU. 52 mas at 168 pc is 0.052 x 168 = 8.736 AU. The model separation, 1850 solar radii, is 1850 / 215.032 = 8.6034 AU, and
// 8.6034 / 3.528 = 2.44 Betelgeuse radii. Kepler: P = sqrt(8.6034^3 / (17.5 + 1.6)) = sqrt(636.8 / 19.1) = sqrt(33.34) = 5.774 years = 2,109 days. The upper tail of the normal
// curve is Q(1) = 0.158655, Q(1.5) = 0.0668072, Q(2) = 0.0227501, Q(3) = 0.00134990 and Q(5) = 2.86652e-7 (standard tables); one over them is 6.30, 14.97, 43.96, 740.8 and 3.4886e6.

const rel = (value: number, reference: number) => Math.abs(value - reference) / Math.abs(reference)

describe('the size from an angle and a distance (test 1)', () => {
  it('gives 3.444 AU for 41 mas at 168 pc and 3.528 AU for 42 mas', () => {
    expect(rel(radiusAU(41, 168), 3.444)).toBeLessThan(1e-6)
    expect(rel(radiusAU(42, 168), 3.528)).toBeLessThan(1e-6)
  })
  it('is 740.6 and 758.6 solar radii, within 1 percent of Joyce and others\' 764 at 42 mas', () => {
    expect(rel(radiusSolarRadii(41, 168), 3.444 * 215.032)).toBeLessThan(1e-4)
    expect(rel(radiusSolarRadii(42, 168), 764)).toBeLessThan(0.01)
  })
  it('is proportional to the angle and to the distance', () => {
    expect(radiusAU(82, 168) / radiusAU(41, 168)).toBeCloseTo(2, 10)
    expect(radiusAU(41, 336) / radiusAU(41, 168)).toBeCloseTo(2, 10)
  })
  it('uses the parsec the way the IAU defines it', () => {
    expect(AU_PER_PARSEC).toBeCloseTo(206264.806, 2)
    expect(SOLAR_RADII_PER_AU).toBeCloseTo(215.032, 2)
  })
})

describe('which planets are inside (test 2)', () => {
  it('has Mercury, Venus, Earth and Mars inside at 3.44 AU and not Jupiter', () => {
    expect(planetsInside(radiusAU(41, 168))).toEqual(['Mercury', 'Venus', 'Earth', 'Mars'])
  })
  it('gives the same planets across the whole range of distance and angle the papers allow', () => {
    for (const d of [153, 168, 195]) {
      for (const theta of [40, 41, 42]) {
        expect(planetsInside(radiusAU(theta, d))).toEqual(['Mercury', 'Venus', 'Earth', 'Mars'])
        expect(reachOf(radiusAU(theta, d))).toBe('past Mars')
      }
    }
  })
  it('has the range of radius from 3.060 to 4.095 AU, and Jupiter (5.203 AU) beyond all of it', () => {
    const range = radiusRangeAU()
    expect(rel(range.min, 3.06)).toBeLessThan(1e-6)
    expect(rel(range.max, 4.095)).toBeLessThan(1e-6)
    expect(PLANETS.find((p) => p.name === 'Jupiter')!.orbitAU).toBeGreaterThan(range.max)
  })
  it('puts a bigger or smaller star in the right class', () => {
    expect(reachOf(0.9)).toBe('inside Earth')
    expect(reachOf(1.2)).toBe('past Earth')
    expect(reachOf(1.6)).toBe('past Mars')
    expect(reachOf(5.5)).toBe('past Jupiter')
  })
})

describe('the companion\'s separation (test 3)', () => {
  it('turns 52 mas at 168 pc into 8.736 AU', () => {
    expect(rel(separationAU(52, 168), 8.736)).toBeLessThan(1e-6)
  })
  it('gives the model separation as 8.603 AU, which is 2.44 radii of a 42 mas star', () => {
    expect(rel(modelSeparationAU(), 1850 / 215.032)).toBeLessThan(1e-5)
    expect(separationInRadii(modelSeparationAU(), radiusAU(42, 168))).toBeCloseTo(2.44, 2)
  })
  it('has the two separations within 2 percent of each other', () => {
    expect(rel(separationAU(52, 168), modelSeparationAU())).toBeLessThan(0.02)
  })
})

describe('Kepler\'s third law (test 4)', () => {
  it('gives 5.774 years, 2,109 days, for 8.603 AU, 17.5 and 1.6 solar masses', () => {
    expect(rel(keplerPeriodYears(modelSeparationAU(), 17.5, 1.6), 5.774)).toBeLessThan(1e-3)
    expect(rel(periodDays(modelSeparationAU(), 17.5, 1.6), 2109)).toBeLessThan(1e-3)
  })
  it('agrees with the observed 2,100 days to within 1 percent', () => {
    expect(rel(periodDays(modelSeparationAU(), 17.5, 1.6), COMPANION.observedPeriodDays)).toBeLessThan(0.01)
  })
  it('is the right law: doubling the separation multiplies the period by 2 sqrt 2, quadrupling the mass halves it', () => {
    expect(keplerPeriodYears(2, 1, 1) / keplerPeriodYears(1, 1, 1)).toBeCloseTo(2 * Math.SQRT2, 10)
    expect(keplerPeriodYears(1, 2, 2) / keplerPeriodYears(1, 1, 1)).toBeCloseTo(Math.SQRT1_2, 10) // total mass doubled
    expect(keplerPeriodYears(1, 4, 4) / keplerPeriodYears(1, 1, 1)).toBeCloseTo(0.5, 10) // total mass quadrupled
  })
  it('gives one year for one AU and one solar mass less a tiny mass (the Earth\'s orbit)', () => {
    expect(keplerPeriodYears(1, 1, 0.000003)).toBeCloseTo(1, 5)
  })
  it('converts years to days with the Julian year', () => {
    expect(periodDays(1, 1, 3)).toBeCloseTo(0.5 * 1 * DAYS_PER_YEAR * 1, 6) // 1 AU, 4 solar masses: half a year
  })
})

describe('the period barely depends on the companion\'s mass (test 5)', () => {
  it('changes by less than 5 percent from 1.17 to 2.0 solar masses', () => {
    const slow = periodDays(modelSeparationAU(), 17.5, 1.17)
    const fast = periodDays(modelSeparationAU(), 17.5, 2.0)
    expect(slow).toBeGreaterThan(fast)
    expect((slow - fast) / slow).toBeLessThan(0.05)
  })
  it('changes much more with Betelgeuse\'s own mass: 5.93 years at 16.5, 5.43 at 20', () => {
    expect(rel(keplerPeriodYears(modelSeparationAU(), 16.5, 1.6), 5.931)).toBeLessThan(2e-3)
    expect(rel(keplerPeriodYears(modelSeparationAU(), 20, 1.6), 5.43)).toBeLessThan(2e-3)
  })
  it('keeps every choice of masses within 6 percent of the observed 2,100 days', () => {
    for (const m1 of BETELGEUSE.massChoicesSolar) {
      for (const m2 of COMPANION.massChoicesSolar) {
        expect(rel(periodDays(modelSeparationAU(), m1, m2), COMPANION.observedPeriodDays)).toBeLessThan(0.06)
      }
    }
  })
})

describe('the chance of noise alone (tests 6 and 7)', () => {
  it('matches the standard tables at 1, 1.5, 2, 3 and 5 sigma', () => {
    expect(rel(chanceOfSigma(1), 0.158655)).toBeLessThan(1e-5)
    expect(rel(chanceOfSigma(1.5), 0.0668072)).toBeLessThan(1e-6)
    expect(rel(chanceOfSigma(2), 0.0227501)).toBeLessThan(1e-5)
    expect(rel(chanceOfSigma(3), 0.0013499)).toBeLessThan(1e-4)
    expect(rel(chanceOfSigma(5), 2.86652e-7)).toBeLessThan(1e-5)
  })
  it('agrees with a separate numerical integral of the bell curve (Simpson\'s rule)', () => {
    const tail = (z: number) => {
      const upper = 14
      const n = 20000 // even
      const h = (upper - z) / n
      const pdf = (x: number) => Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI)
      let sum = pdf(z) + pdf(upper)
      for (let i = 1; i < n; i++) sum += pdf(z + i * h) * (i % 2 === 0 ? 2 : 4)
      return (sum * h) / 3
    }
    for (const z of [0, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5]) {
      expect(rel(chanceOfSigma(z), tail(z))).toBeLessThan(1e-7)
    }
  })
  it('is one half at zero sigma and falls steadily as the number of sigma grows', () => {
    expect(chanceOfSigma(0)).toBeCloseTo(0.5, 12)
    let last = chanceOfSigma(0)
    for (let z = 0.25; z <= 6; z += 0.25) {
      const now = chanceOfSigma(z)
      expect(now).toBeLessThan(last)
      last = now
    }
  })
  it('gives "1 time in N" with N about 15 at 1.5 sigma and 3.49 million at 5 sigma', () => {
    expect(rel(oneInChance(1.5), 14.97)).toBeLessThan(1e-3)
    expect(rel(oneInChance(5), 3.4886e6)).toBeLessThan(1e-4)
    expect(oneInChance(1)).toBeCloseTo(6.3, 1)
  })
  it('rejects a negative number of sigma', () => {
    expect(() => chanceOfSigma(-1)).toThrow(RangeError)
  })
})

describe('the published data equal the module\'s constants (test 8)', () => {
  it('has the paper\'s numbers', () => {
    expect(BETELGEUSE.distancePc).toBe(168)
    expect(BETELGEUSE.distanceRangePc).toEqual([153, 195])
    expect(BETELGEUSE.angularDiameterMas).toBe(41)
    expect(BETELGEUSE.massSolar).toBe(17.5)
    expect(BETELGEUSE.joyceRadiusSolarRadii).toBe(764)
    expect(COMPANION.separationMas).toBe(52)
    expect(COMPANION.positionAngleDegrees).toBe(115)
    expect(COMPANION.modelSeparationSolarRadii).toBe(1850)
    expect(COMPANION.massSolar).toBe(1.6)
    expect(COMPANION.reportedSigma).toBe(1.5)
    expect(COMPANION.observedPeriodDays).toBe(2100)
    expect(COMPANION.greatestElongations).toEqual(['2024 Dec 6', '2027 Nov 26', '2030 Nov 15', '2033 Nov 4'])
    expect(PLANETS.map((p) => p.orbitAU)).toEqual([0.387, 0.723, 1.0, 1.524, 5.203])
  })
})

describe('out-of-range inputs (test 9)', () => {
  it('throw RangeError', () => {
    expect(() => radiusAU(0, 168)).toThrow(RangeError)
    expect(() => radiusAU(41, -1)).toThrow(RangeError)
    expect(() => radiusAU(Number.NaN, 168)).toThrow(RangeError)
    expect(() => planetsInside(0)).toThrow(RangeError)
    expect(() => separationAU(0, 168)).toThrow(RangeError)
    expect(() => keplerPeriodYears(0, 1, 1)).toThrow(RangeError)
    expect(() => keplerPeriodYears(1, 0, 1)).toThrow(RangeError)
    expect(() => keplerPeriodYears(1, 1, -1)).toThrow(RangeError)
    expect(() => reachOf(-1)).toThrow(RangeError)
    expect(() => runBetelgeuseCompanion({ distancePc: 0 })).toThrow(RangeError)
  })
})

describe('the module stands alone (test 10)', () => {
  it('imports nothing from the other experiments\' physics modules', () => {
    const source = readFileSync(new URL('./betelgeuseCompanion.ts', import.meta.url), 'utf8')
    expect(source).not.toMatch(/^import /m)
  })
})

describe('the predictions\' answers and the run (test 11)', () => {
  it('has Prediction 1\'s answer "past Mars" and Prediction 2\'s answer "1 in 15"', () => {
    expect(sizeAnswer()).toBe('past Mars')
    expect(sigmaAnswer()).toBe('1 in 15')
  })
  it('runs with the published values by default', () => {
    const r = runBetelgeuseCompanion()
    expect(rel(r.radiusAU, 3.444)).toBeLessThan(1e-6)
    expect(r.planetsInside).toEqual(['Mercury', 'Venus', 'Earth', 'Mars'])
    expect(r.reach).toBe('past Mars')
    expect(rel(r.separationFromAngleAU, 8.736)).toBeLessThan(1e-6)
    expect(rel(r.periodDays, 2109)).toBeLessThan(1e-3)
    expect(Math.abs(r.periodMinusObservedPercent)).toBeLessThan(1)
    expect(rel(r.periodMinusObservedPercent, (2109.0 - 2100) / 2100 * 100)).toBeLessThan(0.05) // +0.43 percent: the model period is a little longer than the observed one
    expect(rel(r.separationInBetelgeuseRadii, 8.6034 / 3.444)).toBeLessThan(1e-3)
    expect(r.sigma).toBe(1.5)
    expect(rel(r.oneIn, 14.97)).toBeLessThan(1e-3)
  })
  it('follows each control: the distance changes the radius and the 52 mas length, the masses the period, the sigma the chance', () => {
    const far = runBetelgeuseCompanion({ distancePc: 195 })
    expect(rel(far.radiusAU, 0.5 * 0.041 * 195)).toBeLessThan(1e-6)
    expect(rel(far.separationFromAngleAU, 0.052 * 195)).toBeLessThan(1e-6)
    expect(far.reach).toBe('past Mars')
    expect(runBetelgeuseCompanion({ betelgeuseMassSolar: 16.5 }).periodDays).toBeGreaterThan(runBetelgeuseCompanion().periodDays)
    expect(runBetelgeuseCompanion({ companionMassSolar: 1.17 }).periodDays).toBeGreaterThan(runBetelgeuseCompanion().periodDays)
    expect(rel(runBetelgeuseCompanion({ sigma: 5 }).oneIn, 3.4886e6)).toBeLessThan(1e-4)
  })
  it('does not change the period when only the distance changes (the model orbit is a length, not an angle)', () => {
    expect(runBetelgeuseCompanion({ distancePc: 195 }).periodDays).toBeCloseTo(runBetelgeuseCompanion().periodDays, 10)
  })
})
