import { describe, expect, it } from 'vitest'
import { horizonRadiusKm } from './blackHoleSizeExperiment'
import source from './seeingTheFallExperiment.ts?raw'
import {
  BLACK_HOLE_PRESETS,
  FLASH_COUNT,
  MAX_START_IN_HORIZON_RADII,
  MIN_START_IN_HORIZON_RADII,
  SMALLEST_GAP_IN_HORIZON_RADII,
  arrivalTime,
  gravityPart,
  motionPart,
  runSeeingTheFallExperiment,
  stretchFactor,
  travelerWatch,
} from './seeingTheFallExperiment'

const SPEED_OF_LIGHT = 299_792_458

// ---- independent descriptions, in horizon radii (r_s = 1, c = 1) ----

// The receding-source factor from the traveler's speed relative to an observer at rest at r: gamma (1 + beta), with
// gamma = E / sqrt(1 - 1/r) (the energy per unit mass E is conserved in the fall) and gamma beta = sqrt(gamma^2 - 1).
function motionPartFromSpeed(r0: number, r: number): number {
  const energy = Math.sqrt(1 - 1 / r0)
  const gamma = energy / Math.sqrt(1 - 1 / r)
  return gamma + Math.sqrt(Math.max(0, gamma * gamma - 1))
}

// The far-away clock at sending from Experiment 5's figures, restated in the test only as the integral of the clock-rate
// ratio against the closed-form watch, in the cycloid parameter (not from the module's own integrand).
function farAwayClockByRates(r0: number, r: number): number {
  const energy = Math.sqrt(1 - 1 / r0)
  const etaEnd = Math.acos((2 * r) / r0 - 1)
  const steps = 200000
  let sum = 0
  for (let i = 0; i < steps; i++) {
    const eta = ((i + 0.5) / steps) * etaEnd
    const radius = (r0 / 2) * (1 + Math.cos(eta))
    sum += (energy / (1 - 1 / radius)) * ((r0 ** 1.5 / 2) * (1 + Math.cos(eta)))
  }
  return (sum * etaEnd) / steps
}

const delay = (r0: number, r: number) => r0 + Math.log(r0 - 1) - (r + Math.log(r - 1))

describe('the two parts of the stretch factor', () => {
  it('has the gravity part equal 1 / sqrt(1 - 1/r), and reject a distance at or inside the horizon', () => {
    for (const r of [1.0001, 1.5, 2, 10, 100]) expect(gravityPart(r)).toBeCloseTo(1 / Math.sqrt(1 - 1 / r), 12)
    expect(() => gravityPart(1)).toThrow(RangeError)
    expect(() => gravityPart(0.5)).toThrow(RangeError)
    expect(() => gravityPart(Number.NaN)).toThrow(RangeError)
  })

  it('has the motion part equal the receding-source factor written from the traveler\'s speed', () => {
    for (const r0 of [2, 5, 10, 100]) {
      for (const fraction of [0.99, 0.7, 0.3, 0.05, 0.001]) {
        const r = 1 + (r0 - 1) * fraction
        expect(motionPart(r0, r) / motionPartFromSpeed(r0, r)).toBeCloseTo(1, 9)
      }
    }
  })

  it('has the stretch factor equal gravity part times motion part, and the direct formula, at every distance', () => {
    for (const r0 of [2, 10, 100]) {
      for (const fraction of [1, 0.6, 0.2, 0.01, 0.0001]) {
        const r = 1 + (r0 - 1) * fraction
        const energy = Math.sqrt(1 - 1 / r0)
        const direct = (energy + Math.sqrt(Math.max(0, 1 / r - 1 / r0))) / (1 - 1 / r)
        expect(stretchFactor(r0, r) / (gravityPart(r) * motionPart(r0, r))).toBeCloseTo(1, 9)
        expect(stretchFactor(r0, r) / direct).toBeCloseTo(1, 9)
      }
    }
  })

  it('is gravity only at the release: the factor is 1 / sqrt(1 - 1/r0) and the motion part is exactly 1', () => {
    for (const r0 of [2, 10, 100]) {
      expect(stretchFactor(r0, r0)).toBeCloseTo(1 / Math.sqrt(1 - 1 / r0), 12)
      expect(motionPart(r0, r0)).toBeCloseTo(1, 12)
    }
  })

  it('rejects a distance beyond the release distance and a release point that is not outside the horizon', () => {
    expect(() => stretchFactor(10, 10.5)).toThrow(RangeError)
    expect(() => motionPart(1, 1.5)).toThrow(RangeError)
    expect(() => stretchFactor(10, 1)).toThrow(RangeError)
  })
})

