import { describe, expect, it } from 'vitest'
import { horizonRadiusKm } from './blackHoleSizeExperiment'
import source from './lightNearBlackHoleExperiment.ts?raw'
import {
  BLACK_HOLE_PRESETS,
  CRITICAL_AIM_IN_HORIZON_RADII,
  MAX_AIM_IN_HORIZON_RADII,
  MIN_AIM_IN_HORIZON_RADII,
  PHOTON_SPHERE_IN_HORIZON_RADII,
  ANSWER_CHECK_AIMS,
  BARELY_CHANGED_BELOW_DEGREES,
  GRAPH_MAX_DEGREES,
  KM_PER_AU,
  PART_ONE_BLACK_HOLE_ID,
  SWING_ROUND_ABOVE_DEGREES,
  answerCheckPaths,
  bendCurve,
  bendDegrees,
  bendGuessGraphMarker,
  bendGuessIsModelAnswer,
  captureGuessIsModelAnswer,
  captureGuessIsOffView,
  checkUpRows,
  criticalAimRows,
  criticalAimWorked,
  guessedCaptureAimInHorizonRadii,
  justOutsideGuessGraphMarker,
  justOutsideGuessIsModelAnswer,
  largerThanSimple,
  lightPath,
  modelBendAnswer,
  modelCaptureAnswer,
  modelCaptureBoundaryInHorizonRadii,
  modelJustOutsideAnswer,
  partOneRows,
  percentAbove,
  readAgainst,
  readAgainstRounded,
  runLightNearBlackHoleExperiment,
  runPartOne,
  viewRadiusInHorizonRadii,
  weakFieldBendDegrees,
  weakFieldBendRadians,
  weakFieldWorked,
} from './lightNearBlackHoleExperiment'
import type { BendChoice, CaptureChoice, JustOutsideChoice } from './lightNearBlackHoleExperiment'

const toDegrees = (radians: number) => (radians * 180) / Math.PI

// ---- an independent description of the exact theory, in horizon radii (r_s = 1) ----
// The light's effective potential for radial motion, V(r) = (1 - 1/r) / r^2, and the first integral of the path,
// (du/dphi)^2 + u^2 (1 - u) = 1 / b^2. These are a different route from the module's equation for u(phi).
const V = (r: number) => (1 - 1 / r) / (r * r)
const firstDerivative = (f: (r: number) => number, r: number, h = 1e-4) => (f(r + h) - f(r - h)) / (2 * h)
const secondDerivative = (f: (r: number) => number, r: number, h = 1e-3) => (f(r + h) - 2 * f(r) + f(r - h)) / (h * h)

// The closest approach from the turning point of the first integral: the smaller root of u^2 (1 - u) = 1 / b^2.
function closestFromFirstIntegral(aim: number): number {
  let low = 0
  let high = 2 / 3
  for (let i = 0; i < 80; i++) {
    const middle = (low + high) / 2
    if (middle * middle * (1 - middle) < 1 / (aim * aim)) low = middle
    else high = middle
  }
  return 1 / low
}

describe('the simple formula of Gravity Experiment 8', () => {
  it('equals 2 / aim at several aims', () => {
    for (const b of [1, 2.5, 5, 20, 100]) expect(weakFieldBendRadians(b)).toBeCloseTo(2 / b, 12)
  })

  it('rejects an aim at or below zero or not finite', () => {
    expect(() => weakFieldBendRadians(0)).toThrow(RangeError)
    expect(() => weakFieldBendRadians(-1)).toThrow(RangeError)
    expect(() => weakFieldBendRadians(Number.NaN)).toThrow(RangeError)
    expect(() => weakFieldBendRadians(Infinity)).toThrow(RangeError)
  })
})

describe('the two given numbers', () => {
  it('has the critical aim equal 3 sqrt(3) / 2 and the photon sphere equal 1.5', () => {
    expect(CRITICAL_AIM_IN_HORIZON_RADII).toBeCloseTo(2.598076211, 8)
    expect(PHOTON_SPHERE_IN_HORIZON_RADII).toBe(1.5)
  })
})

