import { describe, expect, it } from 'vitest'
import { HUBBLE_CONSTANT_KM_PER_S_PER_MPC } from './hubblesLawExperiment'
import {
  actualAgeAnswer,
  actualTimeAnswer,
  ageGuessMarkerYears,
  ageGuessMatches,
  ageReading,
  ageStripFraction,
  AGE_STRIP_MAX_YEARS,
  AGE_STRIP_MIN_YEARS,
  BACKWARD_RUN_PRESETS,
  bigBangCheckUp,
  bigBangWorkedExample,
  galaxyTimeRow,
  hubbleTimeYearsForH0,
  MAX_OWN_GALAXY_DISTANCE_MPC,
  MIN_OWN_GALAXY_DISTANCE_MPC,
  relativeGapToMeasuredAge,
  timeBackToZeroYears,
  timeBarFraction,
  timeGuessMarker,
  timeGuessMatches,
  distanceAtPastTimeMpc,
  hubbleTimeYears,
  MPC_TO_KM,
  REAL_UNIVERSE_AGE_YEARS,
  runBigBangExperiment,
  SECONDS_PER_YEAR,
} from './bigBangExperiment'

describe('hubbleTimeYears', () => {
  it('does not depend on distance', () => {
    const near = runBigBangExperiment(16.5)
    const far = runBigBangExperiment(100)
    expect(far.hubbleTimeYears).toBeCloseTo(near.hubbleTimeYears, 10)
  })

  it('matches a direct, independently computed unit conversion of 1 / H0', () => {
    const hubbleConstantPerSecond = HUBBLE_CONSTANT_KM_PER_S_PER_MPC / MPC_TO_KM
    const expectedYears = 1 / hubbleConstantPerSecond / SECONDS_PER_YEAR
    expect(hubbleTimeYears()).toBeCloseTo(expectedYears, 5)
  })

  it('is within about 10% of the real universe age', () => {
    const ratio = hubbleTimeYears() / REAL_UNIVERSE_AGE_YEARS
    expect(ratio).toBeGreaterThan(0.9)
    expect(ratio).toBeLessThan(1.1)
  })
})

describe('distanceAtPastTimeMpc', () => {
  it('equals the current distance exactly at yearsAgo = 0', () => {
    for (const distanceMpc of [16.5, 100, 200]) {
      expect(distanceAtPastTimeMpc(distanceMpc, 0)).toBeCloseTo(distanceMpc, 10)
    }
  })

  it('reaches exactly 0 at the Hubble time, for any distance', () => {
    const t = hubbleTimeYears()
    for (const distanceMpc of [16.5, 100, 200]) {
      expect(distanceAtPastTimeMpc(distanceMpc, t)).toBeCloseTo(0, 10)
    }
  })

  it('follows the same fractional law regardless of distance', () => {
    const t = hubbleTimeYears() * 0.3
    const near = distanceAtPastTimeMpc(16.5, t) / 16.5
    const far = distanceAtPastTimeMpc(100, t) / 100
    expect(far).toBeCloseTo(near, 10)
  })
})

describe('runBigBangExperiment', () => {
  it('throws for a non-positive distance', () => {
    expect(() => runBigBangExperiment(0)).toThrow(RangeError)
    expect(() => runBigBangExperiment(-5)).toThrow(RangeError)
  })
})

describe('module source', () => {
  it('imports HUBBLE_CONSTANT_KM_PER_S_PER_MPC from hubblesLawExperiment.ts rather than redefining it', async () => {
    const source = await import('node:fs/promises').then((fs) =>
      fs.readFile(new URL('./bigBangExperiment.ts', import.meta.url), 'utf-8')
    )
    const importLines = source.split('\n').filter((line) => line.trim().startsWith('import'))
    const importsHubbleConstant = importLines.some(
      (line) => line.includes('HUBBLE_CONSTANT_KM_PER_S_PER_MPC') && line.includes('hubblesLawExperiment')
    )
    expect(importsHubbleConstant).toBe(true)
  })
})

