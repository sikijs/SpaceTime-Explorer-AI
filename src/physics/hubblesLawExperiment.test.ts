import { describe, expect, it } from 'vitest'
import {
  actualRedshiftAnswer,
  actualSpeedAnswer,
  cosmologicalRedshift,
  guessedFarSpeedKmPerS,
  hubbleCheckUp,
  hubbleConstantReading,
  MAX_PAIR_NEAR_DISTANCE_MPC,
  PAIR_DISTANCE_RATIO,
  PART1_NEAR_DISTANCE_MPC,
  redshiftGuessMarkerRow,
  redshiftGuessMatches,
  runHubblePair,
  speedGuessMatches,
  speedGuessRatio,
  speedPanelMaxKmPerS,
  stretchedWavelengthNm,
  workedExample,
  GALAXY_PRESETS,
  HUBBLE_CONSTANT_KM_PER_S_PER_MPC,
  MAX_CUSTOM_DISTANCE_MPC,
  REAL_SPEED_OF_LIGHT_KM_PER_S,
  recessionSpeedKmPerS,
  runHubblesLawExperiment,
  wavelengthStretchFactor,
} from './hubblesLawExperiment'

describe('recessionSpeedKmPerS', () => {
  it('is exactly proportional to distance', () => {
    const near = recessionSpeedKmPerS(50)
    const far = recessionSpeedKmPerS(100)
    expect(far).toBeCloseTo(near * 2, 10)
  })
})

describe('cosmologicalRedshift', () => {
  it('is exactly proportional to distance', () => {
    const near = cosmologicalRedshift(50)
    const far = cosmologicalRedshift(100)
    expect(far).toBeCloseTo(near * 2, 10)
  })

  it('matches the direct formula for representative distances', () => {
    expect(cosmologicalRedshift(16.5)).toBeCloseTo(
      (HUBBLE_CONSTANT_KM_PER_S_PER_MPC * 16.5) / REAL_SPEED_OF_LIGHT_KM_PER_S,
      10
    )
    expect(cosmologicalRedshift(100)).toBeCloseTo(
      (HUBBLE_CONSTANT_KM_PER_S_PER_MPC * 100) / REAL_SPEED_OF_LIGHT_KM_PER_S,
      10
    )
  })

  it('does not reuse the velocity-based Doppler formula', async () => {
    // Regression check (CLAUDE.md §8): this experiment must not import
    // gravitationalWaveRedshiftExperiment.ts, since that module models a source moving through
    // space, the wrong mechanism for cosmological redshift. (Explanatory comments in the source
    // mention these names deliberately, so only the import statements themselves are checked.)
    const source = await import('node:fs/promises').then((fs) =>
      fs.readFile(new URL('./hubblesLawExperiment.ts', import.meta.url), 'utf-8')
    )
    const importLines = source.split('\n').filter((line) => line.trim().startsWith('import'))
    for (const line of importLines) {
      expect(line).not.toContain('gravitationalWaveRedshiftExperiment')
      expect(line).not.toContain('dopplerFactorFor')
    }
  })
})

describe('wavelengthStretchFactor', () => {
  it('equals exactly 1 + cosmologicalRedshift for representative distances', () => {
    for (const distanceMpc of [16.5, 100, 200]) {
      expect(wavelengthStretchFactor(distanceMpc)).toBeCloseTo(1 + cosmologicalRedshift(distanceMpc), 10)
    }
  })
})

describe('runHubblesLawExperiment', () => {
  it('produces a strictly larger redshift and stretch factor for a farther distance', () => {
    const near = runHubblesLawExperiment(16.5)
    const far = runHubblesLawExperiment(100)
    expect(far.redshift).toBeGreaterThan(near.redshift)
    expect(far.wavelengthStretchFactor).toBeGreaterThan(near.wavelengthStretchFactor)
  })

  it('throws for a non-positive distance', () => {
    expect(() => runHubblesLawExperiment(0)).toThrow(RangeError)
    expect(() => runHubblesLawExperiment(-5)).toThrow(RangeError)
  })

  it('keeps redshift small (low-redshift approximation stays honest) at every preset and the custom-slider ceiling', () => {
    const distances = [...GALAXY_PRESETS.map((preset) => preset.distanceMpc), MAX_CUSTOM_DISTANCE_MPC]
    for (const distanceMpc of distances) {
      expect(runHubblesLawExperiment(distanceMpc).redshift).toBeLessThan(0.05)
    }
  })
})

