import { describe, expect, it } from 'vitest'
import {
  HYPOTHETICAL_START_IN_HORIZON_RADII,
  OBJECT_PRESETS,
  horizonRadiusKm,
  isBlackHole,
  ordinaryGravityEscapeSpeedFractionOfLight,
  radiusInHorizonRadii,
  runBlackHoleSizeExperiment,
} from './blackHoleSizeExperiment'

// Independent check in SI units (a different set of constants from the module's galactic units).
const G_SI = 6.6743e-11 // m^3 / (kg s^2)
const C_SI = 299_792_458 // m / s
const SOLAR_MASS_KG = 1.98841e30
const KM_PER_AU = 149_597_870.7
const horizonKmSI = (solarMasses: number) => ((2 * G_SI * solarMasses * SOLAR_MASS_KG) / C_SI ** 2) / 1000

const preset = (id: string) => OBJECT_PRESETS.find((p) => p.id === id)!
const within = (actual: number, expected: number, fraction: number) =>
  expect(Math.abs(actual - expected) / expected).toBeLessThan(fraction)

describe('horizon radius', () => {
  it('is about 2.953 km for one solar mass (the Sun)', () => {
    within(horizonRadiusKm(1), 2.953, 0.001)
    within(horizonRadiusKm(preset('sun').massSolarMasses), 2.953, 0.001)
  })

  it('agrees with an independent calculation in SI units', () => {
    for (const m of [3.0e-6, 1, 1.4, 10, 4.3e6, 6.5e9]) within(horizonRadiusKm(m), horizonKmSI(m), 0.001)
  })

  it('is exactly proportional to the mass', () => {
    for (const m of [0.5, 1, 7, 100, 4.3e6]) {
      expect(horizonRadiusKm(2 * m) / horizonRadiusKm(m)).toBeCloseTo(2, 12)
      expect(horizonRadiusKm(1000 * m) / horizonRadiusKm(m)).toBeCloseTo(1000, 9)
    }
  })

  it("is about 8.87 millimeters for Earth's mass", () => {
    within(horizonRadiusKm(preset('earth').massSolarMasses), 0.00000887, 0.01)
  })

  it("matches the specification's table for the other objects", () => {
    within(horizonRadiusKm(preset('neutron-star').massSolarMasses), 4.13, 0.01)
    within(horizonRadiusKm(preset('stellar-black-hole').massSolarMasses), 29.5, 0.01)
    const sgr = horizonRadiusKm(preset('sgr-a-star').massSolarMasses)
    within(sgr, 12.7e6, 0.01)
    within(sgr / KM_PER_AU, 0.085, 0.01)
    const m87 = horizonRadiusKm(preset('m87-star').massSolarMasses)
    within(m87, 19.2e9, 0.01) // the specification's "about 19 billion km", unrounded
    within(m87 / KM_PER_AU, 128, 0.01)
  })
})

describe('radius in horizon radii and the black hole condition', () => {
  it('is the radius divided by the horizon radius, and 1 at the horizon', () => {
    for (const m of [1, 10, 4.3e6]) {
      const rs = horizonRadiusKm(m)
      expect(radiusInHorizonRadii(5 * rs, m)).toBeCloseTo(5, 12)
      expect(radiusInHorizonRadii(rs, m)).toBeCloseTo(1, 12)
    }
  })

  it('is a black hole if and only if the radius is at or below the horizon', () => {
    for (const m of [3.0e-6, 1, 1.4, 10, 6.5e9]) {
      const rs = horizonRadiusKm(m)
      expect(isBlackHole(rs * 0.999, m)).toBe(true)
      expect(isBlackHole(rs, m)).toBe(true)
      expect(isBlackHole(rs * 1.001, m)).toBe(false)
    }
  })
})

describe('ordinary-gravity escape speed', () => {
  it('is 1 at the horizon, below 1 above it and above 1 below it, equal to sqrt(r_s / r)', () => {
    for (const m of [1, 10]) {
      const rs = horizonRadiusKm(m)
      expect(ordinaryGravityEscapeSpeedFractionOfLight(rs, m)).toBeCloseTo(1, 12)
      expect(ordinaryGravityEscapeSpeedFractionOfLight(rs * 4, m)).toBeLessThan(1)
      expect(ordinaryGravityEscapeSpeedFractionOfLight(rs / 4, m)).toBeGreaterThan(1)
      for (const k of [0.1, 0.5, 2, 100]) {
        expect(ordinaryGravityEscapeSpeedFractionOfLight(rs * k, m)).toBeCloseTo(Math.sqrt(1 / k), 12)
      }
    }
  })

  it('equals the Newtonian escape speed sqrt(2GM/r) divided by c, checked in SI units (the link to Experiment 7)', () => {
    for (const m of [1, 10, 4.3e6]) {
      for (const k of [0.5, 1, 3]) {
        const radiusKm = horizonRadiusKm(m) * k
        const newtonianEscape = Math.sqrt((2 * G_SI * m * SOLAR_MASS_KG) / (radiusKm * 1000))
        within(ordinaryGravityEscapeSpeedFractionOfLight(radiusKm, m), newtonianEscape / C_SI, 0.001)
      }
    }
  })
})