describe('the time back to zero, found the long way (audit update)', () => {
  it('equals 1 / H0 for every galaxy, whatever its distance (an independent route to the same number)', () => {
    for (const distanceMpc of [1, 16.5, 50, 100, 200]) {
      expect(Math.abs(timeBackToZeroYears(distanceMpc) - hubbleTimeYears()) / hubbleTimeYears()).toBeLessThan(1e-12)
    }
  })

  it('gives the figures printed on the page: 1,155 and 7,000 km/s and 13.97 billion years', () => {
    const virgo = galaxyTimeRow(16.5)
    const coma = galaxyTimeRow(100)
    expect(virgo.recessionSpeedKmPerS).toBeCloseTo(1155, 6)
    expect(coma.recessionSpeedKmPerS).toBeCloseTo(7000, 6)
    expect(virgo.timeBackYears / 1e9).toBeCloseTo(13.968, 3)
    expect(coma.timeBackYears / 1e9).toBeCloseTo(13.968, 3)
  })

  it('throws for a non-positive distance', () => {
    expect(() => timeBackToZeroYears(0)).toThrow(RangeError)
    expect(() => timeBackToZeroYears(-3)).toThrow(RangeError)
  })

  it('lets the learner add a galaxy anywhere from 1 to 200 Mpc, the same range as Cosmology 1', () => {
    expect(MIN_OWN_GALAXY_DISTANCE_MPC).toBe(1)
    expect(MAX_OWN_GALAXY_DISTANCE_MPC).toBe(200)
    expect(BACKWARD_RUN_PRESETS.map((p) => p.distanceMpc)).toEqual([16.5, 100, 200])
  })

  it('gives 1 / H0 for other Hubble constants, equal to hubbleTimeYears() at 70 and falling as H0 rises', () => {
    expect(Math.abs(hubbleTimeYearsForH0(70) - hubbleTimeYears()) / hubbleTimeYears()).toBeLessThan(1e-12)
    expect(hubbleTimeYearsForH0(73.04) / 1e9).toBeCloseTo(13.387, 2)
    expect(hubbleTimeYearsForH0(67.4) / 1e9).toBeCloseTo(14.507, 2)
    expect(hubbleTimeYearsForH0(73.04)).toBeLessThan(hubbleTimeYearsForH0(67.4))
    expect(() => hubbleTimeYearsForH0(0)).toThrow(RangeError)
  })
})

describe('the two new panels and the guess markers (audit update)', () => {
  it('draws every bar the same length for the three presets, inside a 0 to 16 billion year scale', () => {
    const fractions = BACKWARD_RUN_PRESETS.map((p) => timeBarFraction(timeBackToZeroYears(p.distanceMpc)))
    expect(fractions[0]).toBeCloseTo(fractions[1], 9)
    expect(fractions[1]).toBeCloseTo(fractions[2], 9)
    expect(fractions[0]).toBeCloseTo(13.968 / 16, 3)
  })

  it('puts the amber and green ticks on the 12 to 16 billion year strip, about 0.17 billion years apart', () => {
    const model = ageStripFraction(hubbleTimeYears())
    const measured = ageStripFraction(13.8e9)
    expect(model).toBeGreaterThan(measured)
    expect((model - measured) * (AGE_STRIP_MAX_YEARS - AGE_STRIP_MIN_YEARS)).toBeCloseTo(0.168e9, -6)
  })

  it('gives each time guess a different marker, and none of them a size', () => {
    expect(timeGuessMarker('longer')).toBe('past-end')
    expect(timeGuessMarker('shorter')).toBe('short-of-end')
    expect(timeGuessMarker('same')).toBe('at-end')
  })

  it('puts each age guess at a different place on the strip: much longer right of the answer, much shorter left of the measured age, close between', () => {
    const right = ageGuessMarkerYears('muchLonger')
    const left = ageGuessMarkerYears('muchShorter')
    const middle = ageGuessMarkerYears('close')
    expect(right / 1e9).toBeCloseTo(13.968 + 1, 2)
    expect(left / 1e9).toBeCloseTo(13.8 - 1, 2)
    expect(middle).toBeGreaterThan(13.8e9)
    expect(middle).toBeLessThan(hubbleTimeYears())
    expect(left).toBeGreaterThan(AGE_STRIP_MIN_YEARS)
    expect(right).toBeLessThan(AGE_STRIP_MAX_YEARS)
  })

  it('does not change any real number (the marks read the numbers, the numbers never read a guess)', () => {
    const before = [galaxyTimeRow(16.5), galaxyTimeRow(100), hubbleTimeYears()]
    timeGuessMarker('longer')
    ageGuessMarkerYears('muchLonger')
    expect([galaxyTimeRow(16.5), galaxyTimeRow(100), hubbleTimeYears()]).toEqual(before)
  })
})

