import { describe, expect, it } from 'vitest'
import source from './spinningBlackHoleExperiment.ts?raw'
import {
  BLACK_HOLE_PRESETS,
  MAX_SPIN,
  MIN_SPIN,
  energyReleasedFraction,
  energyReleasedSteps,
  horizonRadius,
  lastSafeOrbitRadius,
  runSpinningBlackHoleExperiment,
} from './spinningBlackHoleExperiment'

const closeTo = (actual: number, expected: number, relative: number) =>
  expect(Math.abs(actual / expected - 1)).toBeLessThan(relative)

// The energy per unit rest-mass energy of a circular orbit (r in units of M, +a with the spin), written separately from
// the module. It is infinite at the photon orbit and not real inside it, so those radii give NaN.
function energyAt(spin: number, r: number, sign: 1 | -1): number {
  const term = (sign * spin) / r ** 1.5
  const denominator = 1 - 3 / r + 2 * term
  return denominator > 0 ? (1 - 2 / r + term) / Math.sqrt(denominator) : NaN
}

// The radius (in units of M) where that energy is lowest, found by stepping the radius outside the horizon.
function radiusOfLowestEnergy(spin: number, sign: 1 | -1): number {
  const horizon = 1 + Math.sqrt(1 - spin * spin)
  let bestR = NaN
  let bestE = Infinity
  for (let r = horizon + 1e-4; r < 14; r += 1e-4) {
    const e = energyAt(spin, r, sign)
    if (e < bestE) {
      bestE = e
      bestR = r
    }
  }
  return bestR
}

describe('the horizon', () => {
  it('is 1 reference radius with no spin, as in Experiment 1', () => {
    expect(horizonRadius(0)).toBe(1)
  })

  it('equals (1 + sqrt(1 - a^2)) / 2 reference radii, written separately here', () => {
    for (const a of [0.1, 0.5, 0.9, 0.99, 0.999999]) expect(horizonRadius(a)).toBeCloseTo((1 + Math.sqrt(1 - a * a)) / 2, 12)
  })

  it('shrinks toward 0.5 as the spin approaches 1', () => {
    closeTo(horizonRadius(1 - 1e-12), 0.5, 0.001)
    expect(horizonRadius(0.9)).toBeCloseTo(0.718, 3)
  })
})

describe('the last safe orbit', () => {
  it('is 3 reference radii (6M) for both directions with no spin, as in Experiment 3', () => {
    expect(lastSafeOrbitRadius(0, 'with')).toBeCloseTo(3, 9)
    expect(lastSafeOrbitRadius(0, 'against')).toBeCloseTo(3, 9)
  })

  it('matches the specification\'s table at spins 0.5, 0.9, 0.99 and 0.9999', () => {
    const table: Array<[number, number, number]> = [
      [0.5, 2.117, 3.777],
      [0.9, 1.16, 4.359],
      [0.99, 0.727, 4.486],
      [0.9999, 0.539, 4.5],
    ]
    for (const [a, withSpin, against] of table) {
      expect(lastSafeOrbitRadius(a, 'with')).toBeCloseTo(withSpin, 3)
      expect(lastSafeOrbitRadius(a, 'against')).toBeCloseTo(against, 3)
    }
  })

  it('approaches 0.5 with the spin and 4.5 against it (M and 9M) as the spin approaches 1', () => {
    closeTo(lastSafeOrbitRadius(1 - 1e-12, 'with'), 0.5, 0.001)
    closeTo(lastSafeOrbitRadius(1 - 1e-12, 'against'), 4.5, 0.001)
  })

  it('is where a circular orbit\'s energy is lowest (found by stepping the radius, in both directions)', () => {
    for (const a of [0, 0.5, 0.9, 0.99]) {
      closeTo(radiusOfLowestEnergy(a, 1) / 2, lastSafeOrbitRadius(a, 'with'), 0.001)
      closeTo(radiusOfLowestEnergy(a, -1) / 2, lastSafeOrbitRadius(a, 'against'), 0.001)
    }
  })

  it('is closer in with the spin than against it, and outside the horizon, at every spin', () => {
    for (let a = 0; a <= 0.99; a += 0.01) {
      expect(lastSafeOrbitRadius(a, 'with')).toBeLessThanOrEqual(lastSafeOrbitRadius(a, 'against'))
      expect(lastSafeOrbitRadius(a, 'with')).toBeGreaterThan(horizonRadius(a))
      expect(lastSafeOrbitRadius(a, 'against')).toBeGreaterThan(horizonRadius(a))
    }
  })
})

