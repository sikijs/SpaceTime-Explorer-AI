import { describe, expect, it } from 'vitest'
import {
  CLUMP_THRESHOLD,
  MATTER_RADIATION_EQUALITY_REDSHIFT,
  MAX_START_DELTA,
  MIN_START_DELTA,
  RECOMBINATION_REDSHIFT,
  START_SIZE_PRESETS,
  densityExcessAt,
  growthBetween,
  growthFactor,
  requiredStartDelta,
  runStructureFormationExperiment,
} from './structureFormationExperiment'
import { BEST_FIT_DARK_ENERGY_FRACTION } from './darkEnergyExperiment'
import { universeAgeYears } from './universeAgeExperiment'
import { RECOMBINATION_REDSHIFT as EXPERIMENT_3_RECOMBINATION_REDSHIFT } from './cosmicMicrowaveBackgroundExperiment'

const L = BEST_FIT_DARK_ENERGY_FRACTION
const relativeError = (a: number, b: number) => Math.abs(a - b) / Math.abs(b)

describe('growth factor of a small density excess', () => {
  it('equals the universe relative size exactly when there is no dark energy', () => {
    for (const a of [0.0003, 0.001, 0.01, 0.1, 0.5, 1]) {
      expect(relativeError(growthFactor(a, 0), a)).toBeLessThan(1e-9)
    }
  })

  it('is within 0.1% of the relative size at early times, even with dark energy', () => {
    expect(relativeError(growthFactor(0.001, L), 0.001)).toBeLessThan(1e-3)
  })

  it('matches the values worked out for the specification', () => {
    // Independent literal values from the specification's table (Hubble constant 70, 70% dark energy).
    expect(relativeError(growthBetween(0.5, 0, L), 1.3)).toBeLessThan(0.05)
    expect(relativeError(growthBetween(2, 0, L), 2.4)).toBeLessThan(0.05)
    expect(relativeError(growthBetween(10, 0, L), 8.6)).toBeLessThan(0.02)
    expect(relativeError(growthBetween(RECOMBINATION_REDSHIFT, 0, L), 850)).toBeLessThan(0.01)
    expect(relativeError(growthBetween(MATTER_RADIATION_EQUALITY_REDSHIFT, 0, L), 2650)).toBeLessThan(0.01)
  })

  it('stays below the full size ratio when there is dark energy, and equals it when there is none', () => {
    for (const z of [0.5, 2, 10, RECOMBINATION_REDSHIFT]) {
      expect(growthBetween(z, 0, L)).toBeLessThan(1 + z)
      expect(relativeError(growthBetween(z, 0, 0), 1 + z)).toBeLessThan(1e-9)
    }
  })

  it('increases with the size ratio and decreases as the dark energy share increases', () => {
    const zs = [0.5, 2, 10, 100, RECOMBINATION_REDSHIFT]
    for (let i = 1; i < zs.length; i++) {
      expect(growthBetween(zs[i], 0, L)).toBeGreaterThan(growthBetween(zs[i - 1], 0, L))
    }
    const shares = [0, 0.3, 0.5, 0.7, 0.9]
    for (let i = 1; i < shares.length; i++) {
      expect(growthBetween(RECOMBINATION_REDSHIFT, 0, shares[i])).toBeLessThan(
        growthBetween(RECOMBINATION_REDSHIFT, 0, shares[i - 1]),
      )
    }
  })

  it('is accurate at the default number of steps compared with a much finer integration', () => {
    for (const a of [1 / (1 + RECOMBINATION_REDSHIFT), 0.1, 1]) {
      expect(relativeError(growthFactor(a, L), growthFactor(a, L, 400_000))).toBeLessThan(1e-3)
    }
  })

  it('gives dark matter a head start of about 3 over ordinary matter, by the ratio of the two growths', () => {
    const ordinary = growthBetween(RECOMBINATION_REDSHIFT, 0, L)
    const dark = growthBetween(MATTER_RADIATION_EQUALITY_REDSHIFT, 0, L)
    expect(dark).toBeGreaterThan(ordinary)
    const a = runStructureFormationExperiment('ordinary', 1e-4)
    const b = runStructureFormationExperiment('ordinary-plus-dark', 1e-4)
    expect(relativeError(b.densityExcessToday / a.densityExcessToday, dark / ordinary)).toBeLessThan(1e-9)
    expect(dark / ordinary).toBeGreaterThan(3)
    expect(dark / ordinary).toBeLessThan(3.2)
  })
})

describe('density excess of a ripple', () => {
  it('returns the starting excess exactly at (and before) the start, and scales linearly with it', () => {
    expect(densityExcessAt(RECOMBINATION_REDSHIFT, RECOMBINATION_REDSHIFT, 1e-4, L)).toBe(1e-4)
    expect(densityExcessAt(5000, RECOMBINATION_REDSHIFT, 1e-4, L)).toBe(1e-4)
    const small = densityExcessAt(2, RECOMBINATION_REDSHIFT, 1e-5, L)
    const big = densityExcessAt(2, RECOMBINATION_REDSHIFT, 1e-3, L)
    expect(relativeError(big / small, 100)).toBeLessThan(1e-9)
  })
})

