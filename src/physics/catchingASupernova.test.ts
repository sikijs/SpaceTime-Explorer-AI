import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  CM_PER_AU,
  cmToAU,
  collapseEnergyJ,
  collapseWorkedExample,
  compareWithPublished,
  distanceRangeMpc,
  distanceUncertaintyPercent,
  ergFromJoules,
  gasTimeWorkedExample,
  inSunLifetimes,
  joulesFromErg,
  lightTravelAnswer,
  lightOneInRangeOverCores,
  lightTravelTimesLongerThan,
  lightTravelYears,
  LITERATURE,
  lightYearsFromMpc,
  MASS_2026,
  massEstimates,
  nearestLog,
  oneInN,
  overlapCount,
  overlaps,
  restShare,
  runCatchingASupernova,
  SECONDS_PER_YEAR,
  shareOf,
  sunLifetimeEnergyJ,
  SUPERNOVA,
  timeBeforeExplosionYears,
  visibleShareAnswer,
  whereInRange,
} from './catchingASupernova'

// Independent figures, worked here from the constants written out in full (not from the module's code), so a slip in the module shows.
const G = 6.6743e-11
const MSUN = 1.98847e30
const YEAR = 365.25 * 86400

describe('the energy of the collapse (tests 1 and 2)', () => {
  it('is 4.31e46 J for 1.4 solar masses and 12 km, matching a separate calculation', () => {
    const expected = (G * (1.4 * MSUN) ** 2) / 12000
    expect(collapseEnergyJ(1.4, 12)).toBeCloseTo(expected, -35)
    expect(collapseEnergyJ(1.4, 12) / 1e46).toBeCloseTo(4.31, 2)
  })
  it('is proportional to the mass squared and inversely proportional to the radius', () => {
    expect(collapseEnergyJ(2.8, 12) / collapseEnergyJ(1.4, 12)).toBeCloseTo(4, 10)
    expect(collapseEnergyJ(1.4, 6) / collapseEnergyJ(1.4, 12)).toBeCloseTo(2, 10)
  })
  it('is about 4.3e53 erg: the erg is 1e-7 of a joule', () => {
    expect(ergFromJoules(collapseEnergyJ(1.4, 12)) / 1e53).toBeCloseTo(4.31, 2)
    expect(ergFromJoules(1)).toBe(1e7)
    expect(joulesFromErg(1e7)).toBe(1)
  })
  it('is of the size the literature gives: within a factor of 2 of (3 to 5)e53 erg', () => {
    const erg = ergFromJoules(collapseEnergyJ(1.4, 12))
    expect(erg).toBeGreaterThan(3e53)
    expect(erg).toBeLessThan(5e53)
    // and the nine control settings stay within about a factor of 3 of 3e53 to 1e54
    for (const m of SUPERNOVA.coreMassChoicesSolar) for (const r of SUPERNOVA.coreRadiusChoicesKm) {
      const e = ergFromJoules(collapseEnergyJ(m, r))
      expect(e).toBeGreaterThan(2e53)
      expect(e).toBeLessThan(1.2e54)
    }
  })
  it('puts the Sun\'s whole-life output at 1.21e44 J = 1.21e51 erg', () => {
    expect(sunLifetimeEnergyJ() / 1e44).toBeCloseTo((3.828e26 * 1e10 * YEAR) / 1e44, 8)
    expect(sunLifetimeEnergyJ() / 1e44).toBeCloseTo(1.21, 2)
    expect(ergFromJoules(sunLifetimeEnergyJ()) / 1e51).toBeCloseTo(1.21, 2)
  })
  it('makes the collapse about 360 Sun-lifetimes, the gas\'s motion about one, and the light under a tenth', () => {
    const run = runCatchingASupernova()
    expect(run.sunLifetimes.collapse).toBeCloseTo(357, 0)
    expect(run.sunLifetimes.gasMotion).toBeCloseTo(0.83, 2)
    expect(run.sunLifetimes.light).toBeCloseTo(0.0083, 4)
    expect(inSunLifetimes(sunLifetimeEnergyJ())).toBeCloseTo(1, 12)
  })
})

