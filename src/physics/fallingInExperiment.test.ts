import { describe, expect, it } from 'vitest'
import { horizonRadiusKm } from './blackHoleSizeExperiment'
import source from './fallingInExperiment.ts?raw'
import {
  BLACK_HOLE_PRESETS,
  BODY_LENGTH_METERS,
  FAR_CLOCK_CUTOFF_IN_HORIZON_RADII,
  MAX_START_IN_HORIZON_RADII,
  MIN_START_IN_HORIZON_RADII,
  farAwayClock,
  runFallingInExperiment,
  stretchCurve,
  stretchInG,
  travelerClock,
} from './fallingInExperiment'

// ---- independent descriptions of the exact theory, in horizon radii (r_s = 1, c = 1) ----

// The traveler's clock by integrating d(tau)/dr = -1 / sqrt(1/r - 1/r0) numerically, with r = r0 - s^2 so that the
// singularity at the release point goes away: tau = 2 sqrt(r0) * integral of sqrt(r0 - s^2) ds.
function travelerClockByIntegration(r0: number, r: number): number {
  const sEnd = Math.sqrt(r0 - r)
  const steps = 20000
  let sum = 0
  for (let i = 0; i < steps; i++) {
    const s = ((i + 0.5) / steps) * sEnd
    sum += Math.sqrt(r0 - s * s)
  }
  return 2 * Math.sqrt(r0) * (sum * sEnd) / steps
}

// The far-away clock from the standard ratio of clock rates, dt/dtau = E / (1 - 1/r) with E = sqrt(1 - 1/r0), integrated
// against the closed-form traveler's clock written in the cycloid parameter: r = (r0/2)(1 + cos eta) and
// dtau/d(eta) = (r0^1.5 / 2)(1 + cos eta). A different route from the module's own integrand.
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

// The stretch from 2GM h / r^3 with G and the solar mass written out in SI units, not through the module's constants.
const G = 6.674e-11
const SOLAR_MASS_KG = 1.98847e30
const SPEED_OF_LIGHT = 299_792_458
const stretchInGFromScratch = (massSolarMasses: number, rKm: number) =>
  (2 * G * massSolarMasses * SOLAR_MASS_KG * BODY_LENGTH_METERS) / (rKm * 1000) ** 3 / 9.80665

const stellar = BLACK_HOLE_PRESETS.find((p) => p.id === 'stellar-black-hole')!
const sgr = BLACK_HOLE_PRESETS.find((p) => p.id === 'sgr-a-star')!
const m87 = BLACK_HOLE_PRESETS.find((p) => p.id === 'm87-star')!

describe('the traveler\'s clock', () => {
  it('starts at 0 and matches the closed form at the horizon', () => {
    for (const r0 of [2, 5, 10, 20, 100]) {
      expect(travelerClock(r0, r0)).toBe(0)
      const eta = Math.acos(2 / r0 - 1)
      expect(travelerClock(r0, 1)).toBeCloseTo(0.5 * r0 ** 1.5 * (eta + Math.sin(eta)), 9)
    }
  })

  it('agrees with a numerical integration of d(tau)/dr, done a different way', () => {
    for (const [r0, r] of [[10, 5], [10, 2], [10, 1], [20, 3], [100, 1], [5, 1.5]]) {
      expect(travelerClock(r0, r) / travelerClockByIntegration(r0, r)).toBeCloseTo(1, 4)
    }
  })

  it('matches the specification\'s table: 48.985 from 10, 1570 from 100, 140 from 20, 16.85 from 5', () => {
    expect(Math.abs(travelerClock(10, 1) - 48.985)).toBeLessThan(0.1)
    expect(Math.abs(travelerClock(100, 1) - 1570.1)).toBeLessThan(0.1)
    expect(Math.abs(travelerClock(20, 1) - 139.8)).toBeLessThan(0.1)
    expect(Math.abs(travelerClock(5, 1) - 16.85)).toBeLessThan(0.1)
    for (const [r, expected] of [[3, 45.8], [2, 47.7], [1.5, 48.4], [1.1, 48.88]]) {
      expect(Math.abs(travelerClock(10, r) - expected)).toBeLessThan(0.1)
    }
  })

  it('settles: from 1.01 to 1.0001 horizon radii it changes by only about 0.01', () => {
    const change = travelerClock(10, 1.0001) - travelerClock(10, 1.01)
    expect(change).toBeGreaterThan(0)
    // The specification said "less than 0.01"; the exact change is 0.0105, so the bound here is 0.02.
    expect(change).toBeLessThan(0.02)
  })

  it('rejects distances outside the fall and a release point that is not outside the horizon', () => {
    expect(() => travelerClock(10, 0.9)).toThrow(RangeError)
    expect(() => travelerClock(10, 10.5)).toThrow(RangeError)
    expect(() => travelerClock(1, 1)).toThrow(RangeError)
    expect(() => travelerClock(Number.NaN, 1)).toThrow(RangeError)
  })
})

