import { describe, expect, it } from 'vitest'
import source from './hawkingRadiationExperiment.ts?raw'
import {
  BACKGROUND_KELVIN,
  HAWKING_PRESETS,
  HAWKING_TEMPERATURE_OF_ONE_SUN_KELVIN,
  LIFETIME_OF_ONE_SUN_YEARS,
  MAX_MASS_KG,
  MIN_MASS_KG,
  SUN_MASS_KG,
  UNIVERSE_AGE_YEARS,
  balanceMassKg,
  hawkingSteps,
  hawkingTemperatureKelvin,
  lifetimeYears,
  massDirection,
  massForLifetimeKg,
  runHawkingRadiationExperiment,
} from './hawkingRadiationExperiment'
import { horizonRadiusKm } from './blackHoleSizeExperiment'
import { CMB_TEMPERATURE_TODAY_KELVIN } from './cosmicMicrowaveBackgroundExperiment'
import { REAL_UNIVERSE_AGE_YEARS } from './bigBangExperiment'

const closeTo = (actual: number, expected: number, relative: number) =>
  expect(Math.abs(actual / expected - 1)).toBeLessThan(relative)

// The two formulas written out again here, separately from the module, from the same CODATA constants.
const HBAR = 1.054571817e-34
const C = 299_792_458
const G = 6.6743e-11
const KB = 1.380649e-23
const YEAR = 365.25 * 86_400
const temperatureCheck = (m: number) => (HBAR * C ** 3) / (8 * Math.PI * G * m * KB)
const lifetimeCheck = (m: number) => (5120 * Math.PI * G ** 2 * m ** 3) / (HBAR * C ** 4) / YEAR

// Masses spaced evenly in the logarithm, from the smallest to the largest the model covers.
const GRID = Array.from({ length: 200 }, (_, i) => MIN_MASS_KG * (MAX_MASS_KG / MIN_MASS_KG) ** (i / 199))

const byId = (id: string) => HAWKING_PRESETS.find((p) => p.id === id)!.massKg

describe('the black hole\'s temperature', () => {
  it('is about 6.17e-8 K for 1 Sun, and 6.17e-9, 1.435e-14 and 9.49e-18 K for 10 Suns, Sagittarius A* and M87*', () => {
    closeTo(hawkingTemperatureKelvin(SUN_MASS_KG), 6.17e-8, 0.005)
    closeTo(hawkingTemperatureKelvin(10 * SUN_MASS_KG), 6.17e-9, 0.01)
    closeTo(hawkingTemperatureKelvin(byId('sgr-a-star')), 1.435e-14, 0.01)
    closeTo(hawkingTemperatureKelvin(byId('m87-star')), 9.49e-18, 0.01)
  })

  it('equals the formula worked out separately in this file', () => {
    for (const m of GRID) closeTo(hawkingTemperatureKelvin(m), temperatureCheck(m), 1e-12)
  })

  it('is inversely proportional to the mass: doubling the mass halves it', () => {
    for (const m of GRID.slice(0, -1)) {
      closeTo(hawkingTemperatureKelvin(2 * m), hawkingTemperatureKelvin(m) / 2, 1e-12)
    }
  })

  it('exports the 1-Sun value, computed and not typed in', () => {
    expect(HAWKING_TEMPERATURE_OF_ONE_SUN_KELVIN).toBe(hawkingTemperatureKelvin(SUN_MASS_KG))
  })
})

describe('the lifetime', () => {
  it('is about 2.10e67 years for 1 Sun, and 2.10e70 for 10 Suns', () => {
    closeTo(lifetimeYears(SUN_MASS_KG), 2.1e67, 0.005)
    closeTo(LIFETIME_OF_ONE_SUN_YEARS, lifetimeYears(SUN_MASS_KG), 1e-15)
    closeTo(lifetimeYears(10 * SUN_MASS_KG), 2.1e70, 0.005)
  })

  it('equals the formula worked out separately in this file', () => {
    for (const m of GRID) closeTo(lifetimeYears(m), lifetimeCheck(m), 1e-12)
  })

  it('grows as the cube of the mass: ten times the mass takes a thousand times as long', () => {
    for (const m of GRID) {
      closeTo(lifetimeYears(10 * m) / lifetimeYears(m), 1000, 1e-12)
    }
  })

  it('is about 2.7e12 years for the mountain-sized black hole, and 2.4e44 for the balance mass', () => {
    closeTo(lifetimeYears(byId('mountain')), 2.665e12, 0.005)
    closeTo(lifetimeYears(balanceMassKg()), 2.43e44, 0.01)
  })

  it('massForLifetimeKg is its inverse, and the universe\'s age corresponds to about 1.73e11 kg', () => {
    closeTo(massForLifetimeKg(UNIVERSE_AGE_YEARS), 1.73e11, 0.01)
    closeTo(lifetimeYears(massForLifetimeKg(UNIVERSE_AGE_YEARS)), UNIVERSE_AGE_YEARS, 1e-12)
    for (const m of GRID) closeTo(massForLifetimeKg(lifetimeYears(m)), m, 1e-12)
  })
})