describe('the circular light orbit, found independently', () => {
  it('is at 1.5 horizon radii, where the effective potential has its maximum (so it is unstable)', () => {
    expect(Math.abs(firstDerivative(V, PHOTON_SPHERE_IN_HORIZON_RADII))).toBeLessThan(1e-6)
    expect(secondDerivative(V, PHOTON_SPHERE_IN_HORIZON_RADII)).toBeLessThan(0)
    // It is the only turning point of V outside the horizon: V rises from 0 at the horizon to this peak, then falls.
    expect(V(1.4)).toBeLessThan(V(1.5))
    expect(V(1.6)).toBeLessThan(V(1.5))
    expect(V(3)).toBeLessThan(V(1.6))
  })

  it('makes the module equation u\'\' = -u + 1.5 u^2 vanish at u = 2/3', () => {
    const u = 1 / PHOTON_SPHERE_IN_HORIZON_RADII
    expect(-u + 1.5 * u * u).toBeCloseTo(0, 12)
  })
})

describe('the critical aim distance, found independently', () => {
  it('equals the value that makes 1 / b^2 the potential maximum: V(1.5) = 4/27, so b = 3 sqrt(3) / 2', () => {
    expect(V(PHOTON_SPHERE_IN_HORIZON_RADII)).toBeCloseTo(4 / 27, 12)
    expect(1 / Math.sqrt(V(PHOTON_SPHERE_IN_HORIZON_RADII))).toBeCloseTo(CRITICAL_AIM_IN_HORIZON_RADII, 10)
  })

  it('has the integrated light captured inside it and escaping outside it', () => {
    for (const aim of [1, 1.5, 2, 2.55, 2.58, 2.59]) expect(lightPath(aim).outcome).toBe('captured')
    for (const aim of [2.61, 2.65, 3, 5, 20]) expect(lightPath(aim).outcome).toBe('escapes')
  })

  it('has a captured path end at the horizon and report no bend', () => {
    for (const aim of [1, 2, 2.59]) {
      const path = lightPath(aim)
      expect(path.bendRadians).toBeNull()
      expect(path.closestInHorizonRadii).toBe(1)
      const last = path.points[path.points.length - 1]
      expect(last.distanceInHorizonRadii).toBeCloseTo(1, 12)
    }
  })

  it('has an escaping path end far away', () => {
    for (const aim of [2.61, 5, 20]) {
      const path = lightPath(aim)
      const last = path.points[path.points.length - 1]
      expect(last.distanceInHorizonRadii).toBeGreaterThan(100)
    }
  })
})

describe('how much the light is bent', () => {
  const exactDegrees = (aim: number) => toDegrees(lightPath(aim).bendRadians as number)

  it('approaches the simple formula far away: within 2% at an aim of 100', () => {
    const ratio = (lightPath(100).bendRadians as number) / weakFieldBendRadians(100)
    expect(Math.abs(ratio - 1)).toBeLessThan(0.02)
  })

  it('is larger than the simple formula at every aim from 100 down to 2.62', () => {
    for (const aim of [100, 50, 20, 10, 5, 3.5, 3, 2.7, 2.62]) {
      expect(lightPath(aim).bendRadians as number).toBeGreaterThan(weakFieldBendRadians(aim))
    }
  })

  it('grows as the aim shrinks, without bound near the critical aim', () => {
    const aims = [20, 10, 5, 3.5, 3, 2.7, 2.65, 2.62, 2.61, 2.6]
    for (let i = 1; i < aims.length; i++) {
      expect(lightPath(aims[i]).bendRadians as number).toBeGreaterThan(lightPath(aims[i - 1]).bendRadians as number)
    }
    expect(lightPath(2.6).bendRadians as number).toBeGreaterThan(2 * Math.PI)
    expect(lightPath(2.5981).bendRadians as number).toBeGreaterThan(lightPath(2.6).bendRadians as number)
  })

  it('matches the specification\'s table to within 0.5 degrees', () => {
    const table: Array<[number, number]> = [
      [20, 6.19],
      [10, 13.53],
      [5, 33.83],
      [3, 98.51],
      [2.7, 167.27],
      [2.6, 390.21],
    ]
    for (const [aim, degrees] of table) expect(Math.abs(exactDegrees(aim) - degrees)).toBeLessThan(0.5)
  })

  it('has the simple formula about 8% low at 20 horizon radii (the most distant aim the controls allow)', () => {
    const ratio = weakFieldBendRadians(20) / (lightPath(20).bendRadians as number)
    expect(ratio).toBeGreaterThan(0.9)
    expect(ratio).toBeLessThan(0.94)
  })
})

