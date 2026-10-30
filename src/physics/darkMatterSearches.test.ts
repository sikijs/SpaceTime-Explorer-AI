import { describe, it, expect } from 'vitest'
import {
  chanceOfAtLeastOneEvent,
  chanceOfNoEvents,
  countRange,
  EXPECTED_AT_LIMIT,
  expectedEvents,
  globalChance,
  globalEffect,
  globalSigma,
  limitAfter,
  limitAtLiveDays,
  LZ230616,
  LZ_DECEMBER_2025,
  LZ_LIMIT_2025,
  OTHER_BORON8_SIGMAS,
  runDarkMatterSearches,
  SIGMA_LADDER,
  sigmaOfChance,
  TRIES_FOR_LZ_GLOBAL,
  triesForGlobalSigma,
  XENONNT_LIMIT,
  ZERO_EVENT_CHANCE,
} from './darkMatterSearches'
import { oneSidedChance } from './evolvingDarkEnergy'

// Tests for Cosmic Horizons Experiment 6 (docs/experiments/frontier-and-beyond/06-where-is-the-dark-matter.md, "Required Physics Tests").
// The expected values are worked out by hand (logarithms, and the standard normal table: Q(3.4) = 3.369e-4, Q(2.6) = 4.661e-3), so a wrong
// formula in the module cannot make a test pass.

describe('the expected number of events at the limit (test 1)', () => {
  it('is -ln 0.1 = 2.3026, and the chance of seeing none there is 0.100', () => {
    expect(ZERO_EVENT_CHANCE).toBe(0.1)
    expect(EXPECTED_AT_LIMIT).toBeCloseTo(2.302585, 6)
    expect(chanceOfNoEvents(EXPECTED_AT_LIMIT)).toBeCloseTo(0.1, 12)
  })
})

describe('the expected number of events (test 2)', () => {
  it('is 2.3026 at the limit, and ten times weaker with ten times the exposure gives the same (the answer to Prediction 1)', () => {
    expect(expectedEvents(1, 1)).toBeCloseTo(2.302585, 6)
    expect(expectedEvents(0.1, 10)).toBeCloseTo(2.302585, 6)
  })
  it('is 0.23026 for a strength of 0.1 and 23.026 for an exposure of 10', () => {
    expect(expectedEvents(0.1, 1)).toBeCloseTo(0.2302585, 6)
    expect(expectedEvents(1, 10)).toBeCloseTo(23.02585, 5)
  })
  it('is proportional to the strength and to the exposure', () => {
    expect(expectedEvents(3, 5)).toBeCloseTo(15 * expectedEvents(1, 1), 10)
  })
})

describe('Poisson chances (test 3)', () => {
  it('seeing none has chance 1 when nothing is expected, and it falls as more are expected', () => {
    expect(chanceOfNoEvents(0)).toBe(1)
    let previous = 1
    for (const n of [0.1, 0.5, 1, 2.3026, 5, 10]) {
      const chance = chanceOfNoEvents(n)
      expect(chance).toBeLessThan(previous)
      previous = chance
    }
  })
  it('none and at least one add up to 1, and at least one is 0.900 at the limit', () => {
    for (const n of [0, 0.2, 1, 2.3026, 7, 20]) expect(chanceOfNoEvents(n) + chanceOfAtLeastOneEvent(n)).toBeCloseTo(1, 12)
    expect(chanceOfAtLeastOneEvent(EXPECTED_AT_LIMIT)).toBeCloseTo(0.9, 12)
  })
})

describe('how the limit improves with exposure (test 4)', () => {
  it('is 1 / 3.571 = 0.280 with no background and 1 / sqrt(3.571) = 0.529 with a growing background', () => {
    expect(limitAfter(3.571, 'none')).toBeCloseTo(0.28, 3)
    expect(limitAfter(3.571, 'grows')).toBeCloseTo(0.529, 3)
  })
  it('is the same for both rules at an exposure of 1, and smaller with no background for every larger exposure', () => {
    expect(limitAfter(1, 'none')).toBe(1)
    expect(limitAfter(1, 'grows')).toBe(1)
    for (const e of [1.5, 3.571, 10, 100, 1000]) expect(limitAfter(e, 'none')).toBeLessThan(limitAfter(e, 'grows'))
  })
  it('with no background the limit times the exposure is 1', () => {
    for (const e of [2, 7, 50]) expect(limitAfter(e, 'none') * e).toBeCloseTo(1, 12)
  })
})

describe('LZ\'s limit scaled to 1,000 live days (test 5)', () => {
  it('is 6.16e-49 cm2 with no background and 1.164e-48 cm2 with a growing background', () => {
    // 2.2e-48 / (1000 / 280) = 6.16e-49, and 2.2e-48 / sqrt(3.5714) = 2.2e-48 / 1.8898 = 1.1641e-48
    expect(limitAtLiveDays(1000, 'none')).toBeCloseTo(6.16e-49, 51)
    expect(limitAtLiveDays(1000, 'grows')).toBeCloseTo(1.1641e-48, 52)
  })
  it('is LZ\'s own number at 280 live days', () => {
    expect(limitAtLiveDays(280, 'none')).toBeCloseTo(2.2e-48, 55)
    expect(limitAtLiveDays(280, 'grows')).toBeCloseTo(2.2e-48, 55)
  })
})

