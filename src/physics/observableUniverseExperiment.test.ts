import { describe, expect, it } from 'vitest'
import {
  CMB_REDSHIFT,
  MAX_REDSHIFT,
  MIN_REDSHIFT,
  SOURCE_PRESETS,
  distanceTodayLightYears,
  distanceWhenLightLeftLightYears,
  lightTravelYears,
  runObservableUniverseExperiment,
  timeAfterBigBangYears,
} from './observableUniverseExperiment'
import { BEST_FIT_DARK_ENERGY_FRACTION, comovingDistanceMpc } from './darkEnergyExperiment'
import { universeAgeYears, relativeSizeAtTime } from './universeAgeExperiment'
import { RECOMBINATION_REDSHIFT } from './cosmicMicrowaveBackgroundExperiment'

const L = BEST_FIT_DARK_ENERGY_FRACTION
const BILLION = 1e9
const relativeError = (a: number, b: number) => Math.abs(a - b) / Math.abs(b)

// Independent literal values (not the module's imported constants), for the small-redshift check.
const C_KM_PER_S = 299792.458
const H0 = 70
const MPC_IN_LIGHT_YEARS = 3.2615637771674337e6

describe('small redshift', () => {
  it('agrees with c z / H0 when nothing has had time to stretch', () => {
    const z = 0.001
    const expectedLightYears = ((C_KM_PER_S * z) / H0) * MPC_IN_LIGHT_YEARS
    expect(relativeError(distanceTodayLightYears(z, L), expectedLightYears)).toBeLessThan(0.002)
    expect(relativeError(lightTravelYears(z, L), expectedLightYears)).toBeLessThan(0.002)
    expect(relativeError(distanceTodayLightYears(z, L), lightTravelYears(z, L))).toBeLessThan(0.002)
  })
})

const REDSHIFT_GRID = [0.01, 0.1, 0.5, 1, 2, 5, 10, 100, 1089.8]

describe('distance today versus the distance the light travelled', () => {
  it('is larger for every redshift above 0, and the ratio grows with redshift', () => {
    let previousRatio = 1
    for (const z of REDSHIFT_GRID) {
      const ratio = distanceTodayLightYears(z, L) / lightTravelYears(z, L)
      expect(ratio).toBeGreaterThan(1)
      expect(ratio).toBeGreaterThan(previousRatio)
      previousRatio = ratio
    }
  })
})

describe('distance when the light left', () => {
  it('equals the distance today divided by 1 + z, exactly', () => {
    for (const z of REDSHIFT_GRID) {
      expect(relativeError(distanceWhenLightLeftLightYears(z, L), distanceTodayLightYears(z, L) / (1 + z))).toBeLessThan(1e-12)
    }
  })

  it('rises and then falls, with its largest value at a redshift between 1 and 5', () => {
    const curve = runObservableUniverseExperiment(2).curve
    const best = curve.reduce((a, b) => (b.distanceWhenLightLeftLightYears > a.distanceWhenLightLeftLightYears ? b : a))
    expect(best.redshift).toBeGreaterThan(1)
    expect(best.redshift).toBeLessThan(5)
    expect(curve[0].distanceWhenLightLeftLightYears).toBeLessThan(best.distanceWhenLightLeftLightYears)
    expect(curve[curve.length - 1].distanceWhenLightLeftLightYears).toBeLessThan(best.distanceWhenLightLeftLightYears)
  })
})

describe('the cosmic microwave background', () => {
  const result = runObservableUniverseExperiment(CMB_REDSHIFT)

  it('is about 44.6 billion light-years away today and about 41 million when the light left', () => {
    expect(relativeError(result.distanceTodayLightYears, 44.6 * BILLION)).toBeLessThan(0.01)
    expect(relativeError(result.distanceWhenLightLeftLightYears, 41e6)).toBeLessThan(0.02)
  })

  it('has a light-travel time within 0.5% of the age of the universe', () => {
    expect(relativeError(result.lightTravelYears, universeAgeYears(L))).toBeLessThan(0.005)
  })

  it('matches the specification table at the other presets, to 1%', () => {
    const expected: Array<[number, number, number, number]> = [
      // redshift, light travelled, distance today, distance when the light left (billion light-years)
      [0.5, 5.04, 6.16, 4.11],
      [2, 10.24, 16.89, 5.63],
      [10, 13.0, 30.79, 2.8],
    ]
    for (const [z, travelled, today, left] of expected) {
      const run = runObservableUniverseExperiment(z)
      expect(relativeError(run.lightTravelYears, travelled * BILLION)).toBeLessThan(0.01)
      expect(relativeError(run.distanceTodayLightYears, today * BILLION)).toBeLessThan(0.01)
      expect(relativeError(run.distanceWhenLightLeftLightYears, left * BILLION)).toBeLessThan(0.01)
    }
  })

  it('has a recession speed today of about 3 times the speed of light', () => {
    expect(result.recessionSpeedTodayOverC).toBeGreaterThan(3)
    expect(result.recessionSpeedTodayOverC).toBeLessThan(3.4)
  })

  it('restates the same redshift that Experiment 3 uses', () => {
    expect(CMB_REDSHIFT).toBe(RECOMBINATION_REDSHIFT)
  })
})

