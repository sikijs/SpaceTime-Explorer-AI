import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  blackHoleRadiusFraction,
  blackHoleRadiusKm,
  clockWorkedExample,
  compactness,
  densityVersusNasa,
  distanceInGiveOrTakes,
  EARTH_SURFACE_GRAVITY_M_S2,
  gravityAnswer,
  GRAVITY_ANSWERS,
  giveOrTakeInterval,
  gravityInEarths,
  intervalOverlap,
  isInsideHorizon,
  ladderEntries,
  meanDensityKgM3,
  nearestLog,
  nearestPlain,
  NEUTRON_STAR_DATA,
  radiusRatio,
  rangeCheck,
  ratioRange,
  runCheckUp,
  runNeutronStarSize,
  sizeAnswer,
  SIZE_ANSWERS,
  sugarCubeKg,
  sugarCubeMillionTonnes,
  surfaceMinutesPerDistantHour,
  sunRadiiOverStarRadius,
  surfaceClockRate,
  surfaceGravity,
} from './neutronStarSize'
import { horizonRadiusKm as blackHolesOneHorizon } from './blackHoleSizeExperiment'
import { exactSlowingFactor } from './timeNearBlackHoleExperiment'
import { whiteDwarfRadiusKm as blackHolesNineRadius } from './blackHoleFormationExperiment'

// Independent figures, worked here from G, c and the Sun's mass written out in full (not from the module's constants), so a slip in the module shows.
const G = 6.6743e-11
const C = 299792458
const SUN_KG = 1.98847e30
const rsKmByHand = (m: number): number => ((2 * G * m * SUN_KG) / (C * C)) / 1000
const gByHand = (m: number, rKm: number): number => (G * m * SUN_KG) / (rKm * 1000) ** 2
const relClose = (actual: number, expected: number, tol = 1e-3): void => expect(Math.abs(actual - expected) / Math.abs(expected)).toBeLessThan(tol)

describe('the black-hole radius and the ratio (tests 1 and 2)', () => {
  it('is Black Holes 1\'s function, and gives 4.19 km for 1.418 Suns and 4.13 km for 1.4', () => {
    expect(blackHoleRadiusKm).toBe(blackHolesOneHorizon)
    relClose(blackHoleRadiusKm(1.418), rsKmByHand(1.418))
    expect(blackHoleRadiusKm(1.418)).toBeCloseTo(4.19, 2)
    expect(blackHoleRadiusKm(1.4)).toBeCloseTo(4.13, 2)
  })
  it('the NICER star is 2.71 times its black-hole radius, a 1.4-Sun star squeezed to 6 km is 1.45 times', () => {
    expect(radiusRatio(1.418, 11.36)).toBeCloseTo(2.71, 2)
    expect(radiusRatio(1.4, 6)).toBeCloseTo(1.45, 2)
    relClose(radiusRatio(1.418, 11.36), 11.36 / rsKmByHand(1.418))
  })
  it('the ratio is 1 or below exactly when the radius is at or below the black-hole radius', () => {
    const rs = blackHoleRadiusKm(1.4)
    expect(radiusRatio(1.4, rs)).toBeCloseTo(1, 12)
    expect(isInsideHorizon(1.4, rs)).toBe(true)
    expect(isInsideHorizon(1.4, rs * 1.0001)).toBe(false)
    expect(isInsideHorizon(1.4, rs * 0.9999)).toBe(true)
  })
})

describe('compactness (test 3)', () => {
  it('is 0.184 for the NICER star, equals 1 / (2 x ratio) and G M / (R c^2) worked by hand', () => {
    expect(compactness(1.418, 11.36)).toBeCloseTo(0.184, 3)
    expect(compactness(1.418, 11.36)).toBeCloseTo(1 / (2 * radiusRatio(1.418, 11.36)), 12)
    relClose(compactness(1.418, 11.36), (G * 1.418 * SUN_KG) / (11360 * C * C))
  })
  it('is 0.5 at the black-hole radius, and doubling the radius halves it', () => {
    expect(compactness(1.4, blackHoleRadiusKm(1.4))).toBeCloseTo(0.5, 12)
    expect(compactness(1.4, 24) / compactness(1.4, 12)).toBeCloseTo(0.5, 12)
  })
})

