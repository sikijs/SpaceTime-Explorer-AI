import { describe, it, expect } from 'vitest'
import {
  ageAfterBigBangYears,
  ageShareRange,
  countRange,
  distanceThenLightYearsPlanck,
  distanceTodayLightYearsPlanck,
  HUBBLE_CONSTANT_PLANCK,
  lightTravelYearsPlanck,
  LYMAN_ALPHA_NM,
  monthsOfFirstFourYears,
  MOM_Z14_PAPER_AGE_YEARS,
  MOM_Z14_REDSHIFT,
  NUMBER_DENSITY_EXCESS,
  observedWavelengthNm,
  paperAgeGapPercent,
  PLANCK_MATTER_FRACTION,
  presentAgeYears,
  RECORDS,
  relativeSizeThen,
  runEarliestGalaxies,
  shareOfPresentAge,
  stretchFactor,
  ticksAboveOne,
  WEBB_NIRCAM_RANGE_NM,
} from './earliestGalaxies'
import { distanceTodayLightYears } from './observableUniverseExperiment'

// Tests for Cosmic Horizons Experiment 5 (docs/experiments/frontier-and-beyond/05-how-early-can-galaxies-form.md, "Required Physics Tests").
// The age and the distance are also computed here by direct numerical integration of the expansion rate (Simpson's rule, Planck's
// H0 = 67.4 and matter fraction 0.315, no radiation), which does not use the project's closed forms, so a wrong rescaling in the module
// cannot make a test pass.

const OMEGA_M = 0.315
const OMEGA_L = 0.685
const HUBBLE_TIME_YEARS = 977.792e9 / HUBBLE_CONSTANT_PLANCK // 1 / H0 in years: 977.792 billion years for H0 = 1 km/s/Mpc

function simpson(f: (x: number) => number, a: number, b: number, n = 4000): number {
  const h = (b - a) / n
  let sum = f(a) + f(b)
  for (let i = 1; i < n; i++) sum += f(a + i * h) * (i % 2 === 0 ? 2 : 4)
  return (sum * h) / 3
}
const expansionRateOverH0 = (a: number) => Math.sqrt(OMEGA_M / (a * a * a) + OMEGA_L)
// t(a) = (1 / H0) x integral of da / (a E(a)); the integrand is written with a substitution that is finite at a = 0 (a E(a) -> sqrt(Omega_m / a)).
const timeAtSizeYears = (a: number) => HUBBLE_TIME_YEARS * simpson((x) => (x === 0 ? 0 : 1 / (x * expansionRateOverH0(x))), 0, a)
// comoving distance today = (c / H0) x integral of dz / E(z), in light-years (c / H0 = the Hubble time in light-years)
const distanceTodayByIntegralLy = (z: number) => HUBBLE_TIME_YEARS * simpson((x) => 1 / expansionRateOverH0(1 / (1 + x)), 0, z, 20000)

describe('the stretch factor (test 1)', () => {
  it('is 1 + z: 15.44 for MoM-z14 and 1 today', () => {
    expect(stretchFactor(14.44)).toBeCloseTo(15.44, 10)
    expect(stretchFactor(0)).toBe(1)
  })
  it('is strictly increasing with redshift', () => {
    expect(stretchFactor(14.44)).toBeGreaterThan(stretchFactor(14.18))
    expect(stretchFactor(14.18)).toBeGreaterThan(stretchFactor(6))
  })
})

describe('the observed wavelength (test 2)', () => {
  it('turns Lyman-alpha (121.567 nm) into 1,877 nm at z = 14.44, worked out by hand: 121.567 x 15.44', () => {
    expect(LYMAN_ALPHA_NM).toBe(121.567)
    expect(observedWavelengthNm(121.567, 14.44)).toBeCloseTo(1876.99, 1)
  })
  it('leaves a wavelength unchanged at z = 0 and doubles it at z = 1 (243.134 nm)', () => {
    expect(observedWavelengthNm(121.567, 0)).toBeCloseTo(121.567, 10)
    expect(observedWavelengthNm(121.567, 1)).toBeCloseTo(243.134, 6)
  })
})

describe('the size of the universe then (test 3)', () => {
  it('is 0.0648 at z = 14.44 and equals 1 / the stretch factor', () => {
    expect(relativeSizeThen(14.44)).toBeCloseTo(0.0648, 4)
    expect(relativeSizeThen(14.44)).toBeCloseTo(1 / stretchFactor(14.44), 12)
  })
})