describe('the stretch factor, found independently of its formula', () => {
  it('agrees with how fast the observer\'s clock at arrival runs against the traveler\'s watch', () => {
    // A central difference of the module's own arrival time against its own watch, a different route from the formula.
    for (const [r0, r] of [[10, 5], [10, 2], [10, 1.5], [20, 3], [100, 10], [5, 1.2]]) {
      const delta = 1e-4 * (r - 1)
      const numerical =
        (arrivalTime(r0, r - delta) - arrivalTime(r0, r + delta)) / (travelerWatch(r0, r - delta) - travelerWatch(r0, r + delta))
      expect(numerical / stretchFactor(r0, r)).toBeGreaterThan(0.999)
      expect(numerical / stretchFactor(r0, r)).toBeLessThan(1.001)
    }
  })
})

describe('near the horizon', () => {
  it('has a stretch factor with no limit: times (r - 1) it approaches 2E, and each tenfold closing multiplies it by 10', () => {
    const r0 = 10
    const energy = Math.sqrt(1 - 1 / r0)
    const factors = [1.1, 1.01, 1.001, 1.0001, 1.00001].map((r) => stretchFactor(r0, r))
    for (let i = 1; i < factors.length; i++) expect(factors[i]).toBeGreaterThan(factors[i - 1])
    for (const r of [1.01, 1.001, 1.0001]) expect(Math.abs((stretchFactor(r0, r) * (r - 1)) / (2 * energy) - 1)).toBeLessThan(0.01)
    for (const [a, b] of [[1.01, 1.001], [1.001, 1.0001], [1.0001, 1.00001]]) {
      expect(Math.abs(stretchFactor(r0, b) / stretchFactor(r0, a) / 10 - 1)).toBeLessThan(0.01)
    }
  })

  it('has an arrival time with no limit: each tenfold closing of the gap adds about 2 ln 10', () => {
    const readings = [1.01, 1.001, 1.0001, 1.00001].map((r) => arrivalTime(10, r))
    for (let i = 1; i < readings.length; i++) expect(readings[i]).toBeGreaterThan(readings[i - 1])
    expect(Math.abs(readings[2] - readings[1] - 2 * Math.LN10)).toBeLessThan(0.02)
    expect(Math.abs(readings[3] - readings[2] - 2 * Math.LN10)).toBeLessThan(0.02)
  })

  it('has no arrival time at or inside the horizon', () => {
    expect(() => arrivalTime(10, 1)).toThrow(RangeError)
    expect(() => arrivalTime(10, 0.5)).toThrow(RangeError)
  })

  it('has the arrival time equal the far-away clock of Experiment 5 plus the delay, without importing it', () => {
    // Experiment 5's specification table (from 10): 59.8, 62.1 and 64.4 at 1.01, 1.001 and 1.0001, to within 0.2.
    for (const [r, expected] of [[1.01, 59.8], [1.001, 62.1], [1.0001, 64.4]]) {
      expect(Math.abs(arrivalTime(10, r) - delay(10, r) - expected)).toBeLessThan(0.2)
    }
    // And against an independent integration of the ratio of clock rates.
    for (const r of [3, 2, 1.5, 1.1]) {
      expect((arrivalTime(10, r) - delay(10, r)) / farAwayClockByRates(10, r)).toBeCloseTo(1, 3)
    }
  })
})