describe('gravity at the surface (test 4)', () => {
  it('is about 1.46e12 m/s^2 for the NICER star, about 1.49e11 Earths', () => {
    relClose(surfaceGravity(1.418, 11.36), gByHand(1.418, 11.36))
    expect(surfaceGravity(1.418, 11.36) / 1e12).toBeCloseTo(1.458, 2)
    expect(gravityInEarths(1.418, 11.36) / 1e11).toBeCloseTo(1.487, 2)
    expect(gravityInEarths(1.418, 11.36)).toBeCloseTo(surfaceGravity(1.418, 11.36) / EARTH_SURFACE_GRAVITY_M_S2, 3)
  })
  it('doubling the radius divides gravity by 4, and doubling the mass doubles it', () => {
    expect(surfaceGravity(1.4, 12) / surfaceGravity(1.4, 24)).toBeCloseTo(4, 10)
    expect(surfaceGravity(2.8, 12) / surfaceGravity(1.4, 12)).toBeCloseTo(2, 10)
  })
})

describe('the clock on the surface (test 5)', () => {
  it('ticks at 0.795 of a distant clock for the NICER star, and agrees with Black Holes 2\'s exact factor', () => {
    expect(surfaceClockRate(1.418, 11.36)).toBeCloseTo(0.795, 3)
    relClose(surfaceClockRate(1.418, 11.36)!, Math.sqrt(1 - rsKmByHand(1.418) / 11.36))
    expect(surfaceClockRate(1.418, 11.36)!).toBeCloseTo(exactSlowingFactor(radiusRatio(1.418, 11.36)), 12)
  })
  it('tends to 1 for a large radius, and is undefined (null) at or inside the black-hole radius', () => {
    expect(surfaceClockRate(1.4, 1e9)!).toBeGreaterThan(0.999999)
    expect(surfaceClockRate(1.4, blackHoleRadiusKm(1.4))).toBeNull()
    expect(surfaceClockRate(1.4, 3)).toBeNull()
    expect(surfaceClockRate(1.4, 6)!).toBeGreaterThan(0)
    expect(surfaceClockRate(1.4, 6)!).toBeLessThan(surfaceClockRate(1.4, 12)!)
  })
})

describe('density (test 6)', () => {
  it('is about 4.6e17 kg/m^3 for the NICER star, worked by hand', () => {
    const byHand = (1.418 * SUN_KG) / ((4 / 3) * Math.PI * 11360 ** 3)
    relClose(meanDensityKgM3(1.418, 11.36), byHand)
    expect(meanDensityKgM3(1.418, 11.36) / 1e17).toBeCloseTo(4.59, 1)
  })
  it('a sugar cube (1 cm^3) is its density times 1e-6, about 4.6e11 kg, the same order as NASA\'s 1e12', () => {
    expect(sugarCubeKg(1.418, 11.36)).toBeCloseTo(meanDensityKgM3(1.418, 11.36) * 1e-6, 0)
    const ratio = NEUTRON_STAR_DATA.nasaSugarCubeKg / sugarCubeKg(1.418, 11.36)
    expect(ratio).toBeGreaterThan(1)
    expect(ratio).toBeLessThan(10)
  })
  it('density falls as the cube of the radius', () => {
    expect(meanDensityKgM3(1.4, 12) / meanDensityKgM3(1.4, 24)).toBeCloseTo(8, 8)
  })
})

