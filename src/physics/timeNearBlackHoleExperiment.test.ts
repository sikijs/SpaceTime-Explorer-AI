import { describe, expect, it } from 'vitest'
import { OBJECT_PRESETS, horizonRadiusKm, radiusInHorizonRadii } from './blackHoleSizeExperiment'
import { EARTH_RADIUS_METERS, runGpsTimeDilationExperiment } from './gpsTimeDilationExperiment'
import {
  BLACK_HOLE_PRESETS,
  FAR_CLOCK_RUN_SECONDS,
  MAX_DISTANCE_IN_HORIZON_RADII,
  MIN_DISTANCE_IN_HORIZON_RADII,
  clockReadingsAt,
  exactSlowingFactor,
  firstOrderSlowingFactor,
  runTimeNearBlackHoleExperiment,
  surfaceSlowing,
  APPROXIMATION_ACCURATE_WITHIN_PERCENT,
  CHECK_UP_DISTANCES,
  PART_ONE_DISTANCE_IN_HORIZON_RADII,
  approximationGuessIsModelAnswer,
  escapeSpeedLadder,
  gpsCheckUpRow,
  horizonComparisons,
  lightDistanceKm,
  yearsToDriftOneSecond,
  guessHeightForJustOutside,
  justOutsideGuessIsModelAnswer,
  massGuessIsModelAnswer,
  percentTooHigh,
  readAgainst,
  runPartOne,
  s2ClosestApproachInHorizonRadiiUpperBound,
  simpleAgainstExactRows,
  timesAsMuch,
  twoHolesAtTwoRadii,
  type ApproximationGuess,
  type JustOutsideGuess,
  type MassGuess,
} from './timeNearBlackHoleExperiment'

const within = (actual: number, expected: number, fraction: number) =>
  expect(Math.abs(actual - expected) / expected).toBeLessThan(fraction)

describe('exact slowing factor', () => {
  it('equals sqrt(1 - 1/x) at several distances', () => {
    expect(exactSlowingFactor(4)).toBeCloseTo(Math.sqrt(0.75), 12)
    expect(exactSlowingFactor(2)).toBeCloseTo(0.7071, 4)
    for (const x of [1.001, 1.5, 3, 10, 1000]) expect(exactSlowingFactor(x)).toBeCloseTo(Math.sqrt(1 - 1 / x), 12)
  })

  it('is exactly 0 at the horizon and rejects distances inside it', () => {
    expect(exactSlowingFactor(1)).toBe(0)
    expect(() => exactSlowingFactor(0.99)).toThrow(RangeError)
    expect(() => exactSlowingFactor(0)).toThrow(RangeError)
    expect(() => exactSlowingFactor(Number.NaN)).toThrow(RangeError)
  })

  it('is strictly increasing with distance and approaches 1 far away', () => {
    const xs = [1, 1.001, 1.01, 1.1, 1.5, 2, 3, 10, 100, 1e4, 1e6]
    for (let i = 1; i < xs.length; i++) expect(exactSlowingFactor(xs[i])).toBeGreaterThan(exactSlowingFactor(xs[i - 1]))
    expect(exactSlowingFactor(1e6)).toBeGreaterThan(0.999999)
    expect(exactSlowingFactor(1e6)).toBeLessThan(1)
  })

  it('matches the values in the specification table to four decimal places', () => {
    const table: Array<[number, number]> = [
      [100, 0.995],
      [10, 0.9487],
      [3, 0.8165],
      [2, 0.7071],
      [1.5, 0.5774],
      [1.1, 0.3015],
      [1.01, 0.0995],
      [1.001, 0.0316],
    ]
    for (const [x, expected] of table) expect(exactSlowingFactor(x)).toBeCloseTo(expected, 4)
  })
})

