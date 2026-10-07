import { describe, expect, it } from 'vitest'
import { REAL_UNIVERSE_AGE_YEARS, hubbleTimeYears } from './bigBangExperiment'
import { MAX_DARK_ENERGY_FRACTION, decelerationParameter, expansionRateRatio } from './darkEnergyExperiment'
import {
  OLDEST_STARS_AGE_YEARS,
  PLANCK_LIKE_DARK_ENERGY_FRACTION,
  PLANCK_LIKE_HUBBLE_CONSTANT_KM_PER_S_PER_MPC,
  constantSpeedRelativeSize,
  relativeSizeAtTime,
  runUniverseAgeExperiment,
  universeAgeYears,
} from './universeAgeExperiment'

// Independent check: t0 = Hubble time x integral from 0 to infinity of dz / ((1 + z) E(z)), done with
// the substitution u = 1 / (1 + z) (so the integral becomes from 0 to 1 of du / E(1/u - 1)), by
// Simpson's rule, using Experiment 5's own expansionRateRatio.
function numericalAgeYears(darkEnergyFraction: number): number {
  const steps = 20000
  const f = (u: number) => (u === 0 ? 0 : 1 / (u * expansionRateRatio(1 / u - 1, darkEnergyFraction)))
  const h = 1 / steps
  let sum = f(0) + f(1)
  for (let i = 1; i < steps; i++) sum += (i % 2 === 1 ? 4 : 2) * f(i * h)
  return hubbleTimeYears() * ((sum * h) / 3)
}

describe('universeAgeYears', () => {
  it('is exactly two thirds of the Hubble time with no dark energy', () => {
    expect(universeAgeYears(0)).toBeCloseTo((2 / 3) * hubbleTimeYears(), 0)
  })

  it('matches a direct numerical integral for several dark energy shares', () => {
    for (const share of [0, 0.2, 0.5, 0.7, 0.9]) {
      const exact = universeAgeYears(share)
      expect(Math.abs(exact - numericalAgeYears(share)) / exact).toBeLessThan(1e-4)
    }
  })

  it('increases strictly with the dark energy share', () => {
    let previous = universeAgeYears(0)
    for (let share = 0.05; share <= MAX_DARK_ENERGY_FRACTION + 1e-9; share += 0.05) {
      const age = universeAgeYears(share)
      expect(age).toBeGreaterThan(previous)
      previous = age
    }
  })

  it('gives about 13.47 billion years at 70%, close to the real measured age', () => {
    const age = universeAgeYears(0.7)
    expect(Math.abs(age - 13.47e9) / 13.47e9).toBeLessThan(0.02)
    expect(Math.abs(age - REAL_UNIVERSE_AGE_YEARS) / REAL_UNIVERSE_AGE_YEARS).toBeLessThan(0.03)
  })

  it('gives about 13.8 billion years with the Planck-like values (Hubble-tension tie-in)', () => {
    const age = universeAgeYears(
      PLANCK_LIKE_DARK_ENERGY_FRACTION,
      PLANCK_LIKE_HUBBLE_CONSTANT_KM_PER_S_PER_MPC,
    )
    expect(Math.abs(age - REAL_UNIVERSE_AGE_YEARS) / REAL_UNIVERSE_AGE_YEARS).toBeLessThan(0.01)
  })

  it('is closer to 13.8 with both Planck-like values than with a lower Hubble constant alone (the item 5 rewording)', () => {
    const hubbleOnly = universeAgeYears(0.7, PLANCK_LIKE_HUBBLE_CONSTANT_KM_PER_S_PER_MPC)
    const both = universeAgeYears(PLANCK_LIKE_DARK_ENERGY_FRACTION, PLANCK_LIKE_HUBBLE_CONSTANT_KM_PER_S_PER_MPC)
    expect(Math.abs(both - REAL_UNIVERSE_AGE_YEARS)).toBeLessThan(Math.abs(hubbleOnly - REAL_UNIVERSE_AGE_YEARS) / 2)
    expect(hubbleOnly).toBeGreaterThan(REAL_UNIVERSE_AGE_YEARS)
  })

  it('matches the specification table at 70 km/s/Mpc', () => {
    const table: Array<[number, number]> = [
      [0, 9.31e9],
      [0.5, 11.61e9],
      [0.7, 13.47e9],
      [0.9, 17.85e9],
    ]
    for (const [share, expected] of table) {
      expect(Math.abs(universeAgeYears(share) - expected) / expected).toBeLessThan(0.005)
    }
  })
})

