import { describe, expect, it } from 'vitest'
import {
  cosmologicalRedshift,
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