describe('monotonic behavior as the spin grows', () => {
  it('the horizon and the with-spin edge never rise, and the against-spin edge never falls', () => {
    let previous = { h: horizonRadius(0), w: lastSafeOrbitRadius(0, 'with'), g: lastSafeOrbitRadius(0, 'against') }
    for (let a = 0.001; a <= 0.99; a += 0.001) {
      const now = { h: horizonRadius(a), w: lastSafeOrbitRadius(a, 'with'), g: lastSafeOrbitRadius(a, 'against') }
      expect(now.h).toBeLessThanOrEqual(previous.h)
      expect(now.w).toBeLessThanOrEqual(previous.w)
      expect(now.g).toBeGreaterThanOrEqual(previous.g)
      previous = now
    }
  })
})

describe('the energy released on the way down', () => {
  it('is 1 - sqrt(8/9), about 5.72%, with no spin, in both directions', () => {
    const expected = 1 - Math.sqrt(8 / 9)
    expect(energyReleasedFraction(0, 'with')).toBeCloseTo(expected, 9)
    expect(energyReleasedFraction(0, 'against')).toBeCloseTo(expected, 9)
    expect(expected).toBeCloseTo(0.0572, 4)
  })

  it('matches the specification\'s values at spins 0.5, 0.9 and 0.99', () => {
    const table: Array<[number, number, number]> = [
      [0.5, 0.0821, 0.0451],
      [0.9, 0.1558, 0.039],
      [0.99, 0.264, 0.0379],
    ]
    for (const [a, withSpin, against] of table) {
      expect(energyReleasedFraction(a, 'with')).toBeCloseTo(withSpin, 3)
      expect(energyReleasedFraction(a, 'against')).toBeCloseTo(against, 3)
    }
  })

  it('approaches 1 - 1/sqrt(3) (42.3%) with the spin and 1 - sqrt(25/27) (3.77%) against it as the spin approaches 1', () => {
    closeTo(energyReleasedFraction(1 - 1e-12, 'with'), 1 - 1 / Math.sqrt(3), 0.001)
    closeTo(energyReleasedFraction(1 - 1e-12, 'against'), 1 - Math.sqrt(25 / 27), 0.001)
  })

  it('equals one minus the separately written circular-orbit energy at the last safe orbit', () => {
    for (const a of [0, 0.3, 0.9, 0.99]) {
      expect(energyReleasedFraction(a, 'with')).toBeCloseTo(1 - energyAt(a, 2 * lastSafeOrbitRadius(a, 'with'), 1), 12)
      expect(energyReleasedFraction(a, 'against')).toBeCloseTo(1 - energyAt(a, 2 * lastSafeOrbitRadius(a, 'against'), -1), 12)
    }
  })

  it('rises with the spin with the spin, and falls with the spin against it', () => {
    let previousWith = energyReleasedFraction(0, 'with')
    let previousAgainst = energyReleasedFraction(0, 'against')
    for (let a = 0.001; a <= 0.99; a += 0.001) {
      const w = energyReleasedFraction(a, 'with')
      const g = energyReleasedFraction(a, 'against')
      expect(w).toBeGreaterThanOrEqual(previousWith)
      expect(g).toBeLessThanOrEqual(previousAgainst)
      previousWith = w
      previousAgainst = g
    }
  })

  it('is larger the closer in the last safe orbit is (with the spin)', () => {
    expect(energyReleasedFraction(0.9, 'with')).toBeGreaterThan(energyReleasedFraction(0, 'with'))
    expect(energyReleasedFraction(0.9, 'against')).toBeLessThan(energyReleasedFraction(0, 'against'))
  })
})