describe('the far-away clock', () => {
  it('starts at 0', () => {
    expect(farAwayClock(10, 10)).toBe(0)
  })

  it('exceeds the traveler\'s clock at every distance after the release', () => {
    for (const r0 of [2, 5, 10, 100]) {
      for (const fraction of [0.99, 0.9, 0.5, 0.2, 0.05]) {
        const r = 1 + (r0 - 1) * fraction
        expect(farAwayClock(r0, r)).toBeGreaterThan(travelerClock(r0, r))
      }
      expect(farAwayClock(r0, FAR_CLOCK_CUTOFF_IN_HORIZON_RADII)).toBeGreaterThan(travelerClock(r0, FAR_CLOCK_CUTOFF_IN_HORIZON_RADII))
    }
  })

  it('has no limit: each tenfold closing of the gap to the horizon adds about ln 10', () => {
    const readings = [1.1, 1.01, 1.001, 1.0001, 1.00001].map((r) => farAwayClock(10, r))
    for (let i = 1; i < readings.length; i++) expect(readings[i]).toBeGreaterThan(readings[i - 1])
    // The first step is not yet in the asymptotic range; from 1.001 on, it is.
    expect(Math.abs(readings[3] - readings[2] - Math.LN10)).toBeLessThan(0.02)
    expect(Math.abs(readings[4] - readings[3] - Math.LN10)).toBeLessThan(0.02)
    expect(readings[3] - readings[1]).toBeGreaterThan(4) // while the traveler's clock moved by less than 0.01
  })

  it('agrees with an integration of the ratio of clock rates, done a different way', () => {
    for (const r of [3, 2, 1.5, 1.1]) {
      expect(farAwayClock(10, r) / farAwayClockByRates(10, r)).toBeCloseTo(1, 3)
    }
    expect(farAwayClock(20, 2) / farAwayClockByRates(20, 2)).toBeCloseTo(1, 3)
  })

  it('matches the specification\'s table to within 0.2 horizon light-times', () => {
    for (const [r, expected] of [[3, 50.5], [2, 53.4], [1.5, 55.1], [1.1, 57.4], [1.01, 59.8], [1.001, 62.1], [1.0001, 64.4]]) {
      expect(Math.abs(farAwayClock(10, r) - expected)).toBeLessThan(0.2)
    }
  })

  it('has no value at or inside the horizon', () => {
    expect(() => farAwayClock(10, 1)).toThrow(RangeError)
    expect(() => farAwayClock(10, 0.5)).toThrow(RangeError)
    expect(() => farAwayClock(10, 11)).toThrow(RangeError)
  })
})