describe('relativeSizeAtTime', () => {
  it('equals 1 exactly at the universe age, for several shares including 0', () => {
    for (const share of [0, 0.3, 0.7, 0.9]) {
      expect(relativeSizeAtTime(universeAgeYears(share), share)).toBeCloseTo(1, 9)
    }
  })

  it('is 0 at time 0 and strictly increasing in time', () => {
    for (const share of [0, 0.7]) {
      expect(relativeSizeAtTime(0, share)).toBe(0)
      let previous = 0
      for (let t = 1e9; t <= 20e9; t += 1e9) {
        const size = relativeSizeAtTime(t, share)
        expect(size).toBeGreaterThan(previous)
        previous = size
      }
    }
  })

  it('accelerates today exactly when the share is above 1/3, matching Experiment 5', () => {
    for (const share of [0.2, 0.5, 0.8]) {
      const t0 = universeAgeYears(share)
      const h = 1e7
      const secondDifference =
        relativeSizeAtTime(t0 + h, share) - 2 * relativeSizeAtTime(t0, share) + relativeSizeAtTime(t0 - h, share)
      expect(secondDifference > 0).toBe(decelerationParameter(share) < 0)
    }
  })
})

describe('constantSpeedRelativeSize', () => {
  it('equals 1 at the Hubble time', () => {
    expect(constantSpeedRelativeSize(hubbleTimeYears())).toBeCloseTo(1, 9)
  })
})

describe('runUniverseAgeExperiment', () => {
  it('shows matter-only is younger than the oldest stars and 70% is older', () => {
    expect(universeAgeYears(0)).toBeLessThan(OLDEST_STARS_AGE_YEARS)
    expect(universeAgeYears(0.7)).toBeGreaterThan(OLDEST_STARS_AGE_YEARS)
    expect(runUniverseAgeExperiment(0).isOlderThanOldestStars).toBe(false)
    expect(runUniverseAgeExperiment(0.7).isOlderThanOldestStars).toBe(true)
  })

  it('reports consistent values and curves that start at size 0', () => {
    const result = runUniverseAgeExperiment(0.7)
    expect(result.ageOverHubbleTime).toBeCloseTo(result.ageYears / result.hubbleTimeYears, 12)
    expect(result.matterOnlyAgeYears).toBeCloseTo((2 / 3) * result.hubbleTimeYears, 0)
    expect(result.curves[0]).toMatchObject({ yearsAfterBigBang: 0, matterOnlySize: 0, chosenSize: 0, constantSpeedSize: 0 })
  })
})

describe('module independence', () => {
  it('imports from the earlier experiments rather than redefining, and nothing from dark matter or the CMB', async () => {
    const source = await import('node:fs/promises').then((fs) =>
      fs.readFile(new URL('./universeAgeExperiment.ts', import.meta.url), 'utf-8'),
    )
    const importLines = source.split('\n').filter((line: string) => line.trim().startsWith('import'))
    const from = (name: string) => importLines.filter((line: string) => line.includes(name)).join(' ')
    expect(from('hubblesLawExperiment')).toContain('HUBBLE_CONSTANT_KM_PER_S_PER_MPC')
    expect(from('bigBangExperiment')).toContain('hubbleTimeYears')
    expect(from('darkEnergyExperiment')).toContain('MAX_DARK_ENERGY_FRACTION')
    for (const name of ['darkMatterExperiment', 'cosmicMicrowaveBackgroundExperiment']) {
      expect(importLines.some((line: string) => line.includes(name))).toBe(false)
    }
  })
})
