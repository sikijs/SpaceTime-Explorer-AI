import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  CHANDRASEKHAR_LIMIT_SOLAR_MASSES,
  compareWithPublished,
  distanceErrorPercent,
  distanceErrorWorkedExample,
  distanceTravelledPc,
  doubleDetonationMass,
  earthRadii,
  EARTH_RADIUS_KM,
  fractionOfLightSpeed,
  fractionOfLimit,
  gapBelowLimit,
  nearestLog,
  nearestPlain,
  runWhiteDwarfExplosion,
  shellGap,
  shellSeparationInUncertainties,
  shellSpeedKmS,
  shellSpeedRangeKmS,
  shellSpeedWorkedExample,
  SIZE_ANSWERS,
  SPEED_OF_LIGHT_KM_S,
  sizeAnswer,
  SPEED_ANSWERS,
  speedAnswer,
  twoAnalysesComparison,
  whereInRange,
  whiteDwarfRadiusKm,
  WHITE_DWARF_EXPLOSION,
} from './whiteDwarfExplosion'
import { whiteDwarfRadiusKm as blackHolesNineRadius } from './blackHoleFormationExperiment'

// Independent figures, worked here from the numbers written out in full (not from the module's code), so a slip in the module shows.
const PARSEC_KM = 3.0856775814913673e13
const YEAR_S = 365.25 * 86400
const SUN_RADIUS_KM = 695700
const radiusByHand = (m: number): number => 0.0131 * SUN_RADIUS_KM * m ** (-1 / 3) * Math.sqrt(1 - (m / 1.44) ** (4 / 3))

describe('a white dwarf and its limit (tests 1 and 2)', () => {
  it('is the Black Holes 9 function, and matches a separate calculation for the five masses', () => {
    for (const m of [0.6, 1.0, 1.055, 1.2, 1.4]) {
      expect(whiteDwarfRadiusKm(m)).toBe(blackHolesNineRadius(m))
      expect(whiteDwarfRadiusKm(m)).toBeCloseTo(radiusByHand(m), 6)
    }
  })
  it('gives about 8,970, 5,660, 5,220, 3,980 and 1,560 km for the five masses', () => {
    expect(whiteDwarfRadiusKm(0.6)).toBeCloseTo(8968, -1)
    expect(whiteDwarfRadiusKm(1.0)).toBeCloseTo(5655, -1)
    expect(whiteDwarfRadiusKm(1.055)).toBeCloseTo(5217, -1)
    expect(whiteDwarfRadiusKm(1.2)).toBeCloseTo(3984, -1)
    expect(whiteDwarfRadiusKm(1.4)).toBeCloseTo(1564, -1)
  })
  it('a heavier white dwarf is smaller, and a mass at or above the limit throws', () => {
    expect(whiteDwarfRadiusKm(1.4)).toBeLessThan(whiteDwarfRadiusKm(1.2))
    expect(whiteDwarfRadiusKm(1.2)).toBeLessThan(whiteDwarfRadiusKm(1.0))
    expect(() => whiteDwarfRadiusKm(1.44)).toThrow(RangeError)
    expect(() => gapBelowLimit(1.44)).toThrow(RangeError)
    expect(() => fractionOfLimit(1.5)).toThrow(RangeError)
  })
  it('the sizes in Earth radii are 1.41, 0.89, 0.82, 0.63 and 0.25', () => {
    expect(earthRadii(whiteDwarfRadiusKm(0.6))).toBeCloseTo(8968 / 6371, 2)
    expect(earthRadii(whiteDwarfRadiusKm(1.0))).toBeCloseTo(0.89, 2)
    expect(earthRadii(whiteDwarfRadiusKm(1.055))).toBeCloseTo(0.82, 2)
    expect(earthRadii(whiteDwarfRadiusKm(1.2))).toBeCloseTo(0.63, 2)
    expect(earthRadii(whiteDwarfRadiusKm(1.4))).toBeCloseTo(0.25, 2)
    expect(EARTH_RADIUS_KM).toBe(6371)
  })
  it('the limit is 1.44, and 1.055 Suns is 0.385 below it, 73.3 percent of it', () => {
    expect(CHANDRASEKHAR_LIMIT_SOLAR_MASSES).toBe(1.44)
    expect(gapBelowLimit(1.055)).toBeCloseTo(0.385, 10)
    expect(fractionOfLimit(1.055)).toBeCloseTo(1.055 / 1.44, 10)
    expect(fractionOfLimit(1.055)).toBeCloseTo(0.733, 3)
  })
})