describe('marking the guesses (audit update)', () => {
  const rows = BACKWARD_RUN_PRESETS.map((p) => galaxyTimeRow(p.distanceMpc))

  it('reads the real answers from the numbers, not from constants', () => {
    expect(actualTimeAnswer(rows)).toBe('same')
    expect(actualAgeAnswer()).toBe('close')
  })

  it('marks exactly one time guess and one age guess as matching', () => {
    expect(timeGuessMatches('same', rows)).toBe(true)
    expect(timeGuessMatches('longer', rows)).toBe(false)
    expect(timeGuessMatches('shorter', rows)).toBe(false)
    expect(ageGuessMatches('close')).toBe(true)
    expect(ageGuessMatches('muchLonger')).toBe(false)
    expect(ageGuessMatches('muchShorter')).toBe(false)
  })

  it('answers "the same" for any galaxy the learner adds, so no setting changes the answer', () => {
    for (const distanceMpc of [1, 37, 200]) {
      expect(actualTimeAnswer([galaxyTimeRow(16.5), galaxyTimeRow(distanceMpc), galaxyTimeRow(100)])).toBe('same')
    }
  })

  it('would answer longer or shorter if the farther galaxy really took more or less time', () => {
    const near = { distanceMpc: 10, recessionSpeedKmPerS: 700, timeBackYears: 10e9 }
    expect(actualTimeAnswer([near, { ...near, distanceMpc: 20, timeBackYears: 12e9 }])).toBe('longer')
    expect(actualTimeAnswer([near, { ...near, distanceMpc: 20, timeBackYears: 8e9 }])).toBe('shorter')
  })

  it('marks the age guess from the size of the gap: within 10 percent is close, beyond it is much longer or much shorter', () => {
    expect(actualAgeAnswer(13.8e9 * 1.05)).toBe('close')
    expect(actualAgeAnswer(13.8e9 * 1.3)).toBe('muchLonger')
    expect(actualAgeAnswer(13.8e9 * 0.7)).toBe('muchShorter')
  })
})

describe('the check-up (audit update)', () => {
  const rows = Object.fromEntries(bigBangCheckUp().map((row) => [row.id, row]))

  it('has the four rows, in the order the page prints them', () => {
    expect(bigBangCheckUp().map((row) => row.id)).toEqual([
      'age-against-measured',
      'hubble-constant',
      'age-at-published-h0',
      'time-per-galaxy',
    ])
  })

  it('reads this page\'s answer as more than the measured age, by about 1.2 percent', () => {
    expect(rows['age-against-measured'].used / 1e9).toBeCloseTo(13.968, 3)
    expect(rows['age-against-measured'].published).toBe(13.8e9)
    expect(rows['age-against-measured'].reading).toBe('more')
    expect(rows['age-against-measured'].relativeGap).toBeCloseTo(0.0122, 3)
    expect(relativeGapToMeasuredAge()).toBeCloseTo(0.0122, 3)
    expect(ageReading(13.8e9, 13.8e9)).toBe('same')
    expect(ageReading(13e9, 13.8e9)).toBe('less')
  })

  it('reads 70 as between the two published Hubble constants', () => {
    expect(rows['hubble-constant'].used).toBe(70)
    expect(rows['hubble-constant'].reading).toBe('between')
  })

  it('finds the measured age between 1 / H0 at the two published values, and says it is not an independent check', () => {
    const row = rows['age-at-published-h0']
    expect(row.publishedLow! / 1e9).toBeCloseTo(13.387, 2)
    expect(row.publishedHigh! / 1e9).toBeCloseTo(14.507, 2)
    expect(row.published).toBe(13.8e9)
    expect(row.reading).toBe('between-not-independent')
  })

  it('gives each galaxy\'s time no published reference', () => {
    expect(rows['time-per-galaxy'].published).toBeNull()
    expect(rows['time-per-galaxy'].reading).toBe('calculated-only')
  })
})

describe('the worked example (audit update)', () => {
  it('gives 5.09 x 10^20 km, 1,155 km/s, 4.408 x 10^17 seconds and 13.97 billion years for the Virgo Cluster', () => {
    const example = bigBangWorkedExample()
    expect(example.distanceMpc).toBe(16.5)
    expect(example.distanceKm / 1e20).toBeCloseTo(5.091, 3)
    expect(example.speedKmPerS).toBeCloseTo(1155, 6)
    expect(example.seconds / 1e17).toBeCloseTo(4.408, 3)
    expect(example.years / 1e9).toBeCloseTo(13.968, 3)
  })

  it('gives the same time for the Coma Cluster', () => {
    const example = bigBangWorkedExample(100)
    expect(example.speedKmPerS).toBeCloseTo(7000, 6)
    expect(example.years / 1e9).toBeCloseTo(13.968, 3)
  })
})
