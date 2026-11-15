import { describe, expect, it } from 'vitest'
import { REAL_UNIVERSE_AGE_YEARS, hubbleTimeYears } from './bigBangExperiment'
import { BEST_FIT_DARK_ENERGY_FRACTION, MAX_DARK_ENERGY_FRACTION, decelerationParameter, expansionRateRatio } from './darkEnergyExperiment'
import {
  EARLY_EXAMPLE_YEARS,
  GUESS_ARROW_LENGTH_YEARS,
  OLDEST_STARS_AGE_YEARS,
  PUBLISHED_PLANCK,
  actualDarkEnergyAge,
  actualMatterOnlyAge,
  checkUp,
  darkEnergyExample,
  darkEnergyGuessMarker,
  darkEnergyGuessMatches,
  earlySizes,
  markDarkEnergyGuess,
  markMatterOnlyGuess,
  matterOnlyExample,
  matterOnlyGuessMarker,
  matterOnlyGuessMatches,
  percentDifference,
  measuredAgeShare,
  readingAgainst,
  shareForAge,
  starTestPassShare,
  valuesTable,
  yourComparison,
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


describe('the oldest-clusters marker (audit, 2026-11-15)', () => {
  it('is the 13.3 billion year lower limit of the 2023 study, not the old rounded 12.5', () => {
    expect(OLDEST_STARS_AGE_YEARS).toBe(13.3e9)
  })

  it('is passed from a dark energy share of about 0.69 (age 13.28 at 0.685, 13.47 at 0.7)', () => {
    const share = starTestPassShare()
    expect(share).toBeGreaterThan(0.68)
    expect(share).toBeLessThan(0.7)
    expect(universeAgeYears(share)).toBeCloseTo(13.3e9, -6)
    expect(universeAgeYears(0.685)).toBeLessThan(OLDEST_STARS_AGE_YEARS)
    expect(universeAgeYears(0.7)).toBeGreaterThan(OLDEST_STARS_AGE_YEARS)
  })

  it('leaves matter only about 4.0 billion years short of it', () => {
    expect((OLDEST_STARS_AGE_YEARS - universeAgeYears(0)) / 1e9).toBeCloseTo(3.99, 1)
  })
})

describe('shareForAge', () => {
  it('inverts universeAgeYears', () => {
    for (const share of [0.1, 0.4, 0.7, 0.85]) {
      expect(shareForAge(universeAgeYears(share))!).toBeCloseTo(share, 6)
    }
  })
  it('gives about 0.725 for the measured age and about 0.737 for the Hubble time', () => {
    expect(measuredAgeShare()).toBeCloseTo(0.7253, 3)
    expect(shareForAge(hubbleTimeYears())!).toBeCloseTo(0.7371, 3)
  })
  it('returns null outside what 0 to the maximum share gives', () => {
    expect(shareForAge(5e9)).toBeNull()
    expect(shareForAge(30e9)).toBeNull()
  })
})

describe('what the model gives for the two guesses', () => {
  it('matter only is shorter than the Hubble time; dark energy makes it older than matter only', () => {
    expect(actualMatterOnlyAge()).toBe('shorter')
    expect(actualDarkEnergyAge()).toBe('older')
  })
  it('matches only the right answer', () => {
    expect(matterOnlyGuessMatches('shorter')).toBe(true)
    expect(matterOnlyGuessMatches('longer')).toBe(false)
    expect(matterOnlyGuessMatches('same')).toBe(false)
    expect(darkEnergyGuessMatches('older')).toBe(true)
    expect(darkEnergyGuessMatches('younger')).toBe(false)
    expect(darkEnergyGuessMatches('same')).toBe(false)
  })
  it('marking carries the numbers the tutor quotes', () => {
    const first = markMatterOnlyGuess('longer')
    expect(first.matches).toBe(false)
    expect(first.ageYears / 1e9).toBeCloseTo(9.31, 2)
    expect(first.referenceAgeYears / 1e9).toBeCloseTo(13.97, 2)
    const second = markDarkEnergyGuess('older')
    expect(second.matches).toBe(true)
    expect(second.ageYears / 1e9).toBeCloseTo(13.47, 2)
    expect(second.referenceAgeYears / 1e9).toBeCloseTo(9.31, 2)
  })
})

describe('the white guess marks', () => {
  it('guess 1 starts at the Hubble time (the purple dot) and follows the guess', () => {
    const shorter = matterOnlyGuessMarker('shorter')
    const longer = matterOnlyGuessMarker('longer')
    const same = matterOnlyGuessMarker('same')
    expect(shorter.fromDot).toBe('constant')
    expect(shorter.fromYears).toBeCloseTo(hubbleTimeYears(), 0)
    expect(shorter.kind).toBe('left')
    expect(shorter.toYears).toBeCloseTo(hubbleTimeYears() - GUESS_ARROW_LENGTH_YEARS, 0)
    expect(longer.kind).toBe('right')
    expect(longer.toYears).toBeGreaterThan(longer.fromYears)
    expect(same.kind).toBe('ring')
    expect(same.toYears).toBe(same.fromYears)
  })
  it('guess 2 starts at the matter-only age (the blue dot) and follows the guess', () => {
    const older = darkEnergyGuessMarker('older')
    const younger = darkEnergyGuessMarker('younger')
    const same = darkEnergyGuessMarker('same')
    expect(older.fromDot).toBe('matter')
    expect(older.fromYears).toBeCloseTo(universeAgeYears(0), 0)
    expect(older.kind).toBe('right')
    expect(older.toYears - older.fromYears).toBeCloseTo(GUESS_ARROW_LENGTH_YEARS, 0)
    expect(younger.kind).toBe('left')
    expect(younger.toYears).toBeLessThan(younger.fromYears)
    expect(same.kind).toBe('ring')
  })
  it('the marks never read the real answer: every guess gives the same length', () => {
    for (const g of ['shorter', 'longer'] as const) {
      const m = matterOnlyGuessMarker(g)
      expect(Math.abs(m.toYears - m.fromYears)).toBe(GUESS_ARROW_LENGTH_YEARS)
    }
  })
})

describe('the early-time example', () => {
  it('gives 0.57, 0.39 and 0.29 at 4 billion years: matter only is biggest early', () => {
    const e = earlySizes()
    expect(EARLY_EXAMPLE_YEARS).toBe(4e9)
    expect(e.matterOnlySize).toBeCloseTo(0.569, 2)
    expect(e.bestFitSize).toBeCloseTo(0.387, 2)
    expect(e.constantSpeedSize).toBeCloseTo(0.286, 2)
    expect(e.matterOnlySize).toBeGreaterThan(e.bestFitSize)
    expect(e.bestFitSize).toBeGreaterThan(e.constantSpeedSize)
  })
})

describe('worked examples', () => {
  it('matter only: (2/3) x 13.97 = 9.31', () => {
    const e = matterOnlyExample()
    expect(e.hubbleTimeYears / 1e9).toBeCloseTo(13.97, 2)
    expect(e.ageYears / 1e9).toBeCloseTo(9.31, 2)
    expect(e.ageYears).toBeCloseTo(universeAgeYears(0), 0)
  })
  it('dark energy at 0.7 step by step ends at the module age', () => {
    const e = darkEnergyExample()
    expect(e.share).toBe(BEST_FIT_DARK_ENERGY_FRACTION)
    expect(e.root).toBeCloseTo(0.8367, 3)
    expect(e.factor).toBeCloseTo(0.7970, 3)
    expect(e.argument).toBeCloseTo(1.5275, 3)
    expect(e.asinhValue).toBeCloseTo(1.2095, 3)
    expect(e.ageYears).toBeCloseTo(universeAgeYears(0.7), 0)
    expect(e.ageYears / 1e9).toBeCloseTo(13.47, 2)
  })
})

describe('readingAgainst', () => {
  it('says the same only inside the published uncertainty, otherwise less or more', () => {
    expect(readingAgainst(13.8, 13.797, 0.023)).toBe('the same')
    expect(readingAgainst(13.47, 13.797, 0.023)).toBe('less')
    expect(readingAgainst(13.97, 13.797, 0.023)).toBe('more')
    expect(readingAgainst(5, 5)).toBe('the same')
  })
})

describe('the check-up (Table 1)', () => {
  const rows = checkUp()
  const row = (id: string) => rows.find((r) => r.id === id)!
  it('has rows a to e', () => {
    expect(rows.map((r) => r.id)).toEqual(['a', 'b', 'c', 'd', 'e'])
  })
  it('(a) the best fit is 0.33 less than the measured age', () => {
    expect(row('a').besideYears).toBe(PUBLISHED_PLANCK.ageYears)
    expect(row('a').differenceYears! / 1e9).toBeCloseTo(-0.33, 2)
    expect(row('a').reading).toBe('less')
  })
  it('(b) the Planck-like pair is the same as the measured age to the digits shown', () => {
    expect(row('b').thisPageYears / 1e9).toBeCloseTo(13.796, 3)
    expect(row('b').reading).toBe('the same')
  })
  it('(c) matter only is about 4.0 less than the oldest clusters', () => {
    expect(row('c').besideYears).toBe(OLDEST_STARS_AGE_YEARS)
    expect(row('c').differenceYears! / 1e9).toBeCloseTo(-3.99, 1)
    expect(row('c').reading).toBe('less')
  })
  it('(d) the Hubble time is 0.17 more than the measured age', () => {
    expect(row('d').differenceYears! / 1e9).toBeCloseTo(0.17, 2)
    expect(row('d').reading).toBe('more')
  })
  it('(e) matter only against the Hubble time has no published value and is calculated here only', () => {
    expect(row('e').besideYears).toBeNull()
    expect(row('e').differenceYears).toBeNull()
    expect(row('e').reading).toBe('calculated here only')
  })
  it('does not depend on the learner: every row is the same on each call', () => {
    expect(checkUp()).toEqual(rows)
  })
})

describe('yourComparison (Table 2 and "What your numbers show")', () => {
  it('matter only: younger than the clusters by about 4.0 and less than the measured age', () => {
    const c = yourComparison(0)
    expect(c.ageYears / 1e9).toBeCloseTo(9.31, 2)
    expect(c.againstMeasured.reading).toBe('less')
    expect(c.againstOldestStars.older).toBe(false)
    expect(c.againstOldestStars.differenceYears / 1e9).toBeCloseTo(-3.99, 1)
    expect(c.ageOverHubbleTime).toBeCloseTo(0.667, 3)
  })
  it('the best fit: older than the clusters by 0.17 and less than the measured age by 0.33', () => {
    const c = yourComparison(0.7)
    expect(c.againstOldestStars.older).toBe(true)
    expect(c.againstOldestStars.differenceYears / 1e9).toBeCloseTo(0.17, 2)
    expect(c.againstMeasured.differenceYears / 1e9).toBeCloseTo(-0.33, 2)
  })
  it('80 percent: more than the measured age', () => {
    expect(yourComparison(0.8).againstMeasured.reading).toBe('more')
  })
})

describe('the values table (Table 3)', () => {
  it('gives 13.47, 13.99 and 13.80', () => {
    const rows = valuesTable()
    expect(rows.map((r) => +(r.ageYears / 1e9).toFixed(2))).toEqual([13.47, 13.99, 13.8])
    expect(rows[1].hubbleConstant).toBe(67.4)
    expect(rows[2].share).toBe(0.685)
  })
})

describe('percentDifference', () => {
  it('is (value - reference) / reference in percent: the Hubble time is about 1.2 percent above the measured age', () => {
    expect(percentDifference(110, 100)).toBeCloseTo(10, 9)
    expect(percentDifference(90, 100)).toBeCloseTo(-10, 9)
    expect(percentDifference(hubbleTimeYears(), PUBLISHED_PLANCK.ageYears)).toBeCloseTo(1.24, 1)
  })
})