describe('the factor depends only on the ratio, not on the mass', () => {
  it('is the same for all three black holes at the same distance in horizon radii', () => {
    expect(BLACK_HOLE_PRESETS.map((p) => p.id)).toEqual(['stellar-black-hole', 'sgr-a-star', 'm87-star'])
    for (const x of [1.01, 2, 10]) {
      const results = BLACK_HOLE_PRESETS.map((p) => runTimeNearBlackHoleExperiment(p.id, x))
      for (const r of results) {
        expect(r.exactFactor).toBe(results[0].exactFactor)
        expect(r.hoveringClockReadingSeconds).toBe(results[0].hoveringClockReadingSeconds)
      }
      // ...while the distance in kilometers differs in proportion to the horizon radius.
      within(
        results[2].distanceKm / results[0].distanceKm,
        results[2].horizonRadiusKm / results[0].horizonRadiusKm,
        1e-12,
      )
      expect(results[2].distanceKm).toBeGreaterThan(results[0].distanceKm * 1e8)
    }
  })

  it("converts to kilometers consistently with Experiment 1's horizon radius", () => {
    for (const p of BLACK_HOLE_PRESETS) {
      const r = runTimeNearBlackHoleExperiment(p.id, 2)
      expect(r.horizonRadiusKm).toBe(horizonRadiusKm(p.massSolarMasses))
      expect(r.distanceKm).toBeCloseTo(2 * horizonRadiusKm(p.massSolarMasses), 6)
      expect(radiusInHorizonRadii(r.distanceKm, p.massSolarMasses)).toBeCloseTo(2, 12)
    }
  })
})

describe('first-order factor, for comparison', () => {
  it('equals 1 - 1/(2x) and is always above the exact factor', () => {
    for (const x of [1.001, 1.1, 2, 10, 100]) {
      expect(firstOrderSlowingFactor(x)).toBeCloseTo(1 - 1 / (2 * x), 12)
      expect(firstOrderSlowingFactor(x)).toBeGreaterThan(exactSlowingFactor(x))
    }
  })

  it('agrees closely far away and fails at the horizon', () => {
    expect((firstOrderSlowingFactor(10) - exactSlowingFactor(10)) / exactSlowingFactor(10)).toBeLessThan(0.002)
    expect((firstOrderSlowingFactor(100) - exactSlowingFactor(100)) / exactSlowingFactor(100)).toBeLessThan(0.0001)
    expect(firstOrderSlowingFactor(1)).toBe(0.5)
    expect(exactSlowingFactor(1)).toBe(0)
  })

  it("matches Gravity Experiment 9's own gravity-effect number for Earth and a GPS satellite (within 1%)", () => {
    const earth = OBJECT_PRESETS.find((p) => p.id === 'earth')!
    const rsKm = horizonRadiusKm(earth.massSolarMasses)
    const groundX = EARTH_RADIUS_METERS / 1000 / rsKm
    const gpsRadiusMeters = 2.6571e7
    const satelliteX = gpsRadiusMeters / 1000 / rsKm
    const difference = firstOrderSlowingFactor(satelliteX) - firstOrderSlowingFactor(groundX)
    within(difference, runGpsTimeDilationExperiment(gpsRadiusMeters).gravityEffectFraction, 0.01)
  })
})

