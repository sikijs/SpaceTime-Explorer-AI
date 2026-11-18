import { describe, expect, it } from 'vitest'
import source from './spinningBlackHoleExperiment.ts?raw'
import {
  BLACK_HOLE_PRESETS,
  EDGE_MARKER_RADII,
  HORIZON_MARKER_RADII,
  MAX_SPIN,
  MIN_SPIN,
  PART_ONE_PRESET_ID,
  PART_ONE_SPIN,
  checkUp,
  edgeAnswer,
  energyAnswer,
  energyReleasedFraction,
  energyReleasedSecondRoute,
  energyReleasedSteps,
  horizonAnswer,
  horizonRadius,
  lastSafeOrbitRadius,
  markGuesses,
  radiiToKm,
  runSpinningBlackHoleExperiment,
} from './spinningBlackHoleExperiment'
import { horizonRadiusKm } from './blackHoleSizeExperiment'

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

describe('audit update: the fixed Part 1 run', () => {
  it('is the 10-Sun black hole spun up to 0.9, which the module can run', () => {
    expect(PART_ONE_PRESET_ID).toBe('stellar-black-hole')
    expect(PART_ONE_SPIN).toBe(0.9)
    const run = runSpinningBlackHoleExperiment(PART_ONE_PRESET_ID, PART_ONE_SPIN)
    closeTo(run.lastSafeWith, 1.16, 0.001)
    closeTo(run.lastSafeAgainst, 4.359, 0.001)
    closeTo(run.horizon, 0.718, 0.001)
    closeTo(run.energyReleasedWith, 0.156, 0.005)
    closeTo(run.energyReleasedAgainst, 0.039, 0.01)
  })
})

describe('audit update: the answers to the four predictions', () => {
  it('with no spin, every answer is "the same" (nothing differs from Black Holes 1 and 3)', () => {
    expect(edgeAnswer(0, 'with')).toBe('same')
    expect(edgeAnswer(0, 'against')).toBe('same')
    expect(horizonAnswer(0)).toBe('same')
    expect(energyAnswer(0)).toBe('same')
  })

  it('with spin, the last safe orbit is closer in with the spin and farther out against it, at every spin above 0', () => {
    for (const a of [0.01, 0.5, 0.9, 0.99]) {
      expect(edgeAnswer(a, 'with')).toBe('closer')
      expect(edgeAnswer(a, 'against')).toBe('farther')
    }
  })

  it('the horizon is smaller at every spin above 0, and the probe circling with the spin gives up more', () => {
    for (const a of [0.01, 0.5, 0.9, 0.99]) {
      expect(horizonAnswer(a)).toBe('smaller')
      expect(energyAnswer(a)).toBe('with')
    }
  })

  it('agree with the numbers the pictures draw (no answer is decided separately from them)', () => {
    for (const a of [0.1, 0.5, 0.9]) {
      expect(lastSafeOrbitRadius(a, 'with')).toBeLessThan(3)
      expect(lastSafeOrbitRadius(a, 'against')).toBeGreaterThan(3)
      expect(horizonRadius(a)).toBeLessThan(1)
      expect(energyReleasedFraction(a, 'with')).toBeGreaterThan(energyReleasedFraction(a, 'against'))
    }
  })

  it('marks each guess against the model at the run\'s spin', () => {
    const right = { with: 'closer', against: 'farther', horizon: 'smaller', energy: 'with' } as const
    expect(markGuesses(0.9, right)).toEqual({ with: true, against: true, horizon: true, energy: true })
    const wrong = { with: 'same', against: 'closer', horizon: 'bigger', energy: 'against' } as const
    expect(markGuesses(0.9, wrong)).toEqual({ with: false, against: false, horizon: false, energy: false })
    expect(markGuesses(0, { with: 'same', against: 'same', horizon: 'same', energy: 'same' })).toEqual({
      with: true,
      against: true,
      horizon: true,
      energy: true,
    })
  })
})