describe('the inverse of the one-sided chance (test 6)', () => {
  it('returns sigma for sigma = 1, 2, 2.6, 3, 3.4, 4.5 and 5, to three decimals', () => {
    for (const sigma of [1, 2, 2.6, 3, 3.4, 4.5, 5]) expect(sigmaOfChance(oneSidedChance(sigma))).toBeCloseTo(sigma, 3)
  })
  it('is 0 at a chance of one half and falls in sigma as the chance grows', () => {
    expect(sigmaOfChance(0.5)).toBeCloseTo(0, 6)
    expect(sigmaOfChance(0.01)).toBeGreaterThan(sigmaOfChance(0.1))
  })
})

describe('the two chances of the LZ event (test 7)', () => {
  it('3.4 sigma is 3.37e-4 and 2.6 sigma is 4.66e-3 (the standard normal table)', () => {
    expect(oneSidedChance(3.4)).toBeCloseTo(3.369e-4, 7)
    expect(oneSidedChance(2.6)).toBeCloseTo(4.661e-3, 6)
  })
})

describe('local and global significance (test 8)', () => {
  it('with one try the global sigma is the local sigma', () => {
    expect(globalSigma(3.4, 1)).toBeCloseTo(3.4, 3)
    expect(globalChance(3.4, 1)).toBeCloseTo(oneSidedChance(3.4), 12)
  })
  it('falls as the number of tries grows', () => {
    let previous = Infinity
    for (const tries of [1, 2, 5, 10, 14, 20, 50, 100]) {
      const sigma = globalSigma(3.4, tries)
      expect(sigma).toBeLessThan(previous)
      previous = sigma
    }
  })
  it('is 2.6 to one decimal for 14 tries, and 13.9 tries give LZ\'s 2.6 exactly', () => {
    expect(globalSigma(3.4, 14)).toBeCloseTo(2.6, 1)
    // ln(1 - 4.661e-3) / ln(1 - 3.369e-4) = -4.672e-3 / -3.3696e-4 = 13.86
    expect(triesForGlobalSigma(3.4, 2.6)).toBeCloseTo(13.86, 1)
    expect(TRIES_FOR_LZ_GLOBAL).toBeCloseTo(13.86, 1)
  })
  it('is 0 when so many tries make an excess certain (the chance of at least one is above one half)', () => {
    expect(globalChance(0.5, 1)).toBeCloseTo(oneSidedChance(0.5), 12)
    expect(globalSigma(0, 2)).toBe(0)
  })
})

describe('the answers to the two predictions (test 9)', () => {
  it('Prediction 1: ten times weaker and ten times longer is "about 2.3", a weaker strength alone "about 0.23", a longer run alone "about 23"', () => {
    expect(countRange(0.1, 10)).toBe('twoPoint3')
    expect(countRange(0.1, 1)).toBe('point23')
    expect(countRange(1, 10)).toBe('twentyThree')
    expect(countRange(1, 1)).toBe('twoPoint3')
  })
  it('the edges are the middles of the answers on a logarithmic scale (0.73 and 7.3)', () => {
    expect(countRange(0.72 / EXPECTED_AT_LIMIT, 1)).toBe('point23')
    expect(countRange(0.74 / EXPECTED_AT_LIMIT, 1)).toBe('twoPoint3')
    expect(countRange(7.2 / EXPECTED_AT_LIMIT, 1)).toBe('twoPoint3')
    expect(countRange(7.4 / EXPECTED_AT_LIMIT, 1)).toBe('twentyThree')
  })
  it('Prediction 2: the global significance is lower than the local one', () => {
    expect(globalEffect()).toBe('lower')
  })
})

describe('the published values (test 10)', () => {
  it('match the sources in the specification', () => {
    expect(LZ_DECEMBER_2025.liveDays).toBe(417)
    expect(LZ_DECEMBER_2025.massRangeGeV).toEqual({ low: 3, high: 9 })
    expect(LZ_DECEMBER_2025.boron8Sigma).toBe(4.5)
    expect(LZ_DECEMBER_2025.detectorTonnesOfXenon).toBe(10)
    expect(LZ_DECEMBER_2025.plannedLiveDaysBy2028).toBe(1000)
    expect(OTHER_BORON8_SIGMAS).toEqual({ pandaX4T: 2.64, xenonNT: 2.73 })
    expect(LZ_LIMIT_2025).toMatchObject({ crossSectionCm2: 2.2e-48, massGeV: 40, exposureTonneYears: 4.2, liveDays: 280 })
    expect(XENONNT_LIMIT).toMatchObject({ crossSectionCm2: 1.7e-47, massGeV: 30, exposureTonneYears: 3.1 })
    expect(LZ230616).toMatchObject({ energyKeV: 248, statisticalKeV: 23, systematicKeV: 23, exposureTonneYears: 2.84, localSigma: 3.4, globalSigma: 2.6 })
    for (const s of [LZ_DECEMBER_2025.source, LZ_LIMIT_2025.source, XENONNT_LIMIT.source, LZ230616.source]) expect(s.length).toBeGreaterThan(0)
  })
})