describe('the double-detonation white dwarf (test 3)', () => {
  it('a core of 1.028 and a shell of 0.027 make 1.055 solar masses, well below the limit', () => {
    expect(doubleDetonationMass(1.028, 0.027)).toBeCloseTo(1.055, 10)
    expect(gapBelowLimit(doubleDetonationMass(1.028, 0.027))).toBeCloseTo(0.385, 10)
  })
  it('the 2026 analysis (a core of 1 and a shell above 0.05) gives at least 1.05, within 1 percent of the simulation', () => {
    const c = twoAnalysesComparison()
    expect(c.simulationSolar).toBeCloseTo(1.055, 10)
    expect(c.analysis2026AtLeastSolar).toBeCloseTo(1.05, 10)
    expect(c.differencePercent).toBeCloseTo(((1.05 - 1.055) / 1.055) * 100, 8)
    expect(Math.abs(c.differencePercent)).toBeLessThan(1)
  })
  it('a non-positive core or shell is refused', () => {
    expect(() => doubleDetonationMass(0, 0.027)).toThrow(RangeError)
    expect(() => doubleDetonationMass(1.028, -0.1)).toThrow(RangeError)
  })
})

describe('the two calcium shells (tests 4 and 5)', () => {
  it('the speeds at 300, 325 and 350 years are 5,639, 5,205 and 4,833 (inner) and 6,714, 6,198 and 5,755 km/s (outer), against a separate calculation', () => {
    for (const [r, t, expected] of [
      [1.73, 300, 5639],
      [1.73, 325, 5205],
      [1.73, 350, 4833],
      [2.06, 300, 6714],
      [2.06, 325, 6198],
      [2.06, 350, 5755],
    ] as const) {
      expect(shellSpeedKmS(r, t)).toBeCloseTo((r * PARSEC_KM) / (t * YEAR_S), 6)
      expect(shellSpeedKmS(r, t)).toBeCloseTo(expected, 0)
    }
  })
  it('the speed halves when the age doubles, and doubles when the radius doubles', () => {
    expect(shellSpeedKmS(1.73, 600) / shellSpeedKmS(1.73, 300)).toBeCloseTo(0.5, 12)
    expect(shellSpeedKmS(3.46, 300) / shellSpeedKmS(1.73, 300)).toBeCloseTo(2, 12)
  })
  it('the gap between the shells is 0.33 pc, 1.08 light-years', () => {
    const g = shellGap(1.73, 2.06)
    expect(g.pc).toBeCloseTo(0.33, 10)
    expect(g.lightYears).toBeCloseTo(0.33 * 3.26156, 8)
    expect(g.lightYears).toBeCloseTo(1.08, 2)
    expect(() => shellGap(2.06, 1.73)).toThrow(RangeError)
  })
  it('the gap is about 3.3 times the combined give-or-take of 0.07 pc on each radius', () => {
    expect(shellSeparationInUncertainties(1.73, 2.06, 0.07)).toBeCloseTo(0.33 / (0.07 * Math.sqrt(2)), 10)
    expect(shellSeparationInUncertainties(1.73, 2.06, 0.07)).toBeCloseTo(3.33, 2)
  })
  it('6,000 km/s is 2 percent of the speed of light', () => {
    expect(fractionOfLightSpeed(6000)).toBeCloseTo(6000 / 299792.458, 10)
    expect(fractionOfLightSpeed(6000)).toBeCloseTo(0.02, 3)
  })
})