describe('the closest approach', () => {
  it('is smaller than the aim at every aim that escapes (the light is bent inward on its way in)', () => {
    for (const aim of [20, 10, 5, 3, 2.7, 2.6]) {
      expect(lightPath(aim).closestInHorizonRadii).toBeLessThan(aim)
    }
  })

  it('agrees with the turning point of the first integral', () => {
    for (const aim of [20, 5, 3, 2.7, 2.6]) {
      const expected = closestFromFirstIntegral(aim)
      expect(Math.abs(lightPath(aim).closestInHorizonRadii - expected) / expected).toBeLessThan(1e-4)
    }
  })

  it('approaches 1.5 horizon radii from above as the aim approaches the critical aim', () => {
    const closest = [3, 2.7, 2.62, 2.6, 2.5981].map((aim) => lightPath(aim).closestInHorizonRadii)
    for (let i = 1; i < closest.length; i++) expect(closest[i]).toBeLessThan(closest[i - 1])
    for (const c of closest) expect(c).toBeGreaterThan(PHOTON_SPHERE_IN_HORIZON_RADII)
    expect(closest[3]).toBeGreaterThan(1.52)
    expect(closest[3]).toBeLessThan(1.55)
  })
})

describe('conservation', () => {
  const drift = (point: { distanceInHorizonRadii: number; duDphi: number }, aim: number) => {
    const u = 1 / point.distanceInHorizonRadii
    const target = 1 / (aim * aim)
    return Math.abs(point.duDphi ** 2 + u * u * (1 - u) - target) / target
  }

  it('keeps (du/dphi)^2 + u^2 (1 - u) = 1 / b^2 at every integrated step, escaping or captured', () => {
    for (const aim of [20, 5, 2.7, 2.6, 2.5, 1.5]) {
      const path = lightPath(aim)
      // A captured path's last point is interpolated to the horizon within one step; it is checked separately below.
      const steps = path.outcome === 'captured' ? path.points.slice(0, -1) : path.points
      for (const point of steps) expect(drift(point, aim)).toBeLessThan(1e-8)
    }
  })

  it('keeps it to within 1e-4 at the interpolated end point of a captured path', () => {
    for (const aim of [2.5, 2, 1.5, 1]) {
      const path = lightPath(aim)
      expect(drift(path.points[path.points.length - 1], aim)).toBeLessThan(1e-4)
    }
  })
})