describe('the sigma ladder (test 11)', () => {
  it('is in the order the picture draws it: PandaX-4T < XENONnT < LZ for the neutrinos, global < local for the event', () => {
    const sigma = (name: string) => SIGMA_LADDER.find((r) => r.name === name)!.sigma
    expect(sigma('PandaX-4T, boron-8 neutrinos')).toBeLessThan(sigma('XENONnT, boron-8 neutrinos'))
    expect(sigma('XENONnT, boron-8 neutrinos')).toBeLessThan(sigma('LZ, boron-8 neutrinos'))
    expect(sigma('LZ230616, global')).toBeLessThan(sigma('LZ230616, local'))
  })
  it('the labels follow Experiment 2\'s lines: below 3 a hint, 3 to 5 evidence', () => {
    const label = (name: string) => SIGMA_LADDER.find((r) => r.name === name)!.label
    expect(label('PandaX-4T, boron-8 neutrinos')).toBe('hint')
    expect(label('XENONnT, boron-8 neutrinos')).toBe('hint')
    expect(label('LZ, boron-8 neutrinos')).toBe('evidence')
    expect(label('LZ230616, local')).toBe('evidence')
    expect(label('LZ230616, global')).toBe('hint')
    expect(SIGMA_LADDER.every((r) => r.label !== 'discovery')).toBe(true)
  })
})

describe('the learner\'s own search (runDarkMatterSearches)', () => {
  it('gathers the numbers of the first table and the second', () => {
    const r = runDarkMatterSearches(0.1, 10, 'none', 14)
    expect(r.expected).toBeCloseTo(2.302585, 6)
    expect(r.chanceOfNoEvents).toBeCloseTo(0.1, 10)
    expect(r.chanceOfAtLeastOneEvent).toBeCloseTo(0.9, 10)
    expect(r.limitFactor).toBeCloseTo(0.1, 12)
    expect(r.limitCm2).toBeCloseTo(2.2e-49, 52)
    expect(r.globalSigma).toBeCloseTo(2.6, 1)
    expect(r.localChance).toBeCloseTo(3.369e-4, 7)
    expect(r.triesForLzGlobal).toBeCloseTo(13.86, 1)
  })
  it('a growing background gives a larger (weaker) limit than none for the same exposure', () => {
    expect(runDarkMatterSearches(1, 100, 'grows', 1).limitCm2).toBeGreaterThan(runDarkMatterSearches(1, 100, 'none', 1).limitCm2)
  })
})

describe('out-of-range input (test 12)', () => {
  it('throws RangeError', () => {
    expect(() => expectedEvents(0, 1)).toThrow(RangeError)
    expect(() => expectedEvents(1, -2)).toThrow(RangeError)
    expect(() => expectedEvents(NaN, 1)).toThrow(RangeError)
    expect(() => chanceOfNoEvents(-1)).toThrow(RangeError)
    expect(() => limitAfter(0, 'none')).toThrow(RangeError)
    expect(() => limitAfter(2, 'other' as never)).toThrow(RangeError)
    expect(() => limitAtLiveDays(0, 'none')).toThrow(RangeError)
    expect(() => sigmaOfChance(0.6)).toThrow(RangeError)
    expect(() => sigmaOfChance(0)).toThrow(RangeError)
    expect(() => globalSigma(3.4, 0)).toThrow(RangeError)
    expect(() => globalSigma(3.4, 2.5)).toThrow(RangeError)
    expect(() => globalSigma(3.4, 101)).toThrow(RangeError)
    expect(() => triesForGlobalSigma(2.6, 3.4)).toThrow(RangeError)
  })
})

describe('module source (test 13)', () => {
  it('reuses oneSidedChance, chanceOfAtLeastOne and sigmaLabel from evolvingDarkEnergy.ts rather than redefining them', async () => {
    const source = await import('node:fs/promises').then((fs) => fs.readFile(new URL('./darkMatterSearches.ts', import.meta.url), 'utf-8'))
    const importLines = source.split('\n').filter((line) => line.trim().startsWith('import'))
    const reuse = importLines.find((line) => line.includes('evolvingDarkEnergy') && !line.includes('import type'))
    expect(reuse).toBeDefined()
    for (const name of ['oneSidedChance', 'chanceOfAtLeastOne', 'sigmaLabel']) expect(reuse).toContain(name)
    expect(source).not.toMatch(/function oneSidedChance|function chanceOfAtLeastOne\b|function sigmaLabel/)
  })
})
