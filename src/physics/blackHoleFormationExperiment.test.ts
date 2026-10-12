import { describe, expect, it } from 'vitest'
import source from './blackHoleFormationExperiment.ts?raw'
import {
  CHANDRASEKHAR_LIMIT_SOLAR_MASSES,
  LADDER,
  MAX_CORE_MASS,
  MIN_CORE_MASS,
  NEUTRON_STAR_RADIUS_KM,
  SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES,
  SURE_NEUTRON_STAR_TOP_SOLAR_MASSES,
  coreOutcome,
  runBlackHoleFormationExperiment,
  whiteDwarfRadiusKm,
} from './blackHoleFormationExperiment'
import { horizonRadiusKm } from './blackHoleSizeExperiment'

const closeTo = (actual: number, expected: number, relative: number) =>
  expect(Math.abs(actual / expected - 1)).toBeLessThan(relative)

const SUN_RADIUS_KM = 695_700

// ---- A white dwarf built from the standard degenerate-electron equation of state (Chandrasekhar's), integrated here from
// the hydrostatic equilibrium equations, separately from the module. Two nucleons per electron. Returns the mass in solar
// masses and the radius in km for a given central value of x = p_F / (m_e c).
const ME = 9.1093837015e-31
const C = 299792458
const H = 6.62607015e-34
const G = 6.6743e-11
const MU = 1.66053906660e-27
const MSUN = 1.98847e30
const PRESSURE_SCALE = (Math.PI * ME ** 4 * C ** 5) / (3 * H ** 3)
const DENSITY_SCALE = ((8 * Math.PI * ME ** 3 * C ** 3) / (3 * H ** 3)) * 2 * MU
const density = (x: number) => DENSITY_SCALE * x ** 3
const dPressureDx = (x: number) => (8 * PRESSURE_SCALE * x ** 4) / Math.sqrt(1 + x * x)

function integratedWhiteDwarf(centralX: number): { mass: number; radiusKm: number } {
  let r = 1
  let x = centralX
  let m = (4 / 3) * Math.PI * r ** 3 * density(x)
  const f = (xx: number, mm: number, rr: number): [number, number] => [(-G * mm * density(xx)) / rr ** 2 / dPressureDx(xx), 4 * Math.PI * rr * rr * density(xx)]
  while (x > 1e-3) {
    const dr = Math.max(1e3, r * 2e-4)
    const k1 = f(x, m, r)
    const k2 = f(x + (dr / 2) * k1[0], m + (dr / 2) * k1[1], r + dr / 2)
    const k3 = f(x + (dr / 2) * k2[0], m + (dr / 2) * k2[1], r + dr / 2)
    const k4 = f(x + dr * k3[0], m + dr * k3[1], r + dr)
    x += (dr / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0])
    m += (dr / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])
    r += dr
    if (x <= 0) break
  }
  return { mass: m / MSUN, radiusKm: r / 1e3 }
}

const integrated = [0.2, 0.3, 0.5, 1, 2, 3, 5, 8].map(integratedWhiteDwarf)

describe('the independent integration of a white dwarf (a check of the check)', () => {
  it('reaches a largest mass near the analytic Chandrasekhar mass for two nucleons per electron, 5.83 / 4 = 1.4575 Suns', () => {
    const heavy = integratedWhiteDwarf(100)
    closeTo(heavy.mass, 1.4575, 0.01)
  })

  it('shows a heavier white dwarf is smaller (radius falls as the mass rises)', () => {
    for (let i = 1; i < integrated.length; i++) {
      expect(integrated[i].mass).toBeGreaterThan(integrated[i - 1].mass)
      expect(integrated[i].radiusKm).toBeLessThan(integrated[i - 1].radiusKm)
    }
  })
})