describe('the experiment as run', () => {
  it('depends only on the aim in horizon radii, not on the black hole; the kilometers scale with the mass', () => {
    const results = BLACK_HOLE_PRESETS.map((p) => runLightNearBlackHoleExperiment(p.id, 3))
    for (const r of results) {
      expect(r.path.bendRadians).toBe(results[0].path.bendRadians)
      expect(r.criticalAimKm).toBeCloseTo(CRITICAL_AIM_IN_HORIZON_RADII * horizonRadiusKm(r.preset.massSolarMasses), 6)
      expect(r.photonSphereKm).toBeCloseTo(1.5 * r.horizonRadiusKm, 6)
      expect(r.aimKm).toBeCloseTo(3 * r.horizonRadiusKm, 6)
    }
    expect(results[2].criticalAimKm / results[0].criticalAimKm).toBeCloseTo(
      BLACK_HOLE_PRESETS[2].massSolarMasses / BLACK_HOLE_PRESETS[0].massSolarMasses,
      6,
    )
  })

  it('gives critical aim distances of about 77 km, 33 million km and 50 billion km for the three black holes', () => {
    const [stellar, sgr, m87] = BLACK_HOLE_PRESETS.map((p) => runLightNearBlackHoleExperiment(p.id, 3).criticalAimKm)
    expect(stellar).toBeGreaterThan(76)
    expect(stellar).toBeLessThan(77.5)
    expect(sgr / 1e6).toBeGreaterThan(32)
    expect(sgr / 1e6).toBeLessThan(34)
    expect(m87 / 1e9).toBeGreaterThan(49)
    expect(m87 / 1e9).toBeLessThan(51)
  })

  it('reports the simple formula beside the exact result', () => {
    const result = runLightNearBlackHoleExperiment('stellar-black-hole', 5)
    expect(result.weakFieldBendRadians).toBeCloseTo(0.4, 12)
    expect(result.path.outcome).toBe('escapes')
  })

  it('sweeps half a turn plus the bend, so a beam bent by more than 180 degrees swings right round', () => {
    for (const aim of [20, 5, 3, 2.7, 2.6]) {
      const path = lightPath(aim)
      expect(path.turnsAround).toBeCloseTo(0.5 + (path.bendRadians as number) / (2 * Math.PI), 10)
    }
    expect(toDegrees(lightPath(2.7).bendRadians as number)).toBeLessThan(180)
    expect(toDegrees(lightPath(2.62).bendRadians as number)).toBeGreaterThan(180)
    expect(toDegrees(lightPath(2.6).bendRadians as number)).toBeGreaterThan(360)
  })

  it('rejects an aim outside the controls\' range and an unknown black hole', () => {
    expect(() => runLightNearBlackHoleExperiment('stellar-black-hole', 0.99)).toThrow(RangeError)
    expect(() => runLightNearBlackHoleExperiment('stellar-black-hole', 20.01)).toThrow(RangeError)
    expect(() => runLightNearBlackHoleExperiment('stellar-black-hole', Number.NaN)).toThrow(RangeError)
    expect(() => runLightNearBlackHoleExperiment('not-a-black-hole' as never, 5)).toThrow()
    expect(MIN_AIM_IN_HORIZON_RADII).toBe(1)
    expect(MAX_AIM_IN_HORIZON_RADII).toBe(20)
  })

  it('rejects an aim at or below zero or not finite when computing a path', () => {
    expect(() => lightPath(0)).toThrow(RangeError)
    expect(() => lightPath(-3)).toThrow(RangeError)
    expect(() => lightPath(Number.NaN)).toThrow(RangeError)
  })
})

describe('the graph\'s curve', () => {
  it('runs from just above the critical aim to the largest aim, rising as the aim falls', () => {
    const curve = bendCurve()
    expect(curve[0].aim).toBeCloseTo(MAX_AIM_IN_HORIZON_RADII, 6)
    expect(curve[curve.length - 1].aim).toBeGreaterThan(CRITICAL_AIM_IN_HORIZON_RADII)
    expect(curve[curve.length - 1].aim - CRITICAL_AIM_IN_HORIZON_RADII).toBeLessThan(0.001)
    for (let i = 1; i < curve.length; i++) {
      expect(curve[i].aim).toBeLessThan(curve[i - 1].aim)
      expect(curve[i].bendRadians).toBeGreaterThan(curve[i - 1].bendRadians)
    }
  })

  it('agrees with a direct path calculation', () => {
    const curve = bendCurve()
    const point = curve[Math.floor(curve.length / 2)]
    expect(point.bendRadians).toBeCloseTo(lightPath(point.aim).bendRadians as number, 12)
  })
})

describe('determinism and playback speed', () => {
  it('gives the same path for the same inputs', () => {
    const a = lightPath(2.7)
    const b = lightPath(2.7)
    expect(a.bendRadians).toBe(b.bendRadians)
    expect(a.points.length).toBe(b.points.length)
  })

  it('uses no wall-clock time or randomness, so playback speed cannot change a result (CLAUDE.md §11)', () => {
    expect(source).not.toMatch(/performance\.|Date\.|Math\.random|setTimeout|requestAnimationFrame/)
  })
})

describe('reuse (CLAUDE.md §8)', () => {
  it('imports from blackHoleSizeExperiment and from none of the other experiments\' modules', () => {
    const importLines = source.split('\n').filter((line: string) => line.trim().startsWith('import'))
    const from = (name: string) => importLines.filter((line: string) => line.includes(name)).join(' ')
    expect(from('blackHoleSizeExperiment')).toContain('horizonRadiusKm')
    expect(from('blackHoleSizeExperiment')).toContain('OBJECT_PRESETS')
    for (const other of ['lightBendingExperiment', 'orbitsNearBlackHoleExperiment', 'blackHoleExperiment', 'orbitExperiment']) {
      expect(importLines.some((line: string) => line.includes(`/${other}'`))).toBe(false)
    }
  })
})