describe('the age after the Big Bang (test 4)', () => {
  it('is 284 million years at z = 14.44, to within 0.5 percent of a separate numerical integration', () => {
    const byIntegral = timeAtSizeYears(1 / 15.44)
    expect(Math.abs(ageAfterBigBangYears(14.44) - byIntegral) / byIntegral).toBeLessThan(0.005)
    expect(ageAfterBigBangYears(14.44) / 1e6).toBeCloseTo(284.05, 0)
  })
  it('agrees with the numerical integration at several redshifts', () => {
    for (const z of [6, 10, 13.2, 20, 30]) {
      const byIntegral = timeAtSizeYears(1 / (1 + z))
      expect(Math.abs(ageAfterBigBangYears(z) - byIntegral) / byIntegral).toBeLessThan(0.005)
    }
  })
  it('is strictly decreasing with redshift', () => {
    let previous = Infinity
    for (const z of [0, 1, 6, 10, 13.2, 14.18, 14.44, 20, 30]) {
      const age = ageAfterBigBangYears(z)
      expect(age).toBeLessThan(previous)
      previous = age
    }
  })
  it('is within 2 percent of the paper\'s 280 million years (the model leaves radiation out)', () => {
    expect(Math.abs(ageAfterBigBangYears(MOM_Z14_REDSHIFT) - MOM_Z14_PAPER_AGE_YEARS) / MOM_Z14_PAPER_AGE_YEARS).toBeLessThan(0.02)
    expect(ageAfterBigBangYears(MOM_Z14_REDSHIFT)).toBeGreaterThan(MOM_Z14_PAPER_AGE_YEARS) // it is above, not below
  })
  it('equals the present age at z = 0', () => {
    expect(ageAfterBigBangYears(0)).toBeCloseTo(presentAgeYears(), -3)
    expect(presentAgeYears() / 1e9).toBeCloseTo(13.796, 2)
  })
})

describe('the share of the present age (test 5)', () => {
  it('is 2.06 percent at z = 14.44 (284.05 / 13,796)', () => {
    expect(shareOfPresentAge(14.44) * 100).toBeCloseTo(2.06, 2)
  })
  it('is 100 percent at z = 0', () => {
    expect(shareOfPresentAge(0)).toBeCloseTo(1, 10)
  })
})

describe('the light travel time (test 6)', () => {
  it('plus the age after the Big Bang equals the present age, at every redshift', () => {
    for (const z of [0, 1, 6, 10.603, 13.2, 14.18, 14.44, 25, 30]) {
      expect(lightTravelYearsPlanck(z) + ageAfterBigBangYears(z)).toBeCloseTo(presentAgeYears(), 3)
    }
  })
  it('is about 13.5 billion years at z = 14.44', () => {
    expect(lightTravelYearsPlanck(14.44) / 1e9).toBeCloseTo(13.51, 2)
  })
})

describe('the distances (test 7)', () => {
  it('today: 33.85 billion light-years at z = 14.44, within 0.5 percent of a separate numerical integration', () => {
    const byIntegral = distanceTodayByIntegralLy(14.44)
    expect(Math.abs(distanceTodayLightYearsPlanck(14.44) - byIntegral) / byIntegral).toBeLessThan(0.005)
    expect(distanceTodayLightYearsPlanck(14.44) / 1e9).toBeCloseTo(33.85, 1)
  })
  it('then: equals the distance today divided by the stretch factor (2.19 billion light-years)', () => {
    expect(distanceThenLightYearsPlanck(14.44)).toBeCloseTo(distanceTodayLightYearsPlanck(14.44) / 15.44, 0)
    expect(distanceThenLightYearsPlanck(14.44) / 1e6).toBeCloseTo(2192, -1)
  })
  it('both are 70 / 67.4 = 1.0386 times the project\'s own (unrescaled) value', () => {
    const projectValue = distanceTodayLightYears(14.44, 0.685)
    expect(distanceTodayLightYearsPlanck(14.44) / projectValue).toBeCloseTo(70 / 67.4, 6)
  })
})