describe('brightness and distance (test 6)', () => {
  it('20 percent dimmer gives a distance 11.8 percent too large; 10 percent dimmer 5.4; 10 percent brighter 4.7 too small', () => {
    expect(distanceErrorPercent(-0.2)).toBeCloseTo((1 / Math.sqrt(0.8) - 1) * 100, 10)
    expect(distanceErrorPercent(-0.2)).toBeCloseTo(11.8, 1)
    expect(distanceErrorPercent(-0.1)).toBeCloseTo(5.4, 1)
    expect(distanceErrorPercent(0.1)).toBeCloseTo(-4.7, 1)
    expect(distanceErrorPercent(-0.3)).toBeCloseTo(19.5, 1)
  })
  it('no change gives no error; a quarter of the brightness doubles the distance', () => {
    expect(distanceErrorPercent(0)).toBe(0)
    expect(distanceErrorPercent(-0.75)).toBeCloseTo(100, 8)
  })
  it('a change of -100 percent or less, or a non-number, is refused', () => {
    expect(() => distanceErrorPercent(-1)).toThrow(RangeError)
    expect(() => distanceErrorPercent(-2)).toThrow(RangeError)
    expect(() => distanceErrorPercent(NaN)).toThrow(RangeError)
  })
})

describe('the predictions\' answers (tests 7 and 14)', () => {
  it('Prediction 1\'s answer is "about 1.0 Sun" (nearest to 1.055 on a plain scale)', () => {
    expect(sizeAnswer()).toBe('about 1.0 Sun')
  })
  it('Prediction 2\'s answer is "about 5,000 km/s" at every age in the published range, and by default', () => {
    expect(speedAnswer()).toBe('about 5,000 km/s')
    for (const t of [300, 325, 350]) expect(speedAnswer(t)).toBe('about 5,000 km/s')
  })
  it('the buttons are the three the specification names, in increasing order', () => {
    expect(SIZE_ANSWERS.map((a) => [a.label, a.value])).toEqual([
      ['about 0.5 Suns', 0.5],
      ['about 1.0 Sun', 1.0],
      ['about 1.4 Suns', 1.4],
    ])
    expect(SPEED_ANSWERS.map((a) => [a.label, a.value])).toEqual([
      ['about 50 km/s', 50],
      ['about 5,000 km/s', 5000],
      ['about 300,000 km/s', 300000],
    ])
  })
  it('the nearest-answer helpers separate a log distance from a plain distance', () => {
    const answers = [{ value: 2 }, { value: 10 }, { value: 100 }, { value: 10_000 }]
    // Plain distance would choose 100 for 3,000 (2,900 against 7,000); powers of ten choose 10,000 (0.52 steps against 1.48).
    expect(nearestPlain(answers, 3000).value).toBe(100)
    expect(nearestLog(answers, 3000).value).toBe(10_000)
    expect(nearestLog([...answers].reverse(), 3000).value).toBe(10_000)
    for (const a of answers) {
      expect(nearestLog(answers, a.value).value).toBe(a.value)
      expect(nearestPlain(answers, a.value).value).toBe(a.value)
    }
  })
})

describe('the published data (test 8)', () => {
  it('equals the values in the specification', () => {
    const d = WHITE_DWARF_EXPLOSION
    expect(d.simulationCoreSolar).toBe(1.028)
    expect(d.simulationShellSolar).toBe(0.027)
    expect(d.analysis2026CoreSolar).toBe(1.0)
    expect(d.analysis2026ShellAboveSolar).toBe(0.05)
    expect(d.innerShellPc).toBe(1.73)
    expect(d.outerShellPc).toBe(2.06)
    expect(d.shellUncertaintyPc).toBe(0.07)
    expect(d.ageRangeYears).toEqual([300, 350])
    expect(d.defaultAgeYears).toBe(325)
    expect(d.massChoicesSolar).toEqual([0.6, 1.0, 1.055, 1.2, 1.4])
    expect(d.ageChoicesYears).toEqual([300, 325, 350])
    expect(d.brightnessChoices).toEqual([-0.3, -0.2, -0.1, 0, 0.1])
    expect(d.pictureMassesSolar).toEqual([0.6, 1.0, 1.2, 1.4])
    expect(d.pictureBrightnessChanges).toEqual([-0.1, -0.2, -0.3])
  })
})