describe('runBlackHoleSizeExperiment', () => {
  it('gives the squeeze needed for Earth, the Sun and the neutron star, and null for the black holes', () => {
    within(runBlackHoleSizeExperiment('earth', 1).squeezeNeeded!, 720e6, 0.01)
    within(runBlackHoleSizeExperiment('sun', 1).squeezeNeeded!, 236_000, 0.01)
    within(runBlackHoleSizeExperiment('neutron-star', 1).squeezeNeeded!, 2.9, 0.01)
    for (const id of ['stellar-black-hole', 'sgr-a-star', 'm87-star'] as const) {
      expect(runBlackHoleSizeExperiment(id, 1e6).squeezeNeeded).toBeNull()
    }
  })

  it('starts from the real radius, or from a labeled hypothetical 100 horizon radii for the black holes', () => {
    for (const p of OBJECT_PRESETS) {
      const result = runBlackHoleSizeExperiment(p.id, 1)
      if (p.realRadiusKm === null) {
        expect(result.startIsHypothetical).toBe(true)
        expect(result.startRadiusKm / result.horizonRadiusKm).toBeCloseTo(HYPOTHETICAL_START_IN_HORIZON_RADII, 9)
        expect(HYPOTHETICAL_START_IN_HORIZON_RADII).toBe(100)
      } else {
        expect(result.startIsHypothetical).toBe(false)
        expect(result.startRadiusKm).toBe(p.realRadiusKm)
      }
    }
  })

  it('has a curve that starts at the start radius, ends at the chosen radius, is monotonic and evenly spaced in log radius', () => {
    for (const [id, chosenFraction] of [
      ['sun', 0.5],
      ['earth', 10],
      ['stellar-black-hole', 0.1],
    ] as const) {
      const rs = horizonRadiusKm(preset(id).massSolarMasses)
      const { curve, startRadiusKm, chosenRadiusKm } = runBlackHoleSizeExperiment(id, rs * chosenFraction)
      expect(curve[0].radiusKm).toBe(startRadiusKm)
      expect(curve[curve.length - 1].radiusKm).toBe(chosenRadiusKm)
      expect(curve[0].progress).toBe(0)
      expect(curve[curve.length - 1].progress).toBe(1)
      const logSteps = curve.slice(1).map((pt, i) => Math.log(pt.radiusKm) - Math.log(curve[i].radiusKm))
      const sign = Math.sign(logSteps[0])
      for (const step of logSteps) {
        expect(Math.sign(step)).toBe(sign)
        expect(step).toBeCloseTo(logSteps[0], 9)
      }
    }
  })

  it('reports becomesBlackHole consistently with isBlackHole, and the chosen radius in horizon radii', () => {
    for (const p of OBJECT_PRESETS) {
      const rs = horizonRadiusKm(p.massSolarMasses)
      for (const k of [0.1, 0.99, 1, 1.01, 10]) {
        const result = runBlackHoleSizeExperiment(p.id, rs * k)
        expect(result.becomesBlackHole).toBe(isBlackHole(rs * k, p.massSolarMasses))
        expect(result.becomesBlackHole).toBe(k <= 1)
        expect(result.chosenInHorizonRadii).toBeCloseTo(k, 9)
        expect(result.escapeSpeedFractionOfLight).toBeCloseTo(Math.sqrt(1 / k), 9)
      }
    }
  })

  it('rejects an unknown object and a non-positive radius', () => {
    expect(() => runBlackHoleSizeExperiment('moon' as never, 1)).toThrow()
    expect(() => runBlackHoleSizeExperiment('sun', 0)).toThrow()
  })
})

describe('reuse (CLAUDE.md §8)', () => {
  it('imports its constants from darkMatterExperiment and hubblesLawExperiment, and not from blackHoleExperiment', async () => {
    const source = await import('node:fs/promises').then((fs) =>
      fs.readFile(new URL('./blackHoleSizeExperiment.ts', import.meta.url), 'utf-8'),
    )
    const importLines = source.split('\n').filter((line: string) => line.trim().startsWith('import'))
    const from = (name: string) => importLines.filter((line: string) => line.includes(name)).join(' ')
    expect(from('darkMatterExperiment')).toContain('GRAVITATIONAL_CONSTANT_KPC_KMS2_PER_SOLAR_MASS')
    expect(from('darkMatterExperiment')).toContain('KM_PER_KPC')
    expect(from('hubblesLawExperiment')).toContain('REAL_SPEED_OF_LIGHT_KM_PER_S')
    expect(importLines.some((line: string) => line.includes('/blackHoleExperiment'))).toBe(false)
  })
})
