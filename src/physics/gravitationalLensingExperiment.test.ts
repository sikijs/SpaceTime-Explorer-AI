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
  bendingAngleArcseconds,
  einsteinRingArcseconds,
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