describe('the specification\'s illustrative values (a fall from rest at 10 horizon radii)', () => {
  it('matches the arrival times and stretch factors', () => {
    for (const [r, arrival, factor] of [[5, 49.78, 1.581], [2, 63.66, 3.162], [1.01, 75.63, 191.1], [1.0001, 84.86, 18975]]) {
      expect(Math.abs(arrivalTime(10, r) - arrival)).toBeLessThan(0.1)
      expect(Math.abs(stretchFactor(10, r) / factor - 1)).toBeLessThan(0.005)
    }
    expect(Math.abs(travelerWatch(10, 5) - 40.65)).toBeLessThan(0.05)
    expect(Math.abs(travelerWatch(10, 1) - 48.985)).toBeLessThan(0.01)
    expect(gravityPart(2)).toBeCloseTo(1.414, 3)
    expect(motionPart(10, 2)).toBeCloseTo(2.236, 3)
    expect(motionPart(10, 1.01)).toBeCloseTo(19.02, 1)
  })
})

describe('the flashes', () => {
  const run = runSeeingTheFallExperiment('stellar-black-hole', 10)

  it('has FLASH_COUNT + 1 flashes, evenly spaced on the traveler\'s watch', () => {
    expect(run.flashes).toHaveLength(FLASH_COUNT + 1)
    const step = run.travelerWatchAtHorizon / FLASH_COUNT
    run.flashes.forEach((flash, k) => {
      expect(flash.index).toBe(k)
      expect(Math.abs(flash.sentWatch - k * step)).toBeLessThan(1e-9)
    })
    for (let k = 1; k <= FLASH_COUNT; k++) expect(run.flashes[k].spacingAsSent).toBeCloseTo(step, 9)
    expect(run.flashes[0].spacingAsSent).toBeNull()
  })

  it('has the first flash arrive at 0 and the one sent at the horizon never arrive', () => {
    expect(run.flashes[0].arrival).toBe(0)
    expect(run.flashes[FLASH_COUNT].arrival).toBeNull()
    expect(run.flashes[FLASH_COUNT].distance).toBe(1)
    expect(run.flashes[FLASH_COUNT].spacingAsReceived).toBeNull()
    expect(run.flashes[FLASH_COUNT].stretchFactor).toBeNull()
  })

  it('has the arrival spacing grow from flash to flash, from 2.60 to 5.03 (a fall from 10)', () => {
    let previous = 0
    for (let k = 1; k < FLASH_COUNT; k++) {
      const spacing = run.flashes[k].spacingAsReceived as number
      expect(spacing).toBeGreaterThan(previous)
      previous = spacing
      expect(run.flashes[k].stretchFactor as number).toBeCloseTo(spacing / (run.travelerWatchAtHorizon / FLASH_COUNT), 12)
    }
    expect(Math.abs((run.flashes[1].spacingAsReceived as number) - 2.6)).toBeLessThan(0.05)
    expect(Math.abs((run.flashes[19].spacingAsReceived as number) - 5.03)).toBeLessThan(0.05)
    expect(Math.abs((run.flashes[19].arrival as number) - 60.64)).toBeLessThan(0.1)
  })

  it('has every flash after the first arrive later than it was sent, by a growing delay', () => {
    let previousDelay = 0
    for (let k = 1; k < FLASH_COUNT; k++) {
      const flash = run.flashes[k]
      const flashDelay = (flash.arrival as number) - flash.sentWatch
      expect(flashDelay).toBeGreaterThan(0)
      expect(flashDelay).toBeGreaterThan(previousDelay)
      previousDelay = flashDelay
    }
  })

  it('has each flash\'s stretch factor lie between its neighbours\' instantaneous factors', () => {
    // The spacing between flashes k-1 and k averages the instantaneous factor over that stretch of the fall.
    for (let k = 1; k < FLASH_COUNT; k++) {
      const low = stretchFactor(10, run.flashes[k - 1].distance)
      const high = stretchFactor(10, run.flashes[k].distance)
      const factor = run.flashes[k].stretchFactor as number
      expect(factor).toBeGreaterThanOrEqual(low - 1e-9)
      expect(factor).toBeLessThanOrEqual(high + 1e-9)
    }
  })
})