describe('the white dwarf\'s radius', () => {
  it('equals 0.0131 R_sun M^(-1/3) sqrt(1 - (M/1.44)^(4/3)), written separately here', () => {
    for (const m of [0.1, 0.3, 0.6, 1, 1.2, 1.4]) {
      const expected = 0.0131 * SUN_RADIUS_KM * m ** (-1 / 3) * Math.sqrt(1 - (m / 1.44) ** (4 / 3))
      expect(whiteDwarfRadiusKm(m)).toBeCloseTo(expected, 6)
    }
  })

  it('falls as the mass rises, over a fine grid up to the limit', () => {
    let previous = whiteDwarfRadiusKm(0.05)
    for (let m = 0.06; m < 1.4399; m += 0.001) {
      const now = whiteDwarfRadiusKm(m)
      expect(now).toBeLessThan(previous)
      previous = now
    }
  })

  it('is about 8,970 km at 0.6 Suns, 5,650 at 1.0 and 1,560 at 1.4 (within 1%)', () => {
    closeTo(whiteDwarfRadiusKm(0.6), 8968, 0.01)
    closeTo(whiteDwarfRadiusKm(1.0), 5655, 0.01)
    closeTo(whiteDwarfRadiusKm(1.4), 1564, 0.01)
  })

  it('falls toward zero at the limit, and is about Earth-sized (several thousand km) for ordinary white dwarfs', () => {
    expect(whiteDwarfRadiusKm(1.4399)).toBeLessThan(200)
    for (const m of [0.5, 0.6, 0.8]) {
      expect(whiteDwarfRadiusKm(m)).toBeGreaterThan(5000)
      expect(whiteDwarfRadiusKm(m)).toBeLessThan(12000)
    }
  })

  it('matches the numerical integration within 3.5% up to 1.2 Suns and within 8% up to 1.35', () => {
    let checked = 0
    for (const wd of integrated) {
      if (wd.mass <= 1.2) {
        closeTo(whiteDwarfRadiusKm(wd.mass), wd.radiusKm, 0.035)
        checked++
      } else if (wd.mass <= 1.35) {
        closeTo(whiteDwarfRadiusKm(wd.mass), wd.radiusKm, 0.08)
        checked++
      }
    }
    expect(checked).toBeGreaterThanOrEqual(6)
  })

  it('has, for light white dwarfs, R M^(1/3) within 10% of the source\'s 0.012 R_sun and within 3.5% of the integration\'s value', () => {
    for (const m of [0.1, 0.2, 0.3]) {
      const scaled = (whiteDwarfRadiusKm(m) * m ** (1 / 3)) / SUN_RADIUS_KM
      closeTo(scaled, 0.012, 0.1)
    }
    const light = integrated.find((wd) => wd.mass > 0.05 && wd.mass < 0.15)!
    const integratedScaled = (light.radiusKm * light.mass ** (1 / 3)) / SUN_RADIUS_KM
    closeTo((whiteDwarfRadiusKm(light.mass) * light.mass ** (1 / 3)) / SUN_RADIUS_KM, integratedScaled, 0.035)
  })

  it('throws a RangeError at or above the limit, and for a non-positive or non-finite mass', () => {
    for (const bad of [1.44, 1.5, 10, 0, -1, NaN, Infinity]) expect(() => whiteDwarfRadiusKm(bad)).toThrow(RangeError)
  })
})