describe('audit update: where the guess marks go', () => {
  it('puts "closer" inside the dashed no-spin ring, "same" on it and "farther" outside it', () => {
    expect(EDGE_MARKER_RADII.closer).toBeLessThan(EDGE_MARKER_RADII.same)
    expect(EDGE_MARKER_RADII.same).toBe(runSpinningBlackHoleExperiment('stellar-black-hole', 0.5).noSpinLastSafe)
    expect(EDGE_MARKER_RADII.farther).toBeGreaterThan(EDGE_MARKER_RADII.same)
  })

  it('puts "smaller" inside the dotted no-spin horizon ring (radius 1), "same" on it and "bigger" outside it', () => {
    expect(HORIZON_MARKER_RADII.smaller).toBeLessThan(1)
    expect(HORIZON_MARKER_RADII.same).toBe(1)
    expect(HORIZON_MARKER_RADII.bigger).toBeGreaterThan(1)
  })

  it('does not depend on the spin: a guess has no size of its own, so a marker only shows the kind of answer', () => {
    expect(Object.keys(EDGE_MARKER_RADII)).toEqual(['closer', 'same', 'farther'])
    expect(Object.keys(HORIZON_MARKER_RADII)).toEqual(['smaller', 'same', 'bigger'])
  })
})

describe('audit update: the second route to the energy given up', () => {
  it('is 1 - sqrt(8/9), about 5.72%, with no spin, in both directions', () => {
    expect(energyReleasedSecondRoute(0, 'with')).toBeCloseTo(1 - Math.sqrt(8 / 9), 12)
    expect(energyReleasedSecondRoute(0, 'against')).toBeCloseTo(0.0572, 4)
  })

  it('agrees with the circular-orbit route at every spin and both directions', () => {
    for (const a of [0, 0.1, 0.5, 0.9, 0.99]) {
      for (const d of ['with', 'against'] as const) {
        expect(energyReleasedSecondRoute(a, d)).toBeCloseTo(energyReleasedFraction(a, d), 9)
      }
    }
  })

  it('gives about 26.4% with the spin and 3.8% against at a spin of 0.99', () => {
    expect(energyReleasedSecondRoute(0.99, 'with')).toBeCloseTo(0.264, 3)
    expect(energyReleasedSecondRoute(0.99, 'against')).toBeCloseTo(0.038, 3)
  })

  it('rejects a spin of 1 or more', () => {
    expect(() => energyReleasedSecondRoute(1, 'with')).toThrow(RangeError)
  })
})

describe('audit update: the check-up', () => {
  it('has seven rows, each read as expected, at every spin the page offers', () => {
    for (const a of [0, 0.5, 0.9, 0.99]) {
      const rows = checkUp(a)
      expect(rows).toHaveLength(7)
      for (const row of rows) expect(['the same', 'outside the horizon']).toContain(row.reading)
    }
  })

  it('compares the no-spin rows with Black Holes 3 (3), Black Holes 1 (1) and 1 - sqrt(8/9)', () => {
    const byId = Object.fromEntries(checkUp(0.9).map((r) => [r.id, r]))
    expect(byId.noSpinLastSafe).toMatchObject({ expected: 3, found: 3, reading: 'the same' })
    expect(byId.noSpinHorizon).toMatchObject({ expected: 1, found: 1, reading: 'the same' })
    expect(byId.noSpinEnergy.expected).toBeCloseTo(0.0572, 4)
    expect(byId.noSpinEnergy.reading).toBe('the same')
  })

  it('puts the last safe orbit outside the horizon in both directions (0.9: 1.16 and 4.36 against 0.72)', () => {
    const byId = Object.fromEntries(checkUp(0.9).map((r) => [r.id, r]))
    closeTo(byId.withOutsideHorizon.found, 1.16, 0.001)
    closeTo(byId.againstOutsideHorizon.found, 4.359, 0.001)
    closeTo(byId.withOutsideHorizon.expected, 0.718, 0.001)
    expect(byId.withOutsideHorizon.reading).toBe('outside the horizon')
  })

  it('rejects a spin outside 0 up to, but not including, 1', () => {
    expect(() => checkUp(1)).toThrow(RangeError)
    expect(() => checkUp(-0.1)).toThrow(RangeError)
  })
})

describe('audit update: kilometers', () => {
  it('multiplies reference radii by Black Holes 1\'s horizon radius (29.5 km for 10 Suns)', () => {
    const km = horizonRadiusKm(BLACK_HOLE_PRESETS.find((p) => p.id === 'stellar-black-hole')!.massSolarMasses)
    expect(radiiToKm(1, 'stellar-black-hole')).toBeCloseTo(km, 9)
    closeTo(radiiToKm(1.16, 'stellar-black-hole'), 34.2, 0.01)
    closeTo(radiiToKm(4.359, 'stellar-black-hole'), 128.6, 0.01)
  })

  it('throws for an unknown black hole', () => {
    expect(() => radiiToKm(1, 'moon' as never)).toThrow()
  })
})