describe('the energy released, worked step by step', () => {
  it('has a last safe orbit in units of M that is twice the one in reference radii', () => {
    for (const a of [0, 0.5, 0.9]) {
      for (const d of ['with', 'against'] as const) {
        expect(energyReleasedSteps(a, d).lastSafeInM).toBeCloseTo(2 * lastSafeOrbitRadius(a, d), 12)
      }
    }
  })

  it('gives E as the numerator over the denominator, and the share released as 1 - E, matching the fraction', () => {
    for (const a of [0, 0.3, 0.9, 0.99]) {
      for (const d of ['with', 'against'] as const) {
        const steps = energyReleasedSteps(a, d)
        expect(steps.energy).toBeCloseTo(steps.numerator / steps.denominator, 12)
        expect(steps.released).toBeCloseTo(1 - steps.energy, 12)
        expect(steps.released).toBe(energyReleasedFraction(a, d))
      }
    }
  })

  it('matches the separately written circular-orbit energy at the last safe orbit', () => {
    for (const a of [0, 0.5, 0.9, 0.99]) {
      expect(energyReleasedSteps(a, 'with').energy).toBeCloseTo(energyAt(a, 2 * lastSafeOrbitRadius(a, 'with'), 1), 12)
      expect(energyReleasedSteps(a, 'against').energy).toBeCloseTo(energyAt(a, 2 * lastSafeOrbitRadius(a, 'against'), -1), 12)
    }
  })

  it('gives E = sqrt(8/9) = 0.9428 at r = 6M with no spin, and 0.8442 at spin 0.9 with the spin', () => {
    const none = energyReleasedSteps(0, 'with')
    expect(none.lastSafeInM).toBeCloseTo(6, 9)
    expect(none.numerator).toBeCloseTo(2 / 3, 9)
    expect(none.denominator).toBeCloseTo(Math.sqrt(0.5), 9)
    expect(none.energy).toBeCloseTo(Math.sqrt(8 / 9), 9)
    expect(energyReleasedSteps(0.9, 'with').energy).toBeCloseTo(0.8442, 4)
  })

  it('has a spin term that is positive with the spin, negative against it, and zero with no spin', () => {
    expect(energyReleasedSteps(0.9, 'with').spinTerm).toBeGreaterThan(0)
    expect(energyReleasedSteps(0.9, 'against').spinTerm).toBeLessThan(0)
    expect(energyReleasedSteps(0, 'with').spinTerm).toBe(0)
  })

  it('throws a RangeError for a spin outside 0 up to, not including, 1', () => {
    for (const bad of [-0.1, 1, NaN]) expect(() => energyReleasedSteps(bad, 'with')).toThrow(RangeError)
  })
})