describe('the balance mass and the direction of the mass', () => {
  it('the balance mass is about 4.50e22 kg, about 0.61 of the Moon\'s mass, and its temperature is the background\'s', () => {
    closeTo(balanceMassKg(), 4.50e22, 0.005)
    closeTo(balanceMassKg() / 7.342e22, 0.613, 0.005)
    closeTo(hawkingTemperatureKelvin(balanceMassKg()), BACKGROUND_KELVIN, 1e-12)
    expect(massDirection(balanceMassKg())).toBe('balanced')
  })

  it('a black hole just lighter than the balance mass loses mass, and one just heavier gains it', () => {
    expect(massDirection(balanceMassKg() * 0.999)).toBe('loses')
    expect(massDirection(balanceMassKg() * 1.001)).toBe('gains')
  })

  it('the mountain-sized preset loses mass, and 1 Sun, 10 Suns, Sagittarius A* and M87* gain it', () => {
    expect(massDirection(byId('mountain'))).toBe('loses')
    for (const id of ['sun', 'ten-suns', 'sgr-a-star', 'm87-star']) expect(massDirection(byId(id))).toBe('gains')
  })

  it('the direction changes exactly once along the grid: lighter loses, heavier gains', () => {
    const directions = GRID.map(massDirection)
    const firstGain = directions.indexOf('gains')
    expect(firstGain).toBeGreaterThan(0)
    expect(directions.slice(0, firstGain).every((d) => d === 'loses')).toBe(true)
    expect(directions.slice(firstGain).every((d) => d === 'gains')).toBe(true)
  })

  it('the cooling the background needs for 1 Sun is about 4.4e7, and none is needed for a black hole that already loses mass', () => {
    closeTo(runHawkingRadiationExperiment(SUN_MASS_KG).coolingFactorNeeded!, 4.4e7, 0.01)
    expect(runHawkingRadiationExperiment(byId('mountain')).coolingFactorNeeded).toBeNull()
  })
})

describe('the result and the presets', () => {
  it('a smaller black hole is always hotter and shorter-lived than a bigger one, over the presets in order', () => {
    for (let i = 1; i < HAWKING_PRESETS.length; i++) {
      const smaller = HAWKING_PRESETS[i - 1].massKg
      const bigger = HAWKING_PRESETS[i].massKg
      expect(smaller).toBeLessThan(bigger)
      expect(hawkingTemperatureKelvin(smaller)).toBeGreaterThan(hawkingTemperatureKelvin(bigger))
      expect(lifetimeYears(smaller)).toBeLessThan(lifetimeYears(bigger))
    }
  })

  it('the temperature over the background is 1.2e11 / 2.725 for the mountain, and 2.27e-8 for 1 Sun', () => {
    closeTo(runHawkingRadiationExperiment(byId('mountain')).temperatureOverBackground, 1.227e11 / 2.725, 0.005)
    closeTo(runHawkingRadiationExperiment(SUN_MASS_KG).temperatureOverBackground, 2.264e-8, 0.005)
  })

  it('the lifetime over the universe\'s age is lifetime / 13.8e9 years', () => {
    const result = runHawkingRadiationExperiment(SUN_MASS_KG)
    closeTo(result.lifetimeOverUniverseAge, lifetimeCheck(SUN_MASS_KG) / 13.8e9, 1e-12)
  })

  it('reuses Experiment 1\'s horizon radius and the other experiments\' background temperature and universe age', () => {
    for (const p of HAWKING_PRESETS) {
      expect(runHawkingRadiationExperiment(p.massKg).horizonRadiusKm).toBe(horizonRadiusKm(p.massKg / SUN_MASS_KG))
    }
    closeTo(runHawkingRadiationExperiment(SUN_MASS_KG).horizonRadiusKm, 2.953, 0.001)
    expect(BACKGROUND_KELVIN).toBe(CMB_TEMPERATURE_TODAY_KELVIN)
    expect(UNIVERSE_AGE_YEARS).toBe(REAL_UNIVERSE_AGE_YEARS)
  })

  it('the curve covers the whole range, in order, and matches the functions', () => {
    const { curve } = runHawkingRadiationExperiment(SUN_MASS_KG)
    expect(curve[0].massKg).toBeCloseTo(MIN_MASS_KG, 0)
    closeTo(curve[curve.length - 1].massKg, MAX_MASS_KG, 1e-12)
    for (let i = 1; i < curve.length; i++) expect(curve[i].massKg).toBeGreaterThan(curve[i - 1].massKg)
    for (const p of curve) {
      expect(p.temperatureKelvin).toBe(hawkingTemperatureKelvin(p.massKg))
      expect(p.lifetimeYears).toBe(lifetimeYears(p.massKg))
    }
  })

  it('every preset lies inside the range the model covers', () => {
    for (const p of HAWKING_PRESETS) {
      expect(p.massKg).toBeGreaterThanOrEqual(MIN_MASS_KG)
      expect(p.massKg).toBeLessThanOrEqual(MAX_MASS_KG)
    }
  })
})

