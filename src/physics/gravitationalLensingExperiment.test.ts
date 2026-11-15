import { describe, expect, it } from 'vitest'
import {
  LENS_DISTANCE_MPC,
  LENS_TO_SOURCE_DISTANCE_MPC,
  MAX_LENS_MASS_SOLAR_MASSES,
  MIN_LENS_MASS_SOLAR_MASSES,
  OBSERVED_RING_ARCSECONDS,
  OBSERVED_TOTAL_MASS_SOLAR_MASSES,
  SOURCE_DISTANCE_MPC,
  VISIBLE_MASS_FRACTION,
  FOUR_TIMES_MASS_FACTOR,
  GUESS_ARROW_LENGTH_ARCSECONDS,
  PUBLISHED_BROADHURST,
  actualFourTimes,
  actualRingSize,
  bendingAngleArcseconds,
  checkUp,
  coinDistanceKm,
  einsteinRingArcseconds,
  fourTimesGuessMark,
  fourTimesGuessMatches,
  fourTimesRingMultiple,
  imaginedFourTimes,
  markFourTimesGuess,
  markRingSizeGuess,
  observedBendArcseconds,
  percentDifference,
  readingAgainst,
  ringComparisonExample,
  ringFormulaExample,
  ringSizeGuessMarker,
  ringSizeGuessMatches,
  visibleOnlyMassSolarMasses,
  visibleOnlyRingArcseconds,
  workedOutVisibleShare,
  yourComparison,
  gravitationalLengthKm,
  massInsideRingSolarMasses,
  runGravitationalLensingExperiment,
} from './gravitationalLensingExperiment'

// Independent check, using literal textbook values rather than the module's imported constants.
const GM_OVER_C2_KM_PER_SOLAR_MASS = 1.4766250385
const MPC_KM = 3.0856775814913673e19
const ARCSEC_PER_RAD = 206264.80624709636
function independentRingArcseconds(mass: number): number {
  const fourGmMpc = (4 * GM_OVER_C2_KM_PER_SOLAR_MASS * mass) / MPC_KM
  return (
    Math.sqrt((fourGmMpc * LENS_TO_SOURCE_DISTANCE_MPC) / (LENS_DISTANCE_MPC * SOURCE_DISTANCE_MPC)) *
    ARCSEC_PER_RAD
  )
}

const relativeError = (a: number, b: number) => Math.abs(a - b) / Math.abs(b)

describe('einsteinRingArcseconds', () => {
  it('matches the formula computed independently, for several masses', () => {
    for (const mass of [1e13, 3e13, 1e14, 2e14, 4e14]) {
      expect(relativeError(einsteinRingArcseconds(mass), independentRingArcseconds(mass))).toBeLessThan(1e-5)
    }
  })

  it('matches the specification table', () => {
    const table: Array<[number, number]> = [
      [1e13, 10.5],
      [3e13, 18.2],
      [1e14, 33.2],
      [2e14, 47.0],
      [4e14, 66.5],
    ]
    for (const [mass, ring] of table) {
      expect(relativeError(einsteinRingArcseconds(mass), ring)).toBeLessThan(0.01)
    }
  })

  it('grows as the square root of the mass', () => {
    const base = einsteinRingArcseconds(5e13)
    expect(einsteinRingArcseconds(4 * 5e13) / base).toBeCloseTo(2, 10)
    expect(einsteinRingArcseconds(9 * 5e13) / base).toBeCloseTo(3, 10)
  })

  it('increases strictly with mass across the allowed range', () => {
    let previous = 0
    for (const point of runGravitationalLensingExperiment(1e14).curve) {
      expect(point.ringArcseconds).toBeGreaterThan(previous)
      previous = point.ringArcseconds
    }
  })
})

describe('gravitationalLengthKm', () => {
  it('is within 0.1% of the standard value of about 1.4766 km per solar mass', () => {
    expect(relativeError(gravitationalLengthKm(1), GM_OVER_C2_KM_PER_SOLAR_MASS)).toBeLessThan(1e-3)
  })
})