describe('running the experiment', () => {
  it('gives the same numbers in reference radii for all three black holes, and differs only in kilometers', () => {
    const [stellar, sgr, m87] = BLACK_HOLE_PRESETS.map((p) => runSpinningBlackHoleExperiment(p.id, 0.9))
    for (const other of [sgr, m87]) {
      expect(other.horizon).toBe(stellar.horizon)
      expect(other.lastSafeWith).toBe(stellar.lastSafeWith)
      expect(other.lastSafeAgainst).toBe(stellar.lastSafeAgainst)
      expect(other.energyReleasedWith).toBe(stellar.energyReleasedWith)
    }
    expect(BLACK_HOLE_PRESETS.map((p) => p.id)).toEqual(['stellar-black-hole', 'sgr-a-star', 'm87-star'])
  })

  it('gives the reference radius of Experiment 1: 29.5 km, about 12.7 million km and about 19 billion km', () => {
    closeTo(runSpinningBlackHoleExperiment('stellar-black-hole', 0.5).referenceRadiusKm, 29.5, 0.01)
    closeTo(runSpinningBlackHoleExperiment('sgr-a-star', 0.5).referenceRadiusKm, 12.7e6, 0.01)
    closeTo(runSpinningBlackHoleExperiment('m87-star', 0.5).referenceRadiusKm, 19.2e9, 0.01) // "about 19 billion", unrounded, as in Experiment 1's tests
  })

  it('reports the chosen spin, the Experiment 3 reference ring at 3 and the no-spin energy', () => {
    const result = runSpinningBlackHoleExperiment('sgr-a-star', 0.9)
    expect(result.spin).toBe(0.9)
    expect(result.noSpinLastSafe).toBe(3)
    expect(result.noSpinEnergyReleased).toBeCloseTo(1 - Math.sqrt(8 / 9), 9)
    expect(result.horizon).toBe(horizonRadius(0.9))
    expect(result.lastSafeWith).toBe(lastSafeOrbitRadius(0.9, 'with'))
    expect(result.lastSafeAgainst).toBe(lastSafeOrbitRadius(0.9, 'against'))
    expect(result.energyReleasedWith).toBe(energyReleasedFraction(0.9, 'with'))
    expect(result.energyReleasedAgainst).toBe(energyReleasedFraction(0.9, 'against'))
  })

  it('has a curve that starts at spin 0 with the Experiment 3 values (1, 3, 3), ends at the chosen spin and is monotonic', () => {
    const { curve } = runSpinningBlackHoleExperiment('stellar-black-hole', 0.99)
    expect(curve[0].spin).toBe(0)
    expect(curve[0].horizon).toBe(1)
    expect(curve[0].lastSafeWith).toBeCloseTo(3, 9)
    expect(curve[0].lastSafeAgainst).toBeCloseTo(3, 9)
    expect(curve[curve.length - 1].spin).toBe(0.99)
    for (let i = 1; i < curve.length; i++) {
      expect(curve[i].spin).toBeGreaterThan(curve[i - 1].spin)
      expect(curve[i].horizon).toBeLessThanOrEqual(curve[i - 1].horizon)
      expect(curve[i].lastSafeWith).toBeLessThanOrEqual(curve[i - 1].lastSafeWith)
      expect(curve[i].lastSafeAgainst).toBeGreaterThanOrEqual(curve[i - 1].lastSafeAgainst)
      expect(curve[i].energyReleasedWith).toBeGreaterThanOrEqual(curve[i - 1].energyReleasedWith)
      expect(curve[i].energyReleasedAgainst).toBeLessThanOrEqual(curve[i - 1].energyReleasedAgainst)
    }
  })

  it('works at the smallest and largest spins the learner can choose', () => {
    expect(runSpinningBlackHoleExperiment('stellar-black-hole', MIN_SPIN).lastSafeWith).toBeCloseTo(3, 9)
    expect(runSpinningBlackHoleExperiment('stellar-black-hole', MAX_SPIN).lastSafeWith).toBeCloseTo(0.727, 3)
  })
})

describe('out-of-range input', () => {
  it('throws a RangeError for a spin below 0, at 1, above 1 or not a number', () => {
    for (const bad of [-0.1, 1, 1.5, NaN, Infinity]) {
      expect(() => horizonRadius(bad)).toThrow(RangeError)
      expect(() => lastSafeOrbitRadius(bad, 'with')).toThrow(RangeError)
      expect(() => lastSafeOrbitRadius(bad, 'against')).toThrow(RangeError)
      expect(() => energyReleasedFraction(bad, 'with')).toThrow(RangeError)
    }
  })

  it('refuses a spin above the largest the learner can choose, and an unknown black hole', () => {
    expect(() => runSpinningBlackHoleExperiment('stellar-black-hole', 0.995)).toThrow(RangeError)
    expect(() => runSpinningBlackHoleExperiment('stellar-black-hole', -0.01)).toThrow(RangeError)
    expect(() => runSpinningBlackHoleExperiment('sun' as never, 0.5)).toThrow()
  })
})

describe('determinism and playback speed', () => {
  it('gives the same result for the same inputs', () => {
    expect(runSpinningBlackHoleExperiment('m87-star', 0.9)).toEqual(runSpinningBlackHoleExperiment('m87-star', 0.9))
  })

  it('uses no wall-clock time or randomness, so playback speed cannot change a result (CLAUDE.md §11)', () => {
    expect(source).not.toMatch(/performance\.now|Date\.now|new Date|Math\.random|requestAnimationFrame|setTimeout/)
  })
})

describe('reuse (CLAUDE.md §8)', () => {
  it('imports from blackHoleSizeExperiment and from none of the other experiments\' modules', () => {
    const importLines = source.split('\n').filter((line: string) => line.trim().startsWith('import'))
    const from = (name: string) => importLines.filter((line: string) => line.includes(name)).join(' ')
    expect(from('blackHoleSizeExperiment')).toContain('horizonRadiusKm')
    expect(from('blackHoleSizeExperiment')).toContain('OBJECT_PRESETS')
    for (const other of [
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