describe('the oldest light (test 8)', () => {
  it('the model\'s distance to the source of the microwave background is within 3 percent of the real 45.7 billion light-years', () => {
    // The model's own range is 30 for z, so the oldest light is checked through the project's function, rescaled the same way.
    const modelLy = distanceTodayLightYears(1089.8, 0.685) * (70 / HUBBLE_CONSTANT_PLANCK)
    expect(Math.abs(modelLy - 45.7e9) / 45.7e9).toBeLessThan(0.03)
    expect(modelLy).toBeLessThan(45.7e9) // radiation left out: the model falls short, as Cosmology Experiment 8 says
  })
})

describe('Prediction 1: the age share ranges (test 9)', () => {
  it('z = 14.44 is about 2 percent, z = 6 (6.7 percent) is about 10 and z = 25 (0.94 percent) is about 1', () => {
    expect(ageShareRange(14.44)).toBe('about2')
    expect(ageShareRange(6)).toBe('about10')
    expect(ageShareRange(25)).toBe('about1')
  })
  it('puts the edges at 1.5 and 4 percent as documented (z = 20 is 1.30 percent, z = 10.603 is about 3.2 percent, z = 8 is above 4)', () => {
    expect(ageShareRange(20)).toBe('about1')
    expect(ageShareRange(10.603)).toBe('about2')
    expect(shareOfPresentAge(8) * 100).toBeGreaterThan(4)
    expect(ageShareRange(8)).toBe('about10')
  })
})

describe('Prediction 2: the number of bright galaxies (test 10)', () => {
  it('the answer is "about a hundred times more or higher", and the lowest published value (77) is above 50', () => {
    expect(countRange()).toBe('hundred')
    expect(NUMBER_DENSITY_EXCESS.low).toBe(77)
    expect(NUMBER_DENSITY_EXCESS.low).toBeGreaterThan(50)
  })
})

describe('the published values (test 11)', () => {
  it('match the sources in the specification', () => {
    expect(NUMBER_DENSITY_EXCESS).toEqual({ best: 182, low: 77, high: 511, headline: 100 })
    expect(MOM_Z14_REDSHIFT).toBe(14.44)
    expect(MOM_Z14_PAPER_AGE_YEARS).toBe(280e6)
    expect(HUBBLE_CONSTANT_PLANCK).toBe(67.4)
    const byName = (name: string) => RECORDS.find((r) => r.name === name)!
    expect(byName('GN-z11')).toMatchObject({ redshift: 10.603, year: 2023, method: 'spectroscopic' })
    expect(byName('JADES-GS-z13-0')).toMatchObject({ redshift: 13.2, year: 2023, method: 'spectroscopic' })
    expect(byName('JADES-GS-z14-0')).toMatchObject({ redshift: 14.18, year: 2024, method: 'spectroscopic' })
    expect(byName('MoM-z14')).toMatchObject({ redshift: 14.44, year: 2025, method: 'spectroscopic' })
    for (const r of RECORDS) expect(r.source.length).toBeGreaterThan(0)
  })
})

describe('the staircase of records (test 12)', () => {
  it('has increasing redshifts and non-decreasing years, and ends at MoM-z14', () => {
    for (let i = 1; i < RECORDS.length; i++) {
      expect(RECORDS[i].redshift).toBeGreaterThan(RECORDS[i - 1].redshift)
      expect(RECORDS[i].year).toBeGreaterThanOrEqual(RECORDS[i - 1].year)
    }
    expect(RECORDS[RECORDS.length - 1].name).toBe('MoM-z14')
    expect(RECORDS[RECORDS.length - 1].redshift).toBe(MOM_Z14_REDSHIFT)
  })
})

describe('the record holders\' ages (test 13)', () => {
  it('fall as the redshift grows', () => {
    for (let i = 1; i < RECORDS.length; i++) {
      expect(ageAfterBigBangYears(RECORDS[i].redshift)).toBeLessThan(ageAfterBigBangYears(RECORDS[i - 1].redshift))
    }
  })
  it('GN-z11\'s model age is near the 430 million years in its later paper\'s title, and the ESA release\'s 400 million, within 10 percent', () => {
    const age = ageAfterBigBangYears(10.603)
    expect(Math.abs(age - 430e6) / 430e6).toBeLessThan(0.05)
    expect(Math.abs(age - 400e6) / 400e6).toBeLessThan(0.1)
  })
})