describe('the shares and the predictions (tests 3 to 5)', () => {
  const total = collapseEnergyJ(1.4, 12)
  it('shares: the gas\'s motion is 1 in 431 (0.23 percent) and the light 1 in 43,104 (0.0023 percent)', () => {
    const run = runCatchingASupernova()
    expect(run.gasMotionOneIn).toBeCloseTo(431.3, 0)
    expect(run.gasMotionShare * 100).toBeCloseTo(0.2319, 3)
    expect(run.lightOneIn).toBeCloseTo(43104, -1)
    expect(run.lightShare).toBeCloseTo(1 / 43104, 8)
  })
  it('for the top of the literature range for light (1e50 erg) the light is 1 in 4,310', () => {
    expect(oneInN(joulesFromErg(1e50), total)).toBeCloseTo(4310.4, 0)
  })
  it('a share is the part over the total, and the shares of the parts never exceed the whole', () => {
    expect(shareOf(1, 4)).toBe(0.25)
    expect(oneInN(1, 4)).toBe(4)
    const run = runCatchingASupernova()
    expect(run.gasMotionShare + run.lightShare).toBeLessThan(1)
  })
  it('Prediction 1\'s answer is "1 in 10,000" at the default and at the top of the light range', () => {
    expect(visibleShareAnswer()).toBe('1 in 10,000')
    // 1e50 erg: 1 in 4,310 is still nearest 1 in 10,000 when compared on a log scale
    expect(Math.abs(Math.log10(4310) - 4)).toBeLessThan(Math.abs(Math.log10(4310) - 2))
  })
  it('light-travel time: 6.85 Mpc is 22.34 million light-years, so the light left 22.34 million years ago', () => {
    expect(lightYearsFromMpc(6.85)).toBeCloseTo(6.85e6 * 3.26156, 0)
    expect(lightTravelYears(6.85) / 1e6).toBeCloseTo(22.34, 2)
    expect(lightTravelYears(6.7) / 1e6).toBeCloseTo(21.85, 2)
    expect(lightTravelYears(7.0) / 1e6).toBeCloseTo(22.83, 2)
  })
  it('light-travel time is proportional to the distance', () => {
    expect(lightTravelYears(13.7) / lightTravelYears(6.85)).toBeCloseTo(2, 10)
  })
  it('Prediction 2\'s answer is "about 20 million years"', () => {
    expect(lightTravelAnswer()).toBe('about 20 million years')
  })
})

describe('the shed gas (test 6)', () => {
  it('(0.5, 1.0)e15 cm at 50 km/s were shed 3.17 and 6.34 years before the explosion: the paper\'s "3 to 6 years"', () => {
    const [inner, outer] = SUPERNOVA.gasShellRadiiCm
    expect(timeBeforeExplosionYears(inner, 50)).toBeCloseTo(0.5e15 / 5e6 / YEAR, 10)
    expect(timeBeforeExplosionYears(inner, 50)).toBeCloseTo(3.17, 2)
    expect(timeBeforeExplosionYears(outer, 50)).toBeCloseTo(6.34, 2)
  })
  it('halving the speed doubles the time, and doubling the radius doubles it', () => {
    expect(timeBeforeExplosionYears(1e15, 25) / timeBeforeExplosionYears(1e15, 50)).toBeCloseTo(2, 10)
    expect(timeBeforeExplosionYears(2e15, 50) / timeBeforeExplosionYears(1e15, 50)).toBeCloseTo(2, 10)
  })
  it('the radii are 33.4 and 66.8 astronomical units, just past Neptune\'s 30 and about twice it', () => {
    expect(cmToAU(0.5e15)).toBeCloseTo(33.42, 2)
    expect(cmToAU(1e15)).toBeCloseTo(66.85, 2)
    expect(CM_PER_AU).toBeCloseTo(1.495978707e13, 0)
  })
  it('the three speed choices give 6.3 to 12.7, 3.2 to 6.3 and 1.6 to 3.2 years', () => {
    const [slow, fast] = [25, 100].map((v) => runCatchingASupernova({ windSpeedKmS: v }).gasShedYearsBefore)
    expect(slow[0]).toBeCloseTo(6.34, 2)
    expect(slow[1]).toBeCloseTo(12.68, 2)
    expect(fast[0]).toBeCloseTo(1.58, 2)
    expect(fast[1]).toBeCloseTo(3.17, 2)
  })
  it('a year is the Julian year in seconds', () => {
    expect(SECONDS_PER_YEAR).toBe(31_557_600)
  })
})