describe('the two clocks', () => {
  it('has the hovering clock read the exact factor times the far-away clock', () => {
    const r = runTimeNearBlackHoleExperiment('stellar-black-hole', 2)
    expect(r.farClockReadingSeconds).toBe(FAR_CLOCK_RUN_SECONDS)
    expect(r.hoveringClockReadingSeconds).toBeCloseTo(r.exactFactor * FAR_CLOCK_RUN_SECONDS, 12)
    expect(r.hoveringClockReadingSeconds).toBeCloseTo(42.43, 2)
    expect(runTimeNearBlackHoleExperiment('m87-star', 1.01).hoveringClockReadingSeconds).toBeCloseTo(5.97, 2)
  })

  it('has readings that are linear in far-away time and zero at the start', () => {
    const r = runTimeNearBlackHoleExperiment('sgr-a-star', 1.5)
    expect(clockReadingsAt(r, 0)).toEqual({ far: 0, hovering: 0 })
    for (const t of [1, 7.5, 30, 60]) {
      expect(clockReadingsAt(r, t).far).toBe(t)
      expect(clockReadingsAt(r, t).hovering).toBeCloseTo(r.exactFactor * t, 12)
    }
    expect(clockReadingsAt(r, 2 * 10).hovering).toBeCloseTo(2 * clockReadingsAt(r, 10).hovering, 12)
    expect(() => clockReadingsAt(r, -1)).toThrow(RangeError)
  })

  it('always has the hovering clock behind the far-away one at every allowed distance', () => {
    for (const x of [MIN_DISTANCE_IN_HORIZON_RADII, 1.01, 2, 50, MAX_DISTANCE_IN_HORIZON_RADII]) {
      const r = runTimeNearBlackHoleExperiment('stellar-black-hole', x)
      expect(r.hoveringClockReadingSeconds).toBeLessThan(r.farClockReadingSeconds)
    }
  })

  it('rejects an unknown black hole and distances outside the allowed range', () => {
    expect(() => runTimeNearBlackHoleExperiment('sun' as never, 2)).toThrow()
    expect(() => runTimeNearBlackHoleExperiment('stellar-black-hole', 1)).toThrow(RangeError)
    expect(() => runTimeNearBlackHoleExperiment('stellar-black-hole', 0.5)).toThrow(RangeError)
    expect(() => runTimeNearBlackHoleExperiment('stellar-black-hole', 101)).toThrow(RangeError)
  })
})

describe('real surfaces, for scale', () => {
  it('gives the right slowing for Earth, the Sun and a neutron star (within 1%)', () => {
    within(surfaceSlowing('earth').fractionSlower, 6.95e-10, 0.01)
    within(surfaceSlowing('sun').fractionSlower, 2.12e-6, 0.01)
    within(surfaceSlowing('neutron-star').fractionSlower, 0.19, 0.01)
  })

  it('reports r_s / r and a factor consistent with the exact formula', () => {
    for (const id of ['earth', 'sun', 'neutron-star'] as const) {
      const s = surfaceSlowing(id)
      expect(s.exactFactor).toBeCloseTo(Math.sqrt(1 - s.rsOverR), 12)
      expect(s.fractionSlower).toBeCloseTo(1 - s.exactFactor, 15)
    }
    within(surfaceSlowing('earth').rsOverR, 1.39e-9, 0.01)
    within(surfaceSlowing('neutron-star').rsOverR, 0.3445, 0.01)
  })

  it('rejects an object with no real surface', () => {
    expect(() => surfaceSlowing('m87-star' as never)).toThrow()
  })
})

describe('curve for the graph', () => {
  const { curve } = runTimeNearBlackHoleExperiment('stellar-black-hole', 2)

  it('is log-spaced and ascending from the minimum to the maximum distance', () => {
    expect(curve[0].distanceInHorizonRadii).toBe(MIN_DISTANCE_IN_HORIZON_RADII)
    expect(curve[curve.length - 1].distanceInHorizonRadii).toBe(MAX_DISTANCE_IN_HORIZON_RADII)
    const logStep = Math.log(curve[1].distanceInHorizonRadii / curve[0].distanceInHorizonRadii)
    for (let i = 1; i < curve.length; i++) {
      expect(curve[i].distanceInHorizonRadii).toBeGreaterThan(curve[i - 1].distanceInHorizonRadii)
      expect(Math.log(curve[i].distanceInHorizonRadii / curve[i - 1].distanceInHorizonRadii)).toBeCloseTo(logStep, 9)
    }
  })

  it('has exact values that are monotonic and below the first-order values at every point', () => {
    for (let i = 0; i < curve.length; i++) {
      expect(curve[i].exact).toBeLessThan(curve[i].firstOrder)
      if (i > 0) expect(curve[i].exact).toBeGreaterThan(curve[i - 1].exact)
    }
  })
})

