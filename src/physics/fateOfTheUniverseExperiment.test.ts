import { describe, expect, it } from 'vitest'
import {
  FUTURE_GRAPH_MAX_YEARS,
  NUMBER_OF_DOUBLINGS_SHOWN,
  PAST_GRAPH_YEARS,
  expansionRateAtSize,
  futureRelativeSize,
  longTermDoublingTimeYears,
  longTermExpansionRate,
  runFateOfTheUniverseExperiment,
  speedUpSize,
  yearsToGrow,
} from './fateOfTheUniverseExperiment'
import { BEST_FIT_DARK_ENERGY_FRACTION, decelerationParameter } from './darkEnergyExperiment'
import { HUBBLE_CONSTANT_KM_PER_S_PER_MPC } from './hubblesLawExperiment'
import { hubbleTimeYears } from './bigBangExperiment'
import { relativeSizeAtTime, universeAgeYears } from './universeAgeExperiment'

const L = BEST_FIT_DARK_ENERGY_FRACTION
const BILLION = 1e9
const relativeError = (a: number, b: number) => Math.abs(a - b) / Math.abs(b)

describe('size of the universe in the future', () => {
  it('is 1 today for every dark energy share, and grows with time', () => {
    for (const share of [0, 0.1, 0.3, 0.7, 0.9]) {
      expect(relativeError(futureRelativeSize(0, share), 1)).toBeLessThan(1e-9)
      let previous = 1
      for (const years of [1, 5, 20, 60, 100].map((b) => b * BILLION)) {
        const size = futureRelativeSize(years, share)
        expect(size).toBeGreaterThan(previous)
        previous = size
      }
    }
  })

  it("agrees with Experiment 6's formula at today's age plus the time from now", () => {
    for (const share of [0, 0.3, 0.7]) {
      const years = 37 * BILLION
      expect(futureRelativeSize(years, share)).toBe(
        relativeSizeAtTime(universeAgeYears(share) + years, share),
      )
    }
  })

  it('matches the values worked out for the specification', () => {
    // Independent literal values (Hubble constant 70), computed separately for the specification's table.
    const cases: Array<[number, number, number]> = [
      [0, 10, 1.626],
      [0, 50, 3.436],
      [0, 100, 5.165],
      [0.3, 50, 8.939],
      [0.7, 10, 1.918],
      [0.7, 20, 3.52],
      [0.7, 50, 21.262],
      [0.7, 100, 424.858],
      [0.9, 50, 30.375],
      [0.9, 100, 906.354],
    ]
    for (const [share, billions, expected] of cases) {
      expect(relativeError(futureRelativeSize(billions * BILLION, share), expected)).toBeLessThan(0.005)
    }
  })
})

describe('doubling times', () => {
  it('with no dark energy, 1 to 2 takes about 17.0 billion years', () => {
    expect(relativeError(yearsToGrow(1, 2, 0), 17.03 * BILLION)).toBeLessThan(0.005)
  })

  it('with no dark energy, each doubling takes 2^(3/2) times as long as the one before', () => {
    const hubbleTime = hubbleTimeYears()
    for (const size of [0.5, 1, 4, 30]) {
      const expected = (2 / 3) * hubbleTime * Math.pow(size, 1.5) * (Math.pow(2, 1.5) - 1)
      expect(relativeError(yearsToGrow(size, 2 * size, 0), expected)).toBeLessThan(1e-9)
      expect(
        relativeError(yearsToGrow(2 * size, 4 * size, 0) / yearsToGrow(size, 2 * size, 0), Math.pow(2, 1.5)),
      ).toBeLessThan(1e-9)
    }
  })

  it('with the real dark energy share, successive doublings match the specification (10.7, 11.4, 11.6)', () => {
    expect(relativeError(yearsToGrow(1, 2, L), 10.68 * BILLION)).toBeLessThan(0.01)
    expect(relativeError(yearsToGrow(2, 4, L), 11.44 * BILLION)).toBeLessThan(0.01)
    expect(relativeError(yearsToGrow(4, 8, L), 11.56 * BILLION)).toBeLessThan(0.01)
  })

  it('with the real share, the ratio of consecutive doubling times approaches 1', () => {
    const doublings = runFateOfTheUniverseExperiment(L).doublings
    const ratios = [0, 1, 2].map((i) => doublings[i + 1].years / doublings[i].years)
    expect(ratios[0]).toBeGreaterThan(1)
    expect(ratios[1]).toBeGreaterThan(1)
    expect(ratios[1]).toBeLessThan(ratios[0])
    expect(ratios[2]).toBeLessThan(1.01)
  })

  it('settles to ln 2 / (H0 x sqrt(L)) for every dark energy share above zero', () => {
    for (const share of [0.05, 0.3, 0.5, 0.7, 0.9]) {
      const atLargeSize = yearsToGrow(1000, 2000, share)
      expect(relativeError(atLargeSize, longTermDoublingTimeYears(share))).toBeLessThan(0.001)
    }
    expect(relativeError(longTermDoublingTimeYears(L), 11.57 * BILLION)).toBeLessThan(0.002)
    expect(relativeError(longTermDoublingTimeYears(0.3), 17.68 * BILLION)).toBeLessThan(0.002)
    expect(relativeError(longTermDoublingTimeYears(0.9), 10.21 * BILLION)).toBeLessThan(0.002)
  })

  it('with no dark energy, the settled doubling time is infinite and each doubling is longer than the last', () => {
    expect(longTermDoublingTimeYears(0)).toBe(Infinity)
    const doublings = runFateOfTheUniverseExperiment(0).doublings
    for (let i = 1; i < doublings.length; i++) {
      expect(doublings[i].years).toBeGreaterThan(doublings[i - 1].years)
    }
  })
})