describe('timeAfterBigBangYears', () => {
  it('is the exact inverse of Experiment 6 relativeSizeAtTime', () => {
    for (const share of [0, 0.3, 0.7]) {
      for (const a of [0.001, 0.01, 0.1, 0.5, 0.9, 1]) {
        const years = timeAfterBigBangYears(a, share)
        expect(relativeError(relativeSizeAtTime(years, share), a)).toBeLessThan(1e-9)
      }
    }
  })

  it("reaches today's age when the universe has today's size", () => {
    for (const share of [0, 0.3, 0.7]) {
      expect(relativeError(timeAfterBigBangYears(1, share), universeAgeYears(share))).toBeLessThan(1e-12)
    }
  })
})

describe('light-travel time', () => {
  it('is always less than the age of the universe, and increases with redshift', () => {
    const age = universeAgeYears(L)
    let previous = 0
    for (const z of REDSHIFT_GRID) {
      const years = lightTravelYears(z, L)
      expect(years).toBeLessThan(age)
      expect(years).toBeGreaterThan(previous)
      previous = years
    }
  })
})

describe('the two curves separate', () => {
  it('keeps the light-travelled distance below c times the age while the distance today keeps rising past it', () => {
    const age = universeAgeYears(L)
    let previousToday = 0
    for (const z of REDSHIFT_GRID) {
      expect(lightTravelYears(z, L)).toBeLessThan(age)
      const today = distanceTodayLightYears(z, L)
      expect(today).toBeGreaterThan(previousToday)
      previousToday = today
    }
    expect(distanceTodayLightYears(10, L)).toBeGreaterThan(age)
    expect(distanceTodayLightYears(CMB_REDSHIFT, L)).toBeGreaterThan(3 * age)
  })
})

describe("Experiment 5's comoving distance function", () => {
  it('stays accurate at the cosmic microwave background redshift', () => {
    const defaultSteps = comovingDistanceMpc(CMB_REDSHIFT, L)
    const fine = comovingDistanceMpc(CMB_REDSHIFT, L, 200000)
    expect(relativeError(defaultSteps, fine)).toBeLessThan(0.001)
  })
})

describe('runObservableUniverseExperiment', () => {
  it('reports consistent values and a graph curve across the offered range', () => {
    const result = runObservableUniverseExperiment(2)
    expect(result.stretchingFactor).toBe(3)
    expect(result.todayOverTravelled).toBeCloseTo(result.distanceTodayLightYears / result.lightTravelYears, 12)
    expect(result.curve[0].redshift).toBeCloseTo(MIN_REDSHIFT, 12)
    expect(relativeError(result.curve[result.curve.length - 1].redshift, MAX_REDSHIFT)).toBeLessThan(1e-12)
    for (let i = 1; i < result.curve.length; i++) {
      expect(result.curve[i].redshift).toBeGreaterThan(result.curve[i - 1].redshift)
    }
  })

  it('offers presets that all lie within the offered redshift range', () => {
    for (const preset of SOURCE_PRESETS) {
      expect(preset.redshift).toBeGreaterThanOrEqual(MIN_REDSHIFT)
      expect(preset.redshift).toBeLessThanOrEqual(MAX_REDSHIFT)
    }
  })
})

describe('module independence', () => {
  it('imports from the earlier experiments rather than redefining, and from none of the others', async () => {
    const source = await import('node:fs/promises').then((fs) =>
      fs.readFile(new URL('./observableUniverseExperiment.ts', import.meta.url), 'utf-8'),
    )
    // Whole import statements, so imports written over several lines are read correctly.
    const imports = [...source.matchAll(/import\s*\{([^}]*)\}\s*from\s*'([^']+)'/g)].map((m) => ({
      names: m[1],
      module: m[2],
    }))
    const from = (name: string) =>
      imports
        .filter((i) => i.module.includes(name))
        .map((i) => i.names)
        .join(' ')
    expect(from('hubblesLawExperiment')).toContain('REAL_SPEED_OF_LIGHT_KM_PER_S')
    expect(from('hubblesLawExperiment')).toContain('HUBBLE_CONSTANT_KM_PER_S_PER_MPC')
    expect(from('bigBangExperiment')).toContain('MPC_TO_KM')
    expect(from('bigBangExperiment')).toContain('hubbleTimeYears')
    expect(from('darkEnergyExperiment')).toContain('comovingDistanceMpc')
    expect(from('darkEnergyExperiment')).toContain('BEST_FIT_DARK_ENERGY_FRACTION')
    expect(from('universeAgeExperiment')).toContain('universeAgeYears')
    for (const name of [
      'lightBendingExperiment',
      'cosmicMicrowaveBackgroundExperiment',
      'gravitationalLensingExperiment',
    ]) {
      expect(imports.some((i) => i.module.includes(name))).toBe(false)
    }
    // Experiment 5's distance function is imported, not rewritten here.
    expect(source).not.toMatch(/function\s+comovingDistanceMpc/)
  })
})
