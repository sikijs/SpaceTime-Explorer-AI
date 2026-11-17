import { describe, expect, it } from 'vitest'
import { horizonRadiusKm } from './blackHoleSizeExperiment'
import {
  BLACK_HOLE_PRESETS,
  FAR_PANEL_VIEW_IN_HORIZON_RADII,
  FAR_START_IN_HORIZON_RADII,
  FLIES_OFF_AT_LEAST_TIMES_THE_START,
  NEARLY_THE_SAME_WITHIN_PERCENT,
  PART_ONE_BLACK_HOLE_ID,
  PART_ONE_GRAPH_MAX_IN_HORIZON_RADII,
  PART_ONE_PANEL_VIEW_IN_HORIZON_RADII,
  PART_ONE_START_IN_HORIZON_RADII,
  S2_CLOSEST_APPROACH_AU_ESO,
  S2_CLOSEST_APPROACH_KM_UPPER_BOUND,
  S301_CLOSEST_APPROACH_KM,
  checkUpRows,
  farGuessIsModelAnswer,
  farGuessMark,
  guessedLastSafeInHorizonRadii,
  lastSafeGuessIsModelAnswer,
  lastSafeGuessIsOffView,
  lastSafeOrbitRows,
  modelNudgeAnswer,
  nudgeGuessIsModelAnswer,
  nudgeGuessMark,
  readAgainst,
  realStarRows,
  runFarPair,
  runPartOne,
  s301TopSpeedFractionOfLight,
  speedGapPercent,
  wobblePercent,
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

// ---------------------------------------------------------------------------------------------------------------
// Audit update (Black Holes 3): the fixed Part 1 runs, the white guess marks and their marking, the check-up and the
// real-orbit comparisons.
// ---------------------------------------------------------------------------------------------------------------
describe('the fixed Part 1 runs', () => {
  it('runs the 10-Sun black hole with a pair at 2 horizon radii and a pair at 20', () => {
    const two = runPartOne()
    const far = runFarPair()
    expect(two.preset.id).toBe(PART_ONE_BLACK_HOLE_ID)
    expect(two.startInHorizonRadii).toBe(PART_ONE_START_IN_HORIZON_RADII)
    expect(far.preset.id).toBe(PART_ONE_BLACK_HOLE_ID)
    expect(far.startInHorizonRadii).toBe(FAR_START_IN_HORIZON_RADII)
    expect(two.horizonRadiusKm).toBeCloseTo(29.53, 1)
    expect(two.startKm).toBeCloseTo(59.06, 1)
  })

  it('has the exact-theory probe at 2 radii plunge after about 1.55 turns while the ordinary one keeps circling', () => {
    const two = runPartOne()
    expect(two.exact.outcome).toBe('plunges')
    expect(two.exact.turnsCompleted).toBeGreaterThan(1.5)
    expect(two.exact.turnsCompleted).toBeLessThan(1.6)
    expect(two.ordinary.outcome).toBe('keeps-circling')
    expect(two.ordinary.turnsCompleted).toBeCloseTo(MAX_TURNS, 6)
  })

  it('has both probes keep circling at 20 radii, with launch speeds 0.162 and 0.158', () => {
    const far = runFarPair()
    expect(far.exact.outcome).toBe('keeps-circling')
    expect(far.ordinary.outcome).toBe('keeps-circling')
    expect(far.exactSpeedFractionOfLight).toBeCloseTo(0.1622, 3)
    expect(far.ordinarySpeedFractionOfLight).toBeCloseTo(0.1581, 3)
  })

  it('fits the ring at 3 horizon radii inside the 2-radii panels and the graph', () => {
    expect(PART_ONE_PANEL_VIEW_IN_HORIZON_RADII).toBeGreaterThan(LAST_SAFE_ORBIT_IN_HORIZON_RADII)
    expect(PART_ONE_GRAPH_MAX_IN_HORIZON_RADII).toBeGreaterThanOrEqual(10)
    expect(FAR_PANEL_VIEW_IN_HORIZON_RADII).toBeGreaterThan(FAR_START_IN_HORIZON_RADII)
  })
})

describe('guess 1: a nudged circle at 2 horizon radii', () => {
  it('gives each answer its own shape of marker, so a different guess is visibly different', () => {
    const marks = new Set([nudgeGuessMark('wobbles'), nudgeGuessMark('spirals-in'), nudgeGuessMark('flies-off')])
    expect(marks.size).toBe(3)
  })

  it('has the model answer "spirals in" taken from the exact-theory path, not typed in', () => {
    expect(modelNudgeAnswer()).toBe('spirals-in')
    expect(nudgeGuessIsModelAnswer('spirals-in')).toBe(true)
    expect(nudgeGuessIsModelAnswer('wobbles')).toBe(false)
    expect(nudgeGuessIsModelAnswer('flies-off')).toBe(false)
  })

  it('never sees the probe fly off: the exact path ends no farther out than it began', () => {
    const farthest = orbitPath('exact', PART_ONE_START_IN_HORIZON_RADII).farthestInHorizonRadii
    expect(farthest).toBeLessThan(FLIES_OFF_AT_LEAST_TIMES_THE_START * PART_ONE_START_IN_HORIZON_RADII)
    expect(farthest).toBeLessThan(PART_ONE_START_IN_HORIZON_RADII * 1.01)
  })
})

describe('guess 2: the last safe place to circle', () => {
  it('gives a ring distance for 3 and 10 and none for "anywhere"', () => {
    expect(guessedLastSafeInHorizonRadii('three')).toBe(3)
    expect(guessedLastSafeInHorizonRadii('ten')).toBe(10)
    expect(guessedLastSafeInHorizonRadii('anywhere')).toBeNull()
  })

  it('follows the guess: a different guess gives a different distance', () => {
    expect(guessedLastSafeInHorizonRadii('three')).not.toBe(guessedLastSafeInHorizonRadii('ten'))
  })

  it('flags a guess of 10 as off the 2-radii panels (which reach 4) but on the graph (which reaches 12)', () => {
    expect(lastSafeGuessIsOffView('ten', PART_ONE_PANEL_VIEW_IN_HORIZON_RADII)).toBe(true)
    expect(lastSafeGuessIsOffView('ten', PART_ONE_GRAPH_MAX_IN_HORIZON_RADII)).toBe(false)
    expect(lastSafeGuessIsOffView('three', PART_ONE_PANEL_VIEW_IN_HORIZON_RADII)).toBe(false)
    expect(lastSafeGuessIsOffView('anywhere', 1)).toBe(false)
  })

  it('marks only "about 3" as the model answer, which agrees with what the paths do', () => {
    expect(lastSafeGuessIsModelAnswer('three')).toBe(true)
    expect(lastSafeGuessIsModelAnswer('ten')).toBe(false)
    expect(lastSafeGuessIsModelAnswer('anywhere')).toBe(false)
    // The probe at 3.5 circles for all turns; one at 2 plunges: the safe edge lies between them, near 3.
    expect(orbitPath('exact', 3.5).outcome).toBe('keeps-circling')
    expect(orbitPath('exact', 2).outcome).toBe('plunges')
    // And a probe at 10 radii is also safe, so 10 is not "the last safe place".
    expect(orbitPath('exact', 10).outcome).toBe('keeps-circling')
  })
})

describe('guess 3: the two rules at 20 horizon radii', () => {
  it('has launch speeds only about 2.6 percent apart', () => {
    expect(speedGapPercent(FAR_START_IN_HORIZON_RADII)).toBeCloseTo(2.6, 1)
    expect(speedGapPercent(2)).toBeCloseTo(41.4, 1)
  })

  it('marks "nearly the same" as the model answer, from the paths and the speed gap', () => {
    expect(farGuessIsModelAnswer('nearly-same')).toBe(true)
    expect(farGuessIsModelAnswer('very-different')).toBe(false)
    expect(speedGapPercent(FAR_START_IN_HORIZON_RADII)).toBeLessThanOrEqual(NEARLY_THE_SAME_WITHIN_PERCENT)
  })

  it('gives each answer its own sign, so a different guess is visibly different', () => {
    expect(farGuessMark('very-different')).not.toBe(farGuessMark('nearly-same'))
  })

  it('keeps the two paths close to their start for all turns at 20 radii', () => {
    const far = runFarPair()
    expect(wobblePercent(far.ordinary, FAR_START_IN_HORIZON_RADII)).toBeLessThan(1)
    expect(wobblePercent(far.exact, FAR_START_IN_HORIZON_RADII)).toBeLessThan(1)
  })
})

describe('the figures the interface used to work out itself', () => {
  it('has wobblePercent agree with the closest and farthest distances', () => {
    const path = orbitPath('ordinary', 2)
    const byHand = Math.max(1 - path.closestInHorizonRadii / 2, path.farthestInHorizonRadii / 2 - 1) * 100
    expect(wobblePercent(path, 2)).toBeCloseTo(byHand, 10)
    expect(wobblePercent(path, 2)).toBeLessThan(0.3)
  })

  it('reads one number against another as the same, more or less, with no cut-offs', () => {
    expect(readAgainst(3, 3)).toBe('the same')
    expect(readAgainst(3.025, 3)).toBe('more')
    expect(readAgainst(2.9999, 3)).toBe('less')
  })
})

describe('the check-up', () => {
  const rows = checkUpRows()

  it('has five rows, each from a formula the model is built from or a figure already published', () => {
    expect(rows).toHaveLength(5)
  })

  it('shows the model edge as a little more than 3, and every closed-formula row as the same', () => {
    expect(rows[0].found).toBeCloseTo(3.025, 2)
    expect(rows[0].reading).toBe('more')
    for (const row of rows.slice(1, 4)) expect(row.reading).toBe('the same')
  })

  it('reads the 10-Sun horizon radius against the 30 km published figure, to the rounding', () => {
    expect(rows[4].found).toBeCloseTo(29.53, 1)
    expect(rows[4].reading).toBe('the same, to the rounding')
  })
})

describe('where real orbits sit, in horizon radii', () => {
  const [s2, s301] = realStarRows()

  it('puts S2 less than about 1,600 horizon radii from Sagittarius A* (an upper bound)', () => {
    expect(s2.label).toBe('S2')
    expect(s2.isUpperBound).toBe(true)
    expect(s2.horizonRadiiThisPage).toBeCloseTo(1575, -1)
  })

  it('puts S301 at about 140 horizon radii with this page\'s 4.3 million Suns, and about 150 with ESO\'s four million', () => {
    expect(s301.label).toBe('S301')
    expect(s301.isUpperBound).toBe(false)
    expect(s301.horizonRadiiThisPage).toBeCloseTo(140.2, 0)
    expect(s301.horizonRadiiEsoMass).toBeCloseTo(150.7, 0)
    expect(s301.closestApproachAu).toBeCloseTo(11.9, 1)
  })

  it('keeps both stars far outside the last safe orbit, and S301 closer in than S2', () => {
    expect(s301.horizonRadiiThisPage).toBeGreaterThan(20 * LAST_SAFE_ORBIT_IN_HORIZON_RADII)
    expect(s301.horizonRadiiThisPage).toBeLessThan(s2.horizonRadiiThisPage)
    expect(S301_CLOSEST_APPROACH_KM).toBeLessThan(S2_CLOSEST_APPROACH_KM_UPPER_BOUND)
  })

  it('keeps ESO\'s two S2 figures consistent: 120 AU is under the 20 billion km bound', () => {
    expect(S2_CLOSEST_APPROACH_AU_ESO * 149_597_870.7).toBeLessThan(S2_CLOSEST_APPROACH_KM_UPPER_BOUND)
  })

  it('has S301 top out at over 8 percent of the speed of light', () => {
    expect(s301TopSpeedFractionOfLight()).toBeGreaterThan(0.08)
    expect(s301TopSpeedFractionOfLight()).toBeCloseTo(0.0834, 3)
  })

  it('gives the last safe orbit of the three black holes as 88.6 km, 38.1 million km and 57.6 billion km', () => {
    const [stellar, sgr, m87] = lastSafeOrbitRows()
    expect(stellar.lastSafeOrbitKm).toBeCloseTo(88.6, 1)
    expect(sgr.lastSafeOrbitKm / 1e6).toBeCloseTo(38.1, 1)
    expect(sgr.lastSafeOrbitAu).toBeCloseTo(0.25, 2)
    expect(m87.lastSafeOrbitKm / 1e9).toBeCloseTo(57.6, 1)
    expect(m87.lastSafeOrbitAu).toBeCloseTo(385, -1)
    for (const row of [stellar, sgr, m87]) expect(row.lastSafeOrbitKm / row.horizonRadiusKm).toBeCloseTo(3, 10)
  })
})