describe('expansion rate', () => {
  it("equals the Hubble constant at today's size for every share", () => {
    for (const share of [0, 0.3, 0.7, 0.9]) {
      expect(relativeError(expansionRateAtSize(1, share), HUBBLE_CONSTANT_KM_PER_S_PER_MPC)).toBeLessThan(1e-12)
    }
  })

  it('with dark energy, falls with size toward its long-term value and stays above it', () => {
    const limit = longTermExpansionRate(L)
    let previous = expansionRateAtSize(1, L)
    for (const size of [2, 4, 8, 50, 1000]) {
      const rate = expansionRateAtSize(size, L)
      expect(rate).toBeLessThan(previous)
      expect(rate).toBeGreaterThan(limit)
      previous = rate
    }
    expect(relativeError(previous, limit)).toBeLessThan(1e-3)
  })

  it('with no dark energy, falls toward zero and goes below any positive value', () => {
    expect(longTermExpansionRate(0)).toBe(0)
    expect(expansionRateAtSize(1e6, 0)).toBeLessThan(1e-3)
    expect(expansionRateAtSize(1e6, 0)).toBeLessThan(expansionRateAtSize(1e3, 0))
  })

  it('has a long-term value of about 58.6 km/s/Mpc for the real share', () => {
    expect(relativeError(longTermExpansionRate(L), 58.57)).toBeLessThan(0.002)
  })
})

describe('when the expansion starts speeding up', () => {
  it("is exactly today at a dark energy share of 1/3, agreeing with Experiment 5", () => {
    expect(relativeError(speedUpSize(1 / 3), 1)).toBeLessThan(1e-12)
    expect(Math.abs(decelerationParameter(1 / 3))).toBeLessThan(1e-12)
  })

  it('is before today if and only if the expansion speeds up today (Experiment 5)', () => {
    for (const share of [0.05, 0.2, 0.33, 0.34, 0.5, 0.7, 0.9]) {
      expect(speedUpSize(share) < 1).toBe(decelerationParameter(share) < 0)
    }
  })

  it('is about 0.598 for the real share, and never for no dark energy', () => {
    expect(relativeError(speedUpSize(L), 0.5984)).toBeLessThan(0.001)
    expect(speedUpSize(0)).toBe(Infinity)
  })

  it('is where the speed at which the universe grows is at its lowest', () => {
    // Speed of growth = size x expansion rate. It falls, then rises, with its minimum at the switch size.
    const speed = (size: number, share: number) => size * expansionRateAtSize(size, share)
    for (const share of [0.3, 0.7]) {
      const s = speedUpSize(share)
      expect(speed(0.9 * s, share)).toBeGreaterThan(speed(s, share))
      expect(speed(1.1 * s, share)).toBeGreaterThan(speed(s, share))
    }
  })

  it('happened about 6 billion years ago for the real share, and is in the future for 30%', () => {
    const real = runFateOfTheUniverseExperiment(L).speedUpYearsFromNow
    expect(real).not.toBeNull()
    expect(relativeError(real as number, -6.14 * BILLION)).toBeLessThan(0.01)
    const weaker = runFateOfTheUniverseExperiment(0.3).speedUpYearsFromNow
    expect(weaker).not.toBeNull()
    expect(weaker as number).toBeGreaterThan(0)
    expect(runFateOfTheUniverseExperiment(0).speedUpYearsFromNow).toBeNull()
  })
})

