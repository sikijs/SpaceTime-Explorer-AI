import { describe, expect, it } from 'vitest'
import { horizonRadiusKm } from './blackHoleSizeExperiment'
import {
  BLACK_HOLE_PRESETS,
  LAST_SAFE_ORBIT_IN_HORIZON_RADII,
  MAX_START_IN_HORIZON_RADII,
  MAX_TURNS,
  MIN_START_IN_HORIZON_RADII,
  NUDGE,
  STEPS_PER_TURN,
  exactCircularSpeedFractionOfLight,
  modelEdgeInHorizonRadii,
  orbitPath,
  ordinaryCircularSpeedFractionOfLight,
  runOrbitsNearBlackHoleExperiment,
} from './orbitsNearBlackHoleExperiment'

// ---- an independent description of the exact theory, in units G = c = M = 1 (so r_s = 2) ----
// The effective potential (1 - 2M/r)(1 + L^2/r^2): a different route from the module's equation for u(phi).
const V = (r: number, L2: number) => (1 - 2 / r) * (1 + L2 / (r * r))
const circularL2 = (r: number) => (r * r) / (r - 3)
const secondDerivative = (f: (r: number) => number, r: number, h = 1e-3) => (f(r + h) - 2 * f(r) + f(r - h)) / (h * h)

// The probe plunges if its energy exceeds the potential at every distance between the horizon and its start.
function plungesByPotential(startInHorizonRadii: number, nudge: number): boolean {
  const r0 = startInHorizonRadii * 2
  const L2 = circularL2(r0)
  const radialSpeedSquared = (nudge * Math.sqrt(L2) / r0) ** 2
  const energySquared = radialSpeedSquared + V(r0, L2)
  let peak = -Infinity
  for (let r = 2 * 1.0000001; r <= r0; r += (r0 - 2) / 100_000) peak = Math.max(peak, V(r, L2))
  return energySquared > peak
}

const within = (actual: number, expected: number, fraction: number) =>
  expect(Math.abs(actual - expected) / expected).toBeLessThan(fraction)

describe('circular-orbit launch speeds', () => {
  it('has the exact speed equal sqrt(1 / (2 (x - 1))), 0.5 at 3 horizon radii', () => {
    for (const x of [1.6, 2, 3, 4, 10, 20]) {
      expect(exactCircularSpeedFractionOfLight(x)).toBeCloseTo(Math.sqrt(1 / (2 * (x - 1))), 12)
    }
    expect(exactCircularSpeedFractionOfLight(3)).toBeCloseTo(0.5, 12)
  })

  it('reaches the speed of light at 1.5 horizon radii and rejects that distance and anything inside it', () => {
    expect(exactCircularSpeedFractionOfLight(1.5000001)).toBeGreaterThan(0.999)
    expect(() => exactCircularSpeedFractionOfLight(1.5)).toThrow(RangeError)
    expect(() => exactCircularSpeedFractionOfLight(1.2)).toThrow(RangeError)
    expect(() => orbitPath('exact', 1.4)).toThrow(RangeError)
  })

  it('has the ordinary speed equal sqrt(1 / (2x))', () => {
    for (const x of [1.6, 3, 20]) expect(ordinaryCircularSpeedFractionOfLight(x)).toBeCloseTo(Math.sqrt(1 / (2 * x)), 12)
  })

  it('has the two speeds agree far away and the exact one always the larger', () => {
    within(exactCircularSpeedFractionOfLight(100) / ordinaryCircularSpeedFractionOfLight(100), 1, 0.01)
    let previousRatio = Infinity
    for (const x of [100, 20, 10, 6, 4, 3, 2, 1.6]) {
      const ratio = exactCircularSpeedFractionOfLight(x) / ordinaryCircularSpeedFractionOfLight(x)
      expect(ratio).toBeGreaterThan(1)
      if (previousRatio !== Infinity) expect(ratio).toBeGreaterThan(previousRatio) // and growing as x falls
      previousRatio = ratio
    }
  })

  it("agrees with Gravity Experiment 6's circular-speed relation: v^2 x is the same constant at every distance", () => {
    for (const x of [1.6, 3, 10, 20, 100]) expect(ordinaryCircularSpeedFractionOfLight(x) ** 2 * x).toBeCloseTo(0.5, 12)
  })
})

describe('the last safe orbit, found independently of the module', () => {
  it('is stable above 3 horizon radii, unstable between 1.5 and 3, and marginal at 3', () => {
    const curvature = (horizonRadii: number) => {
      const r = horizonRadii * 2
      const L2 = circularL2(r)
      return secondDerivative((x) => V(x, L2), r)
    }
    for (const x of [1.6, 2, 2.5, 2.9]) expect(curvature(x)).toBeLessThan(0)
    for (const x of [3.1, 3.5, 4, 6, 10, 20]) expect(curvature(x)).toBeGreaterThan(0)
    expect(Math.abs(curvature(LAST_SAFE_ORBIT_IN_HORIZON_RADII))).toBeLessThan(1e-5)
  })
})