describe('the ladder (Picture 2)', () => {
  const byId = (id: string) => ladderEntries().find((e) => e.id === id)!
  it('has five entries in order, ending at exactly 1 for a black hole', () => {
    expect(ladderEntries().map((e) => e.id)).toEqual(['earth', 'sun', 'white-dwarf', 'neutron-star', 'black-hole'])
    expect(byId('black-hole').ratio).toBeCloseTo(1, 10)
  })
  it('the ratios are about 7e8 (Earth), 2.4e5 (Sun), 1.9e3 (1-Sun white dwarf) and 2.7 (neutron star)', () => {
    relClose(byId('earth').ratio, 6371 / (rsKmByHand(3.003e-6)), 2e-3)
    expect(byId('earth').ratio / 1e8).toBeCloseTo(7.18, 1)
    expect(byId('sun').ratio / 1e5).toBeCloseTo(2.36, 1)
    expect(byId('white-dwarf').ratio / 1e3).toBeCloseTo(1.92, 1)
    expect(byId('neutron-star').ratio).toBeCloseTo(2.71, 2)
  })
  it('the white dwarf entry uses Black Holes 9\'s size, and the ratios fall in order down the ladder', () => {
    expect(byId('white-dwarf').radiusKm).toBe(blackHolesNineRadius(1))
    const ratios = ladderEntries().map((e) => e.ratio)
    for (let i = 1; i < ratios.length; i++) expect(ratios[i]).toBeLessThan(ratios[i - 1])
  })
})

describe('the published data (test 8)', () => {
  it('equal the specification\'s values', () => {
    const d = NEUTRON_STAR_DATA
    expect(d.j0437).toEqual({ massSolar: 1.418, massUncertaintySolar: 0.037, radiusKm: 11.36, radiusPlusKm: 0.95, radiusMinusKm: 0.63 })
    expect([...d.j0614RadiusRangeKm]).toEqual([9.88, 12.77])
    expect(d.nasaDiameterKm).toBe(20)
    expect(d.nasaSugarCubeKg).toBe(1e12)
    expect([...d.maximumMassEstimateRangeSolar]).toEqual([2.2, 2.3])
    expect(d.gw230529Primary).toEqual({ massSolar: 3.6, lowSolar: 2.5, highSolar: 4.5 })
    expect(d.gw230529Secondary).toEqual({ lowSolar: 1.2, highSolar: 2.0 })
    expect([...d.gapRangeSolar]).toEqual([3, 5])
    expect([...d.radiusChoicesKm]).toEqual([6, 8, 10, 11.36, 12.77])
    expect([...d.massChoicesSolar]).toEqual([1.2, 1.4, 1.418, 2.0, 2.3])
  })
  it('J0437\'s radius lies inside J0614\'s range, and J0437\'s own interval (10.73 to 12.31) is inside it too', () => {
    const [lo, hi] = NEUTRON_STAR_DATA.j0614RadiusRangeKm
    const j = NEUTRON_STAR_DATA.j0437
    expect(j.radiusKm >= lo && j.radiusKm <= hi).toBe(true)
    expect(j.radiusKm - j.radiusMinusKm).toBeCloseTo(10.73, 2)
    expect(j.radiusKm + j.radiusPlusKm).toBeCloseTo(12.31, 2)
  })
})

describe('how far from a published value, in give-or-takes (test 9)', () => {
  it('6 km is 5.36 km below 11.36, which is 8.5 times the lower give-or-take of 0.63', () => {
    const r = distanceInGiveOrTakes(6, 11.36, 0.95, 0.63)
    expect(r.direction).toBe('below')
    expect(r.difference).toBeCloseTo(5.36, 10)
    expect(r.giveOrTake).toBe(0.63)
    expect(r.times).toBeCloseTo(5.36 / 0.63, 10)
    expect(r.times).toBeCloseTo(8.51, 2)
  })
  it('a value above the central one uses the upper give-or-take: 12.77 is 1.41 km above, 1.5 times 0.95', () => {
    const r = distanceInGiveOrTakes(12.77, 11.36, 0.95, 0.63)
    expect(r.direction).toBe('above')
    expect(r.giveOrTake).toBe(0.95)
    expect(r.times).toBeCloseTo(1.41 / 0.95, 10)
  })
  it('the same value gives zero, and non-positive give-or-takes throw', () => {
    expect(distanceInGiveOrTakes(11.36, 11.36, 0.95, 0.63)).toMatchObject({ direction: 'same', difference: 0, times: 0 })
    expect(() => distanceInGiveOrTakes(6, 11.36, 0, 0.63)).toThrow(RangeError)
    expect(() => distanceInGiveOrTakes(6, 11.36, 0.95, -1)).toThrow(RangeError)
    expect(() => distanceInGiveOrTakes(NaN, 11.36, 0.95, 0.63)).toThrow(RangeError)
  })
})