describe('determinism and reuse (CLAUDE.md §8)', () => {
  it('gives identical results on repeated calls', () => {
    expect(runTimeNearBlackHoleExperiment('m87-star', 1.1)).toEqual(runTimeNearBlackHoleExperiment('m87-star', 1.1))
  })

  it('imports from blackHoleSizeExperiment and not from blackHoleExperiment, and imports no Gravity-chapter physics', async () => {
    const source = await import('node:fs/promises').then((fs) =>
      fs.readFile(new URL('./timeNearBlackHoleExperiment.ts', import.meta.url), 'utf-8'),
    )
    const importLines = source.split('\n').filter((line: string) => line.trim().startsWith('import'))
    const from = (name: string) => importLines.filter((line: string) => line.includes(name)).join(' ')
    expect(from('blackHoleSizeExperiment')).toContain('horizonRadiusKm')
    expect(from('blackHoleSizeExperiment')).toContain('OBJECT_PRESETS')
    expect(importLines.some((line: string) => line.includes('/blackHoleExperiment'))).toBe(false)
    expect(importLines.some((line: string) => line.includes('gpsTimeDilationExperiment'))).toBe(false)
    expect(importLines.some((line: string) => line.includes('gravitationalTimeDilationExperiment'))).toBe(false)
  })
})

describe('audit update (Black Holes 2): the fixed Part 1 run', () => {
  it('is the 10-Sun black hole with the hovering clock at 1.01 horizon radii for 60 s', () => {
    const r = runPartOne()
    expect(r.preset.id).toBe('stellar-black-hole')
    expect(r.distanceInHorizonRadii).toBe(1.01)
    expect(r.exactFactor).toBeCloseTo(0.0995, 4)
    expect(r.farClockReadingSeconds).toBe(60)
    expect(r.hoveringClockReadingSeconds).toBeCloseTo(5.97, 2)
  })
  it('puts the clock about 0.3 km outside the 10-Sun horizon (29.8 km from the centre)', () => {
    const r = runPartOne()
    expect(r.distanceKm).toBeCloseTo(29.8, 1)
    expect(r.distanceKm - r.horizonRadiusKm).toBeCloseTo(0.3, 1)
  })
})

describe('audit update: Prediction 1, the white mark and its marking', () => {
  it('gives each choice a height: 1, 0.5, 0.1 and 0', () => {
    expect(guessHeightForJustOutside('same')).toBe(1)
    expect(guessHeightForJustOutside('half')).toBe(0.5)
    expect(guessHeightForJustOutside('tenth')).toBe(0.1)
    expect(guessHeightForJustOutside('stopped')).toBe(0)
  })
  it('gives a different height for each guess, so the mark follows the guess', () => {
    const guesses: JustOutsideGuess[] = ['same', 'half', 'tenth', 'stopped']
    expect(new Set(guesses.map(guessHeightForJustOutside)).size).toBe(4)
  })
  it('marks only "about one tenth" as the model answer, from the real factor', () => {
    expect(justOutsideGuessIsModelAnswer('tenth')).toBe(true)
    for (const g of ['same', 'half', 'stopped'] as const) expect(justOutsideGuessIsModelAnswer(g)).toBe(false)
  })
  it('does not change with any guess: the real factor is the same call every time', () => {
    const before = runPartOne().exactFactor
    for (const g of ['same', 'half', 'tenth', 'stopped'] as const) {
      guessHeightForJustOutside(g)
      justOutsideGuessIsModelAnswer(g)
    }
    expect(runPartOne().exactFactor).toBe(before)
  })
})

describe('audit update: Prediction 2, the two black holes at 2 radii', () => {
  it('gives the same factor, about 0.7071, for the 10-Sun hole and M87*', () => {
    const { small, giant } = twoHolesAtTwoRadii()
    expect(small.factor).toBeCloseTo(0.7071, 4)
    expect(giant.factor).toBeCloseTo(0.7071, 4)
    expect(small.factor).toBe(giant.factor)
  })
  it('puts them at about 59 km and about 38 billion km from the centre, in proportion to the horizon radius', () => {
    const { small, giant } = twoHolesAtTwoRadii()
    expect(small.preset.id).toBe('stellar-black-hole')
    expect(giant.preset.id).toBe('m87-star')
    within(small.distanceKm, 59, 0.01)
    within(giant.distanceKm, 38e9, 0.03)
    within(giant.distanceKm / small.distanceKm, giant.horizonRadiusKm / small.horizonRadiusKm, 1e-9)
  })
  it('marks only "the same" as the model answer', () => {
    expect(massGuessIsModelAnswer('same')).toBe(true)
    for (const g of ['small', 'giant'] as MassGuess[]) expect(massGuessIsModelAnswer(g)).toBe(false)
  })
})