describe('the pair (audit update)', () => {
  it('puts Galaxy A at exactly twice Galaxy B\'s distance, with Part 1 using the Virgo Cluster for B', () => {
    const pair = runHubblePair(PART1_NEAR_DISTANCE_MPC)
    expect(PART1_NEAR_DISTANCE_MPC).toBe(16.5)
    expect(pair.near.distanceMpc).toBe(16.5)
    expect(pair.far.distanceMpc).toBe(33)
    expect(pair.far.distanceMpc / pair.near.distanceMpc).toBe(PAIR_DISTANCE_RATIO)
  })

  it('gives the figures printed on the page: 1,155 and 2,310 km/s, z of 0.00385 and 0.00771', () => {
    const pair = runHubblePair(16.5)
    expect(pair.near.recessionSpeedKmPerS).toBeCloseTo(1155, 6)
    expect(pair.far.recessionSpeedKmPerS).toBeCloseTo(2310, 6)
    expect(pair.near.redshift).toBeCloseTo(0.00385, 5)
    expect(pair.far.redshift).toBeCloseTo(0.00771, 5)
  })

  it('keeps A at or below the slider ceiling at the largest allowed B, and matches the single-galaxy module', () => {
    const pair = runHubblePair(MAX_PAIR_NEAR_DISTANCE_MPC)
    expect(MAX_PAIR_NEAR_DISTANCE_MPC).toBe(100)
    expect(pair.far.distanceMpc).toBeLessThanOrEqual(MAX_CUSTOM_DISTANCE_MPC)
    expect(pair.far.redshift).toBeCloseTo(runHubblesLawExperiment(200).redshift, 12)
    expect(pair.far.redshift).toBeLessThan(0.05)
  })

  it('keeps the ratio of A to B exactly 2 for any B (so no setting changes the answer to either guess)', () => {
    for (const distanceMpc of [1, 16.5, 37, 100]) {
      const pair = runHubblePair(distanceMpc)
      expect(pair.far.recessionSpeedKmPerS / pair.near.recessionSpeedKmPerS).toBeCloseTo(2, 10)
      expect(pair.far.redshift / pair.near.redshift).toBeCloseTo(2, 10)
    }
  })

  it('throws for a non-positive distance', () => {
    expect(() => runHubblePair(0)).toThrow(RangeError)
    expect(() => runHubblePair(-1)).toThrow(RangeError)
  })
})

describe('guess marks (audit update)', () => {
  it('turns each speed guess into a different white-bar length, ratio times B\'s real speed', () => {
    expect(speedGuessRatio('twice')).toBe(2)
    expect(speedGuessRatio('same')).toBe(1)
    expect(speedGuessRatio('half')).toBe(0.5)
    expect(guessedFarSpeedKmPerS('twice', 16.5)).toBeCloseTo(2310, 6)
    expect(guessedFarSpeedKmPerS('same', 16.5)).toBeCloseTo(1155, 6)
    expect(guessedFarSpeedKmPerS('half', 16.5)).toBeCloseTo(577.5, 6)
  })

  it('follows B\'s distance, so a different setting moves the white bar', () => {
    expect(guessedFarSpeedKmPerS('twice', 100)).toBeCloseTo(14000, 6)
  })

  it('sizes the speed panel to hold the longest of B, A and the white bar', () => {
    const pair = runHubblePair(16.5)
    expect(speedPanelMaxKmPerS(pair, 'half')).toBeCloseTo(2310, 6)
    expect(speedPanelMaxKmPerS(pair, 'twice')).toBeCloseTo(2310, 6)
    expect(speedPanelMaxKmPerS(pair, 'same')).toBeCloseTo(2310, 6)
  })

  it('puts each redshift guess on a different row, as a marker only', () => {
    expect(redshiftGuessMarkerRow('nearer')).toBe('near')
    expect(redshiftGuessMarkerRow('farther')).toBe('far')
    expect(redshiftGuessMarkerRow('same')).toBe('between')
  })

  it('does not change any real number (the marks read the pair, the pair never reads a guess)', () => {
    const before = runHubblePair(16.5)
    guessedFarSpeedKmPerS('half', 16.5)
    speedPanelMaxKmPerS(before, 'twice')
    expect(runHubblePair(16.5)).toEqual(before)
  })
})