describe('the predictions (tests 10 and 14)', () => {
  it('Prediction 1: a 1.4-Sun star squeezed to 6 km is not a black hole (6 km > 4.13 km): "no"', () => {
    expect(sizeAnswer()).toBe('no')
    expect(SIZE_ANSWERS.map((a) => a.label)).toEqual(['yes', 'no'])
    expect(isInsideHorizon(1.4, 4)).toBe(true)
  })
  it('Prediction 2: gravity on a 1.4-Sun, 12-km star is about 1.3e11 Earths: "about 100 billion times"', () => {
    expect(gravityInEarths(1.4, 12) / 1e11).toBeCloseTo(1.316, 2)
    expect(gravityAnswer()).toBe('about 100 billion times')
    expect(GRAVITY_ANSWERS.map((a) => a.value)).toEqual([10, 1e3, 1e11])
  })
  it('the nearest-answer helpers separate a log distance from a plain one', () => {
    const answers = [{ value: 1e4 }, { value: 1e6 }]
    expect(nearestPlain(answers, 4e5).value).toBe(1e4) // plain: 3.9e5 away from 1e4, 6e5 away from 1e6
    expect(nearestLog(answers, 4e5).value).toBe(1e6) // log: 1.6 decades from 1e4, 0.4 from 1e6
    const more = [{ value: 10 }, { value: 100 }]
    expect(nearestPlain(more, 40).value).toBe(10) // plain: 30 away from 10, 60 from 100
    expect(nearestLog(more, 40).value).toBe(100) // log: 0.6 decades from 10, 0.4 from 100
  })
})

describe('the learner\'s choices (tests 12 and 13)', () => {
  it('the defaults are NICER\'s values for J0437, and the radius is zero give-or-takes from NICER\'s', () => {
    const r = runNeutronStarSize()
    expect(r.massSolar).toBe(1.418)
    expect(r.radiusKm).toBe(11.36)
    expect(r.diameterKm).toBeCloseTo(22.72, 10)
    expect(r.ratio).toBeCloseTo(2.71, 2)
    expect(r.insideHorizon).toBe(false)
    expect(r.clockSlowerPercent!).toBeCloseTo(20.5, 1)
    expect(r.radiusFromNicerKm.times).toBe(0)
  })
  it('all 25 combinations of the five radii and the five masses agree with a separate calculation', () => {
    for (const m of NEUTRON_STAR_DATA.massChoicesSolar) {
      for (const rKm of NEUTRON_STAR_DATA.radiusChoicesKm) {
        const r = runNeutronStarSize({ massSolar: m, radiusKm: rKm })
        const ratio = rKm / rsKmByHand(m)
        relClose(r.blackHoleRadiusKm, rsKmByHand(m))
        relClose(r.ratio, ratio)
        relClose(r.compactness, 1 / (2 * ratio))
        relClose(r.surfaceGravityMS2, gByHand(m, rKm))
        relClose(r.gravityInEarths, gByHand(m, rKm) / 9.80665)
        relClose(r.densityKgM3, (m * SUN_KG) / ((4 / 3) * Math.PI * (rKm * 1000) ** 3))
        expect(r.insideHorizon).toBe(ratio <= 1)
        if (ratio > 1) {
          // Black Holes 1's G is a rounded value (its r_s differs from the hand value by 3e-5), and sqrt(1 - 1/ratio) magnifies that near the horizon, so the tolerance grows as
          // the ratio nears 1 (2.0 Suns at 6 km has a ratio of 1.016). The module's own factor is checked tightly against its own ratio.
          const tol = 1e-4 + 1e-4 / (ratio - 1)
          relClose(r.clockRate!, Math.sqrt(1 - 1 / ratio), tol)
          relClose(r.clockSlowerPercent!, (1 - Math.sqrt(1 - 1 / ratio)) * 100, tol)
          expect(r.clockRate! ** 2).toBeCloseTo(1 - 1 / r.ratio, 12)
        } else {
          expect(r.clockRate).toBeNull()
          expect(r.clockSlowerPercent).toBeNull()
        }
      }
    }
  })
  it('6 km with 2.3 Suns is inside its own black-hole radius (6.79 km), and 6 km with 2.0 Suns is not (5.91 km)', () => {
    expect(runNeutronStarSize({ massSolar: 2.3, radiusKm: 6 }).insideHorizon).toBe(true)
    expect(runNeutronStarSize({ massSolar: 2.3, radiusKm: 6 }).clockRate).toBeNull()
    expect(runNeutronStarSize({ massSolar: 2.0, radiusKm: 6 }).insideHorizon).toBe(false)
  })
})

