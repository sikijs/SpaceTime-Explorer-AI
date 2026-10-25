import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  apjlPushErgRange,
  apjlPushOneInRange,
  COUNT_ANSWERS,
  countAnswer,
  countRealOverGuess,
  failedCountOutOf100,
  failedDots,
  failedRange,
  FAILED_SUPERNOVA_DATA,
  fractionCollapsed,
  guessCountBand,
  guessDots,
  guessPushErg,
  guessPushOneIn,
  logScalePosition,
  massPicture,
  nearestLog,
  nearestPlain,
  neutrinoMassLossSolar,
  pushAnswer,
  PUSH_ANSWERS,
  pushMiddleOneIn,
  pushOneIn,
  pushOneInRange,
  remnantMassSolar,
  remnantOutcome,
  remnantOverLimits,
  supernovaSpreadFactor,
  runFailedSupernova,
  thrownOffNeededForNeutronStar,
  timeline,
  weakShockOverSupernova,
} from './failedSupernova'

// Constants written out separately, so the tests do not reuse the module's own numbers.
const G = 6.6743e-11
const C = 299792458
const SUN_KG = 1.98847e30

describe('what stays collapsed (required tests 1 to 3)', () => {
  it('a 5-Sun star that throws off 0.1 Sun keeps 4.9 Suns, 98 percent of the star', () => {
    expect(remnantMassSolar(5, 0.1)).toBeCloseTo(4.9, 12)
    expect(fractionCollapsed(5, 0.1)).toBeCloseTo(0.98, 12)
  })
  it('throwing off more leaves less; throwing off nothing leaves everything', () => {
    expect(remnantMassSolar(5, 0)).toBe(5)
    expect(remnantMassSolar(5, 3)).toBe(2)
    expect(remnantMassSolar(5, 1)).toBeLessThan(remnantMassSolar(5, 0.1))
  })
  it('the remnant of 4.9 Suns is a black hole, 2.0 a neutron star, 2.5 uncertain (Black Holes 9)', () => {
    expect(remnantOutcome(5, 0.1)).toBe('black-hole')
    expect(remnantOutcome(5, 3)).toBe('neutron-star')
    expect(remnantOutcome(5, 2.5)).toBe('uncertain')
    expect(remnantOutcome(5, 1.9)).toBe('black-hole') // 3.1 Suns
    expect(remnantOutcome(5, 2)).toBe('uncertain') // exactly 3.0 Suns is still the uncertain zone
  })
  it('a neutron star remains only if 3.0 Suns or more of the 5 is thrown off', () => {
    expect(thrownOffNeededForNeutronStar(5)).toBe(3)
    expect(remnantOutcome(5, thrownOffNeededForNeutronStar(5))).toBe('neutron-star')
    expect(thrownOffNeededForNeutronStar(1.5)).toBe(0) // a star already that light
  })
  it('4.9 Suns is 1.63 times the sure-black-hole bottom and 2.13 times the top of the 2.2-to-2.3 estimate', () => {
    const o = remnantOverLimits(4.9)
    expect(o.overSureBlackHole).toBeCloseTo(4.9 / 3, 10)
    expect(o.overSureBlackHole).toBeCloseTo(1.63, 2)
    expect(o.overEstimateTop).toBeCloseTo(4.9 / 2.3, 10)
    expect(o.overEstimateTop).toBeCloseTo(2.13, 2)
  })
})

describe('the push compared with an ordinary supernova (required test 4)', () => {
  it('1e47 erg is 1 in 10,000 of 1e51 and 1e48 erg is 1 in 1,000', () => {
    expect(weakShockOverSupernova(1e47)).toBeCloseTo(1e-4, 18)
    expect(weakShockOverSupernova(1e48)).toBeCloseTo(1e-3, 17)
    expect(pushOneIn(1e47)).toBeCloseTo(1e4, 6)
    expect(pushOneIn(1e48)).toBeCloseTo(1e3, 6)
  })
  it('the paper’s range is 1 in 1,000 to 1 in 10,000; the other paper’s is 1 in 10,000 to 1 in 100 million', () => {
    const r = pushOneInRange()
    expect(r.lowOneIn).toBeCloseTo(1e3, 6)
    expect(r.highOneIn).toBeCloseTo(1e4, 6)
    const a = apjlPushOneInRange()
    expect(a.lowOneIn).toBeCloseTo(1e4, 6)
    expect(a.highOneIn).toBeCloseTo(1e8, 0)
  })
  it('a stronger push is a larger share', () => {
    expect(weakShockOverSupernova(1e50)).toBeGreaterThan(weakShockOverSupernova(1e47))
  })
})