describe('the integrated outcome', () => {
  it('agrees with the effective-potential criterion away from the edge', () => {
    for (const x of [1.6, 2, 2.5, 3, 3.5, 4, 6, 10, 20]) {
      const integrated = orbitPath('exact', x).outcome === 'plunges'
      expect(integrated).toBe(plungesByPotential(x, NUDGE))
    }
  })

  it('plunges at 3 horizon radii or less, ending at the horizon, after more turns the closer the start is to 3', () => {
    const expectedTurns: Array<[number, number]> = [
      [1.6, 1.2],
      [2, 1.6],
      [2.5, 2.3],
      [3, 6.0],
    ]
    let previous = 0
    for (const [x, turns] of expectedTurns) {
      const path = orbitPath('exact', x)
      expect(path.outcome).toBe('plunges')
      expect(path.turnsCompleted).toBeLessThan(MAX_TURNS)
      expect(Math.abs(path.turnsCompleted - turns)).toBeLessThan(0.1)
      expect(path.turnsCompleted).toBeGreaterThan(previous)
      previous = path.turnsCompleted
      const end = path.points[path.points.length - 1]
      expect(end.distanceInHorizonRadii).toBeCloseTo(1, 12)
      expect(path.closestInHorizonRadii).toBe(1)
    }
  })

  it('keeps circling for MAX_TURNS at 3.5 horizon radii or more, within 1% of the start', () => {
    for (const x of [3.5, 4, 6, 10, 20]) {
      const path = orbitPath('exact', x)
      expect(path.outcome).toBe('keeps-circling')
      expect(path.turnsCompleted).toBeCloseTo(MAX_TURNS, 9)
      within(path.closestInHorizonRadii, x, 0.01)
      within(path.farthestInHorizonRadii, x, 0.01)
    }
  })

  it('never plunges under ordinary gravity, whatever the start, staying within 2 x NUDGE of it', () => {
    for (const x of [1.6, 2, 3, 3.1, 6, 10, 20]) {
      const path = orbitPath('ordinary', x)
      expect(path.outcome).toBe('keeps-circling')
      expect(Math.abs(path.closestInHorizonRadii - x) / x).toBeLessThan(2 * NUDGE)
      expect(Math.abs(path.farthestInHorizonRadii - x) / x).toBeLessThan(2 * NUDGE)
    }
  })

  it('conserves the energy of a keeps-circling exact-theory path to within 1e-6', () => {
    const x = 6
    const path = orbitPath('exact', x)
    const L2 = circularL2(x * 2)
    // dr/dtau = -L du/dphi, so energy^2 = L^2 (du/dphi)^2 + V(r).
    const energy = (point: (typeof path.points)[number]) => L2 * point.duDphi ** 2 + V(point.distanceInHorizonRadii * 2, L2)
    const start = energy(path.points[0])
    for (let i = 0; i < path.points.length; i += 50) expect(Math.abs(energy(path.points[i]) - start)).toBeLessThan(1e-6)
  })

  it('has the two rules agree at 20 horizon radii and differ near the black hole', () => {
    const exact = orbitPath('exact', 20)
    const ordinary = orbitPath('ordinary', 20)
    let largest = 0
    for (let i = 0; i < exact.points.length; i++) {
      largest = Math.max(largest, Math.abs(exact.points[i].distanceInHorizonRadii - ordinary.points[i].distanceInHorizonRadii) / 20)
    }
    expect(largest).toBeLessThan(0.005)

    const exactNear = orbitPath('exact', 3.1)
    const ordinaryNear = orbitPath('ordinary', 3.1)
    const wobble = (p: typeof exactNear) => p.farthestInHorizonRadii - p.closestInHorizonRadii
    expect(wobble(exactNear)).toBeGreaterThan(2 * wobble(ordinaryNear))
  })
})

describe("the model's edge", () => {
  it('lies just above 3 horizon radii for the default nudge', () => {
    const edge = modelEdgeInHorizonRadii()
    expect(edge).toBeGreaterThan(3)
    expect(edge).toBeLessThan(3.05)
    // The two sides of the edge behave as the edge says.
    expect(orbitPath('exact', edge - 0.01).outcome).toBe('plunges')
    expect(orbitPath('exact', edge + 0.01).outcome).toBe('keeps-circling')
  })

  it('moves toward 3 as the nudge falls', () => {
    const edges = [0.01, 0.005, 0.001, 0.0002].map((nudge) => modelEdgeInHorizonRadii(nudge))
    for (let i = 1; i < edges.length; i++) expect(edges[i]).toBeLessThan(edges[i - 1])
    expect(edges[edges.length - 1]).toBeLessThan(3.01)
  })
})