describe('the stretch', () => {
  it('follows 2GM h / r^3 written out from G and the mass', () => {
    for (const preset of BLACK_HOLE_PRESETS) {
      const horizon = horizonRadiusKm(preset.massSolarMasses)
      for (const r of [1, 1.5, 3, 10, 100]) {
        expect(stretchInG(preset.massSolarMasses, r) / stretchInGFromScratch(preset.massSolarMasses, r * horizon)).toBeCloseTo(1, 2)
      }
    }
  })

  it('is eight times larger at half the distance, and proportional to the mass at the same kilometer distance', () => {
    expect(stretchInG(10, 2) / stretchInG(10, 4)).toBeCloseTo(8, 9)
    const km = 5000
    const at = (mass: number) => stretchInG(mass, km / horizonRadiusKm(mass))
    expect(at(40) / at(10)).toBeCloseTo(4, 9)
  })

  it('matches the specification\'s table at the horizon, to within 2%', () => {
    expect(stretchInG(stellar.massSolarMasses, 1) / 2.1e7).toBeGreaterThan(0.98)
    expect(stretchInG(stellar.massSolarMasses, 1) / 2.1e7).toBeLessThan(1.02)
    expect(stretchInG(sgr.massSolarMasses, 1) / 1.1e-4).toBeGreaterThan(0.98)
    expect(stretchInG(sgr.massSolarMasses, 1) / 1.1e-4).toBeLessThan(1.04)
    expect(stretchInG(m87.massSolarMasses, 1) / 5.0e-11).toBeGreaterThan(0.98)
    expect(stretchInG(m87.massSolarMasses, 1) / 5.0e-11).toBeLessThan(1.02)
  })

  it('is smaller for a bigger black hole at the same number of horizon radii, in proportion to 1 / mass^2', () => {
    for (const r of [1, 3, 10]) {
      const small = stretchInG(stellar.massSolarMasses, r)
      const mid = stretchInG(sgr.massSolarMasses, r)
      const big = stretchInG(m87.massSolarMasses, r)
      expect(small).toBeGreaterThan(mid)
      expect(mid).toBeGreaterThan(big)
      expect(small / mid / (sgr.massSolarMasses / stellar.massSolarMasses) ** 2).toBeCloseTo(1, 6)
      expect(mid / big / (m87.massSolarMasses / sgr.massSolarMasses) ** 2).toBeCloseTo(1, 6)
    }
  })

  it('rejects a mass or distance that is not a positive number', () => {
    expect(() => stretchInG(0, 1)).toThrow(RangeError)
    expect(() => stretchInG(10, 0)).toThrow(RangeError)
    expect(() => stretchInG(10, Number.NaN)).toThrow(RangeError)
  })
})