describe('the worked steps for the Results', () => {
  it('give the temperature and the lifetime the module\'s functions give, for every black hole on the grid', () => {
    for (const m of GRID) {
      const steps = hawkingSteps(m)
      closeTo(steps.temperatureKelvin, hawkingTemperatureKelvin(m), 1e-12)
      closeTo(steps.lifetimeYears, lifetimeYears(m), 1e-12)
      closeTo(steps.tenTimesMassLifetimeYears, lifetimeYears(10 * m), 1e-12)
    }
  })

  it('work the temperature as the 1-Sun value divided by the mass in Suns', () => {
    const steps = hawkingSteps(10 * SUN_MASS_KG)
    closeTo(steps.massSolarMasses, 10, 1e-12)
    closeTo(steps.oneSunTemperatureKelvin, 6.17e-8, 0.005)
    closeTo(steps.temperatureKelvin, steps.oneSunTemperatureKelvin / 10, 1e-12)
    closeTo(steps.temperatureOverBackground, steps.temperatureKelvin / 2.725, 1e-12)
    closeTo(steps.temperatureOverBackground, 2.264e-9, 0.005)
  })

  it('work the lifetime as the 1-Sun value times the cube of the mass in Suns', () => {
    const steps = hawkingSteps(10 * SUN_MASS_KG)
    closeTo(steps.massCubed, 1000, 1e-12)
    closeTo(steps.oneSunLifetimeYears, 2.1e67, 0.005)
    closeTo(steps.lifetimeYears, steps.oneSunLifetimeYears * 1000, 1e-12)
    closeTo(steps.lifetimeOverUniverseAge, steps.lifetimeYears / 13.8e9, 1e-12)
  })

  it('show that ten times the mass takes exactly 1,000 times as long, at every mass', () => {
    for (const m of GRID) closeTo(hawkingSteps(m).tenTimesMassRatio, 1000, 1e-12)
  })

  it('throw a RangeError for a mass that is not positive and finite', () => {
    for (const bad of [0, -1, NaN, Infinity]) expect(() => hawkingSteps(bad)).toThrow(RangeError)
  })
})

describe('bad inputs and determinism', () => {
  it('throws a RangeError for a non-positive, NaN, infinite or out-of-range mass', () => {
    for (const bad of [0, -1, NaN, Infinity]) {
      expect(() => hawkingTemperatureKelvin(bad)).toThrow(RangeError)
      expect(() => lifetimeYears(bad)).toThrow(RangeError)
      expect(() => massDirection(bad)).toThrow(RangeError)
      expect(() => massForLifetimeKg(bad)).toThrow(RangeError)
    }
    for (const bad of [0, -1, NaN, Infinity, MIN_MASS_KG * 0.99, MAX_MASS_KG * 1.01]) {
      expect(() => runHawkingRadiationExperiment(bad)).toThrow(RangeError)
    }
  })

  it('gives the same result for the same inputs', () => {
    for (const p of HAWKING_PRESETS) {
      expect(runHawkingRadiationExperiment(p.massKg)).toEqual(runHawkingRadiationExperiment(p.massKg))
    }
  })

  it('uses no wall-clock time or randomness, so playback speed cannot change a result (CLAUDE.md §11)', () => {
    expect(source).not.toMatch(/performance\.now|Date\.now|new Date|Math\.random|requestAnimationFrame|setTimeout/)
  })
})

describe('reuse (CLAUDE.md §8)', () => {
  it('imports only Experiment 1\'s black hole size module, the background\'s temperature and the Big Bang\'s universe age', () => {
    const importLines = source.split('\n').filter((line: string) => line.trim().startsWith('import'))
    const modules = importLines.map((line: string) => /from '\.\/([A-Za-z]+)'/.exec(line)![1]).sort()
    expect(modules).toEqual(['bigBangExperiment', 'blackHoleSizeExperiment', 'cosmicMicrowaveBackgroundExperiment'])
    const from = (name: string) => importLines.filter((line: string) => line.includes(`/${name}'`)).join(' ')
    expect(from('blackHoleSizeExperiment')).toContain('horizonRadiusKm')
    expect(from('blackHoleSizeExperiment')).toContain('OBJECT_PRESETS')
    expect(from('cosmicMicrowaveBackgroundExperiment')).toContain('CMB_TEMPERATURE_TODAY_KELVIN')
    expect(from('bigBangExperiment')).toContain('REAL_UNIVERSE_AGE_YEARS')
  })
})