describe('the path itself', () => {
  it('starts at the start distance and angle 0, is evenly spaced in angle, and has x and y consistent with it', () => {
    for (const rule of ['ordinary', 'exact'] as const) {
      const path = orbitPath(rule, 10)
      expect(path.points[0].turns).toBe(0)
      expect(path.points[0].distanceInHorizonRadii).toBeCloseTo(10, 12)
      expect(path.points[0].x).toBeCloseTo(10, 12)
      expect(path.points[0].y).toBeCloseTo(0, 12)
      expect(path.points.length).toBe(MAX_TURNS * STEPS_PER_TURN + 1)
      for (let i = 1; i < 20; i++) expect(path.points[i].turns - path.points[i - 1].turns).toBeCloseTo(1 / STEPS_PER_TURN, 12)
      for (const i of [0, 100, 1234, 5000]) {
        const p = path.points[i]
        expect(Math.hypot(p.x, p.y)).toBeCloseTo(p.distanceInHorizonRadii, 9)
        const angle = Math.atan2(p.y, p.x)
        const expectedAngle = Math.atan2(Math.sin(p.turns * 2 * Math.PI), Math.cos(p.turns * 2 * Math.PI))
        expect(angle).toBeCloseTo(expectedAngle, 9)
      }
    }
  })

  it('has a plunging path end at the horizon with turns strictly increasing', () => {
    const path = orbitPath('exact', 2)
    for (let i = 1; i < path.points.length; i++) expect(path.points[i].turns).toBeGreaterThan(path.points[i - 1].turns)
    expect(path.points[path.points.length - 1].turns).toBe(path.turnsCompleted)
  })
})

describe('the whole experiment', () => {
  it('gives the same outcomes and speeds for all three black holes at the same distance in horizon radii', () => {
    expect(BLACK_HOLE_PRESETS.map((p) => p.id)).toEqual(['stellar-black-hole', 'sgr-a-star', 'm87-star'])
    for (const x of [2, 3.5, 20]) {
      const results = BLACK_HOLE_PRESETS.map((p) => runOrbitsNearBlackHoleExperiment(p.id, x))
      for (const r of results) {
        expect(r.exact.outcome).toBe(results[0].exact.outcome)
        expect(r.ordinary.outcome).toBe(results[0].ordinary.outcome)
        expect(r.exactSpeedFractionOfLight).toBe(results[0].exactSpeedFractionOfLight)
      }
    }
  })

  it("gives kilometers consistent with Experiment 1's horizon radius", () => {
    for (const p of BLACK_HOLE_PRESETS) {
      const r = runOrbitsNearBlackHoleExperiment(p.id, 4)
      expect(r.horizonRadiusKm).toBe(horizonRadiusKm(p.massSolarMasses))
      expect(r.startKm).toBeCloseTo(4 * horizonRadiusKm(p.massSolarMasses), 6)
      expect(r.lastSafeOrbitKm).toBeCloseTo(3 * horizonRadiusKm(p.massSolarMasses), 6)
    }
    within(runOrbitsNearBlackHoleExperiment('stellar-black-hole', 4).lastSafeOrbitKm, 88.6, 0.005)
    within(runOrbitsNearBlackHoleExperiment('m87-star', 4).lastSafeOrbitKm, 5.759e10, 0.005)
  })

  it('rejects an unknown black hole and starts outside the allowed range', () => {
    expect(() => runOrbitsNearBlackHoleExperiment('sun' as never, 4)).toThrow()
    expect(() => runOrbitsNearBlackHoleExperiment('m87-star', MIN_START_IN_HORIZON_RADII - 0.01)).toThrow(RangeError)
    expect(() => runOrbitsNearBlackHoleExperiment('m87-star', MAX_START_IN_HORIZON_RADII + 0.01)).toThrow(RangeError)
  })

  it('gives identical results on repeated calls', () => {
    expect(runOrbitsNearBlackHoleExperiment('sgr-a-star', 2.5)).toEqual(runOrbitsNearBlackHoleExperiment('sgr-a-star', 2.5))
  })
})

describe('reuse (CLAUDE.md §8)', () => {
  it('imports from blackHoleSizeExperiment and not from blackHoleExperiment or orbitExperiment', async () => {
    const source = await import('node:fs/promises').then((fs) =>
      fs.readFile(new URL('./orbitsNearBlackHoleExperiment.ts', import.meta.url), 'utf-8'),
    )
    const importLines = source.split('\n').filter((line: string) => line.trim().startsWith('import'))
    const from = (name: string) => importLines.filter((line: string) => line.includes(name)).join(' ')
    expect(from('blackHoleSizeExperiment')).toContain('horizonRadiusKm')
    expect(from('blackHoleSizeExperiment')).toContain('OBJECT_PRESETS')
    expect(importLines.some((line: string) => line.includes("/blackHoleExperiment'"))).toBe(false)
    expect(importLines.some((line: string) => line.includes("/orbitExperiment'"))).toBe(false)
  })
})