describe('how much supernovae differ', () => {
  it('the spread is a factor of 2 either way (Experiment 13’s range of 0.5 to 2 x 1e51 erg), far less than the factor of 100 between the buttons', () => {
    expect(supernovaSpreadFactor()).toBeCloseTo(2, 10)
    expect(FAILED_SUPERNOVA_DATA.supernovaGasErg).toBeCloseTo(1e51, -35)
    expect(supernovaSpreadFactor()).toBeLessThan(PUSH_ANSWERS[1].value / PUSH_ANSWERS[0].value)
    // the middle of the range, on a log scale, is the figure the page uses
    const [low, high] = FAILED_SUPERNOVA_DATA.supernovaGasErgRange
    expect(Math.sqrt(low * high)).toBeCloseTo(FAILED_SUPERNOVA_DATA.supernovaGasErg, -35)
  })
})

describe('the mass the neutrinos carry off (required test 5)', () => {
  it('is about 0.24 Suns, against a separate calculation, and inside the published 0.2 to 0.5', () => {
    const energyJ = (G * (1.4 * SUN_KG) ** 2) / (12 * 1000)
    const separate = energyJ / (C * C) / SUN_KG
    expect(neutrinoMassLossSolar()).toBeCloseTo(separate, 10)
    expect(neutrinoMassLossSolar()).toBeCloseTo(0.24, 2)
    expect(neutrinoMassLossSolar()).toBeGreaterThanOrEqual(0.2)
    expect(neutrinoMassLossSolar()).toBeLessThanOrEqual(0.5)
  })
})

describe('how common (required test 6)', () => {
  it('0.16 is 16 in every 100, with a range of 4 to 39', () => {
    expect(failedCountOutOf100(0.16)).toBeCloseTo(16, 10)
    const r = failedRange()
    expect(r.low).toBeCloseTo(4, 10)
    expect(r.central).toBeCloseTo(16, 10)
    expect(r.high).toBeCloseTo(39, 10)
  })
  it('the range straddles the centre', () => {
    const r = failedRange()
    expect(r.low).toBeLessThan(r.central)
    expect(r.high).toBeGreaterThan(r.central)
  })
})

describe('the timeline (required test 7)', () => {
  it('equals the published marks and is in date order', () => {
    const t = timeline()
    expect(t.map((m) => m.startYear)).toEqual([2012, 2014, 2014, 2016, 2022, 2024])
    expect(t.map((m) => m.label)).toEqual(['2012', '2014 to 2016', 'From 2014', '2016 to 2019', '2022 to 2023', '2024'])
    for (let i = 1; i < t.length; i++) expect(t[i].startYear).toBeGreaterThanOrEqual(t[i - 1].startYear)
    for (const m of t) if (m.endYear !== null) expect(m.endYear).toBeGreaterThan(m.startYear)
  })
  it('the plateau is drawn as 1,000 days from 2014 (2014 + 1000 / 365.25 = 2016.74), the others as the paper’s years', () => {
    const t = timeline()
    expect(t[2].endYear).toBeCloseTo(2014 + 1000 / 365.25, 10)
    expect(t[2].endYear).toBeCloseTo(2016.74, 2)
    expect(t[1].endYear).toBe(2016)
    expect(t[3].endYear).toBe(2019)
    expect(t[4].endYear).toBe(2023)
    expect(t[0].endYear).toBeNull()
    expect(t[5].endYear).toBeNull()
  })
  it('records the published fade numbers', () => {
    const d = FAILED_SUPERNOVA_DATA
    expect(d.jwstFractionOfProgenitor).toBe(0.07)
    expect(d.visibleFadeFactor).toBe(1e4)
    expect(d.ngc6946FractionRange).toEqual([0.1, 0.15])
    expect(d.initialMassSolar).toBe(13)
    expect(d.terminalMassSolar).toBe(5)
    expect(d.envelopeMassSolar).toBe(0.28)
    expect(d.weakShockErgRange).toEqual([1e47, 1e48])
    expect(d.m31DistanceMillionLightYears).toBe(2.5)
    expect(d.ngc6946).toEqual({ massSolar: 25, brightenedYear: 2009, goneYear: 2015 })
  })
})