describe('the intervals and the Sun comparison used by the pictures', () => {
  it('J0437\'s radius covers 10.73 to 12.31 km, and GW230529\'s ranges are the paper\'s 2.5 to 4.5 and 1.2 to 2.0 Suns (the latter matches the LIGO summary\'s 90 percent range)', () => {
    const d = NEUTRON_STAR_DATA
    const [rLo, rHi] = giveOrTakeInterval(d.j0437.radiusKm, d.j0437.radiusPlusKm, d.j0437.radiusMinusKm)
    expect(rLo).toBeCloseTo(10.73, 10)
    expect(rHi).toBeCloseTo(12.31, 10)
    // GW230529's two ranges are the paper's own 90 percent ranges (arXiv:2404.04248), not worked out from a plus and a minus.
    expect([d.gw230529Primary.lowSolar, d.gw230529Primary.highSolar]).toEqual([2.5, 4.5])
    expect([d.gw230529Secondary.lowSolar, d.gw230529Secondary.highSolar]).toEqual([1.2, 2.0])
    expect(d.gw230529Primary.massSolar).toBeGreaterThan(d.gw230529Primary.lowSolar)
    expect(d.gw230529Primary.massSolar).toBeLessThan(d.gw230529Primary.highSolar)
  })
  it('the interval is wider on the side of the larger give-or-take, and non-positive give-or-takes throw', () => {
    const [lo, hi] = giveOrTakeInterval(10, 3, 1)
    expect(10 - lo).toBe(1)
    expect(hi - 10).toBe(3)
    expect(() => giveOrTakeInterval(10, 0, 1)).toThrow(RangeError)
    expect(() => giveOrTakeInterval(10, 1, -1)).toThrow(RangeError)
    expect(() => giveOrTakeInterval(NaN, 1, 1)).toThrow(RangeError)
  })
  it('the Sun is about 61,200 times wider (in radius) than an 11.36 km neutron star, and the ratio halves when the star\'s radius doubles', () => {
    expect(sunRadiiOverStarRadius(11.36)).toBeCloseTo(695700 / 11.36, 8)
    expect(sunRadiiOverStarRadius(11.36)).toBeCloseTo(61241, 0)
    expect(sunRadiiOverStarRadius(11.36) / sunRadiiOverStarRadius(22.72)).toBeCloseTo(2, 12)
    expect(() => sunRadiiOverStarRadius(0)).toThrow(RangeError)
  })
})