describe('the experiment as run', () => {
  it('depends only on the release distance in horizon radii for the flashes in light-times; the seconds scale with the mass', () => {
    const a = runSeeingTheFallExperiment('stellar-black-hole', 5)
    const b = runSeeingTheFallExperiment('m87-star', 5)
    expect(a.flashes).toEqual(b.flashes)
    expect(a.curve).toEqual(b.curve)
    for (const preset of BLACK_HOLE_PRESETS) {
      const run = runSeeingTheFallExperiment(preset.id, 10)
      expect(run.lightTimeSeconds / ((horizonRadiusKm(preset.massSolarMasses) * 1000) / SPEED_OF_LIGHT)).toBeCloseTo(1, 3)
    }
    expect(runSeeingTheFallExperiment('stellar-black-hole', 10).lightTimeSeconds).toBeCloseTo(9.85e-5, 7)
    expect(Math.abs(runSeeingTheFallExperiment('sgr-a-star', 10).lightTimeSeconds / 42.4 - 1)).toBeLessThan(0.01)
    expect(Math.abs(runSeeingTheFallExperiment('m87-star', 10).lightTimeSeconds / 64_000 - 1)).toBeLessThan(0.01)
  })

  it('gives a curve for the graphs from the release down to the smallest gap, with consistent values', () => {
    const run = runSeeingTheFallExperiment('sgr-a-star', 10)
    const first = run.curve[0]
    const last = run.curve[run.curve.length - 1]
    expect(first.gap).toBeCloseTo(9, 9)
    expect(first.arrival).toBe(0)
    expect(first.motion).toBeCloseTo(1, 9)
    expect(first.total).toBeCloseTo(1 / Math.sqrt(0.9), 9)
    expect(last.gap).toBeCloseTo(SMALLEST_GAP_IN_HORIZON_RADII, 12)
    expect(Math.abs(last.total / 18975 - 1)).toBeLessThan(0.005)
    for (let i = 1; i < run.curve.length; i++) {
      expect(run.curve[i].gap).toBeLessThan(run.curve[i - 1].gap)
      expect(run.curve[i].arrival).toBeGreaterThan(run.curve[i - 1].arrival)
      expect(run.curve[i].total).toBeGreaterThan(run.curve[i - 1].total)
      expect(run.curve[i].total / (run.curve[i].gravity * run.curve[i].motion)).toBeCloseTo(1, 9)
    }
  })

  it('rejects a release distance outside the controls\' range, one that is not finite, and an unknown black hole', () => {
    expect(() => runSeeingTheFallExperiment('stellar-black-hole', MIN_START_IN_HORIZON_RADII - 0.5)).toThrow(RangeError)
    expect(() => runSeeingTheFallExperiment('stellar-black-hole', MAX_START_IN_HORIZON_RADII + 1)).toThrow(RangeError)
    expect(() => runSeeingTheFallExperiment('stellar-black-hole', Number.NaN)).toThrow(RangeError)
    expect(() => runSeeingTheFallExperiment('sun' as never, 10)).toThrow()
    expect(() => travelerWatch(10, 11)).toThrow(RangeError)
    expect(() => travelerWatch(1, 1)).toThrow(RangeError)
  })

  it('works at the ends of the controls\' range', () => {
    for (const start of [MIN_START_IN_HORIZON_RADII, MAX_START_IN_HORIZON_RADII]) {
      const run = runSeeingTheFallExperiment('stellar-black-hole', start)
      expect(run.flashes[FLASH_COUNT - 1].arrival).toBeGreaterThan(0)
      expect(Number.isFinite(run.flashes[FLASH_COUNT - 1].arrival as number)).toBe(true)
    }
    expect(Math.abs(runSeeingTheFallExperiment('stellar-black-hole', 100).curve.at(-1)!.total / 19901 - 1)).toBeLessThan(0.005)
    expect(Math.abs(runSeeingTheFallExperiment('stellar-black-hole', 2).curve.at(-1)!.total / 14143 - 1)).toBeLessThan(0.005)
  })
})

describe('determinism and playback speed', () => {
  it('gives the same flashes for the same inputs', () => {
    expect(runSeeingTheFallExperiment('sgr-a-star', 20)).toEqual(runSeeingTheFallExperiment('sgr-a-star', 20))
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
      'fallingInExperiment',
      'timeNearBlackHoleExperiment',
      'orbitsNearBlackHoleExperiment',
      'lightNearBlackHoleExperiment',
      'blackHoleExperiment',
      'orbitExperiment',
    ]) {
      expect(importLines.some((line: string) => line.includes(`/${other}'`))).toBe(false)
    }
  })
})