// ---------------------------------------------------------------------------------------------------------------
// Audit update (Black Holes 4)
// ---------------------------------------------------------------------------------------------------------------
const BEND_CHOICES: BendChoice[] = ['straight', 'bent', 'captured']
const CAPTURE_CHOICES: CaptureChoice[] = ['horizon', 'critical', 'ten']
const JUST_OUTSIDE_CHOICES: JustOutsideChoice[] = ['small-bend', 'swings', 'captured-anyway']

describe('the fixed Part 1 run', () => {
  it('runs the 10-Sun black hole with a beam at 5 and a beam at 2.6 horizon radii', () => {
    const run = runPartOne()
    expect(run.five.preset.id).toBe(PART_ONE_BLACK_HOLE_ID)
    expect(run.five.preset.massSolarMasses).toBe(10)
    expect(run.five.aimInHorizonRadii).toBe(5)
    expect(run.justOutside.aimInHorizonRadii).toBe(2.6)
    expect(run.five.aimKm).toBeCloseTo(5 * horizonRadiusKm(10), 9)
    expect(run.justOutside.aimKm).toBeCloseTo(2.6 * horizonRadiusKm(10), 9)
  })

  it('matches the specification table: 33.8 degrees at 5 (escapes); 390 degrees at 2.6, more than a full turn', () => {
    const run = runPartOne()
    expect(run.five.path.outcome).toBe('escapes')
    expect(toDegrees(run.five.path.bendRadians as number)).toBeCloseTo(33.8, 0)
    expect(run.five.path.closestInHorizonRadii).toBeCloseTo(4.39, 1)
    expect(run.justOutside.path.outcome).toBe('escapes')
    expect(toDegrees(run.justOutside.path.bendRadians as number)).toBeCloseTo(390, -1)
    expect(run.justOutside.path.closestInHorizonRadii).toBeCloseTo(1.53, 1)
  })

  it('is the same run every time (nothing reads a guess or the clock)', () => {
    expect(runPartOne().five.path.bendRadians).toBe(runPartOne().five.path.bendRadians)
  })
})

describe('the picture views', () => {
  it('reaches 6.25 radii for an aim of 5 and 4 for an aim of 2.6, and 1.25 times the aim from 3.2 upward', () => {
    expect(viewRadiusInHorizonRadii(5)).toBeCloseTo(6.25, 12)
    expect(viewRadiusInHorizonRadii(2.6)).toBe(4)
    expect(viewRadiusInHorizonRadii(20)).toBeCloseTo(25, 12)
  })
})

describe('guess 1: a beam aimed at 5 horizon radii', () => {
  it('has the model answer "bent" (the bend is far above any reading of "barely changed")', () => {
    expect(modelBendAnswer()).toBe('bent')
    expect(bendGuessIsModelAnswer('bent')).toBe(true)
    expect(bendGuessIsModelAnswer('straight')).toBe(false)
    expect(bendGuessIsModelAnswer('captured')).toBe(false)
  })

  it('gives the same answer for any "barely changed" limit from 1 to 30 degrees, so the marking choice does not decide it', () => {
    const bend = toDegrees(lightPath(5).bendRadians as number)
    expect(bend).toBeGreaterThan(30)
    expect(BARELY_CHANGED_BELOW_DEGREES).toBeLessThanOrEqual(30)
  })

  it('draws "straight" lowest, "bent" above it, and "captured" in the rose area with no height', () => {
    const straight = bendGuessGraphMarker('straight')
    const bent = bendGuessGraphMarker('bent')
    const captured = bendGuessGraphMarker('captured')
    expect(straight.aimInHorizonRadii).toBe(5)
    expect(straight.markerDegrees as number).toBeLessThan(bent.markerDegrees as number)
    expect(captured.band).toBeNull()
    expect(captured.markerDegrees).toBeNull()
  })

  it('puts the real bend inside the band of the model answer and outside the others', () => {
    const real = toDegrees(lightPath(5).bendRadians as number)
    const inBand = (c: BendChoice) => {
      const b = bendGuessGraphMarker(c).band
      return b !== null && real >= b.fromDegrees && real <= b.toDegrees
    }
    expect(inBand('bent')).toBe(true)
    expect(inBand('straight')).toBe(false)
    expect(inBand('captured')).toBe(false)
  })
})

