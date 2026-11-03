import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  A0,
  boostGuessRatio,
  boostGuessSpeed,
  boostRange,
  contaminatedRatio,
  contaminationGuessRatio,
  contaminationRange,
  DRAWING_SCALES,
  gammaCheckUp,
  darkMatterInsideSolarMasses,
  fakeBoostPercent,
  fractionToFake,
  GAMMA_MOND_WIDE_BINARY,
  orbitalSpeed,
  PREDICTION_PAIR,
  PREDICTION_TRIPLES,
  predictionPairSpeeds,
  predictionTriplesRatio,
  PUBLISHED_RESULTS,
  pullInA0,
  pullOnPair,
  runWideBinaries,
  speedBoost,
  speedBoostPercent,
  toyCheckUp,
  wideBinariesDrawingReference,
  wideBinariesDrawingValues,
} from './wideBinaries'

// Tests for Cosmic Horizons Experiment 7 (docs/experiments/cosmic-horizons/07-wide-binary-stars.md, "Required Physics Tests").
// The expected values are worked out by hand with G = 6.674e-11, one solar mass 1.989e30 kg and one AU 1.496e11 m, so a wrong formula in the
// module cannot make a test pass. For example, 1.5 Suns at 10,000 AU: GM = 6.674e-11 x 1.5 x 1.989e30 = 1.9911e20; s = 1.496e15 m;
// GM / s = 1.3310e5; the square root is 364.8 m/s; GM / s^2 = 1.3310e5 / 1.496e15 = 8.897e-11.

describe('the orbital speed (test 1)', () => {
  it('is 364.8 m/s for 1.5 Suns at 10,000 AU and 1153.7 m/s at 1,000 AU', () => {
    expect(orbitalSpeed(1.5, 10000)).toBeCloseTo(364.8, 1)
    expect(orbitalSpeed(1.5, 1000)).toBeCloseTo(1153.7, 1)
  })

  it('falls as 1 over the square root of the separation (a hundred times the separation gives a tenth of the speed)', () => {
    expect(orbitalSpeed(1.5, 100000) / orbitalSpeed(1.5, 1000)).toBeCloseTo(0.1, 10)
  })

  it('rises as the square root of the mass (four times the mass gives twice the speed)', () => {
    expect(orbitalSpeed(6, 5000) / orbitalSpeed(1.5, 5000)).toBeCloseTo(2, 10)
  })
})

describe('the pull on the pair (test 2)', () => {
  it('is 8.90e-11 m/s^2 for 1.5 Suns at 10,000 AU, and 0.74 in units of a0', () => {
    expect(pullOnPair(1.5, 10000) / 1e-11).toBeCloseTo(8.9, 1)
    expect(A0).toBe(1.2e-10)
    expect(pullInA0(1.5, 10000)).toBeCloseTo(0.74, 2)
  })

  it('falls as 1 over the separation squared (ten times the separation gives a hundredth of the pull)', () => {
    expect(pullOnPair(1.5, 10000) / pullOnPair(1.5, 1000)).toBeCloseTo(0.01, 12)
  })

  it('equals the speed squared over the separation, for every input', () => {
    for (const [mass, separation] of [
      [0.5, 500],
      [1.5, 10000],
      [3, 30000],
    ]) {
      expect(pullOnPair(mass, separation)).toBeCloseTo(orbitalSpeed(mass, separation) ** 2 / (separation * 1.496e11), 20)
    }
  })
})

describe('the speed boost (test 3)', () => {
  it('is 1.1832 (18.3 percent) for a pull 1.4 times stronger, and nothing for no boost', () => {
    expect(GAMMA_MOND_WIDE_BINARY).toBe(1.4)
    expect(speedBoost(1.4)).toBeCloseTo(1.1832, 4)
    expect(speedBoostPercent(1.4)).toBeCloseTo(18.3, 1)
    expect(speedBoost(1)).toBe(1)
    expect(speedBoostPercent(1)).toBe(0)
  })

  it('squares back to the boost in the pull, and rises with it', () => {
    for (const gamma of [1, 1.2, 1.43, 1.6, 4]) expect(speedBoost(gamma) ** 2).toBeCloseTo(gamma, 12)
    expect(speedBoost(1.6)).toBeGreaterThan(speedBoost(1.4))
    expect(speedBoost(1.4)).toBeGreaterThan(speedBoost(1.2))
  })

  it('is not 40 percent: a pull 40 percent stronger does not make the speed 40 percent higher', () => {
    expect(speedBoostPercent(1.4)).toBeLessThan(20)
  })
})