describe('the reading guide\'s comparisons (CLAUDE.md §14)', () => {
  it('rangeCheck says inside, below or above a range, with the distance to the nearest edge', () => {
    expect(rangeCheck(10, 10.73, 12.31)).toMatchObject({ verdict: 'below' })
    expect(rangeCheck(10, 10.73, 12.31).distance).toBeCloseTo(0.73, 10)
    expect(rangeCheck(12, 10.73, 12.31)).toEqual({ verdict: 'inside', distance: 0 })
    expect(rangeCheck(10.73, 10.73, 12.31).verdict).toBe('inside') // the edges are inside
    expect(rangeCheck(12.31, 10.73, 12.31).verdict).toBe('inside')
    expect(rangeCheck(2.5, 2.2, 2.3)).toMatchObject({ verdict: 'above' })
    expect(rangeCheck(2.5, 2.2, 2.3).distance).toBeCloseTo(0.2, 10)
    expect(() => rangeCheck(1, 3, 2)).toThrow(RangeError)
    expect(() => rangeCheck(NaN, 1, 2)).toThrow(RangeError)
  })
  it('intervalOverlap gives how much of an interval lies inside a range: 2.5 to 4.5 against the 3 to 5 gap is 1.5 of 2.0, 75 percent', () => {
    const o = intervalOverlap(2.5, 4.5, 3, 5)
    expect(o.overlap).toBeCloseTo(1.5, 10)
    expect(o.width).toBeCloseTo(2.0, 10)
    expect(o.fraction).toBeCloseTo(0.75, 10)
    expect(intervalOverlap(1, 2, 3, 5)).toEqual({ overlap: 0, width: 1, fraction: 0 }) // no overlap
    expect(intervalOverlap(3.5, 4, 3, 5).fraction).toBe(1) // wholly inside
    expect(() => intervalOverlap(4, 4, 3, 5)).toThrow(RangeError)
    expect(() => intervalOverlap(NaN, 4, 3, 5)).toThrow(RangeError)
  })
  it('densityVersusNasa: a sugar cube of the NICER star is 4.6e11 kg, and NASA\'s round 1e12 is 2.18 times that', () => {
    const d = densityVersusNasa(1.418, 11.36)
    expect(d.ourKg / 1e11).toBeCloseTo(4.59, 1)
    expect(d.nasaKg).toBe(1e12)
    expect(d.nasaOverOurs).toBeCloseTo(1e12 / d.ourKg, 10)
    expect(d.nasaOverOurs).toBeCloseTo(2.18, 2)
  })
  it('clockWorkedExample gives each step: ratio 2.71, r_s / R 0.369, 1 minus that 0.631, square root 0.795; null at or inside the black-hole radius', () => {
    const w = clockWorkedExample(1.418, 11.36)!
    expect(w.ratio).toBeCloseTo(2.71, 2)
    expect(w.blackHoleOverRadius).toBeCloseTo(0.369, 3)
    expect(w.oneMinus).toBeCloseTo(0.631, 3)
    expect(w.rate).toBeCloseTo(0.795, 3)
    expect(w.rate).toBeCloseTo(surfaceClockRate(1.418, 11.36)!, 12)
    expect(w.blackHoleOverRadius + w.oneMinus).toBeCloseTo(1, 12)
    expect(clockWorkedExample(1.4, blackHoleRadiusKm(1.4))).toBeNull()
    expect(clockWorkedExample(2.3, 6)).toBeNull()
  })
  it('runCheckUp compares the NICER star with each reference, each against a hand calculation', () => {
    const c = runCheckUp()
    expect(c.nasaRadiusKm).toBe(10) // NASA\'s "about 20 km across", halved
    expect(c.nasaRadiusVersusNicer.verdict).toBe('below')
    expect(c.nasaRadiusVersusNicer.distance).toBeCloseTo(10.73 - 10, 10)
    expect(c.nasaRadiusInGiveOrTakes.times).toBeCloseTo((11.36 - 10) / 0.63, 10)
    expect(c.roundRadiusVersusNicer.verdict).toBe('inside') // Black Holes 1\'s round 12 km
    expect(c.nicerRadiusVersusJ0614.verdict).toBe('inside')
    expect(c.massVersusEstimate.verdict).toBe('below')
    expect(c.massVersusEstimate.distance).toBeCloseTo(2.2 - 1.418, 10)
    expect(c.gwHeavierInterval).toEqual([2.5, 4.5])
    expect(c.gwHeavierVersusGap.fraction).toBeCloseTo(0.75, 10)
    expect(c.gwHeavierVersusEstimate.verdict).toBe('above')
    expect(c.gwHeavierVersusEstimate.distance).toBeCloseTo(2.5 - 2.3, 10)
    expect(c.density.nasaOverOurs).toBeCloseTo(2.18, 2)
  })
})