describe('the mass estimates (test 7)', () => {
  const byName = (who: string) => massEstimates().find((e) => e.who === who)!
  it('overlap is symmetric', () => {
    for (const a of massEstimates()) for (const b of massEstimates()) expect(overlaps(a, b)).toBe(overlaps(b, a))
  })
  it('16.2 to 17.4 (Niu) overlaps 17 +/- 4 (Jencson); 8 to 10 (Pledger and Shara) does not', () => {
    expect(overlaps(byName('Niu and others'), byName('Jencson and others'))).toBe(true)
    expect(overlaps(byName('Pledger and Shara'), byName('Jencson and others'))).toBe(false)
  })
  it('the lowest and the highest estimates do not overlap: the estimates disagree', () => {
    const all = massEstimates()
    const low = all.reduce((a, b) => (a.highSolar < b.highSolar ? a : b))
    const high = all.reduce((a, b) => (a.lowSolar > b.lowSolar ? a : b))
    expect(overlaps(low, high)).toBe(false)
  })
  it('two ranges that only touch overlap; a point inside a range overlaps it', () => {
    expect(overlaps({ lowSolar: 1, highSolar: 2 }, { lowSolar: 2, highSolar: 3 })).toBe(true)
    expect(overlaps({ lowSolar: 5, highSolar: 5 }, { lowSolar: 1, highSolar: 10 })).toBe(true)
    expect(overlaps({ lowSolar: 1, highSolar: 2 }, { lowSolar: 3, highSolar: 4 })).toBe(false)
  })
  it('a range that runs backwards throws', () => {
    expect(() => overlaps({ lowSolar: 3, highSolar: 1 }, { lowSolar: 1, highSolar: 2 })).toThrow(RangeError)
  })
  it('the estimates run from 8 to 24 solar masses, each range is ordered, and the list is as read', () => {
    const all = massEstimates()
    expect(all.length).toBe(7)
    expect(Math.min(...all.map((e) => e.lowSolar))).toBe(8)
    expect(Math.max(...all.map((e) => e.highSolar))).toBe(24)
    for (const e of all) expect(e.lowSolar).toBeLessThanOrEqual(e.highSolar)
    expect(byName('Niu and others').lowSolar).toBe(16.2)
    expect(byName('Soraisam and others').highSolar - byName('Soraisam and others').lowSolar).toBe(8) // 20 +/- 4
  })
  it('the 2026 ranges are 5.5 to 14 from the light curve and 17 to 19 from the spectra, and they do not overlap', () => {
    expect(MASS_2026.lightCurveRangeSolar).toEqual([5.5, 14])
    expect(MASS_2026.spectraRangeSolar).toEqual([17, 19])
    expect(overlaps({ lowSolar: 5.5, highSolar: 14 }, { lowSolar: 17, highSolar: 19 })).toBe(false)
  })
})

describe('the published data (test 8)', () => {
  it('equals the values in the specification', () => {
    expect(SUPERNOVA.distanceMpc).toBe(6.85)
    expect(SUPERNOVA.coreMassSolar).toBe(1.4)
    expect(SUPERNOVA.coreRadiusKm).toBe(12)
    expect(SUPERNOVA.gasMotionErg).toBe(1e51)
    expect(SUPERNOVA.lightErg).toBe(1e49)
    expect(SUPERNOVA.gasShellRadiiCm).toEqual([0.5e15, 1e15])
    expect(SUPERNOVA.windSpeedKmS).toBe(50)
    expect(SUPERNOVA.windSpeedChoicesKmS).toEqual([25, 50, 100])
    expect(SUPERNOVA.coreMassChoicesSolar).toEqual([1.2, 1.4, 2.0])
    expect(SUPERNOVA.coreRadiusChoicesKm).toEqual([10, 12, 14])
  })
})

describe('out-of-range inputs throw (test 9)', () => {
  it('zero, negative and non-finite values are refused', () => {
    expect(() => collapseEnergyJ(0, 12)).toThrow(RangeError)
    expect(() => collapseEnergyJ(1.4, -1)).toThrow(RangeError)
    expect(() => collapseEnergyJ(NaN, 12)).toThrow(RangeError)
    expect(() => lightTravelYears(0)).toThrow(RangeError)
    expect(() => timeBeforeExplosionYears(1e15, 0)).toThrow(RangeError)
    expect(() => timeBeforeExplosionYears(0, 50)).toThrow(RangeError)
    expect(() => cmToAU(-1)).toThrow(RangeError)
    expect(() => shareOf(0, 1)).toThrow(RangeError)
    expect(() => inSunLifetimes(0)).toThrow(RangeError)
    expect(() => runCatchingASupernova({ distanceMpc: -3 })).toThrow(RangeError)
  })
})