describe('the predictions (required tests 8 and 9)', () => {
  it('the push answer is "about 1 in 10,000" by the log rule', () => {
    expect(pushMiddleOneIn()).toBeCloseTo(Math.sqrt(1e3 * 1e4), 6)
    expect(pushAnswer()).toBe('about 1 in 10,000')
  })
  it('the count answer is "about 10 to 20"', () => {
    expect(countAnswer()).toBe('about 10 to 20')
  })
  it('the count answer uses plain distance, not powers of ten (a truth of 5 is nearest "fewer than 1", 4.5 away, not "about 10 to 20", 10 away)', () => {
    expect(countAnswer(5)).toBe('fewer than 1')
    expect(countAnswer(40)).toBe('about half')
  })
  it('the log helper and the plain helper give different answers where they should (Experiment 13’s lesson)', () => {
    // A truth of 5: plain distance prefers 0.5 (4.5 away, against 10 away from 15); log distance prefers 15 (0.48 decades, against 1.0 from 0.5).
    expect(nearestPlain(COUNT_ANSWERS, 5).label).toBe('fewer than 1')
    expect(nearestLog(COUNT_ANSWERS, 5).label).toBe('about 10 to 20')
  })
  it('each push button sits at its own energy and its own place on the log scale', () => {
    expect(guessPushOneIn('about the same')).toBe(1)
    expect(guessPushOneIn('about 1 in 100')).toBe(100)
    expect(guessPushOneIn('about 1 in 10,000')).toBe(10000)
    expect(guessPushErg('about the same')).toBeCloseTo(1e51, -35)
    expect(guessPushErg('about 1 in 100')).toBeCloseTo(1e49, -33)
    expect(guessPushErg('about 1 in 10,000')).toBeCloseTo(1e47, -31)
    // Along a log scale from 1e46 to 1e52, the three guesses are spread in order.
    const xs = PUSH_ANSWERS.map((a) => logScalePosition(guessPushErg(a.label), 46, 52))
    expect(xs[0]).toBeGreaterThan(xs[1])
    expect(xs[1]).toBeGreaterThan(xs[2])
    expect(xs[2]).toBeCloseTo(1 / 6, 6)
  })
  it('each count button has its own band, in order, and the real central count lies in the middle one', () => {
    const bands = COUNT_ANSWERS.map((a) => guessCountBand(a.label))
    expect(bands).toEqual([[0, 1], [10, 20], [40, 60]])
    const real = failedRange().central
    expect(real).toBeGreaterThanOrEqual(bands[1][0])
    expect(real).toBeLessThanOrEqual(bands[1][1])
  })
  it('says how many times the real count is larger than a button’s value', () => {
    expect(countRealOverGuess('about 10 to 20')).toBeCloseTo(16 / 15, 10)
    expect(countRealOverGuess('fewer than 1')).toBeCloseTo(32, 10)
    expect(countRealOverGuess('about half')).toBeCloseTo(16 / 50, 10)
  })
  it('logScalePosition places values at the ends and in the middle, and clamps', () => {
    expect(logScalePosition(1e46, 46, 52)).toBe(0)
    expect(logScalePosition(1e52, 46, 52)).toBe(1)
    expect(logScalePosition(1e49, 46, 52)).toBeCloseTo(0.5, 10)
    expect(logScalePosition(1e40, 46, 52)).toBe(0)
    expect(logScalePosition(1e60, 46, 52)).toBe(1)
  })
})

describe('the numbers the pictures use', () => {
  it('the other paper’s wording is 1e43 to 1e47 erg (1e-8 to 1e-4 of 1e51)', () => {
    const [low, high] = apjlPushErgRange()
    expect(low).toBeCloseTo(1e43, -27)
    expect(high).toBeCloseTo(1e47, -31)
  })
  it('the dots are 4, 16 and 39 of 100', () => {
    expect(failedDots()).toEqual({ low: 4, central: 16, high: 39 })
  })
  it('each guess outlines its own dots: fewer than 1 is the first dot only, 10 to 20 is dots 11 to 20, about half is dots 41 to 60', () => {
    expect(guessDots('fewer than 1')).toEqual({ first: 1, last: 1 })
    expect(guessDots('about 10 to 20')).toEqual({ first: 11, last: 20 })
    expect(guessDots('about half')).toEqual({ first: 41, last: 60 })
    expect(() => guessDots('nonsense' as never)).toThrow(RangeError)
  })
  it('the mass picture is the paper’s star against Black Holes 9’s limits', () => {
    const m = massPicture()
    expect(m.initialSolar).toBe(13)
    expect(m.starSolar).toBe(5)
    expect(m.remnantSolar).toBeCloseTo(4.9, 12)
    expect(m.collapsedPercent).toBeCloseTo(98, 10)
    expect(m.thrownOffPercent).toBeCloseTo(2, 10)
    expect(m.neutronStarTopSolar).toBe(2)
    expect(m.estimateLowSolar).toBe(2.2)
    expect(m.estimateHighSolar).toBe(2.3)
    expect(m.blackHoleBottomSolar).toBe(3)
  })
})