describe('bendingAngleArcseconds', () => {
  it("at the ring's edge equals theta x D_s / D_ls (the lens-equation identity)", () => {
    for (const mass of [1e13, 1e14, 4e14]) {
      const result = runGravitationalLensingExperiment(mass)
      const expected = (result.ringArcseconds * SOURCE_DISTANCE_MPC) / LENS_TO_SOURCE_DISTANCE_MPC
      expect(relativeError(bendingAngleArcseconds(mass, result.ringRadiusKm), expected)).toBeLessThan(1e-9)
      expect(relativeError(result.bendingAngleArcseconds, expected)).toBeLessThan(1e-9)
    }
  })

  it('falls as the light passes farther from the mass', () => {
    expect(bendingAngleArcseconds(1e14, 2e19)).toBeLessThan(bendingAngleArcseconds(1e14, 1e19))
  })
})

describe('massInsideRingSolarMasses', () => {
  it('inverts einsteinRingArcseconds', () => {
    for (const mass of [1e13, 7e13, 2e14, 4e14]) {
      expect(relativeError(massInsideRingSolarMasses(einsteinRingArcseconds(mass)), mass)).toBeLessThan(1e-9)
    }
  })

  it('gives about 2.0e14 solar masses for the observed 47-arcsecond ring', () => {
    expect(
      relativeError(massInsideRingSolarMasses(OBSERVED_RING_ARCSECONDS), OBSERVED_TOTAL_MASS_SOLAR_MASSES),
    ).toBeLessThan(0.05)
  })
})

describe('runGravitationalLensingExperiment', () => {
  it('makes the visible-only ring smaller than the observed ring by the square root of the mass ratio', () => {
    const result = runGravitationalLensingExperiment(OBSERVED_TOTAL_MASS_SOLAR_MASSES)
    expect(result.visibleOnlyRingArcseconds).toBeLessThan(result.observedRingArcseconds)
    expect(result.ringOverVisibleOnlyRing).toBeCloseTo(Math.sqrt(1 / VISIBLE_MASS_FRACTION), 10)
    expect(result.ringOverVisibleOnlyRing).toBeGreaterThan(2.5)
    expect(result.ringOverVisibleOnlyRing).toBeLessThan(2.7)
  })

  it('has a curve spanning the allowed mass range', () => {
    const { curve } = runGravitationalLensingExperiment(1e14)
    expect(curve[0].massSolarMasses).toBeCloseTo(MIN_LENS_MASS_SOLAR_MASSES, 3)
    expect(curve[curve.length - 1].massSolarMasses / MAX_LENS_MASS_SOLAR_MASSES).toBeCloseTo(1, 10)
  })
})

describe('module independence', () => {
  it('imports from the earlier experiments rather than redefining, and from none of the others', async () => {
    const source = await import('node:fs/promises').then((fs) =>
      fs.readFile(new URL('./gravitationalLensingExperiment.ts', import.meta.url), 'utf-8'),
    )
    const importLines = source.split('\n').filter((line: string) => line.trim().startsWith('import'))
    const from = (name: string) => importLines.filter((line: string) => line.includes(name)).join(' ')
    expect(from('hubblesLawExperiment')).toContain('REAL_SPEED_OF_LIGHT_KM_PER_S')
    expect(from('bigBangExperiment')).toContain('MPC_TO_KM')
    expect(from('darkMatterExperiment')).toContain('GRAVITATIONAL_CONSTANT_KPC_KMS2_PER_SOLAR_MASS')
    expect(from('darkMatterExperiment')).toContain('KM_PER_KPC')
    for (const name of [
      'lightBendingExperiment',
      'darkEnergyExperiment',
      'universeAgeExperiment',
      'cosmicMicrowaveBackgroundExperiment',
    ]) {
      expect(importLines.some((line: string) => line.includes(name))).toBe(false)
    }
  })
})


describe('the visible-only ring (audit, 2026-11-15)', () => {
  it('is 15 percent of the observed mass and a ring of 18.2 arcseconds', () => {
    expect(visibleOnlyMassSolarMasses()).toBeCloseTo(3e13, -9)
    expect(visibleOnlyRingArcseconds()).toBeCloseTo(18.2, 1)
  })
})