describe('what holds the core up', () => {
  it('is a white dwarf below 1.44, a neutron star from 1.44 up to 2, uncertain above 2 up to 3, and a black hole above 3', () => {
    expect(coreOutcome(0.6)).toBe('white-dwarf')
    expect(coreOutcome(1.4399)).toBe('white-dwarf')
    expect(coreOutcome(1.44)).toBe('neutron-star')
    expect(coreOutcome(1.8)).toBe('neutron-star')
    expect(coreOutcome(2)).toBe('neutron-star')
    expect(coreOutcome(2.0001)).toBe('uncertain')
    expect(coreOutcome(2.5)).toBe('uncertain')
    expect(coreOutcome(3)).toBe('uncertain')
    expect(coreOutcome(3.0001)).toBe('black-hole')
    expect(coreOutcome(10)).toBe('black-hole')
  })

  it('gives the preset masses 0.6, 1.0, 1.4, 1.8, 2.5, 3.5 and 10 the outcomes of the specification\'s table', () => {
    expect([0.6, 1.0, 1.4, 1.8, 2.5, 3.5, 10].map(coreOutcome)).toEqual([
      'white-dwarf',
      'white-dwarf',
      'white-dwarf',
      'neutron-star',
      'uncertain',
      'black-hole',
      'black-hole',
    ])
  })

  it('throws a RangeError for a non-positive or non-finite mass', () => {
    for (const bad of [0, -1, NaN, Infinity]) expect(() => coreOutcome(bad)).toThrow(RangeError)
  })

  it('has zones that cover the whole range of masses in order, with no gaps and no overlap, and edges at 1.44, 2 and 3', () => {
    expect(LADDER.map((z) => z.outcome)).toEqual(['white-dwarf', 'neutron-star', 'uncertain', 'black-hole'])
    expect(LADDER[0].fromSolarMasses).toBe(MIN_CORE_MASS)
    expect(LADDER[LADDER.length - 1].toSolarMasses).toBe(MAX_CORE_MASS)
    for (let i = 1; i < LADDER.length; i++) expect(LADDER[i].fromSolarMasses).toBe(LADDER[i - 1].toSolarMasses)
    expect(LADDER.slice(0, -1).map((z) => z.toSolarMasses)).toEqual([1.44, 2, 3])
    expect([CHANDRASEKHAR_LIMIT_SOLAR_MASSES, SURE_NEUTRON_STAR_TOP_SOLAR_MASSES, SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES]).toEqual([1.44, 2, 3])
  })
})