describe('the display helpers (so the page does no physics arithmetic)', () => {
  it('blackHoleRadiusFraction is 1 / ratio: 0.369 for the NICER star, and it is the compactness divided by 0.5', () => {
    expect(blackHoleRadiusFraction(1.418, 11.36)).toBeCloseTo(0.369, 3)
    expect(blackHoleRadiusFraction(1.418, 11.36)).toBeCloseTo(compactness(1.418, 11.36) / 0.5, 12)
    expect(blackHoleRadiusFraction(1.4, blackHoleRadiusKm(1.4))).toBeCloseTo(1, 12)
  })
  it('ratioRange gives the ratio at both ends of a radius range: 10.73 and 12.31 km give 2.56 and 2.94 for 1.418 Suns', () => {
    const [lo, hi] = ratioRange(1.418, 10.73, 12.31)
    expect(lo).toBeCloseTo(10.73 / rsKmByHand(1.418), 3)
    expect(hi).toBeCloseTo(12.31 / rsKmByHand(1.418), 3)
    expect(lo).toBeCloseTo(2.56, 2)
    expect(hi).toBeCloseTo(2.94, 2)
    expect(() => ratioRange(1.418, 12, 10)).toThrow(RangeError)
    expect(() => ratioRange(1.418, 0, 10)).toThrow(RangeError)
  })
  it('a sugar cube of the NICER star is about 459 million tonnes, and 60 minutes of a distant clock are 47.7 minutes on the surface', () => {
    expect(sugarCubeMillionTonnes(1.418, 11.36)).toBeCloseTo(sugarCubeKg(1.418, 11.36) / 1e9, 10)
    expect(sugarCubeMillionTonnes(1.418, 11.36)).toBeCloseTo(459, 0)
    expect(surfaceMinutesPerDistantHour(1.418, 11.36)!).toBeCloseTo(60 * 0.795, 0)
    expect(surfaceMinutesPerDistantHour(1.418, 11.36)!).toBeCloseTo(47.7, 1)
    expect(surfaceMinutesPerDistantHour(1.4, 3)).toBeNull()
  })
})

describe('out-of-range inputs and imports (tests 11 and 12)', () => {
  it('a non-positive or non-finite mass or radius throws RangeError', () => {
    for (const bad of [0, -1, NaN, Infinity]) {
      expect(() => radiusRatio(bad, 12)).toThrow(RangeError)
      expect(() => radiusRatio(1.4, bad)).toThrow(RangeError)
      expect(() => surfaceGravity(bad, 12)).toThrow(RangeError)
      expect(() => meanDensityKgM3(1.4, bad)).toThrow(RangeError)
      expect(() => runNeutronStarSize({ massSolar: bad })).toThrow(RangeError)
      expect(() => runNeutronStarSize({ radiusKm: bad })).toThrow(RangeError)
    }
  })
  it('imports only the Black Holes 1 and 9 modules', () => {
    const source = readFileSync(new URL('./neutronStarSize.ts', import.meta.url), 'utf8')
    const imports = source.match(/^import .*$/gm) ?? []
    expect(imports.length).toBe(2)
    expect(imports.some((l) => l.includes("'./blackHoleSizeExperiment'"))).toBe(true)
    expect(imports.some((l) => l.includes("'./blackHoleFormationExperiment'"))).toBe(true)
  })
})