describe('the answer to Prediction 1 (test 4)', () => {
  it('is about 20 percent for a pull of 1.4', () => {
    expect(boostRange(speedBoostPercent(1.4))).toBe('about20')
  })

  it('has four answers with their edges', () => {
    expect(boostRange(0)).toBe('none')
    expect(boostRange(4.9)).toBe('none')
    expect(boostRange(5)).toBe('about20')
    expect(boostRange(29.9)).toBe('about20')
    expect(boostRange(40)).toBe('about40')
    expect(boostRange(69.9)).toBe('about40')
    expect(boostRange(100)).toBe('about100')
  })
})

describe('the contamination toy (tests 5 and 6)', () => {
  it('gives an average of 1.2 for a fifth of the pairs moving twice as fast (0.8 x 1 + 0.2 x 2)', () => {
    expect(contaminatedRatio(0.2, 2)).toBeCloseTo(1.2, 12)
    expect(fakeBoostPercent(0.2, 2)).toBeCloseTo(20, 10)
    expect(fakeBoostPercent(0.1, 2)).toBeCloseTo(10, 10)
  })

  it('is exactly 1 with no contamination or no extra speed, and rises with the fraction and the factor', () => {
    expect(contaminatedRatio(0, 3)).toBe(1)
    expect(contaminatedRatio(0.4, 1)).toBe(1)
    expect(contaminatedRatio(0.3, 2)).toBeGreaterThan(contaminatedRatio(0.2, 2))
    expect(contaminatedRatio(0.2, 3)).toBeGreaterThan(contaminatedRatio(0.2, 2))
  })

  it('needs 0.183 of the pairs to fake the expected 18.3 percent when they move twice as fast, and the inverse is the inverse', () => {
    expect(fractionToFake(18.3, 2)).toBeCloseTo(0.183, 12)
    for (const [boost, factor] of [
      [5, 2],
      [18.3, 3],
      [20, 1.5],
    ]) {
      expect(fakeBoostPercent(fractionToFake(boost, factor), factor)).toBeCloseTo(boost, 10)
    }
  })
})

describe('the answer to Prediction 2 (test 7)', () => {
  it('is about 20 percent for 1 pair in 5 moving twice as fast', () => {
    expect(contaminationRange(0.2, 2)).toBe('about20')
  })

  it('is about 2 percent for 2 pairs in 100 and about 100 percent when every pair moves twice as fast', () => {
    expect(contaminationRange(0.02, 2)).toBe('about2')
    expect(contaminationRange(1, 2)).toBe('about100')
  })
})

describe('the published results (tests 8 and 9)', () => {
  const find = (name: string, year: number) => PUBLISHED_RESULTS.filter((r) => r.name.startsWith(name) && r.year === year)

  it('equal the published numbers (a data test that catches a typing error)', () => {
    const chae2023 = find('Chae', 2023)[0]
    expect(chae2023.binaries).toBe(26615)
    expect(chae2023.value).toBe(1.43)
    expect(chae2023.sigma).toBe(10)
    const chae2024 = find('Chae', 2024)[0]
    expect(chae2024.binaries).toBe(2463)
    expect(chae2024.value).toBe(1.49)
    expect(chae2024.errorPlus).toBe(0.21)
    expect(chae2024.errorMinus).toBe(0.19)
    expect(chae2024.sigma).toBe(5)
    const chae2026 = find('Chae and colleagues', 2026)[0]
    expect(chae2026.binaries).toBe(36)
    expect(chae2026.value).toBe(1.6)
    expect(chae2026.errorPlus).toBe(0.24)
    expect(chae2026.errorMinus).toBe(0.14)
    const saad = find('Saad and Ting', 2026)
    expect(saad.map((r) => r.value)).toEqual([1.0, 1.56])
    expect(saad.every((r) => r.binaries === 36)).toBe(true)
    const banik = find('Banik', 2024)[0]
    expect(banik.binaries).toBe(8611)
    expect(banik.value).toBe(-0.021)
    expect(banik.sigma).toBe(19)
    expect(find('Chae', 2025)[0].binaries).toBe(312)
    expect(find('Saglia', 2025)[0].binaries).toBe(32)
  })

  it('names a source for every result', () => {
    for (const r of PUBLISHED_RESULTS) expect(r.source).toMatch(/arXiv:/)
  })

  it('has the gamma results first, in the order the picture draws them, each with a range around its value', () => {
    const gammas = PUBLISHED_RESULTS.filter((r) => r.kind === 'gamma')
    expect(gammas.map((r) => `${r.name} ${r.year}`)).toEqual([
      'Chae 2023',
      'Chae 2024',
      'Chae and colleagues 2026',
      'Saad and Ting (forward-modelled orbits) 2026',
      'Saad and Ting (geometric de-projection) 2026',
    ])
    expect(PUBLISHED_RESULTS.slice(0, gammas.length).every((r) => r.kind === 'gamma')).toBe(true)
    for (const r of gammas) {
      expect(r.value).not.toBeNull()
      expect((r.value as number) - r.errorMinus).toBeLessThan(r.value as number)
      expect((r.value as number) + r.errorPlus).toBeGreaterThan(r.value as number)
    }
  })
})

