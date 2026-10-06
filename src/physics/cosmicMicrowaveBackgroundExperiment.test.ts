import { describe, expect, it } from 'vitest'
import {
  CMB_TEMPERATURE_TODAY_KELVIN,
  RECOMBINATION_REDSHIFT,
  cmbTemperatureKelvin,
  runCmbExperiment,
} from './cosmicMicrowaveBackgroundExperiment'

describe('cmbTemperatureKelvin', () => {
  it('equals the temperature today at redshift 0', () => {
    expect(cmbTemperatureKelvin(0)).toBe(CMB_TEMPERATURE_TODAY_KELVIN)
  })

  it('is within 5% of 3,000 K at recombination', () => {
    const t = cmbTemperatureKelvin(RECOMBINATION_REDSHIFT)
    expect(Math.abs(t - 3000) / 3000).toBeLessThan(0.05)
  })

  it('is exactly proportional to (1 + z) for several redshifts', () => {
    for (const z of [0.5, 10, 100, 1000, RECOMBINATION_REDSHIFT]) {
      expect(cmbTemperatureKelvin(z) / (1 + z)).toBeCloseTo(CMB_TEMPERATURE_TODAY_KELVIN, 10)
    }
  })

  it('is strictly higher at a larger redshift', () => {
    expect(cmbTemperatureKelvin(500)).toBeGreaterThan(cmbTemperatureKelvin(50))
    expect(cmbTemperatureKelvin(50)).toBeGreaterThan(cmbTemperatureKelvin(0))
  })
})

describe('runCmbExperiment', () => {
  it('returns the redshift and its computed temperature', () => {
    const result = runCmbExperiment(100)
    expect(result.redshift).toBe(100)
    expect(result.temperatureKelvin).toBe(cmbTemperatureKelvin(100))
  })
})

describe('module independence', () => {
  it('does not import anything from hubblesLawExperiment.ts', async () => {
    const source = await import('node:fs/promises').then((fs) =>
      fs.readFile(new URL('./cosmicMicrowaveBackgroundExperiment.ts', import.meta.url), 'utf-8')
    )
    const importLines = source.split('\n').filter((line) => line.trim().startsWith('import'))
    expect(importLines.some((line) => line.includes('hubblesLawExperiment'))).toBe(false)
  })
})
