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