describe('audit update: Prediction 3, the simple formula against the exact one', () => {
  it('is how much too high the simple formula is: about 0.14% at 10, 6% at 2 and 408% at 1.01', () => {
    expect(percentTooHigh(10)).toBeCloseTo(0.137, 2)
    expect(percentTooHigh(2)).toBeCloseTo(6.066, 2)
    expect(percentTooHigh(1.01)).toBeCloseTo(407.5, 0)
    expect(percentTooHigh(1)).toBe(Infinity)
  })
  it('grows steadily as the distance shrinks', () => {
    const xs = [100, 10, 3, 2, 1.5, 1.1, 1.01, 1.001]
    for (let i = 1; i < xs.length; i++) expect(percentTooHigh(xs[i])).toBeGreaterThan(percentTooHigh(xs[i - 1]))
  })
  it('is the same quantity read two ways: times as much = 1 + percent / 100', () => {
    for (const d of [10, 2, 1.5, 1.01]) expect(timesAsMuch(d)).toBeCloseTo(1 + percentTooHigh(d) / 100, 10)
    expect(timesAsMuch(1.01)).toBeCloseTo(5.075, 2)
  })
  it('marks only "accurate far away, worse closer in" as the model answer', () => {
    expect(approximationGuessIsModelAnswer('worse-closer')).toBe(true)
    for (const g of ['still-accurate', 'never-accurate'] as ApproximationGuess[]) {
      expect(approximationGuessIsModelAnswer(g)).toBe(false)
    }
  })
  it('uses the same 1% tolerance as the GPS test and states it as a constant', () => {
    expect(APPROXIMATION_ACCURATE_WITHIN_PERCENT).toBe(1)
    expect(percentTooHigh(10)).toBeLessThan(APPROXIMATION_ACCURATE_WITHIN_PERCENT)
    expect(percentTooHigh(PART_ONE_DISTANCE_IN_HORIZON_RADII)).toBeGreaterThan(APPROXIMATION_ACCURATE_WITHIN_PERCENT)
  })
})

describe('audit update: the check-up', () => {
  it('reads the simple formula against the exact one at 10, 2 and 1.01 radii', () => {
    const rows = simpleAgainstExactRows()
    expect(rows.map((r) => r.distanceInHorizonRadii)).toEqual(CHECK_UP_DISTANCES)
    expect(CHECK_UP_DISTANCES).toEqual([10, 2, 1.01])
    expect(rows[0].exact).toBeCloseTo(0.9487, 4)
    expect(rows[0].simple).toBeCloseTo(0.95, 4)
    expect(rows[1].exact).toBeCloseTo(0.7071, 4)
    expect(rows[1].simple).toBeCloseTo(0.75, 4)
    expect(rows[2].exact).toBeCloseTo(0.0995, 4)
    expect(rows[2].simple).toBeCloseTo(0.505, 4)
  })
  it('uses only "the same", "more" or "less" and never an invented cut-off: the simple value is more at every row', () => {
    for (const r of simpleAgainstExactRows()) expect(r.reading).toBe('more')
    expect(readAgainst(1, 1)).toBe('the same')
    expect(readAgainst(2, 1)).toBe('more')
    expect(readAgainst(0.5, 1)).toBe('less')
  })
  it('compares the simple formula for a GPS satellite with the published 45 microseconds per day', () => {
    const row = gpsCheckUpRow()
    expect(row.published).toBe(45)
    expect(row.found).toBeCloseTo(45.67, 1)
    expect(row.percentDifference).toBeCloseTo(1.5, 0)
    expect(row.reading).toBe('more')
  })
  it('agrees with Gravity Experiment 9 within 1% (the same number the module rebuilds from one line)', () => {
    within(gpsCheckUpRow().found, runGpsTimeDilationExperiment(26_571_000).gravityEffectFraction * 86_400e6, 0.01)
  })
})

