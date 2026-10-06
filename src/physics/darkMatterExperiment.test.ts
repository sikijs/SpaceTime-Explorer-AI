import { describe, expect, it } from 'vitest'
import {
  GRAVITATIONAL_CONSTANT_KPC_KMS2_PER_SOLAR_MASS,
  MAX_DARK_MATTER_AMOUNT,
  MAX_RADIUS_KPC,
  MIN_RADIUS_KPC,
  OBSERVED_SPEED_KM_PER_S,
  circularSpeedKmPerS,
  haloEnclosedMass,
  orbitalPeriodYears,
  rotationCurve,
  runDarkMatterExperiment,
  visibleEnclosedMass,
} from './darkMatterExperiment'

const radii = Array.from({ length: MAX_RADIUS_KPC - MIN_RADIUS_KPC + 1 }, (_, i) => MIN_RADIUS_KPC + i)

describe('rotationCurve', () => {
  it('equals the visible-only speed at every radius when amount is 0', () => {
    for (const p of rotationCurve(0, radii)) {
      expect(p.withDarkMatterSpeedKmPerS).toBeCloseTo(p.visibleOnlySpeedKmPerS, 10)
    }
  })

  it('has a visible-only speed that strictly decreases with radius', () => {
    const curve = rotationCurve(0, radii)
    for (let i = 1; i < curve.length; i++) {
      expect(curve[i].visibleOnlySpeedKmPerS).toBeLessThan(curve[i - 1].visibleOnlySpeedKmPerS)
    }
  })

  it('is within 5% of the observed speed at every radius when amount is 1', () => {
    for (const p of rotationCurve(1, radii)) {
      expect(
        Math.abs(p.withDarkMatterSpeedKmPerS - OBSERVED_SPEED_KM_PER_S) / OBSERVED_SPEED_KM_PER_S,
      ).toBeLessThan(0.05)
    }
  })

  it('gives a strictly higher speed at every radius for a larger amount', () => {
    const low = rotationCurve(0.5, radii)
    const high = rotationCurve(1.5, radii)
    low.forEach((p, i) =>
      expect(high[i].withDarkMatterSpeedKmPerS).toBeGreaterThan(p.withDarkMatterSpeedKmPerS),
    )
  })

  it('has a visible-only speed at 8 kpc well below the observed speed', () => {
    const [p] = rotationCurve(0, [8])
    expect(p.visibleOnlySpeedKmPerS).toBeLessThan(OBSERVED_SPEED_KM_PER_S * 0.85)
  })
})

describe('circularSpeedKmPerS', () => {
  it('satisfies speed^2 * radius / G = enclosed mass', () => {
    for (const r of [5, 8, 20, 30]) {
      const mass = visibleEnclosedMass(r) + haloEnclosedMass(r, 1)
      const v = circularSpeedKmPerS(r, mass)
      expect((v * v * r) / GRAVITATIONAL_CONSTANT_KPC_KMS2_PER_SOLAR_MASS).toBeCloseTo(mass, -2)
    }
  })
})

describe('haloEnclosedMass', () => {
  it('is 0 when amount is 0, grows with radius, and is never negative', () => {
    for (const r of radii) expect(haloEnclosedMass(r, 0)).toBe(0)
    let previous = 0
    for (const r of radii) {
      const mass = haloEnclosedMass(r, MAX_DARK_MATTER_AMOUNT)
      expect(mass).toBeGreaterThanOrEqual(0)
      expect(mass).toBeGreaterThan(previous)
      previous = mass
    }
  })
})

describe('orbitalPeriodYears', () => {
  it('is within 10% of 230 million years at 8 kpc when amount is 1', () => {
    const [p] = rotationCurve(1, [8])
    const years = orbitalPeriodYears(8, p.withDarkMatterSpeedKmPerS)
    expect(Math.abs(years - 230e6) / 230e6).toBeLessThan(0.1)
  })
})

describe('runDarkMatterExperiment', () => {
  it('returns one curve point per kiloparsec across the outer galaxy', () => {
    const result = runDarkMatterExperiment(1)
    expect(result.amount).toBe(1)
    expect(result.curve.map((p) => p.radiusKpc)).toEqual(radii)
  })
})

describe('module independence', () => {
  it('does not import from the expansion-physics modules', async () => {
    const source = await import('node:fs/promises').then((fs) =>
      fs.readFile(new URL('./darkMatterExperiment.ts', import.meta.url), 'utf-8'),
    )
    const importLines = source.split('\n').filter((line: string) => line.trim().startsWith('import'))
    for (const name of ['hubblesLawExperiment', 'bigBangExperiment', 'cosmicMicrowaveBackgroundExperiment']) {
      expect(importLines.some((line: string) => line.includes(name))).toBe(false)
    }
  })
})