describe('the module stands alone (test 10)', () => {
  it('imports nothing from the other experiments\' physics modules', () => {
    const source = readFileSync(new URL('./catchingASupernova.ts', import.meta.url), 'utf8')
    expect(source).not.toMatch(/^import /m)
  })
})

describe('the run and the controls (tests 11 and 12)', () => {
  it('with no settings returns the published values', () => {
    const run = runCatchingASupernova()
    expect(run.coreMassSolar).toBe(1.4)
    expect(run.coreRadiusKm).toBe(12)
    expect(run.distanceMpc).toBe(6.85)
    expect(run.windSpeedKmS).toBe(50)
    expect(run.collapseErg / 1e53).toBeCloseTo(4.31, 2)
    expect(run.lightTravelYears / 1e6).toBeCloseTo(22.34, 2)
    expect(run.gasShedYearsBefore[0]).toBeCloseTo(3.17, 2)
    expect(run.gasShellAU[1]).toBeCloseTo(66.85, 2)
  })
  it('all nine core settings agree with a separate calculation, and a heavier or smaller core frees more energy', () => {
    for (const m of SUPERNOVA.coreMassChoicesSolar) for (const r of SUPERNOVA.coreRadiusChoicesKm) {
      const run = runCatchingASupernova({ coreMassSolar: m, coreRadiusKm: r })
      expect(run.collapseJ).toBeCloseTo((G * (m * MSUN) ** 2) / (r * 1000), -35)
      expect(run.lightOneIn).toBeCloseTo(run.collapseJ / 1e42, 6)
      expect(run.gasMotionOneIn).toBeCloseTo(run.collapseJ / 1e44, 6)
    }
    expect(runCatchingASupernova({ coreMassSolar: 2.0 }).collapseJ).toBeGreaterThan(runCatchingASupernova().collapseJ)
    expect(runCatchingASupernova({ coreRadiusKm: 10 }).collapseJ).toBeGreaterThan(runCatchingASupernova().collapseJ)
  })
  it('other distances agree with a separate calculation, and the energy does not depend on the distance', () => {
    for (const d of [6.7, 6.85, 7.0]) {
      const run = runCatchingASupernova({ distanceMpc: d })
      expect(run.lightTravelYears).toBeCloseTo(d * 1e6 * 3.26156, 0)
      expect(run.collapseJ).toBe(runCatchingASupernova().collapseJ)
    }
  })
  it('the three speeds agree with a separate calculation, and do not change the energy or the distance', () => {
    for (const v of SUPERNOVA.windSpeedChoicesKmS) {
      const run = runCatchingASupernova({ windSpeedKmS: v })
      expect(run.gasShedYearsBefore[0]).toBeCloseTo(0.5e15 / (v * 1e5) / YEAR, 8)
      expect(run.gasShedYearsBefore[1]).toBeCloseTo(1e15 / (v * 1e5) / YEAR, 8)
      expect(run.collapseJ).toBe(runCatchingASupernova().collapseJ)
      expect(run.lightTravelYears).toBe(runCatchingASupernova().lightTravelYears)
    }
  })
  it('the gas\'s motion is about one Sun-lifetime and the collapse a few hundred (the correction to the group proposal)', () => {
    const run = runCatchingASupernova()
    expect(run.sunLifetimes.gasMotion).toBeGreaterThan(0.5)
    expect(run.sunLifetimes.gasMotion).toBeLessThan(2)
    expect(run.sunLifetimes.collapse).toBeGreaterThan(100)
    expect(run.sunLifetimes.light).toBeLessThan(0.1)
  })
})