describe('guess 2: how close light must be aimed to be captured', () => {
  it('names 1, 2.6 and 10 horizon radii', () => {
    expect(CAPTURE_CHOICES.map(guessedCaptureAimInHorizonRadii)).toEqual([1, 2.6, 10])
  })

  it('has the model answer "about 2.6": the named distance nearest to 3 sqrt(3) / 2, written separately here', () => {
    const critical = (3 * Math.sqrt(3)) / 2
    const nearest = CAPTURE_CHOICES.reduce((a, b) =>
      Math.abs(guessedCaptureAimInHorizonRadii(a) - critical) < Math.abs(guessedCaptureAimInHorizonRadii(b) - critical) ? a : b,
    )
    expect(nearest).toBe('critical')
    expect(modelCaptureAnswer()).toBe('critical')
    expect(CAPTURE_CHOICES.filter(captureGuessIsModelAnswer)).toEqual(['critical'])
  })

  it('says a ring at 10 is off the Part 1 pictures (they reach 6.25 and 4) but a ring at 1 or 2.6 is on them', () => {
    for (const view of [viewRadiusInHorizonRadii(5), viewRadiusInHorizonRadii(2.6)]) {
      expect(captureGuessIsOffView('ten', view)).toBe(true)
      expect(captureGuessIsOffView('horizon', view)).toBe(false)
      expect(captureGuessIsOffView('critical', view)).toBe(false)
    }
  })

  it('agrees with the integrated paths: captured at 2.5 and 2, escapes at 2.7 and 10, so the boundary lies between 2 and 2.7 and nowhere near 1 or 10', () => {
    const checks = answerCheckPaths()
    expect(checks.insideCritical.outcome).toBe('captured')
    expect(checks.two.outcome).toBe('captured')
    expect(checks.outsideCritical.outcome).toBe('escapes')
    expect(checks.ten.outcome).toBe('escapes')
  })
})

describe('guess 3: aimed only a little farther out than the capture distance', () => {
  it('has the model answer "swings" (escapes, turned by more than 180 degrees)', () => {
    expect(modelJustOutsideAnswer()).toBe('swings')
    expect(JUST_OUTSIDE_CHOICES.filter(justOutsideGuessIsModelAnswer)).toEqual(['swings'])
    expect(toDegrees(lightPath(2.6).bendRadians as number)).toBeGreaterThan(SWING_ROUND_ABOVE_DEGREES)
  })

  it('draws "small bend" under 180 degrees, "swings" above it and within the axis, and "captured anyway" in the rose area', () => {
    const small = justOutsideGuessGraphMarker('small-bend')
    const swings = justOutsideGuessGraphMarker('swings')
    const captured = justOutsideGuessGraphMarker('captured-anyway')
    expect(small.aimInHorizonRadii).toBe(2.6)
    expect(small.markerDegrees as number).toBeLessThan(180)
    expect(swings.markerDegrees as number).toBeGreaterThan(180)
    expect(swings.markerDegrees as number).toBeLessThanOrEqual(GRAPH_MAX_DEGREES)
    expect(captured.band).toBeNull()
  })

  it('puts the real bend at 2.6 (390 degrees) inside the "swings" band, which the graph (to 400) can show', () => {
    const real = toDegrees(lightPath(2.6).bendRadians as number)
    const band = justOutsideGuessGraphMarker('swings').band!
    expect(real).toBeGreaterThanOrEqual(band.fromDegrees)
    expect(real).toBeLessThanOrEqual(band.toDegrees)
  })
})