describe('the dark matter inside the pair (test 10)', () => {
  it('is about 1.3e-4 solar masses inside 30,000 AU, which is far less than the stars', () => {
    // 0.01 x (4/3) x pi x (30,000 / 206,264.8 pc)^3 = 0.01 x 4.18879 x 0.0030766 = 1.289e-4
    expect(darkMatterInsideSolarMasses(30000)).toBeCloseTo(1.29e-4, 6)
    expect(darkMatterInsideSolarMasses(30000)).toBeLessThan(0.001 * 1.5)
  })

  it('grows as the cube of the separation', () => {
    expect(darkMatterInsideSolarMasses(20000) / darkMatterInsideSolarMasses(10000)).toBeCloseTo(8, 10)
  })
})

describe('runWideBinaries and the range checks (test 11)', () => {
  it('gives the learner\'s own pair', () => {
    const r = runWideBinaries(1.5, 10000, 1.4, 0.2, 2)
    expect(r.newtonSpeed).toBeCloseTo(364.8, 1)
    expect(r.boostedSpeed).toBeCloseTo(364.8 * 1.1832, 0)
    expect(r.speedBoostPercent).toBeCloseTo(18.3, 1)
    expect(r.fakeBoostPercent).toBeCloseTo(20, 10)
    expect(r.fractionNeededToFake).toBeCloseTo(0.1832, 3)
    expect(r.pullInA0).toBeCloseTo(0.74, 2)
  })

  it('says that no fraction can fake a boost when the factor is 1', () => {
    expect(runWideBinaries(1.5, 10000, 1.4, 0.2, 1).fractionNeededToFake).toBeNull()
  })

  it('throws RangeError for out-of-range inputs', () => {
    expect(() => orbitalSpeed(0, 1000)).toThrow(RangeError)
    expect(() => orbitalSpeed(1, -5)).toThrow(RangeError)
    expect(() => pullOnPair(NaN, 1000)).toThrow(RangeError)
    expect(() => speedBoost(0.9)).toThrow(RangeError)
    expect(() => contaminatedRatio(1.1, 2)).toThrow(RangeError)
    expect(() => contaminatedRatio(0.2, 0.5)).toThrow(RangeError)
    expect(() => fractionToFake(10, 1)).toThrow(RangeError)
    expect(() => boostRange(-1)).toThrow(RangeError)
    expect(() => darkMatterInsideSolarMasses(0)).toThrow(RangeError)
  })
})

describe('the module stands alone', () => {
  it('imports nothing from the other experiments\' physics modules', () => {
    const source = readFileSync(new URL('./wideBinaries.ts', import.meta.url), 'utf8')
    expect(source).not.toMatch(/^import /m)
  })
})