describe('the reading guide\'s comparisons (test 13)', () => {
  it('whereInRange: inside, below and above a range, with the factor to the nearest edge', () => {
    expect(whereInRange(4, [3, 5])).toEqual({ verdict: 'inside', factor: 1 })
    expect(whereInRange(3, [3, 5]).verdict).toBe('inside')
    expect(whereInRange(5, [3, 5]).verdict).toBe('inside')
    expect(whereInRange(1.5, [3, 5])).toEqual({ verdict: 'below', factor: 2 })
    expect(whereInRange(10, [3, 5])).toEqual({ verdict: 'above', factor: 2 })
  })
  it('the collapse energy at the published values is inside the neutrino range, and the nine control settings are classified by a separate rule', () => {
    expect(whereInRange(runCatchingASupernova().collapseErg, LITERATURE.neutrinoEnergyErg).verdict).toBe('inside')
    for (const m of SUPERNOVA.coreMassChoicesSolar) for (const r of SUPERNOVA.coreRadiusChoicesKm) {
      const erg = ergFromJoules(collapseEnergyJ(m, r))
      const expected = erg < 3e53 ? 'below' : erg > 5e53 ? 'above' : 'inside'
      expect(compareWithPublished({ coreMassSolar: m, coreRadiusKm: r }).collapseVsNeutrinoRange.verdict).toBe(expected)
    }
  })
  it('the rest of the collapse\'s energy is 99.77 percent, and is the collapse minus the blast and the light', () => {
    const run = runCatchingASupernova()
    expect(restShare(run.collapseJ, run.gasMotionJ, run.lightJ) * 100).toBeCloseTo(99.77, 2)
    expect(restShare(run.collapseJ, run.gasMotionJ, run.lightJ)).toBeCloseTo(1 - run.gasMotionShare - run.lightShare, 12)
    expect(() => restShare(1, 1, 1)).toThrow(RangeError)
  })
  it('overlapCount: the number of the other estimates each one shares a value with, from a separate count', () => {
    const all = massEstimates()
    for (const a of all) {
      const expected = all.filter((b) => b.who !== a.who && a.lowSolar <= b.highSolar && b.lowSolar <= a.highSolar).length
      expect(overlapCount(a.who)).toBe(expected)
    }
    expect(overlapCount('Pledger and Shara')).toBe(1) // only Kilpatrick's 9 to 13 reaches down to 10
    expect(() => overlapCount('nobody')).toThrow(RangeError)
  })
  it('at the published values every comparison says the same', () => {
    const c = compareWithPublished()
    expect(c.coreMass).toBe(0)
    expect(c.coreRadius).toBe(0)
    expect(c.collapsePercent).toBe(0)
    expect(c.windSpeed).toBe(0)
    expect(c.gasTimePercent).toBe(0)
    expect(c.lightOneInMine).toBe(c.lightOneInPublished)
  })
  it('a heavier core and a slower gas move the comparisons the right way, against separate calculations', () => {
    const heavy = compareWithPublished({ coreMassSolar: 2.0 })
    expect(heavy.coreMass).toBe(1)
    expect(heavy.collapsePercent).toBeCloseTo(((2.0 / 1.4) ** 2 - 1) * 100, 6)
    expect(heavy.lightOneInMine).toBeGreaterThan(heavy.lightOneInPublished)
    const slow = compareWithPublished({ windSpeedKmS: 25 })
    expect(slow.windSpeed).toBe(-1)
    expect(slow.gasTimePercent).toBeCloseTo(100, 8)
    const fast = compareWithPublished({ windSpeedKmS: 100 })
    expect(fast.gasTimePercent).toBeCloseTo(-50, 8)
  })
  it('the gas time rounds to the paper\'s "3 to 6 years" at 50 km/s and not at 25 or 100 km/s', () => {
    expect(compareWithPublished().gasYearsRounded).toEqual([3, 6])
    expect(compareWithPublished().gasYearsMatchPaper).toBe(true)
    expect(compareWithPublished({ windSpeedKmS: 25 }).gasYearsMatchPaper).toBe(false)
    expect(compareWithPublished({ windSpeedKmS: 100 }).gasYearsMatchPaper).toBe(false)
  })
  it('the published literature figures equal the specification\'s', () => {
    expect(LITERATURE.neutrinoEnergyErg).toEqual([3e53, 5e53])
    expect(LITERATURE.sn1987aEnergyErg).toEqual([2e53, 3e53])
    expect(LITERATURE.explosionEnergyErg).toEqual([0.7e51, 1.2e51])
    expect(LITERATURE.paperGasYears).toEqual([3, 6])
  })
})