describe('what the model gives for the two guesses', () => {
  it('more mass gives a larger ring, and four times the mass gives a ring exactly twice as wide', () => {
    expect(actualRingSize()).toBe('larger')
    expect(fourTimesRingMultiple()).toBeCloseTo(2, 12)
    expect(actualFourTimes()).toBe('two')
  })
  it('matches only the right answer', () => {
    expect(ringSizeGuessMatches('larger')).toBe(true)
    expect(ringSizeGuessMatches('same')).toBe(false)
    expect(ringSizeGuessMatches('smaller')).toBe(false)
    expect(fourTimesGuessMatches('two')).toBe(true)
    expect(fourTimesGuessMatches('four')).toBe(false)
    expect(fourTimesGuessMatches('same')).toBe(false)
  })
  it('marking carries the numbers the tutor quotes', () => {
    const first = markRingSizeGuess('smaller')
    expect(first.matches).toBe(false)
    expect(first.visibleRingArcseconds).toBeCloseTo(18.2, 1)
    expect(first.observedRingArcseconds).toBeCloseTo(47.0, 1)
    const second = markFourTimesGuess('two')
    expect(second.matches).toBe(true)
    expect(second.fourTimesRingArcseconds).toBeCloseTo(36.4, 1)
    expect(second.multiple).toBeCloseTo(2, 12)
  })
})

describe('the white guess marks', () => {
  it('guess 1 starts on the visible-only ring and follows the guess, with a fixed arrow length', () => {
    const larger = ringSizeGuessMarker('larger')
    const smaller = ringSizeGuessMarker('smaller')
    const same = ringSizeGuessMarker('same')
    expect(larger.fromArcseconds).toBeCloseTo(visibleOnlyRingArcseconds(), 12)
    expect(larger.kind).toBe('out')
    expect(larger.toArcseconds - larger.fromArcseconds).toBeCloseTo(GUESS_ARROW_LENGTH_ARCSECONDS, 12)
    expect(smaller.kind).toBe('in')
    expect(smaller.toArcseconds).toBeLessThan(smaller.fromArcseconds)
    expect(same.kind).toBe('ring')
    expect(same.toArcseconds).toBe(same.fromArcseconds)
  })
  it('guess 2 is a ring at 4, 2 or 1 times the visible-only ring and a point at four times the visible mass', () => {
    const four = fourTimesGuessMark('four')
    const two = fourTimesGuessMark('two')
    const same = fourTimesGuessMark('same')
    expect(four.ringArcseconds).toBeCloseTo(72.9, 1)
    expect(two.ringArcseconds).toBeCloseTo(36.4, 1)
    expect(same.ringArcseconds).toBeCloseTo(18.2, 1)
    for (const m of [four, two, same]) expect(m.massSolarMasses).toBeCloseTo(FOUR_TIMES_MASS_FACTOR * 3e13, -9)
  })
  it('the imagined ring is the real counterpart: on the curve, at 36.4 arcseconds', () => {
    const imagined = imaginedFourTimes()
    expect(imagined.ringArcseconds).toBeCloseTo(36.4, 1)
    expect(imagined.ringArcseconds).toBeCloseTo(einsteinRingArcseconds(imagined.massSolarMasses), 12)
    expect(imagined.massSolarMasses).toBeCloseTo(1.2e14, -9)
  })
})

describe('readingAgainst and percentDifference', () => {
  it('says the same only inside the uncertainty, otherwise less or more', () => {
    expect(readingAgainst(5, 5)).toBe('the same')
    expect(readingAgainst(4, 5)).toBe('less')
    expect(readingAgainst(6, 5)).toBe('more')
    expect(readingAgainst(5.01, 5, 0.02)).toBe('the same')
    expect(percentDifference(110, 100)).toBeCloseTo(10, 9)
  })
})

describe('the visible share worked out from two papers', () => {
  it('gives about 15.7 percent for the universe and about 14.6 for big clusters', () => {
    const share = workedOutVisibleShare()
    expect(share.universalPercent).toBeCloseTo(15.65, 1)
    expect(share.clusterPercent).toBeCloseTo(14.56, 1)
    expect(share.clusterPercent).toBeCloseTo(share.universalPercent * 0.93, 9)
  })
})