describe('out-of-range inputs throw (test 9)', () => {
  it('zero, negative and non-finite values are refused', () => {
    expect(() => earthRadii(0)).toThrow(RangeError)
    expect(() => gapBelowLimit(0)).toThrow(RangeError)
    expect(() => shellSpeedKmS(0, 300)).toThrow(RangeError)
    expect(() => shellSpeedKmS(1.73, -5)).toThrow(RangeError)
    expect(() => shellSpeedKmS(Infinity, 300)).toThrow(RangeError)
    expect(() => fractionOfLightSpeed(0)).toThrow(RangeError)
    expect(() => runWhiteDwarfExplosion({ massSolar: 1.44 })).toThrow(RangeError)
    expect(() => runWhiteDwarfExplosion({ ageYears: 0 })).toThrow(RangeError)
    expect(() => runWhiteDwarfExplosion({ brightnessChange: -1 })).toThrow(RangeError)
  })
})

describe('the module imports only the Black Holes 9 module (test 10)', () => {
  it('has a single import, of blackHoleFormationExperiment', () => {
    const source = readFileSync(new URL('./whiteDwarfExplosion.ts', import.meta.url), 'utf8')
    const imports = source.match(/^import .*$/gm) ?? []
    expect(imports).toHaveLength(1)
    expect(imports[0]).toContain("'./blackHoleFormationExperiment'")
  })
})

describe('the run and the controls (tests 11 and 12)', () => {
  it('with no settings returns the published values', () => {
    const r = runWhiteDwarfExplosion()
    expect(r.massSolar).toBeCloseTo(1.055, 10)
    expect(r.simulationMassSolar).toBeCloseTo(1.055, 10)
    expect(r.radiusKm).toBeCloseTo(radiusByHand(1.055), 6)
    expect(r.gapBelowLimitSolar).toBeCloseTo(0.385, 10)
    expect(r.simulationGapBelowLimitSolar).toBeCloseTo(0.385, 10)
    expect(r.ageYears).toBe(325)
    expect(r.innerShellSpeedKmS).toBeCloseTo(5205, 0)
    expect(r.outerShellSpeedKmS).toBeCloseTo(6198, 0)
    expect(r.shellGapPc).toBeCloseTo(0.33, 10)
    expect(r.shellGapLightYears).toBeCloseTo(1.08, 2)
    expect(r.innerShellLightYears).toBeCloseTo(1.73 * 3.26156, 8)
    expect(r.outerShellLightYears).toBeCloseTo(2.06 * 3.26156, 8)
    expect(r.separationInUncertainties).toBeCloseTo(3.33, 2)
    expect(r.brightnessChange).toBe(0)
    expect(r.distanceErrorPercent).toBe(0)
  })
  it('all five masses agree with a separate calculation, and the age and the brightness do not change the size', () => {
    for (const m of WHITE_DWARF_EXPLOSION.massChoicesSolar) {
      const r = runWhiteDwarfExplosion({ massSolar: m })
      expect(r.radiusKm).toBeCloseTo(radiusByHand(m), 6)
      expect(r.radiusEarths).toBeCloseTo(radiusByHand(m) / 6371, 8)
      expect(r.gapBelowLimitSolar).toBeCloseTo(1.44 - m, 10)
      expect(r.fractionOfLimit).toBeCloseTo(m / 1.44, 10)
      expect(r.outerShellSpeedKmS).toBe(runWhiteDwarfExplosion().outerShellSpeedKmS)
    }
    expect(runWhiteDwarfExplosion({ ageYears: 300, brightnessChange: -0.2 }).radiusKm).toBe(runWhiteDwarfExplosion().radiusKm)
  })
  it('all three ages agree with a separate calculation, and do not change the mass', () => {
    for (const t of WHITE_DWARF_EXPLOSION.ageChoicesYears) {
      const r = runWhiteDwarfExplosion({ ageYears: t })
      expect(r.innerShellSpeedKmS).toBeCloseTo((1.73 * PARSEC_KM) / (t * YEAR_S), 6)
      expect(r.outerShellSpeedKmS).toBeCloseTo((2.06 * PARSEC_KM) / (t * YEAR_S), 6)
      expect(r.outerShellFractionOfLightSpeed).toBeCloseTo(r.outerShellSpeedKmS / 299792.458, 12)
      expect(r.massSolar).toBeCloseTo(1.055, 10)
    }
  })
  it('all five brightness changes agree with a separate calculation, and do not change the shells', () => {
    for (const x of WHITE_DWARF_EXPLOSION.brightnessChoices) {
      const r = runWhiteDwarfExplosion({ brightnessChange: x })
      expect(r.distanceErrorPercent).toBeCloseTo((1 / Math.sqrt(1 + x) - 1) * 100, 10)
      expect(r.outerShellSpeedKmS).toBe(runWhiteDwarfExplosion().outerShellSpeedKmS)
    }
  })
})

