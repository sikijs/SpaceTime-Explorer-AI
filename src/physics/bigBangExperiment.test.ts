import { describe, expect, it } from 'vitest'
import { HUBBLE_CONSTANT_KM_PER_S_PER_MPC } from './hubblesLawExperiment'
import {
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