describe('guess functions only describe or mark a guess', () => {
  it('give the same answers however often they are called, and every choice is accepted', () => {
    for (const c of BEND_CHOICES) expect(bendGuessIsModelAnswer(c)).toBe(bendGuessIsModelAnswer(c))
    for (const c of JUST_OUTSIDE_CHOICES) expect(justOutsideGuessIsModelAnswer(c)).toBe(justOutsideGuessIsModelAnswer(c))
    expect(BEND_CHOICES.filter(bendGuessIsModelAnswer)).toHaveLength(1)
  })
})

describe('comparisons moved out of the interface', () => {
  it('bendDegrees and weakFieldBendDegrees convert radians to degrees; a captured path has no bend', () => {
    expect(bendDegrees(lightPath(5))).toBeCloseTo(toDegrees(lightPath(5).bendRadians as number), 12)
    expect(bendDegrees(lightPath(2.5))).toBeNull()
    expect(weakFieldBendDegrees(20)).toBeCloseTo((2 / 20) * (180 / Math.PI), 12)
  })

  it('largerThanSimple gives a percent below twice as large and a multiple from twice upward', () => {
    expect(largerThanSimple(1.5, 1)).toEqual({ kind: 'percent', value: 50 })
    expect(largerThanSimple(2, 1)).toEqual({ kind: 'times', value: 2 })
    const near = runPartOne().justOutside
    const larger = largerThanSimple(near.path.bendRadians as number, near.weakFieldBendRadians)
    expect(larger.kind).toBe('times')
    expect(larger.value).toBeCloseTo(390 / 44.1, 0) // 8.85 times as large (specification, final review)
    const twenty = largerThanSimple(lightPath(20).bendRadians as number, weakFieldBendRadians(20))
    expect(twenty.kind).toBe('percent')
    expect(twenty.value).toBeCloseTo(8.1, 0) // the exact bend is 8.1% larger at 20 (specification, Results step)
  })

  it('answerCheckPaths uses the aims the sentences name', () => {
    expect(ANSWER_CHECK_AIMS).toEqual({ five: 5, ten: 10, two: 2, insideCritical: 2.5, outsideCritical: 2.7, justOutside: 2.6 })
    expect(answerCheckPaths().five.bendRadians).toBe(lightPath(5).bendRadians)
  })
})

describe('the worked math, from the module', () => {
  it('gives sqrt 3 = 1.732, 3 sqrt 3 = 5.196 and 5.196 / 2 = 2.598', () => {
    const w = criticalAimWorked()
    expect(w.sqrt3).toBeCloseTo(1.732, 3)
    expect(w.threeSqrt3).toBeCloseTo(5.196, 3)
    expect(w.criticalInHorizonRadii).toBeCloseTo(2.598, 3)
    expect(w.criticalInHorizonRadii).toBe(CRITICAL_AIM_IN_HORIZON_RADII)
  })

  it('works the simple formula at 20: 2 / 20 = 0.1 radian, times 57.3 = 5.7 degrees', () => {
    const w = weakFieldWorked(20)
    expect(w.radians).toBeCloseTo(0.1, 12)
    expect(w.degreesPerRadian).toBeCloseTo(57.3, 1)
    expect(w.degrees).toBeCloseTo(5.73, 2)
  })
})

describe('Tables 2 and 4', () => {
  it('Table 2 has the two Part 1 beams with bend, simple formula, comparison, turns and closest approach', () => {
    const [five, near] = partOneRows()
    expect(five.aimInHorizonRadii).toBe(5)
    expect(five.bendDegrees).toBeCloseTo(33.8, 0)
    expect(five.simpleDegrees).toBeCloseTo(22.9, 1)
    expect(five.larger?.kind).toBe('percent')
    expect(near.aimInHorizonRadii).toBe(2.6)
    expect(near.simpleDegrees).toBeCloseTo(44.1, 1)
    // half a turn plus the bend, in turns: (180 + 390) / 360 = 1.58 (specification, final review)
    expect(near.turnsAround).toBeCloseTo(1.58, 1)
    expect(near.turnsAround).toBeCloseTo((Math.PI + (near.bendDegrees as number) / (180 / Math.PI)) / (2 * Math.PI), 6)
  })

  it('Table 4 gives 76.7 km, about 33 million km (0.22 AU) and about 50 billion km (330 AU) for the three black holes', () => {
    const rows = criticalAimRows()
    expect(rows).toHaveLength(3)
    expect(rows[0].criticalAimKm).toBeCloseTo(76.7, 0)
    expect(rows[1].criticalAimKm / 1e6).toBeCloseTo(33, 0)
    expect(rows[1].criticalAimAu).toBeCloseTo(0.22, 2)
    expect(rows[2].criticalAimKm / 1e9).toBeCloseTo(50, 0)
    expect(rows[2].criticalAimAu).toBeCloseTo(330, -1)
    for (const row of rows) {
      expect(row.criticalAimKm).toBeCloseTo(CRITICAL_AIM_IN_HORIZON_RADII * horizonRadiusKm(row.preset.massSolarMasses), 6)
      expect(row.criticalAimAu).toBeCloseTo(row.criticalAimKm / KM_PER_AU, 12)
      expect(row.photonSphereKm).toBeCloseTo(1.5 * row.horizonRadiusKm, 9)
    }
  })
})