describe('the check-up (Table 1)', () => {
  const rows = checkUp()
  const row = (id: string) => rows.find((r) => r.id === id)!
  it('has rows a to d', () => {
    expect(rows.map((r) => r.id)).toEqual(['a', 'b', 'c', 'd'])
  })
  it('(a) the visible-only ring is 28.8 arcseconds less than the observed ring', () => {
    expect(row('a').thisPage).toBeCloseTo(18.2, 1)
    expect(row('a').beside).toBe(OBSERVED_RING_ARCSECONDS)
    expect(row('a').difference).toBeCloseTo(-28.8, 1)
    expect(row('a').reading).toBe('less')
  })
  it('(b) the mass inside the observed ring is 2.0e14 and has no outside value', () => {
    expect(relativeError(row('b').thisPage, 2.0e14)).toBeLessThan(0.01)
    expect(row('b').beside).toBeNull()
    expect(row('b').reading).toBe('calculated here only')
  })
  it('(c) the page 15 percent is a little more than the worked-out 14.6', () => {
    expect(row('c').thisPage).toBe(15)
    expect(row('c').beside).toBeCloseTo(14.56, 1)
    expect(row('c').difference).toBeCloseTo(0.44, 1)
    expect(row('c').reading).toBe('more')
  })
  it('(d) four times the visible mass gives exactly double the visible-only ring and is calculated here only', () => {
    expect(row('d').thisPage / row('d').beside!).toBeCloseTo(2, 12)
    expect(row('d').reading).toBe('calculated here only')
  })
  it('does not depend on the learner: every call is the same', () => {
    expect(checkUp()).toEqual(rows)
  })
})

describe('yourComparison (Table 2 and "What your numbers show")', () => {
  it('the visible-only mass: less than the observed ring by 28.8 and equal to the visible ring', () => {
    const c = yourComparison(visibleOnlyMassSolarMasses())
    expect(c.ringArcseconds).toBeCloseTo(18.2, 1)
    expect(c.ringOverVisibleRing).toBeCloseTo(1, 12)
    expect(c.againstObserved.reading).toBe('less')
    expect(c.againstObserved.differenceArcseconds).toBeCloseTo(-28.8, 1)
    expect(c.againstBroadhurst.differenceArcseconds).toBeCloseTo(18.2 - PUBLISHED_BROADHURST.einsteinRadiusArcseconds, 1)
  })
  it('the observed total: about 2.58 times the visible ring, 6.67 times the visible mass', () => {
    const c = yourComparison(OBSERVED_TOTAL_MASS_SOLAR_MASSES)
    expect(c.ringOverVisibleRing).toBeCloseTo(2.58, 2)
    expect(c.massOverVisibleMass).toBeCloseTo(6.667, 2)
    expect(c.againstBroadhurst.reading).toBe('less')
  })
  it('the maximum mass: more than the observed ring', () => {
    expect(yourComparison(MAX_LENS_MASS_SOLAR_MASSES).againstObserved.reading).toBe('more')
  })
})

describe('worked examples', () => {
  it('a 1 cm coin looks one arcsecond wide from about 2.06 km', () => {
    expect(coinDistanceKm(1)).toBeCloseTo(2.063, 2)
  })
  it('the two real rings: 18.2 and 47.0, 28.8 apart, 6.66 times the mass', () => {
    const e = ringComparisonExample()
    expect(e.differenceArcseconds).toBeCloseTo(28.8, 1)
    expect(e.ratio).toBeCloseTo(2.58, 2)
    expect(e.massRatio).toBeCloseTo(6.66, 1)
    expect(relativeError(e.observedMassSolarMasses, 2.0e14)).toBeLessThan(0.01)
  })
  it('the ring formula step by step ends at the module ring', () => {
    const e = ringFormulaExample()
    expect(e.arcseconds).toBeCloseTo(einsteinRingArcseconds(OBSERVED_TOTAL_MASS_SOLAR_MASSES), 9)
    expect(e.gravitationalLengthKm).toBeCloseTo(2.953e14, -11)
    expect(e.distanceFactor).toBeCloseTo(LENS_TO_SOURCE_DISTANCE_MPC / (LENS_DISTANCE_MPC * SOURCE_DISTANCE_MPC), 12)
  })
  it('the real bend at the observed ring is about 55 arcseconds', () => {
    expect(observedBendArcseconds()).toBeCloseTo(54.9, 0)
  })
})