describe('required starting size and clumps', () => {
  it('requires one divided by the growth since the start, about 1 part in 850 and 1 part in 2,650', () => {
    for (const z of [RECOMBINATION_REDSHIFT, MATTER_RADIATION_EQUALITY_REDSHIFT]) {
      expect(relativeError(requiredStartDelta(z, L), CLUMP_THRESHOLD / growthBetween(z, 0, L))).toBeLessThan(1e-12)
    }
    expect(relativeError(1 / requiredStartDelta(RECOMBINATION_REDSHIFT, L), 850)).toBeLessThan(0.01)
    expect(relativeError(1 / requiredStartDelta(MATTER_RADIATION_EQUALITY_REDSHIFT, L), 2650)).toBeLessThan(0.01)
  })

  it('becomes a clump exactly when the start is at least the required size, for both kinds of matter', () => {
    for (const kind of ['ordinary', 'ordinary-plus-dark'] as const) {
      const required = runStructureFormationExperiment(kind, 1e-4).requiredStartDelta
      expect(runStructureFormationExperiment(kind, required * 0.999).becameClump).toBe(false)
      expect(runStructureFormationExperiment(kind, required * 1.001).becameClump).toBe(true)
      expect(runStructureFormationExperiment(kind, required * 1.001).redshiftOfClump).not.toBeNull()
    }
  })

  it('reports the first redshift at which the excess reaches the threshold', () => {
    const result = runStructureFormationExperiment('ordinary-plus-dark', 1e-3)
    expect(result.becameClump).toBe(true)
    const z = result.redshiftOfClump as number
    expect(z).toBeGreaterThan(0)
    expect(z).toBeLessThan(result.startRedshift)
    expect(relativeError(densityExcessAt(z, result.startRedshift, 1e-3, L), CLUMP_THRESHOLD)).toBeLessThan(1e-6)
    // The excess is below the threshold at every earlier curve point.
    for (const point of result.curve.filter((p) => p.redshift > z)) {
      expect(point.densityExcess).toBeLessThan(CLUMP_THRESHOLD)
    }
  })

  it('shows a visible contrast across the presets: one clumps with ordinary matter, one only with dark matter, two with neither', () => {
    const outcome = (startDelta: number) => ({
      ordinary: runStructureFormationExperiment('ordinary', startDelta).becameClump,
      dark: runStructureFormationExperiment('ordinary-plus-dark', startDelta).becameClump,
    })
    const results = START_SIZE_PRESETS.map((p) => outcome(p.startDelta))
    expect(results.filter((r) => r.ordinary && r.dark)).toHaveLength(1)
    expect(results.filter((r) => !r.ordinary && r.dark)).toHaveLength(1)
    expect(results.filter((r) => !r.ordinary && !r.dark)).toHaveLength(2)
    expect(MIN_START_DELTA).toBe(START_SIZE_PRESETS[0].startDelta)
    expect(MAX_START_DELTA).toBe(START_SIZE_PRESETS[START_SIZE_PRESETS.length - 1].startDelta)
  })

  it('reports the other kind of matter\'s required start for comparison', () => {
    const a = runStructureFormationExperiment('ordinary', 1e-4)
    const b = runStructureFormationExperiment('ordinary-plus-dark', 1e-4)
    expect(a.requiredStartDeltaOtherMatter).toBe(b.requiredStartDelta)
    expect(b.requiredStartDeltaOtherMatter).toBe(a.requiredStartDelta)
    expect(b.requiredStartDelta).toBeLessThan(a.requiredStartDelta)
  })
})

describe('experiment result', () => {
  it('has a curve from the start to today that only grows, ending at today with the age of the universe', () => {
    const result = runStructureFormationExperiment('ordinary', 1e-3)
    const first = result.curve[0]
    const last = result.curve[result.curve.length - 1]
    expect(first.redshift).toBeCloseTo(RECOMBINATION_REDSHIFT, 6)
    expect(first.growth).toBeCloseTo(1, 9)
    expect(last.redshift).toBe(0)
    expect(relativeError(last.yearsAfterBigBang, universeAgeYears(L))).toBeLessThan(1e-9)
    expect(relativeError(last.growth, result.growthSinceStart)).toBeLessThan(1e-12)
    for (let i = 1; i < result.curve.length; i++) {
      expect(result.curve[i].growth).toBeGreaterThan(result.curve[i - 1].growth)
      expect(result.curve[i].yearsAfterBigBang).toBeGreaterThan(result.curve[i - 1].yearsAfterBigBang)
    }
  })

  it('reports growth without dark energy as exactly 1 + the start redshift', () => {
    const result = runStructureFormationExperiment('ordinary', 1e-3)
    expect(relativeError(result.growthWithoutDarkEnergy, 1 + RECOMBINATION_REDSHIFT)).toBeLessThan(1e-9)
    expect(result.growthSinceStart).toBeLessThan(result.growthWithoutDarkEnergy)
  })
})

describe('constants and imports', () => {
  it('restates the oldest light\'s redshift equal to Experiment 3\'s own', () => {
    expect(RECOMBINATION_REDSHIFT).toBe(EXPERIMENT_3_RECOMBINATION_REDSHIFT)
  })

  it('imports from the earlier experiments rather than redefining, and not from Experiment 3', async () => {
    const source = await import('node:fs/promises').then((fs) =>
      fs.readFile(new URL('./structureFormationExperiment.ts', import.meta.url), 'utf-8'),
    )
    const imports = [...source.matchAll(/import\s*\{([^}]*)\}\s*from\s*'([^']+)'/g)].map((m) => ({
      names: m[1],
      module: m[2],
    }))
    const from = (name: string) =>
      imports
        .filter((i) => i.module.includes(name))
        .map((i) => i.names)
        .join(' ')
    expect(from('darkEnergyExperiment')).toContain('expansionRateRatio')
    expect(from('darkEnergyExperiment')).toContain('BEST_FIT_DARK_ENERGY_FRACTION')
    expect(from('observableUniverseExperiment')).toContain('timeAfterBigBangYears')
    expect(imports.some((i) => i.module.includes('cosmicMicrowaveBackgroundExperiment'))).toBe(false)
    expect(source).not.toMatch(/function\s+expansionRateRatio/)
    expect(source).not.toMatch(/function\s+timeAfterBigBangYears/)
  })
})