describe('the reading guide\'s comparisons (test 13)', () => {
  it('whereInRange: inside, below and above a range, with the factor to the nearest edge', () => {
    expect(whereInRange(5, [3, 8])).toEqual({ verdict: 'inside', factor: 1 })
    expect(whereInRange(1.5, [3, 8])).toEqual({ verdict: 'below', factor: 2 })
    expect(whereInRange(16, [3, 8])).toEqual({ verdict: 'above', factor: 2 })
    expect(whereInRange(3, [3, 8]).verdict).toBe('inside')
    expect(() => whereInRange(0, [3, 8])).toThrow(RangeError)
    expect(() => whereInRange(5, [8, 3])).toThrow(RangeError)
  })
  it('the speeds at the published ages lie inside the speed range given by the two ends of the age range', () => {
    const slow = shellSpeedKmS(2.06, 350)
    const fast = shellSpeedKmS(2.06, 300)
    for (const t of [300, 325, 350]) expect(whereInRange(shellSpeedKmS(2.06, t), [slow, fast]).verdict).toBe('inside')
    expect(whereInRange(shellSpeedKmS(2.06, 290), [slow, fast]).verdict).toBe('above')
    expect(whereInRange(shellSpeedKmS(2.06, 360), [slow, fast]).verdict).toBe('below')
  })
  it('at the published values every comparison says the same', () => {
    const c = compareWithPublished()
    expect(c.mass).toBe(0)
    expect(c.massPercent).toBe(0)
    expect(c.radiusPercent).toBe(0)
    expect(c.age).toBe(0)
    expect(c.outerSpeedPercent).toBe(0)
    expect(c.ageInsidePublishedRange).toBe(true)
    expect(c.brightness).toBe(0)
  })
  it('a heavier white dwarf, an older remnant and a dimmer supernova move the comparisons the right way, against separate calculations', () => {
    const heavy = compareWithPublished({ massSolar: 1.4 })
    expect(heavy.mass).toBe(1)
    expect(heavy.massPercent).toBeCloseTo(((1.4 - 1.055) / 1.055) * 100, 8)
    expect(heavy.radiusPercent).toBeCloseTo(((radiusByHand(1.4) - radiusByHand(1.055)) / radiusByHand(1.055)) * 100, 6)
    expect(heavy.radiusPercent).toBeLessThan(0)
    const old = compareWithPublished({ ageYears: 350 })
    expect(old.age).toBe(1)
    expect(old.outerSpeedPercent).toBeCloseTo(((1 / 350 - 1 / 325) / (1 / 325)) * 100, 8)
    expect(old.outerSpeedPercent).toBeLessThan(0)
    expect(compareWithPublished({ brightnessChange: -0.2 }).brightness).toBe(-1)
  })
  it('an age outside the published 300 to 350 years is flagged', () => {
    expect(compareWithPublished({ ageYears: 300 }).ageInsidePublishedRange).toBe(true)
    expect(compareWithPublished({ ageYears: 350 }).ageInsidePublishedRange).toBe(true)
    expect(compareWithPublished({ ageYears: 299 }).ageInsidePublishedRange).toBe(false)
    expect(compareWithPublished({ ageYears: 351 }).ageInsidePublishedRange).toBe(false)
  })
})