describe('audit update: guess marks, check-up and Part 2 drawing', () => {
  it('Prediction 1\'s pair (1.5 Suns, 10,000 AU) moves at 364.8 m/s under Newton and 1.1832 times that under a 1.4 pull', () => {
    expect(PREDICTION_PAIR).toEqual({ massSuns: 1.5, separationAu: 10000 })
    const speeds = predictionPairSpeeds()
    expect(speeds.newton).toBeCloseTo(364.8, 0)
    expect(speeds.boosted / speeds.newton).toBeCloseTo(Math.sqrt(1.4), 12)
  })
  it('the boost guess ratios are 1, 1.2, 1.4 and 2, increasing, and the true ratio (1.183) is nearest to the "about 20 percent" answer', () => {
    expect(boostGuessRatio('none')).toBe(1)
    expect(boostGuessRatio('about20')).toBe(1.2)
    expect(boostGuessRatio('about40')).toBe(1.4)
    expect(boostGuessRatio('about100')).toBe(2)
    expect(boostGuessSpeed('about20')).toBeCloseTo(predictionPairSpeeds().newton * 1.2, 10)
    const truth = speedBoost(GAMMA_MOND_WIDE_BINARY)
    const names = ['none', 'about20', 'about40', 'about100'] as const
    const nearest = [...names].sort((a, b) => Math.abs(boostGuessRatio(a) - truth) - Math.abs(boostGuessRatio(b) - truth))[0]
    expect(nearest).toBe('about20')
    expect(boostRange(speedBoostPercent(GAMMA_MOND_WIDE_BINARY))).toBe('about20')
  })
  it('Prediction 2\'s case (1 pair in 5, twice as fast) averages 1.2 times Newton\'s, and the guess ratios are 1.02, 1.2 and 2', () => {
    expect(PREDICTION_TRIPLES).toEqual({ fraction: 0.2, factor: 2 })
    expect(predictionTriplesRatio()).toBeCloseTo(1.2, 12)
    expect(contaminationGuessRatio('about2')).toBe(1.02)
    expect(contaminationGuessRatio('about20')).toBe(1.2)
    expect(contaminationGuessRatio('about100')).toBe(2)
    expect(contaminationRange(0.2, 2)).toBe('about20')
  })
  it('the check-up lists the five boost factors and says which of 1 and 1.4 each published range includes', () => {
    const rows = gammaCheckUp()
    expect(rows).toHaveLength(5)
    const by = (value: number) => rows.find((r) => r.value === value)!
    expect(by(1.43)).toMatchObject({ includesNewton: false, includesBoost: true, reading: 'the boost only' })
    expect(by(1.49)).toMatchObject({ includesNewton: false, includesBoost: true, reading: 'the boost only' })
    expect(by(1.6)).toMatchObject({ includesNewton: false, includesBoost: false, reading: 'neither' })
    expect(by(1.0)).toMatchObject({ includesNewton: true, includesBoost: false, reading: 'Newton only' })
    expect(by(1.56)).toMatchObject({ includesNewton: false, includesBoost: true, reading: 'the boost only' })
    expect(by(1.6).low).toBeCloseTo(1.46, 12)
    expect(by(1.6).high).toBeCloseTo(1.84, 12)
  })
  it('the toy check-up compares the case\'s 20 percent fake boost with the 18.3 percent that a 1.4 pull gives: "more"', () => {
    const t = toyCheckUp()
    expect(t.expected).toBeCloseTo((Math.sqrt(1.4) - 1) * 100, 10)
    expect(t.found).toBeCloseTo(20, 10)
    expect(t.reading).toBe('more')
  })
  it('Part 2\'s drawing: the values match the run, the references are the Prediction 1 pair, 1 a0 and 18.3 percent, and every control setting fits the scales', () => {
    const ref = wideBinariesDrawingReference()
    expect(ref.newtonSpeed).toBeCloseTo(predictionPairSpeeds().newton, 10)
    expect(ref.pullInA0).toBe(1)
    expect(ref.fakeBoostPercent).toBeCloseTo(18.32, 2)
    const v = wideBinariesDrawingValues(1.5, 10000, 0.2, 2)
    expect(v.newtonSpeed).toBeCloseTo(364.8, 0)
    expect(v.pullInA0).toBeCloseTo(0.74, 2)
    expect(v.fakeBoostPercent).toBeCloseTo(20, 10)
    for (const mass of [0.5, 1.5, 3]) {
      for (const sep of [500, 10000, 30000]) {
        for (const fraction of [0, 0.5]) {
          for (const factor of [1, 3]) {
            const d = wideBinariesDrawingValues(mass, sep, fraction, factor)
            expect(d.newtonSpeed).toBeLessThanOrEqual(DRAWING_SCALES.speed.max)
            expect(d.pullInA0).toBeGreaterThanOrEqual(DRAWING_SCALES.pullA0.min)
            expect(d.pullInA0).toBeLessThanOrEqual(DRAWING_SCALES.pullA0.max)
            expect(d.fakeBoostPercent).toBeLessThanOrEqual(DRAWING_SCALES.fakeBoostPercent.max)
          }
        }
      }
    }
  })
})