describe('the check-up', () => {
  it('reads one number against another with no cut-offs', () => {
    expect(readAgainst(1, 1)).toBe('the same')
    expect(readAgainst(1.0001, 1)).toBe('more')
    expect(readAgainst(0.9, 1)).toBe('less')
    expect(readAgainstRounded(2.5981, 2.598076, 3)).toBe('the same')
    expect(readAgainstRounded(2.62, 2.598076, 3)).toBe('more')
    expect(percentAbove(110, 100)).toBeCloseTo(10, 12)
  })

  it('finds this model\'s capture boundary by halving, and it agrees with 3 sqrt(3) / 2 and with the independent effective potential 1 / b^2 = 4/27', () => {
    const boundary = modelCaptureBoundaryInHorizonRadii()
    expect(boundary).toBeCloseTo(CRITICAL_AIM_IN_HORIZON_RADII, 5)
    expect(1 / (boundary * boundary)).toBeCloseTo(4 / 27, 5)
    expect(lightPath(boundary - 1e-4).outcome).toBe('captured')
    expect(lightPath(boundary + 1e-4).outcome).toBe('escapes')
  })

  it('has three rows: the simple formula at 100 is a little below the exact bend; the boundary is the same; the closest approach is a little above 1.5', () => {
    const [far, boundary, circle] = checkUpRows()
    expect(far.expected).toBeCloseTo(2 * (180 / Math.PI) / 100, 6)
    expect(far.found).toBeGreaterThan(far.expected)
    expect(far.reading).toBe('more')
    expect(far.percentAbove).toBeGreaterThan(0)
    expect(far.percentAbove).toBeLessThan(2) // within 2% (specification, test 5)
    expect(boundary.reading).toBe('the same')
    expect(circle.expected).toBe(1.5)
    expect(circle.found).toBeCloseTo(1.53, 1)
    expect(circle.reading).toBe('more')
    expect(circle.percentAbove).toBeGreaterThan(0)
  })

  it('compares the simple formula at 100, beyond the controls, because at the controls\' largest aim (20) it is 8% off', () => {
    expect(MAX_AIM_IN_HORIZON_RADII).toBe(20)
    expect(checkUpRows()[0].what).toContain('100')
  })
})

describe('the existing exports are unchanged (Cosmic Horizons 21 imports the critical aim)', () => {
  it('keeps the critical aim, the circle for light and the path values the first build tested', () => {
    expect(CRITICAL_AIM_IN_HORIZON_RADII).toBe((3 * Math.sqrt(3)) / 2)
    expect(PHOTON_SPHERE_IN_HORIZON_RADII).toBe(1.5)
    expect(toDegrees(lightPath(3).bendRadians as number)).toBeCloseTo(98.5, 0)
    expect(toDegrees(lightPath(20).bendRadians as number)).toBeCloseTo(6.19, 1)
    expect(MIN_AIM_IN_HORIZON_RADII).toBe(1)
  })

  it('still imports only horizonRadiusKm and OBJECT_PRESETS (the new code adds no import)', () => {
    const importLines = source.split('\n').filter((line: string) => line.trim().startsWith('import'))
    expect(importLines).toHaveLength(2)
  })
})