describe('the run (required test 12)', () => {
  it('returns the paper’s numbers for the defaults', () => {
    const r = runFailedSupernova()
    expect(r.starSolar).toBe(5)
    expect(r.thrownOffSolar).toBe(0.1)
    expect(r.remnantSolar).toBeCloseTo(4.9, 12)
    expect(r.fractionCollapsed).toBeCloseTo(0.98, 12)
    expect(r.outcome).toBe('black-hole')
    expect(r.failedPerHundred).toBeCloseTo(16, 10)
    expect(r.thrownOffNeededForNeutronStarSolar).toBe(3)
    expect(r.neutrinoMassLossSolar).toBeCloseTo(0.24, 2)
  })
  it('returns every control setting against a separate calculation (five thrown-off masses by three counts)', () => {
    const expectedOutcome = { 0: 'black-hole', 0.1: 'black-hole', 0.28: 'black-hole', 1: 'black-hole', 3: 'neutron-star' } as const
    for (const off of FAILED_SUPERNOVA_DATA.thrownOffChoicesSolar) {
      for (const count of FAILED_SUPERNOVA_DATA.failedPerHundredChoices) {
        const r = runFailedSupernova({ thrownOffSolar: off, failedPerHundred: count })
        expect(r.remnantSolar).toBeCloseTo(5 - off, 12)
        expect(r.fractionCollapsed).toBeCloseTo((5 - off) / 5, 12)
        expect(r.outcome).toBe(expectedOutcome[off])
        expect(r.failedPerHundred).toBe(count)
        expect(r.overLimits.overEstimateTop).toBeCloseTo((5 - off) / 2.3, 12)
      }
    }
  })
  it('returns the percentages, dots, one-in-N and range verdict for each control setting (separate calculation)', () => {
    for (const off of FAILED_SUPERNOVA_DATA.thrownOffChoicesSolar) {
      const r = runFailedSupernova({ thrownOffSolar: off })
      expect(r.collapsedPercent).toBeCloseTo(((5 - off) / 5) * 100, 10)
      expect(r.thrownOffPercent).toBeCloseTo((off / 5) * 100, 10)
      expect(r.collapsedPercent + r.thrownOffPercent).toBeCloseTo(100, 10)
    }
    const expected = { 4: { dots: 4, oneIn: 25 }, 16: { dots: 16, oneIn: 6.25 }, 39: { dots: 39, oneIn: 100 / 39 } } as const
    for (const count of FAILED_SUPERNOVA_DATA.failedPerHundredChoices) {
      const r = runFailedSupernova({ failedPerHundred: count })
      expect(r.filledDots).toBe(expected[count].dots)
      expect(r.oneStarInEvery).toBeCloseTo(expected[count].oneIn, 10)
      expect(r.failedVersusRange).toBe('inside')
    }
    expect(runFailedSupernova({ failedPerHundred: 0 }).oneStarInEvery).toBeNull()
    expect(runFailedSupernova({ failedPerHundred: 0 }).failedVersusRange).toBe('below')
    expect(runFailedSupernova({ failedPerHundred: 3 }).failedVersusRange).toBe('below')
    expect(runFailedSupernova({ failedPerHundred: 50 }).failedVersusRange).toBe('above')
    expect(runFailedSupernova({ failedPerHundred: 15.6 }).filledDots).toBe(16)
  })
})

describe('out-of-range inputs (required test 11)', () => {
  it('throw RangeError', () => {
    expect(() => remnantMassSolar(0, 0)).toThrow(RangeError)
    expect(() => remnantMassSolar(-1, 0)).toThrow(RangeError)
    expect(() => remnantMassSolar(5, -0.1)).toThrow(RangeError)
    expect(() => remnantMassSolar(5, 5)).toThrow(RangeError)
    expect(() => remnantMassSolar(5, 6)).toThrow(RangeError)
    expect(() => remnantOverLimits(0)).toThrow(RangeError)
    expect(() => weakShockOverSupernova(0)).toThrow(RangeError)
    expect(() => thrownOffNeededForNeutronStar(0)).toThrow(RangeError)
    expect(() => failedCountOutOf100(-0.1)).toThrow(RangeError)
    expect(() => failedCountOutOf100(1.1)).toThrow(RangeError)
    expect(() => logScalePosition(0, 0, 1)).toThrow(RangeError)
    expect(() => logScalePosition(1, 1, 1)).toThrow(RangeError)
    expect(() => runFailedSupernova({ thrownOffSolar: 5 })).toThrow(RangeError)
    expect(() => runFailedSupernova({ failedPerHundred: 101 })).toThrow(RangeError)
    expect(() => guessPushOneIn('nonsense' as never)).toThrow(RangeError)
    expect(() => guessCountBand('nonsense' as never)).toThrow(RangeError)
  })
})

describe('imports (required test 10)', () => {
  it('imports only the Black Holes 9 and Experiment 13 modules', () => {
    const source = readFileSync(new URL('./failedSupernova.ts', import.meta.url), 'utf8')
    const imports = [...source.matchAll(/^import\b[^\n]*?['"]([^'"]+)['"]\s*$/gm)].map((m) => m[1])
    expect(imports.sort()).toEqual(['./blackHoleFormationExperiment', './catchingASupernova'])
  })
})