describe('audit update: Sgr A* and the star S2', () => {
  it('puts the closest approach, less than 20 billion km, at no more than about 1,575 horizon radii of Sgr A*', () => {
    within(s2ClosestApproachInHorizonRadiiUpperBound(), 1575, 0.01)
  })
})

describe('audit update: everyday sizes for the clock tests in the introduction', () => {
  it('two clocks whose rates differ by 10^-19 need about 317 billion years to disagree by one second', () => {
    within(yearsToDriftOneSecond(1e-19), 3.17e11, 0.005)
  })
  it('a difference of one part in 3.156 x 10^7 is one second per year', () => {
    expect(yearsToDriftOneSecond(1 / 31_557_600)).toBeCloseTo(1, 10)
  })
  it('rejects a difference of zero or less', () => {
    expect(() => yearsToDriftOneSecond(0)).toThrow(RangeError)
    expect(() => yearsToDriftOneSecond(-1e-19)).toThrow(RangeError)
  })
  it('light travels about 300 m in a microsecond and about 11 km in 38 microseconds', () => {
    expect(lightDistanceKm(1)).toBeCloseTo(0.2998, 3)
    within(lightDistanceKm(38), 11.39, 0.005)
    expect(lightDistanceKm(0)).toBe(0)
    expect(() => lightDistanceKm(-1)).toThrow(RangeError)
  })
})

describe('audit update: how strong gravity is, and how big the horizons are', () => {
  it('has NASA’s escape speeds for Earth and the Sun and the speed of light, in order', () => {
    const l = escapeSpeedLadder()
    expect(l.earthKmPerSecond).toBe(11.186)
    expect(l.sunKmPerSecond).toBe(617.6)
    expect(l.lightKmPerSecond).toBeCloseTo(299_792.458, 3)
    expect(l.earthKmPerSecond).toBeLessThan(l.sunKmPerSecond)
    expect(l.sunKmPerSecond).toBeLessThan(l.lightKmPerSecond)
  })
  it('turns them into everyday sizes: about 40,000 km/h, 55 times, 485 times and 26,800 times', () => {
    const l = escapeSpeedLadder()
    within(l.earthKmPerHour, 40_270, 0.001)
    within(l.sunOverEarth, 55.2, 0.005)
    within(l.lightOverSun, 485.4, 0.002)
    within(l.lightOverEarth, 26_800, 0.002)
    expect(l.lightOverEarth).toBeCloseTo(l.sunOverEarth * l.lightOverSun, 6)
  })
  it('puts the horizons at about 29.5 km, 12.7 million km (0.085 AU, 18 Suns across in radius) and 19 billion km (128 AU, 4 Neptune orbits)', () => {
    const h = horizonComparisons()
    within(h.stellarHorizonKm, 29.5, 0.01)
    within(h.sgrAHorizonKm, 12.7e6, 0.01)
    within(h.sgrAHorizonAu, 0.0849, 0.01)
    within(h.sgrAHorizonInSunRadii, 18.3, 0.01)
    within(h.m87HorizonKm, 19.2e9, 0.01)
    within(h.m87HorizonAu, 128, 0.01)
    within(h.m87HorizonInNeptuneOrbits, 4.28, 0.01)
  })
  it('uses the same black-hole horizons as the rest of the page', () => {
    const h = horizonComparisons()
    expect(h.stellarHorizonKm).toBe(horizonRadiusKm(BLACK_HOLE_PRESETS[0].massSolarMasses))
    expect(h.m87HorizonKm).toBe(horizonRadiusKm(BLACK_HOLE_PRESETS[2].massSolarMasses))
  })
})