describe('the numbers of the worked examples, which the interface only displays (test 14)', () => {
  it('the collapse example: the mass in kilograms, the radius in metres, G M^2 / R and 3/5 of it for a uniform ball', () => {
    const w = collapseWorkedExample(1.4, 12)
    expect(w.massKg).toBeCloseTo(1.4 * MSUN, -20)
    expect(w.radiusM).toBe(12000)
    expect(w.energyJ).toBeCloseTo((G * (1.4 * MSUN) ** 2) / 12000, -35)
    expect(w.energyJ).toBe(collapseEnergyJ(1.4, 12))
    expect(w.uniformBallEnergyJ / w.energyJ).toBeCloseTo(3 / 5, 12)
    expect(() => collapseWorkedExample(0, 12)).toThrow(RangeError)
    expect(() => collapseWorkedExample(1.4, -1)).toThrow(RangeError)
  })
  it('the gas example: the speed in cm a second, the time in seconds and in years, agreeing with the module', () => {
    const w = gasTimeWorkedExample(1e15, 50)
    expect(w.speedCmS).toBe(5e6)
    expect(w.seconds).toBeCloseTo(2e8, 0)
    expect(w.years).toBeCloseTo(1e15 / 5e6 / YEAR, 8)
    expect(w.years).toBeCloseTo(timeBeforeExplosionYears(1e15, 50), 10)
    expect(() => gasTimeWorkedExample(1e15, 0)).toThrow(RangeError)
  })
  it('the distance range is 6.70 to 7.00 Mpc, a give-or-take of 2.2 percent', () => {
    const [near, far] = distanceRangeMpc()
    expect(near).toBeCloseTo(6.7, 10)
    expect(far).toBeCloseTo(7.0, 10)
    expect(distanceUncertaintyPercent()).toBeCloseTo((0.15 / 6.85) * 100, 10)
    expect(SUPERNOVA.distanceUncertaintyMpc).toBe(0.15)
  })
  it('the light-travel journey is about 1,117 times longer than 20 thousand years, 0.0011 times 20 million years, and enormously longer than a few months', () => {
    expect(lightTravelTimesLongerThan('about 20 thousand years')).toBeCloseTo((6.85e6 * 3.26156) / 2e4, 2)
    expect(lightTravelTimesLongerThan('about 20 million years')).toBeCloseTo((6.85e6 * 3.26156) / 2e7, 6)
    expect(lightTravelTimesLongerThan('a few months')).toBeCloseTo((6.85e6 * 3.26156) / 0.25, 0)
  })
  it('over the nine core settings the light is 1 part in about 38,000 to 106,000, found by a separate loop', () => {
    let low = Infinity
    let high = 0
    for (const m of [1.2, 1.4, 2.0]) {
      for (const r of [10, 12, 14]) {
        const oneIn = ((G * (m * MSUN) ** 2) / (r * 1000)) / (1e49 * 1e-7)
        low = Math.min(low, oneIn)
        high = Math.max(high, oneIn)
      }
    }
    const range = lightOneInRangeOverCores()
    expect(range.lowOneIn).toBeCloseTo(low, -1)
    expect(range.highOneIn).toBeCloseTo(high, -1)
    expect(range.lowOneIn).toBeLessThan(runCatchingASupernova().lightOneIn)
    expect(range.highOneIn).toBeGreaterThan(runCatchingASupernova().lightOneIn)
  })
})

describe('the nearest answer is the nearest on a scale of powers of ten (test 15)', () => {
  const answers = [{ oneIn: 2 }, { oneIn: 10 }, { oneIn: 100 }, { oneIn: 10_000 }]
  it('3,000 is nearer to 10,000 by powers of ten, although a plain distance would choose 100', () => {
    // Plain distance would choose 100 (|100 - 3000| = 2900 < |10000 - 3000| = 7000); powers of ten choose 10,000 (0.52 steps against 1.48).
    expect(nearestLog(answers, 3000).oneIn).toBe(10_000)
  })
  it('300 is nearer to 100 by powers of ten (0.48 steps against 1.52), and the answer does not depend on the order of the list', () => {
    expect(nearestLog(answers, 300).oneIn).toBe(100)
    expect(nearestLog([...answers].reverse(), 300).oneIn).toBe(100)
    expect(nearestLog([...answers].reverse(), 3000).oneIn).toBe(10_000)
  })
  it('an exact match is chosen', () => {
    for (const a of answers) expect(nearestLog(answers, a.oneIn).oneIn).toBe(a.oneIn)
  })
})
