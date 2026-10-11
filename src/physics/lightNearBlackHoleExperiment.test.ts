import { describe, expect, it } from 'vitest'
import { horizonRadiusKm } from './blackHoleSizeExperiment'
import source from './lightNearBlackHoleExperiment.ts?raw'
import {
  BLACK_HOLE_PRESETS,
  CRITICAL_AIM_IN_HORIZON_RADII,
  MAX_AIM_IN_HORIZON_RADII,
  MIN_AIM_IN_HORIZON_RADII,
  PHOTON_SPHERE_IN_HORIZON_RADII,
  bendCurve,
  lightPath,
  runLightNearBlackHoleExperiment,
  weakFieldBendRadians,
} from './lightNearBlackHoleExperiment'

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

  it('swings around more than half a turn when it escapes close to the critical aim', () => {
    expect(lightPath(20).turnsAround).toBeGreaterThan(0.5)
    expect(lightPath(2.6).turnsAround).toBeGreaterThan(1.5)
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