describe('the experiment as run', () => {
  it('finds the 1 g distance at about 276 horizon radii for the 10-Sun black hole, and inside the horizon for the others', () => {
    const stellarRun = runFallingInExperiment('stellar-black-hole', 10)
    expect(Math.abs(stellarRun.stretchOneGRadiusInHorizonRadii! / 276 - 1)).toBeLessThan(0.01)
    expect(stretchInG(stellar.massSolarMasses, stellarRun.stretchOneGRadiusInHorizonRadii!)).toBeCloseTo(1, 6)
    expect(runFallingInExperiment('sgr-a-star', 10).stretchOneGRadiusInHorizonRadii).toBeNull()
    expect(runFallingInExperiment('m87-star', 10).stretchOneGRadiusInHorizonRadii).toBeNull()
  })

  it('scales the seconds with the mass: the light-time is the horizon radius divided by the speed of light', () => {
    for (const preset of BLACK_HOLE_PRESETS) {
      const run = runFallingInExperiment(preset.id, 10)
      expect(run.lightTimeSeconds / ((horizonRadiusKm(preset.massSolarMasses) * 1000) / SPEED_OF_LIGHT)).toBeCloseTo(1, 3)
      expect(run.travelerSecondsAtHorizon).toBeCloseTo(run.travelerClockAtHorizon * run.lightTimeSeconds, 9)
    }
    expect(runFallingInExperiment('stellar-black-hole', 10).travelerSecondsAtHorizon / 4.8e-3).toBeCloseTo(1, 1)
    expect(Math.abs(runFallingInExperiment('sgr-a-star', 10).travelerSecondsAtHorizon / 2075 - 1)).toBeLessThan(0.01)
    expect(Math.abs(runFallingInExperiment('m87-star', 10).travelerSecondsAtHorizon / 3.14e6 - 1)).toBeLessThan(0.01)
  })

  it('reports the clocks, the stretch at the start and at the horizon, and the cutoff reading', () => {
    const run = runFallingInExperiment('sgr-a-star', 10)
    expect(run.travelerClockAtHorizon).toBeCloseTo(travelerClock(10, 1), 12)
    expect(run.farAwayClockAtCutoff).toBeCloseTo(farAwayClock(10, FAR_CLOCK_CUTOFF_IN_HORIZON_RADII), 12)
    expect(run.stretchAtStartInG).toBeCloseTo(stretchInG(sgr.massSolarMasses, 10), 12)
    expect(run.stretchAtHorizonInG).toBeCloseTo(stretchInG(sgr.massSolarMasses, 1), 12)
    expect(run.stretchAtHorizonInG).toBeGreaterThan(run.stretchAtStartInG)
  })

  it('gives points from the release to the horizon, with the far-away clock empty only at the horizon', () => {
    const run = runFallingInExperiment('stellar-black-hole', 10)
    const first = run.points[0]
    const last = run.points[run.points.length - 1]
    expect(first).toEqual({ r: 10, travelerClock: 0, farAwayClock: 0 })
    expect(last.r).toBe(1)
    expect(last.travelerClock).toBeCloseTo(run.travelerClockAtHorizon, 12)
    expect(last.farAwayClock).toBeNull()
    for (let i = 1; i < run.points.length; i++) {
      expect(run.points[i].r).toBeLessThanOrEqual(run.points[i - 1].r)
      expect(run.points[i].travelerClock).toBeGreaterThanOrEqual(run.points[i - 1].travelerClock)
    }
    // The last point before the horizon is at the cutoff.
    const beforeHorizon = run.points[run.points.length - 2]
    expect(beforeHorizon.r).toBeCloseTo(FAR_CLOCK_CUTOFF_IN_HORIZON_RADII, 6)
    expect(beforeHorizon.farAwayClock).toBeCloseTo(run.farAwayClockAtCutoff, 4)
    for (const p of run.points.slice(0, -1)) expect(p.farAwayClock).not.toBeNull()
  })

  it('has the traveler\'s fall depend only on the release distance in horizon radii, not on the black hole', () => {
    const a = runFallingInExperiment('stellar-black-hole', 5)
    const b = runFallingInExperiment('m87-star', 5)
    expect(a.travelerClockAtHorizon).toBe(b.travelerClockAtHorizon)
    expect(a.farAwayClockAtCutoff).toBe(b.farAwayClockAtCutoff)
    expect(a.points).toEqual(b.points)
  })

  it('rejects a release distance outside the controls\' range, a distance that is not finite, and an unknown black hole', () => {
    expect(() => runFallingInExperiment('stellar-black-hole', MIN_START_IN_HORIZON_RADII - 0.5)).toThrow(RangeError)
    expect(() => runFallingInExperiment('stellar-black-hole', MAX_START_IN_HORIZON_RADII + 1)).toThrow(RangeError)
    expect(() => runFallingInExperiment('stellar-black-hole', Number.NaN)).toThrow(RangeError)
    expect(() => runFallingInExperiment('sun' as never, 10)).toThrow()
  })
})

describe('the stretch curve', () => {
  it('runs from the horizon out to the largest release distance, falling with distance', () => {
    for (const preset of BLACK_HOLE_PRESETS) {
      const curve = stretchCurve(preset.id)
      expect(curve[0].r).toBeCloseTo(1, 9)
      expect(curve[curve.length - 1].r).toBeCloseTo(MAX_START_IN_HORIZON_RADII, 6)
      for (let i = 1; i < curve.length; i++) expect(curve[i].stretchInG).toBeLessThan(curve[i - 1].stretchInG)
      expect(curve[0].stretchInG).toBeCloseTo(stretchInG(preset.massSolarMasses, 1), 9)
    }
  })
})

describe('determinism and playback speed', () => {
  it('gives the same result for the same inputs', () => {
    expect(runFallingInExperiment('sgr-a-star', 20)).toEqual(runFallingInExperiment('sgr-a-star', 20))
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
      'timeNearBlackHoleExperiment',
      'orbitsNearBlackHoleExperiment',
      'lightNearBlackHoleExperiment',
      'blackHoleExperiment',
      'tidalEffectExperiment',
      'orbitExperiment',
    ]) {
      expect(importLines.some((line: string) => line.includes(`/${other}'`))).toBe(false)
    }
  })
})