describe('the what-if redshift and out-of-range input (test 14)', () => {
  it('gives finite, positive numbers for every redshift from 6 to 30', () => {
    for (let z = 6; z <= 30; z += 0.5) {
      const r = runEarliestGalaxies(z)
      for (const value of [r.stretchFactor, r.lymanAlphaObservedNm, r.relativeSizeThen, r.ageAfterBigBangYears, r.shareOfPresentAge, r.lightTravelYears, r.distanceThenLightYears, r.distanceTodayLightYears]) {
        expect(Number.isFinite(value)).toBe(true)
        expect(value).toBeGreaterThan(0)
      }
    }
  })
  it('matches the specification\'s what-if rows: z = 20 is 179.1 million years (1.30 percent), z = 25 is 130.0 (0.94 percent)', () => {
    expect(ageAfterBigBangYears(20) / 1e6).toBeCloseTo(179.1, 0)
    expect(shareOfPresentAge(20) * 100).toBeCloseTo(1.3, 1)
    expect(ageAfterBigBangYears(25) / 1e6).toBeCloseTo(130.0, 0)
    expect(shareOfPresentAge(25) * 100).toBeCloseTo(0.94, 2)
  })
  it('throws RangeError for a redshift below 0, above 30 or not finite, and for a non-positive wavelength', () => {
    expect(() => stretchFactor(-0.1)).toThrow(RangeError)
    expect(() => ageAfterBigBangYears(30.1)).toThrow(RangeError)
    expect(() => distanceTodayLightYearsPlanck(NaN)).toThrow(RangeError)
    expect(() => runEarliestGalaxies(Infinity)).toThrow(RangeError)
    expect(() => observedWavelengthNm(0, 5)).toThrow(RangeError)
  })
})

describe('module source (test 15)', () => {
  it('reuses the project\'s age and distance functions rather than redefining them', async () => {
    const source = await import('node:fs/promises').then((fs) => fs.readFile(new URL('./earliestGalaxies.ts', import.meta.url), 'utf-8'))
    const importLines = source.split('\n').filter((line) => line.trim().startsWith('import') || line.trim().startsWith('} from'))
    const joined = importLines.join('\n')
    expect(joined).toContain('observableUniverseExperiment')
    expect(joined).toContain('universeAgeExperiment')
    expect(joined).toContain('hubbleTension')
    expect(source).toContain('timeAfterBigBangYears(')
    expect(source).toContain('distanceTodayLightYears(')
  })
})

// Added at the final review (2026-10-20), when the numbers the interface had typed or calculated were moved into the module.
describe('Planck\'s matter fraction and Webb\'s range (review, finding a)', () => {
  it('the matter fraction is 0.315 and, with the age function\'s dark energy fraction 0.685, makes a flat universe', () => {
    expect(PLANCK_MATTER_FRACTION).toBe(0.315)
    expect(PLANCK_MATTER_FRACTION + OMEGA_L).toBeCloseTo(1, 12)
  })
  it('NIRCam\'s range is 600 to 5,000 nm (0.6 to 5 microns), the bracket of Picture 1', () => {
    expect(WEBB_NIRCAM_RANGE_NM).toEqual({ min: 600, max: 5000 })
  })
})

describe('derived figures the tutor and the results show (review, finding a)', () => {
  it('the model\'s age for MoM-z14 is 1.4 percent above the paper\'s 280 million years, worked out from the module\'s own numbers', () => {
    const byHand = ((ageAfterBigBangYears(14.44) - 280e6) / 280e6) * 100
    expect(paperAgeGapPercent()).toBeCloseTo(byHand, 10)
    expect(paperAgeGapPercent()).toBeCloseTo(1.4, 1)
    expect(paperAgeGapPercent()).toBeGreaterThan(0)
  })
  it('the share of a child\'s first four years: 0.99 months for MoM-z14 (2.06 percent of 48), 48 months at z = 0', () => {
    expect(monthsOfFirstFourYears(14.44)).toBeCloseTo(0.99, 2)
    expect(monthsOfFirstFourYears(0)).toBeCloseTo(48, 8)
  })
  it('ticks above one on a logarithmic scale: 0 for 1, 2 for 100, 2.26 for 182, and an error for a non-positive multiple', () => {
    expect(ticksAboveOne(1)).toBe(0)
    expect(ticksAboveOne(100)).toBeCloseTo(2, 12)
    expect(ticksAboveOne(182)).toBeCloseTo(2.26, 2)
    expect(() => ticksAboveOne(0)).toThrow(RangeError)
    expect(() => ticksAboveOne(-3)).toThrow(RangeError)
  })
})