describe('the numbers of the worked examples, which the interface only displays (test 15)', () => {
  it('the shell example: the radius in km, the age in seconds, the speed, and its fraction of the speed of light', () => {
    const w = shellSpeedWorkedExample(2.06, 325)
    expect(w.radiusKm).toBeCloseTo(2.06 * PARSEC_KM, -6)
    expect(w.ageSeconds).toBeCloseTo(325 * YEAR_S, 0)
    expect(w.speedKmS).toBeCloseTo(w.radiusKm / w.ageSeconds, 10)
    expect(w.speedKmS).toBeCloseTo(6198, 0)
    expect(w.fractionOfLight).toBeCloseTo(6198 / 299792.458, 5)
    expect(() => shellSpeedWorkedExample(0, 325)).toThrow(RangeError)
  })
  it('the brightness example for 20 percent dimmer: 0.8 of the light, its square root 0.894, a distance factor of 1.118, 11.8 percent', () => {
    const w = distanceErrorWorkedExample(-0.2)
    expect(w.brightnessFraction).toBeCloseTo(0.8, 12)
    expect(w.squareRoot).toBeCloseTo(Math.sqrt(0.8), 12)
    expect(w.squareRoot).toBeCloseTo(0.894, 3)
    expect(w.distanceFactor).toBeCloseTo(1.118, 3)
    expect(w.distanceFactor).toBeCloseTo(1 / 0.8944, 3)
    expect(w.percent).toBeCloseTo(11.8, 1)
    expect(w.percent).toBeCloseTo((w.distanceFactor - 1) * 100, 10)
    expect(() => distanceErrorWorkedExample(-1)).toThrow(RangeError)
  })
})

describe('the speed range and the percentage below the limit (test 16)', () => {
  it('the outer shell\'s speed runs from 5,755 km/s at 350 years to 6,714 at 300, and the inner shell\'s from 4,833 to 5,639', () => {
    const [slowOuter, fastOuter] = shellSpeedRangeKmS(2.06)
    expect(slowOuter).toBeCloseTo((2.06 * PARSEC_KM) / (350 * YEAR_S), 6)
    expect(fastOuter).toBeCloseTo((2.06 * PARSEC_KM) / (300 * YEAR_S), 6)
    expect(slowOuter).toBeCloseTo(5755, 0)
    expect(fastOuter).toBeCloseTo(6714, 0)
    const [slowInner, fastInner] = shellSpeedRangeKmS(1.73)
    expect(slowInner).toBeCloseTo(4833, 0)
    expect(fastInner).toBeCloseTo(5639, 0)
    expect(slowOuter).toBeLessThan(fastOuter)
  })
  it('the default age lies inside that range, so the default speed lies inside it too', () => {
    const [slow, fast] = shellSpeedRangeKmS(2.06)
    expect(whereInRange(runWhiteDwarfExplosion().outerShellSpeedKmS, [slow, fast]).verdict).toBe('inside')
  })
  it('a white dwarf of 1.055 Suns is 26.7 percent below the limit, and the percentage below plus the fraction of the limit is 100', () => {
    const r = runWhiteDwarfExplosion()
    expect(r.percentBelowLimit).toBeCloseTo(((1.44 - 1.055) / 1.44) * 100, 8)
    expect(r.percentBelowLimit).toBeCloseTo(26.7, 1)
    for (const m of [0.6, 1.0, 1.2, 1.4]) {
      const x = runWhiteDwarfExplosion({ massSolar: m })
      expect(x.percentBelowLimit + x.fractionOfLimit * 100).toBeCloseTo(100, 10)
    }
  })
})

describe('how far a steady speed gets in a number of years (test 17)', () => {
  it('50 km/s for 325 years is about 0.017 parsecs; the speed of light for 325 years is about 99.6 parsecs, which is 325 light-years', () => {
    expect(distanceTravelledPc(50, 325)).toBeCloseTo((50 * 325 * YEAR_S) / PARSEC_KM, 10)
    expect(distanceTravelledPc(50, 325)).toBeCloseTo(0.0166, 3)
    expect(distanceTravelledPc(SPEED_OF_LIGHT_KM_S, 325)).toBeCloseTo(325 / 3.26156, 1)
    expect(distanceTravelledPc(SPEED_OF_LIGHT_KM_S, 325)).toBeCloseTo(99.6, 1)
  })
  it('the outer shell\'s own average speed carries it exactly to its radius, and the distance doubles when the age doubles', () => {
    expect(distanceTravelledPc(shellSpeedKmS(2.06, 325), 325)).toBeCloseTo(2.06, 10)
    expect(distanceTravelledPc(50, 650) / distanceTravelledPc(50, 325)).toBeCloseTo(2, 12)
    expect(() => distanceTravelledPc(0, 325)).toThrow(RangeError)
    expect(() => distanceTravelledPc(50, -1)).toThrow(RangeError)
  })
})

