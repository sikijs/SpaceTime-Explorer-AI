import { describe, expect, it } from 'vitest'
import {
  HUBBLE_CONSTANT_KM_PER_S_PER_MPC,
  REAL_SPEED_OF_LIGHT_KM_PER_S,
  cosmologicalRedshift,
} from './hubblesLawExperiment'
import {
  MAX_REDSHIFT,
  SUPERNOVA_REDSHIFTS,
  brightnessRelativeToMatterOnly,
  comovingDistanceMpc,
  decelerationParameter,
  luminosityDistanceMpc,
  runDarkEnergyExperiment,
} from './darkEnergyExperiment'

const hubbleDistance = REAL_SPEED_OF_LIGHT_KM_PER_S / HUBBLE_CONSTANT_KM_PER_S_PER_MPC

describe('comovingDistanceMpc', () => {
  it('matches the exact matter-only result when there is no dark energy', () => {
    for (const z of [0.1, 0.5, 1]) {
      const exact = 2 * hubbleDistance * (1 - 1 / Math.sqrt(1 + z))
      expect(Math.abs(comovingDistanceMpc(z, 0) - exact) / exact).toBeLessThan(1e-9)
    }
  })

  it('matches c z / H0 exactly when the universe is all dark energy', () => {
    for (const z of [0.1, 0.5, 1]) {
      const exact = hubbleDistance * z
      expect(Math.abs(comovingDistanceMpc(z, 1) - exact) / exact).toBeLessThan(1e-9)
    }
  })

  it('converges: doubling the integration steps barely changes the result', () => {
    const coarse = comovingDistanceMpc(1, 0.7, 1000)
    const fine = comovingDistanceMpc(1, 0.7, 2000)
    expect(Math.abs(coarse - fine) / fine).toBeLessThan(1e-9)
  })
})

describe('luminosityDistanceMpc', () => {
  it('agrees with Experiment 1 for nearby objects, whatever the dark energy share', () => {
    for (const share of [0, 0.3, 0.7, 0.9]) {
      const z = 0.01
      const d = luminosityDistanceMpc(z, share)
      expect(Math.abs(d - hubbleDistance * z) / (hubbleDistance * z)).toBeLessThan(0.02)
      expect(Math.abs(cosmologicalRedshift(d) - z) / z).toBeLessThan(0.02)
    }
  })

  it('is strictly larger for a larger dark energy share, at any redshift above 0', () => {
    for (const z of [0.2, 0.5, 0.8, 1]) {
      let previous = 0
      for (const share of [0, 0.2, 0.4, 0.6, 0.8]) {
        const d = luminosityDistanceMpc(z, share)
        expect(d).toBeGreaterThan(previous)
        previous = d
      }
    }
  })
})

describe('brightnessRelativeToMatterOnly', () => {
  it('is 1 with no dark energy and below 1 with some', () => {
    for (const z of SUPERNOVA_REDSHIFTS) {
      expect(brightnessRelativeToMatterOnly(z, 0)).toBeCloseTo(1, 12)
      expect(brightnessRelativeToMatterOnly(z, 0.3)).toBeLessThan(1)
    }
  })

  it('dims more at higher redshift for 70% dark energy, with about 0.69 at redshift 0.5', () => {
    const [low, mid, high] = SUPERNOVA_REDSHIFTS.map((z) => brightnessRelativeToMatterOnly(z, 0.7))
    expect(low).toBeGreaterThan(mid)
    expect(mid).toBeGreaterThan(high)
    expect(mid).toBeGreaterThan(0.6)
    expect(mid).toBeLessThan(0.8)
  })
})

describe('decelerationParameter', () => {
  it('is +0.5 with no dark energy, -0.55 at 70%, and 0 at one third', () => {
    expect(decelerationParameter(0)).toBeCloseTo(0.5, 12)
    expect(decelerationParameter(0.7)).toBeCloseTo(-0.55, 12)
    expect(decelerationParameter(1 / 3)).toBeCloseTo(0, 12)
  })
})

describe('runDarkEnergyExperiment', () => {
  it('reports the three supernovae, a curve to the maximum redshift, and the expansion direction', () => {
    const none = runDarkEnergyExperiment(0)
    const best = runDarkEnergyExperiment(0.7)
    expect(best.supernovae.map((s) => s.redshift)).toEqual(SUPERNOVA_REDSHIFTS)
    expect(best.curve[0].redshift).toBe(0)
    expect(best.curve[best.curve.length - 1].redshift).toBeCloseTo(MAX_REDSHIFT, 12)
    expect(none.isExpansionAccelerating).toBe(false)
    expect(best.isExpansionAccelerating).toBe(true)
    const mid = best.supernovae[1]
    expect(mid.distanceMpc).toBeGreaterThan(mid.matterOnlyDistanceMpc)
  })
})

describe('module independence', () => {
  it('imports the Hubble constant and speed of light from hubblesLawExperiment and nothing from the dark matter or CMB modules', async () => {
    const source = await import('node:fs/promises').then((fs) =>
      fs.readFile(new URL('./darkEnergyExperiment.ts', import.meta.url), 'utf-8'),
    )
    const importLines = source.split('\n').filter((line: string) => line.trim().startsWith('import'))
    const fromHubble = importLines.filter((line: string) => line.includes('hubblesLawExperiment')).join(' ')
    expect(fromHubble).toContain('HUBBLE_CONSTANT_KM_PER_S_PER_MPC')
    expect(fromHubble).toContain('REAL_SPEED_OF_LIGHT_KM_PER_S')
    for (const name of ['darkMatterExperiment', 'cosmicMicrowaveBackgroundExperiment']) {
      expect(importLines.some((line: string) => line.includes(name))).toBe(false)
    }
  })
})