describe('the complete experiment run', () => {
  it("says the expansion 'slows-forever' if and only if there is no dark energy", () => {
    expect(runFateOfTheUniverseExperiment(0).fate).toBe('slows-forever')
    for (const share of [0.05, 0.3, 0.7, 0.9]) {
      expect(runFateOfTheUniverseExperiment(share).fate).toBe('steady-growth')
    }
  })

  it('returns the right number of doublings, each starting where the last ended', () => {
    const result = runFateOfTheUniverseExperiment(L)
    expect(result.doublings).toHaveLength(NUMBER_OF_DOUBLINGS_SHOWN)
    expect(result.doublingTimeRatios).toHaveLength(NUMBER_OF_DOUBLINGS_SHOWN - 1)
    expect(result.doublings[0].fromSize).toBe(1)
    for (let i = 1; i < result.doublings.length; i++) {
      expect(result.doublings[i].fromSize).toBe(result.doublings[i - 1].toSize)
    }
  })

  it('has a curve that grows and ends at the fixed axis limit, matching the headline values', () => {
    for (const share of [0, 0.3, 0.7, 0.9]) {
      const result = runFateOfTheUniverseExperiment(share)
      const { curve } = result
      expect(curve[0].yearsFromNow).toBeCloseTo(-PAST_GRAPH_YEARS, 0)
      expect(curve[curve.length - 1].yearsFromNow).toBeCloseTo(FUTURE_GRAPH_MAX_YEARS, 0)
      for (let i = 1; i < curve.length; i++) {
        expect(curve[i].relativeSize).toBeGreaterThanOrEqual(curve[i - 1].relativeSize)
        if (curve[i].relativeSize > 0) expect(curve[i].relativeSize).toBeGreaterThan(curve[i - 1].relativeSize)
      }
      expect(curve[curve.length - 1].relativeSize).toBe(result.sizeAtEnd)
    }
  })

  it("reports today's expansion rate as the Hubble constant and whether the expansion speeds up today", () => {
    expect(relativeError(runFateOfTheUniverseExperiment(L).expansionRateToday, HUBBLE_CONSTANT_KM_PER_S_PER_MPC)).toBeLessThan(1e-12)
    expect(runFateOfTheUniverseExperiment(L).accelerationToday).toBe(true)
    expect(runFateOfTheUniverseExperiment(0.3).accelerationToday).toBe(false)
    expect(runFateOfTheUniverseExperiment(0).accelerationToday).toBe(false)
  })
})

describe('imports', () => {
  it('imports from the earlier experiments rather than redefining them', async () => {
    const source = await import('node:fs/promises').then((fs) =>
      fs.readFile(new URL('./fateOfTheUniverseExperiment.ts', import.meta.url), 'utf-8'),
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
    expect(from('universeAgeExperiment')).toContain('relativeSizeAtTime')
    expect(from('universeAgeExperiment')).toContain('universeAgeYears')
    expect(from('observableUniverseExperiment')).toContain('timeAfterBigBangYears')
    expect(from('darkEnergyExperiment')).toContain('expansionRateRatio')
    expect(from('darkEnergyExperiment')).toContain('decelerationParameter')
    expect(from('hubblesLawExperiment')).toContain('HUBBLE_CONSTANT_KM_PER_S_PER_MPC')
    expect(source).not.toMatch(/function\s+relativeSizeAtTime/)
    expect(source).not.toMatch(/function\s+timeAfterBigBangYears/)
    expect(source).not.toMatch(/function\s+expansionRateRatio/)
    expect(source).not.toMatch(/function\s+decelerationParameter/)
  })
})