describe('running the experiment', () => {
  it('reuses Experiment 1\'s horizon radius: 8.86 km at 3 Suns, 14.8 km at 5 and 29.5 km at 10', () => {
    for (const m of [0.6, 1.4, 2.5, 3, 5, 10]) expect(runBlackHoleFormationExperiment(m).horizonRadiusKm).toBe(horizonRadiusKm(m))
    closeTo(runBlackHoleFormationExperiment(3).horizonRadiusKm, 8.86, 0.01)
    closeTo(runBlackHoleFormationExperiment(5).horizonRadiusKm, 14.77, 0.01)
    closeTo(runBlackHoleFormationExperiment(10).horizonRadiusKm, 29.53, 0.01)
  })

  it('gives a neutron star 12 km, and a ratio of 12 over the horizon radius: 2.54 at 1.6, 2.03 at 2 and 1.35 at 3 (within 1%)', () => {
    expect(runBlackHoleFormationExperiment(1.6).heldUpRadiusKm).toBe(NEUTRON_STAR_RADIUS_KM)
    closeTo(runBlackHoleFormationExperiment(1.6).radiusOverHorizon as number, 2.54, 0.01)
    closeTo(runBlackHoleFormationExperiment(2).radiusOverHorizon as number, 2.03, 0.01)
    closeTo(runBlackHoleFormationExperiment(3).radiusOverHorizon as number, 1.35, 0.01)
    expect(NEUTRON_STAR_RADIUS_KM).toBe(12)
  })

  it('gives a white dwarf its own radius, and a ratio to the horizon of about 4,600 at 0.6 and 1,750 at 1.0 (within 15%)', () => {
    const light = runBlackHoleFormationExperiment(0.6)
    expect(light.heldUpRadiusKm).toBe(whiteDwarfRadiusKm(0.6))
    closeTo(light.radiusOverHorizon as number, 5067, 0.01) // 8,968 km over 1.77 km
    closeTo(light.radiusOverHorizon as number, 4600, 0.15)
    closeTo(runBlackHoleFormationExperiment(1.0).radiusOverHorizon as number, 1750, 0.15)
  })

  it('gives a black hole no held-up radius and no ratio', () => {
    for (const m of [3.5, 5, 10]) {
      const r = runBlackHoleFormationExperiment(m)
      expect(r.outcome).toBe('black-hole')
      expect(r.heldUpRadiusKm).toBeNull()
      expect(r.radiusOverHorizon).toBeNull()
    }
  })

  it('has a white dwarf\'s radius over the horizon radius above 100 up to 1.43 Suns, falling as the mass rises', () => {
    let previous = Infinity
    for (let m = 0.3; m <= 1.43; m += 0.005) {
      const ratio = runBlackHoleFormationExperiment(m).radiusOverHorizon as number
      expect(ratio).toBeGreaterThan(100)
      expect(ratio).toBeLessThan(previous)
      previous = ratio
    }
  })

  it('has a 12 km ball as wide as its horizon only at about 4.06 Suns, which is above the black hole edge of 3', () => {
    const massWhereEqual = NEUTRON_STAR_RADIUS_KM / horizonRadiusKm(1)
    closeTo(massWhereEqual, 4.06, 0.01)
    expect(massWhereEqual).toBeGreaterThan(SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES)
  })

  it('has a curve from the smallest to the largest mass, in order, with the horizon proportional to the mass and nothing held up above 3', () => {
    const { curve } = runBlackHoleFormationExperiment(1.4)
    expect(curve[0].coreMassSolarMasses).toBeCloseTo(MIN_CORE_MASS, 12)
    closeTo(curve[curve.length - 1].coreMassSolarMasses, MAX_CORE_MASS, 1e-9)
    for (let i = 1; i < curve.length; i++) {
      expect(curve[i].coreMassSolarMasses).toBeGreaterThan(curve[i - 1].coreMassSolarMasses)
      expect(curve[i].horizonRadiusKm).toBeGreaterThan(curve[i - 1].horizonRadiusKm)
    }
    for (const p of curve) {
      closeTo(p.horizonRadiusKm / p.coreMassSolarMasses, horizonRadiusKm(1), 1e-9)
      if (p.coreMassSolarMasses > 3) expect(p.heldUpRadiusKm).toBeNull()
      else expect(p.heldUpRadiusKm).not.toBeNull()
    }
  })

  it('carries the ladder', () => {
    expect(runBlackHoleFormationExperiment(2.5).ladder).toEqual(LADDER)
  })

  it('works at the smallest and largest masses and throws a RangeError outside them, or for NaN', () => {
    expect(runBlackHoleFormationExperiment(MIN_CORE_MASS).outcome).toBe('white-dwarf')
    expect(runBlackHoleFormationExperiment(MAX_CORE_MASS).outcome).toBe('black-hole')
    for (const bad of [0.29, 10.01, 0, -1, NaN, Infinity]) expect(() => runBlackHoleFormationExperiment(bad)).toThrow(RangeError)
  })
})

describe('determinism and playback speed', () => {
  it('gives the same result for the same inputs', () => {
    expect(runBlackHoleFormationExperiment(2.5)).toEqual(runBlackHoleFormationExperiment(2.5))
  })

  it('uses no wall-clock time or randomness, so playback speed cannot change a result (CLAUDE.md §11)', () => {
    expect(source).not.toMatch(/performance\.now|Date\.now|new Date|Math\.random|requestAnimationFrame|setTimeout/)
  })
})

describe('reuse (CLAUDE.md §8)', () => {
  it('imports horizonRadiusKm from blackHoleSizeExperiment and from none of the other experiments\' modules', () => {
    const importLines = source.split('\n').filter((line: string) => line.trim().startsWith('import'))
    const from = (name: string) => importLines.filter((line: string) => line.includes(name)).join(' ')
    expect(from('blackHoleSizeExperiment')).toContain('horizonRadiusKm')
    for (const other of [
      'spinningBlackHoleExperiment',
      'colorOfTheFallExperiment',
      'seeingTheFallExperiment',
      'fallingInExperiment',
      'timeNearBlackHoleExperiment',
      'orbitsNearBlackHoleExperiment',
      'lightNearBlackHoleExperiment',
      'blackHoleExperiment',
      'orbitExperiment',
      'hubblesLawExperiment',
    ]) {
      expect(importLines.some((line: string) => line.includes(`/${other}'`))).toBe(false)
    }
  })
})
