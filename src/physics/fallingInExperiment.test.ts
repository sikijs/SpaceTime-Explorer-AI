import { describe, expect, it } from 'vitest'
import { horizonRadiusKm } from './blackHoleSizeExperiment'
import source from './fallingInExperiment.ts?raw'
import {
  BLACK_HOLE_PRESETS,
  BODY_LENGTH_METERS,
  FAR_CLOCK_CUTOFF_IN_HORIZON_RADII,
  MAX_START_IN_HORIZON_RADII,
  MIN_START_IN_HORIZON_RADII,
  LN_10,
  MUCH_STRONGER_AT_LEAST_TIMES,
  NEAR_HORIZON_GAPS,
  PART_ONE_BLACK_HOLE_ID,
  PART_ONE_START_IN_HORIZON_RADII,
  SAME_WITHIN_PERCENT,
  SETTLES_BELOW_FRACTION,
  checkUpRows,
  endGuessIsModelAnswer,
  endGuessMarker,
  farAwayClock,
  farClockGuessIsModelAnswer,
  farClockGuessMarker,
  farClockIncreasesPerTenfoldGap,
  fallRow,
  massRatioSquared,
  modelEndAnswer,
  modelFarClockAnswer,
  modelStretchAnswer,
  nearHorizonReadings,
  partOneRow,
  percentAbove,
  readAgainst,
  readAgainstRounded,
  runFallingInExperiment,
  runPartOne,
  stretchFromGMInG,
  stretchGrowth,
  stretchGuessIsModelAnswer,
  stretchGuessMarker,
  stretchRatioBetweenHoles,
  threeHoleRows,
  travelerClockByIntegration as moduleClockByIntegration,
  stretchCurve,
  stretchInG,
  stretchInMetersPerSecondSquared,
  travelerClock,
  travelerClockSteps,
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

  it('gives the steps of the closed form for the Results\' worked example, and they agree with the clock', () => {
    const steps = travelerClockSteps(10)
    expect(steps.startPower).toBeCloseTo(31.6228, 4)
    expect(steps.cosEta).toBeCloseTo(-0.8, 12)
    expect(steps.etaRadians).toBeCloseTo(2.4981, 4)
    expect(steps.sinEta).toBeCloseTo(0.6, 12)
    expect(steps.clockAtHorizon).toBeCloseTo(48.985, 3)
    for (const r0 of [2, 5, 10, 20, 100]) {
      expect(travelerClockSteps(r0).clockAtHorizon).toBeCloseTo(travelerClock(r0, 1), 9)
    }
    expect(() => travelerClockSteps(1)).toThrow(RangeError)
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

  it('gives the stretch in meters per second squared that, divided by 9.80665, is the stretch in g', () => {
    for (const preset of BLACK_HOLE_PRESETS) {
      for (const r of [1, 3, 50]) {
        expect(stretchInMetersPerSecondSquared(preset.massSolarMasses, r) / 9.80665).toBeCloseTo(stretchInG(preset.massSolarMasses, r), 12)
      }
    }
    // 2GM h / r^3 for the 10-Sun black hole at its horizon, written out: about 2.06e8 m/s^2.
    const horizonMeters = horizonRadiusKm(10) * 1000
    expect(stretchInMetersPerSecondSquared(10, 1) / ((2 * G * 10 * SOLAR_MASS_KG * BODY_LENGTH_METERS) / horizonMeters ** 3)).toBeCloseTo(1, 2)
    expect(() => stretchInMetersPerSecondSquared(-1, 1)).toThrow(RangeError)
  })

  it('is eight times larger at half the distance, and proportional to the mass at the same kilometer distance', () => {
    expect(stretchInG(10, 2) / stretchInG(10, 4)).toBeCloseTo(8, 9)
    const km = 5000
    const at = (mass: number) => stretchInG(mass, km / horizonRadiusKm(mass))
    expect(at(40) / at(10)).toBeCloseTo(4, 9)
  })

  it('matches the specification\'s table at the horizon, to within 2%', () => {
    for (const [preset, expected] of [[stellar, 2.1e7], [sgr, 1.14e-4], [m87, 5.0e-11]] as const) {
      const ratio = stretchInG(preset.massSolarMasses, 1) / expected
      expect(ratio).toBeGreaterThan(0.98)
      expect(ratio).toBeLessThan(1.02)
    }
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
    expect(Math.abs(runFallingInExperiment('stellar-black-hole', 10).travelerSecondsAtHorizon / 4.8e-3 - 1)).toBeLessThan(0.01)
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

// ---------------------------------------------------------------------------------------------------------------
// Audit update (Black Holes 5)
// ---------------------------------------------------------------------------------------------------------------
const END_CHOICES = ['finite', 'never', 'depends'] as const
const FAR_CHOICES = ['same', 'settles', 'no-limit'] as const
const STRETCH_CHOICES = ['small', 'same', 'giant'] as const

describe('the fixed Part 1 fall', () => {
  it('is the 10-Sun black hole released from rest at 10 horizon radii', () => {
    const run = runPartOne()
    expect(run.preset.id).toBe(PART_ONE_BLACK_HOLE_ID)
    expect(run.preset.massSolarMasses).toBe(10)
    expect(run.startInHorizonRadii).toBe(10)
    expect(run.startInHorizonRadii).toBe(PART_ONE_START_IN_HORIZON_RADII)
  })

  it('matches the specification: 48.985 light-times, 4.8 thousandths of a second, far-away clock 64.4, 2.1e4 g and 2.1e7 g, 1 g at about 276 radii', () => {
    const run = runPartOne()
    expect(run.travelerClockAtHorizon).toBeCloseTo(48.985, 2)
    expect(run.travelerSecondsAtHorizon).toBeCloseTo(4.8e-3, 4)
    expect(run.farAwayClockAtCutoff).toBeCloseTo(64.4, 0)
    expect(run.stretchAtStartInG / 2.1e4).toBeCloseTo(1, 1)
    expect(run.stretchAtHorizonInG / 2.1e7).toBeCloseTo(1, 1)
    expect(run.stretchOneGRadiusInHorizonRadii as number).toBeCloseTo(276, -1)
  })

  it('is the same fall every time', () => {
    expect(runPartOne()).toEqual(runPartOne())
  })
})

describe('the readings near the horizon', () => {
  it('give the traveler\'s clock and the far-away clock at gaps of 0.01, 0.001 and 0.0001 (the specification\'s table)', () => {
    expect(NEAR_HORIZON_GAPS).toEqual([0.01, 0.001, 0.0001])
    const [a, b, c] = nearHorizonReadings(10)
    expect(a.travelerClock).toBeCloseTo(48.975, 2)
    expect(b.travelerClock).toBeCloseTo(48.984, 2)
    expect(c.travelerClock).toBeCloseTo(48.985, 2)
    expect(a.farAwayClock).toBeCloseTo(59.8, 0)
    expect(b.farAwayClock).toBeCloseTo(62.1, 0)
    expect(c.farAwayClock).toBeCloseTo(64.4, 0)
  })

  it('agree with the independent far-away integration, and each tenfold closing adds about ln 10', () => {
    for (const reading of nearHorizonReadings(10)) {
      expect(reading.farAwayClock / farAwayClockByRates(10, 1 + reading.gapInHorizonRadii)).toBeCloseTo(1, 2)
    }
    for (const increase of farClockIncreasesPerTenfoldGap(10)) expect(Math.abs(increase - Math.log(10))).toBeLessThan(0.02)
    expect(LN_10).toBe(Math.log(10))
  })
})

describe('guess 1: does the trip to the horizon come to an end on the traveler\'s own watch?', () => {
  it('has the model answer "finite": the traveler\'s clock is finite, and the same number of light-times, for every black hole', () => {
    expect(modelEndAnswer()).toBe('finite')
    expect(END_CHOICES.filter(endGuessIsModelAnswer)).toEqual(['finite'])
    const clocks = BLACK_HOLE_PRESETS.map((p) => runFallingInExperiment(p.id, 10).travelerClockAtHorizon)
    for (const c of clocks) expect(Number.isFinite(c)).toBe(true)
    expect(new Set(clocks.map((c) => c.toFixed(9))).size).toBe(1)
    const seconds = BLACK_HOLE_PRESETS.map((p) => runFallingInExperiment(p.id, 10).travelerSecondsAtHorizon)
    expect(seconds[0]).toBeLessThan(seconds[1])
    expect(seconds[1]).toBeLessThan(seconds[2])
  })

  it('marks each answer with a different shape and place, and none is a size', () => {
    expect(endGuessMarker('finite')).toEqual({ kind: 'at-horizon' })
    expect(endGuessMarker('never')).toEqual({ kind: 'past-right-edge' })
    expect(endGuessMarker('depends')).toEqual({ kind: 'beside-horizon' })
  })
})

describe('guess 2: what does the far-away clock read as the traveler nears the horizon?', () => {
  it('has the model answer "later and later, without limit"', () => {
    expect(modelFarClockAnswer()).toBe('no-limit')
    expect(FAR_CHOICES.filter(farClockGuessIsModelAnswer)).toEqual(['no-limit'])
  })

  it('does not depend on the page\'s marking limits: the far-away clock is 32% above the traveler\'s and the last increase is 99% of the one before', () => {
    const last = nearHorizonReadings(10)[2]
    expect(percentAbove(last.farAwayClock, last.travelerClock)).toBeGreaterThan(10 * SAME_WITHIN_PERCENT)
    const [first, second] = farClockIncreasesPerTenfoldGap(10)
    expect(second / first).toBeGreaterThan(SETTLES_BELOW_FRACTION + 0.4)
  })

  it('is the same answer for every release distance the controls allow', () => {
    for (const start of [2, 5, 20, 100]) expect(modelFarClockAnswer(start)).toBe('no-limit')
  })

  it('marks "without limit" at the orange curve\'s end and the other two in the gap between the curves', () => {
    expect(farClockGuessMarker('no-limit')).toEqual({ kind: 'orange-end' })
    expect(farClockGuessMarker('same')).toEqual({ kind: 'between-curves' })
    expect(farClockGuessMarker('settles')).toEqual({ kind: 'between-curves' })
  })
})

describe('guess 3: the stretch at the horizon, the 10-Sun black hole against Sagittarius A*', () => {
  it('has the model answer "much stronger at the small black hole", by 1.8e11 times', () => {
    expect(modelStretchAnswer()).toBe('small')
    expect(STRETCH_CHOICES.filter(stretchGuessIsModelAnswer)).toEqual(['small'])
    expect(stretchRatioBetweenHoles() / 1.849e11).toBeCloseTo(1, 2)
    expect(stretchRatioBetweenHoles()).toBeGreaterThan(MUCH_STRONGER_AT_LEAST_TIMES * 1e9)
  })

  it('agrees with the ratio of the stretch from G and M written separately (the ratio of masses squared)', () => {
    const ratioFromScratch = stretchInGFromScratch(10, horizonRadiusKm(10)) / stretchInGFromScratch(sgr.massSolarMasses, horizonRadiusKm(sgr.massSolarMasses))
    expect(stretchRatioBetweenHoles() / ratioFromScratch).toBeCloseTo(1, 3)
    expect(stretchRatioBetweenHoles() / massRatioSquared()).toBeCloseTo(1, 9)
    expect(massRatioSquared()).toBeCloseTo((sgr.massSolarMasses / 10) ** 2, 3)
  })

  it('points to the 10-Sun curve, to Sagittarius A*\'s, or joins both', () => {
    expect(stretchGuessMarker('small')).toEqual({ target: 'stellar', presetId: 'stellar-black-hole' })
    expect(stretchGuessMarker('giant')).toEqual({ target: 'sgr', presetId: 'sgr-a-star' })
    expect(stretchGuessMarker('same')).toEqual({ target: 'both' })
  })
})

describe('comparisons moved out of the interface', () => {
  it('stretchGrowth is the release distance cubed (10 radii: 1,000 times)', () => {
    expect(stretchGrowth(runPartOne())).toBeCloseTo(1000, 6)
    expect(stretchGrowth(runFallingInExperiment('sgr-a-star', 5))).toBeCloseTo(125, 6)
  })

  it('travelerClockByIntegration is the separate route and agrees with the closed form', () => {
    for (const [r0, r] of [[10, 1], [10, 5], [20, 3], [100, 1], [2, 1]]) {
      expect(moduleClockByIntegration(r0, r) / travelerClock(r0, r)).toBeCloseTo(1, 4)
      expect(moduleClockByIntegration(r0, r) / travelerClockByIntegration(r0, r)).toBeCloseTo(1, 9)
    }
  })

  it('stretchFromGMInG is the G and M form and agrees with the page\'s c-squared form to three figures', () => {
    for (const m of [10, sgr.massSolarMasses, m87.massSolarMasses]) {
      const scratch = stretchInGFromScratch(m, horizonRadiusKm(m))
      expect(stretchFromGMInG(m, 1) / scratch).toBeCloseTo(1, 9)
      expect(stretchInG(m, 1) / scratch).toBeCloseTo(1, 2)
    }
  })
})

describe('the check-up', () => {
  it('reads one number against another with no cut-offs', () => {
    expect(readAgainst(1, 1)).toBe('the same')
    expect(readAgainst(1.0001, 1)).toBe('more')
    expect(readAgainst(0.9, 1)).toBe('less')
    expect(readAgainstRounded(48.98512, 48.98513, 5)).toBe('the same')
    expect(readAgainstRounded(2.304, 2.3026, 3)).toBe('the same')
    expect(readAgainstRounded(2.35, 2.3026, 3)).toBe('more')
    expect(percentAbove(110, 100)).toBeCloseTo(10, 12)
  })

  it('has four rows: the traveler\'s clock the same; the far-away increase a hair above ln 10; the stretch the same; the ratio the same', () => {
    const [clock, far, stretch, ratio] = checkUpRows()
    expect(clock.reading).toBe('the same')
    expect(clock.expected).toBeCloseTo(48.985, 2)
    expect(far.expected).toBe(Math.log(10))
    expect(far.found).toBeCloseTo(2.304, 2)
    expect(far.reading).toBe('more')
    expect(far.percentAbove).toBeGreaterThan(0)
    expect(far.percentAbove).toBeLessThan(1)
    expect(stretch.reading).toBe('the same')
    expect(ratio.reading).toBe('the same')
    for (const row of checkUpRows()) {
      expect(Number.isFinite(row.expected)).toBe(true)
      expect(Number.isFinite(row.found)).toBe(true)
    }
  })
})

describe('the tables', () => {
  it('Table 2 is the Part 1 fall', () => {
    const row = partOneRow()
    expect(row.presetId).toBe('stellar-black-hole')
    expect(row.startKm).toBeCloseTo(10 * horizonRadiusKm(10), 6)
    expect(row.clockAtHorizonLightTimes).toBeCloseTo(48.985, 2)
    expect(row.oneGRadiusInHorizonRadii as number).toBeCloseTo(276, -1)
    expect(fallRow(runFallingInExperiment('m87-star', 20)).oneGRadiusInHorizonRadii).toBeNull()
  })

  it('Table 4 gives 4.8 thousandths of a second, 34.6 minutes and 36.3 days, and the stretch at each horizon', () => {
    const [a, b, c] = threeHoleRows()
    expect(a.tripSeconds).toBeCloseTo(4.83e-3, 4)
    expect(b.tripSeconds / 60).toBeCloseTo(34.6, 1)
    expect(c.tripSeconds / 86400).toBeCloseTo(36.3, 1)
    expect(a.stretchAtHorizonInG / 2.1e7).toBeCloseTo(1, 1)
    expect(b.stretchAtHorizonInG / 1.14e-4).toBeCloseTo(1, 1)
    expect(c.stretchAtHorizonInG / 5.0e-11).toBeCloseTo(1, 1)
    expect(threeHoleRows(20).map((r) => r.tripSeconds)[0]).toBeGreaterThan(a.tripSeconds)
  })
})

describe('the existing exports are unchanged', () => {
  it('keeps the first build\'s values and still imports only horizonRadiusKm, OBJECT_PRESETS and the speed of light', () => {
    expect(travelerClock(10, 1)).toBeCloseTo(48.985, 2)
    expect(stretchInG(10, 1) / 2.1e7).toBeCloseTo(1, 1)
    expect(MIN_START_IN_HORIZON_RADII).toBe(2)
    expect(MAX_START_IN_HORIZON_RADII).toBe(100)
    const importLines = source.split('\n').filter((line: string) => line.trim().startsWith('import'))
    expect(importLines).toHaveLength(3)
  })
})