describe('marking the guesses (audit update)', () => {
  const pair = runHubblePair(16.5)

  it('reads the real answers from the pair, not from constants', () => {
    expect(actualSpeedAnswer(pair)).toBe('twice')
    expect(actualRedshiftAnswer(pair)).toBe('farther')
  })

  it('marks exactly one speed guess and one redshift guess as matching', () => {
    expect(speedGuessMatches('twice', pair)).toBe(true)
    expect(speedGuessMatches('same', pair)).toBe(false)
    expect(speedGuessMatches('half', pair)).toBe(false)
    expect(redshiftGuessMatches('farther', pair)).toBe(true)
    expect(redshiftGuessMatches('nearer', pair)).toBe(false)
    expect(redshiftGuessMatches('same', pair)).toBe(false)
  })

  it('answers the same at every distance B can take', () => {
    for (const distanceMpc of [1, 50, 100]) {
      const other = runHubblePair(distanceMpc)
      expect(actualSpeedAnswer(other)).toBe('twice')
      expect(actualRedshiftAnswer(other)).toBe('farther')
    }
  })

  it('gives no speed answer, and marks no speed guess, for a pair that is not exactly 2 to 1', () => {
    const odd = { near: runHubblesLawExperiment(10), far: runHubblesLawExperiment(30) }
    expect(actualSpeedAnswer(odd)).toBeNull()
    expect(speedGuessMatches('twice', odd)).toBe(false)
  })

  it('answers "same" for two equal redshifts and "nearer" if the nearer one were more redshifted', () => {
    const equal = { near: runHubblesLawExperiment(20), far: runHubblesLawExperiment(20) }
    expect(actualRedshiftAnswer(equal)).toBe('same')
    const swapped = { near: runHubblesLawExperiment(40), far: runHubblesLawExperiment(20) }
    expect(actualRedshiftAnswer(swapped)).toBe('nearer')
  })
})

describe('the check-up (audit update)', () => {
  const rows = Object.fromEntries(hubbleCheckUp().map((row) => [row.id, row]))

  it('has the four rows, in the order the page prints them', () => {
    expect(hubbleCheckUp().map((row) => row.id)).toEqual([
      'hubble-constant',
      'virgo-distance',
      'coma-redshift',
      'speed-of-b',
    ])
  })

  it('reads 70 as between the two published values, neither of them', () => {
    expect(rows['hubble-constant'].used).toBe(70)
    expect(rows['hubble-constant'].reading).toBe('between')
    expect(hubbleConstantReading(70)).toBe('between')
    expect(hubbleConstantReading(67.4)).toBe('same-as-one-value')
    expect(hubbleConstantReading(80)).toBe('outside')
    expect(hubbleConstantReading(60)).toBe('outside')
  })

  it('finds the Virgo distance the same as the published mean, 16.5 Mpc', () => {
    expect(rows['virgo-distance'].used).toBe(16.5)
    expect(rows['virgo-distance'].published).toBe(16.5)
    expect(rows['virgo-distance'].reading).toBe('same')
  })

  it('finds the Coma redshift at 100 Mpc the same as NASA\'s printed 0.023, to the digits printed', () => {
    expect(rows['coma-redshift'].used).toBeCloseTo(0.02335, 5)
    expect(rows['coma-redshift'].published).toBe(0.023)
    expect(rows['coma-redshift'].reading).toBe('same-to-printed-digits')
  })

  it('gives B\'s speed no published reference', () => {
    expect(rows['speed-of-b'].used).toBeCloseTo(1155, 6)
    expect(rows['speed-of-b'].published).toBeNull()
    expect(rows['speed-of-b'].reading).toBe('calculated-only')
  })
})

describe('the worked example (audit update)', () => {
  it('gives 1,155 km/s, z of 0.00385, a stretch of 1.00385 and 500 nm arriving as about 501.9 nm at 16.5 Mpc', () => {
    const example = workedExample()
    expect(example.distanceMpc).toBe(16.5)
    expect(example.speedKmPerS).toBeCloseTo(1155, 6)
    expect(example.redshift).toBeCloseTo(1155 / 299792.458, 12)
    expect(example.stretchFactor).toBeCloseTo(1.00385, 5)
    expect(example.startWavelengthNm).toBe(500)
    expect(example.arrivalWavelengthNm).toBeCloseTo(501.9, 1)
  })

  it('stretches a wavelength by exactly 1 + z', () => {
    expect(stretchedWavelengthNm(500, 100)).toBeCloseTo(500 * (1 + cosmologicalRedshift(100)), 10)
  })
})
