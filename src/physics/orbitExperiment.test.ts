import { describe, expect, it } from 'vitest'
import {
  COLLISION_RADIUS_FACTOR,
  PART_ONE_PUSHES,
  circularSpeedFor,
  closestApproachFraction,
  edgeCheck,
  farthestPointFraction,
  guessMarkers,
  outcomeForPush,
  outcomeSweep,
  partOneOutcomes,
  pushEdgeForCollisionSize,
  pushEdges,
  pushSummary,
  runOrbitExperiment,
  tutorMarking,
} from './orbitExperiment'
import type { OrbitOutcome, YesNo } from './orbitExperiment'

function specificEnergy(x: number, y: number, vx: number, vy: number, gm: number): number {
  const r = Math.hypot(x, y)
  return 0.5 * (vx * vx + vy * vy) - gm / r
}

function velocityAt(
  trajectory: { t: number; x: number; y: number }[],
  index: number
): { vx: number; vy: number } {
  const a = trajectory[index - 1]
  const b = trajectory[index + 1]
  const dt = b.t - a.t
  return { vx: (b.x - a.x) / dt, vy: (b.y - a.y) / dt }
}

describe('runOrbitExperiment', () => {
  it('falls straight in (no sideways deviation) at zero initial speed', () => {
    const result = runOrbitExperiment(1, 1, 0)

    expect(result.outcome).toBe('falls-in')
    for (const point of result.trajectory) {
      expect(point.y).toBeCloseTo(0, 9)
    }
    const last = result.trajectory[result.trajectory.length - 1]
    expect(last.x).toBeGreaterThan(0)
    expect(last.x).toBeLessThanOrEqual(0.1 * 1 + 1e-6)
  })

  it('stays at essentially constant distance for a full circular orbit at circularSpeed', () => {
    const result = runOrbitExperiment(1, 1, 1)

    expect(result.outcome).toBe('orbits')
    expect(result.circularSpeed).toBeCloseTo(1, 9)
    for (const point of result.trajectory) {
      const r = Math.hypot(point.x, point.y)
      expect(r).toBeCloseTo(1, 2)
    }
  })

  it('escapes when launched well above escape speed', () => {
    const result = runOrbitExperiment(1, 1, 3)

    expect(result.escapeSpeed).toBeCloseTo(Math.SQRT2, 9)
    expect(result.outcome).toBe('escapes')
  })

  it('falls in when launched below circular speed but above zero', () => {
    const result = runOrbitExperiment(1, 1, 0.3)

    expect(result.outcome).toBe('falls-in')
  })

  it('computes circularSpeed and escapeSpeed from the standard closed-form formulas', () => {
    const cases: [number, number][] = [
      [1, 1],
      [4, 1],
      [1, 2],
      [9, 3],
    ]
    for (const [gm, r] of cases) {
      const result = runOrbitExperiment(gm, r, 0.01)
      expect(result.circularSpeed).toBeCloseTo(Math.sqrt(gm / r), 9)
      expect(result.escapeSpeed).toBeCloseTo(Math.sqrt((2 * gm) / r), 9)
    }
  })

  it('conserves total orbital energy over one full circular orbit within a small tolerance', () => {
    const gm = 1
    const r = 1
    const result = runOrbitExperiment(gm, r, 1)
    const initialEnergy = specificEnergy(r, 0, 0, 1, gm)

    // Sample interior points (skip the first/last, which have no symmetric neighbor for
    // the finite-difference velocity estimate).
    for (let i = 10; i < result.trajectory.length - 10; i += 25) {
      const point = result.trajectory[i]
      const { vx, vy } = velocityAt(result.trajectory, i)
      const energy = specificEnergy(point.x, point.y, vx, vy, gm)
      expect(Math.abs(energy - initialEnergy)).toBeLessThan(1e-3)
    }
  })

  it('is deterministic across repeated calls for the same inputs', () => {
    const a = runOrbitExperiment(1, 1, 0.8)
    const b = runOrbitExperiment(1, 1, 0.8)

    expect(a.outcome).toBe(b.outcome)
    expect(a.trajectory.length).toBe(b.trajectory.length)
    for (let i = 0; i < a.trajectory.length; i++) {
      expect(a.trajectory[i]).toEqual(b.trajectory[i])
    }
  })

  it('throws for invalid inputs', () => {
    expect(() => runOrbitExperiment(0, 1, 1)).toThrow(RangeError)
    expect(() => runOrbitExperiment(-1, 1, 1)).toThrow(RangeError)
    expect(() => runOrbitExperiment(1, 0, 1)).toThrow(RangeError)
    expect(() => runOrbitExperiment(1, -1, 1)).toThrow(RangeError)
    expect(() => runOrbitExperiment(1, 1, -1)).toThrow(RangeError)
  })
})

describe('audit update: outcome graph numbers (Gravity 6)', () => {
  it('finds the three outcomes in order along the sweep, with nothing out of order', () => {
    const sweep = outcomeSweep(0.05, 2)
    expect(sweep).toHaveLength(41)
    expect(sweep[0].fraction).toBe(0)
    expect(sweep[sweep.length - 1].fraction).toBe(2)
    const rank = { 'falls-in': 0, orbits: 1, escapes: 2 } as const
    for (let i = 1; i < sweep.length; i++) {
      expect(rank[sweep[i].outcome]).toBeGreaterThanOrEqual(rank[sweep[i - 1].outcome])
    }
    const at = (percent: number) => sweep.find((row) => Math.round(row.fraction * 100) === percent)!
    expect(at(40).outcome).toBe('falls-in')
    expect(at(45).outcome).toBe('orbits')
    expect(at(140).outcome).toBe('orbits')
    expect(at(145).outcome).toBe('escapes')
  })

  it('puts the edges where the closed forms say: about 42.6 and 141.4 percent', () => {
    const edges = pushEdges()
    expect(edges.fallsInBelow).toBeCloseTo(Math.sqrt(0.2 / 1.1), 12)
    expect(edges.fallsInBelow).toBeCloseTo(0.4264, 4)
    expect(edges.escapesFrom).toBeCloseTo(Math.SQRT2, 12)
    expect(outcomeForPush(0.42)).toBe('falls-in')
    expect(outcomeForPush(0.43)).toBe('orbits')
    expect(outcomeForPush(1.41)).toBe('orbits')
    expect(outcomeForPush(1.42)).toBe('escapes')
  })

  it('check-up: the formula lies between the two whole-number pushes either side of each edge', () => {
    const check = edgeCheck()
    expect(check.fallsIn.lastBefore).toBeCloseTo(0.42, 9)
    expect(check.fallsIn.firstAfter).toBeCloseTo(0.43, 9)
    expect(check.fallsIn.lastBeforeOutcome).toBe('falls-in')
    expect(check.fallsIn.firstAfterOutcome).toBe('orbits')
    expect(check.fallsIn.formulaInside).toBe(true)
    expect(check.escape.lastBefore).toBeCloseTo(1.41, 9)
    expect(check.escape.firstAfter).toBeCloseTo(1.42, 9)
    expect(check.escape.lastBeforeOutcome).toBe('orbits')
    expect(check.escape.firstAfterOutcome).toBe('escapes')
    expect(check.escape.formulaInside).toBe(true)
  })

  it('check-up: a push of exactly 1 stays at the start distance all the way round', () => {
    const { circle } = edgeCheck()
    expect(circle.closest).toBeCloseTo(1, 2)
    expect(circle.farthest).toBeCloseTo(1, 2)
  })

  it('closest-approach and farthest-point formulas agree with the integrator', () => {
    for (const fraction of [0.45, 0.6, 0.8]) {
      const result = runOrbitExperiment(1, 1, fraction)
      const minimum = Math.min(...result.trajectory.map((p) => Math.hypot(p.x, p.y)))
      expect(minimum).toBeCloseTo(closestApproachFraction(fraction), 2)
      expect(farthestPointFraction(fraction)).toBe(1)
    }
    // Above the circular speed the start is the closest point, and the farthest point is
    // f^2 / (2 - f^2); 105 and 120 percent finish a full lap inside the run's time limit.
    for (const fraction of [1.05, 1.2]) {
      const result = runOrbitExperiment(1, 1, fraction)
      const maximum = Math.max(...result.trajectory.map((p) => Math.hypot(p.x, p.y)))
      const minimum = Math.min(...result.trajectory.map((p) => Math.hypot(p.x, p.y)))
      expect(minimum).toBeCloseTo(1, 2)
      expect(maximum).toBeCloseTo(farthestPointFraction(fraction), 1)
    }
    expect(farthestPointFraction(1.05)).toBeCloseTo(1.2, 1)
    expect(farthestPointFraction(1.2)).toBeCloseTo(2.571, 3)
    expect(farthestPointFraction(1.35)).toBeCloseTo(10.27, 2)
    expect(farthestPointFraction(1.4)).toBeCloseTo(49, 6)
    expect(farthestPointFraction(Math.SQRT2)).toBe(Infinity)
    expect(farthestPointFraction(2)).toBe(Infinity)
  })

  it('a falling-in push comes inside the collision size', () => {
    expect(closestApproachFraction(0.2)).toBeCloseTo(0.0204, 4)
    expect(closestApproachFraction(0.2)).toBeLessThan(COLLISION_RADIUS_FACTOR)
    expect(closestApproachFraction(0.45)).toBeCloseTo(0.1127, 4)
    expect(closestApproachFraction(0.45)).toBeGreaterThan(COLLISION_RADIUS_FACTOR)
    expect(closestApproachFraction(0)).toBe(0)
    expect(closestApproachFraction(1)).toBe(1)
    expect(closestApproachFraction(2)).toBe(1)
  })

  it('the edge for other collision sizes (for the check-up note): 0.2 gives 0.577, 0.05 gives 0.309', () => {
    expect(pushEdgeForCollisionSize(0.2)).toBeCloseTo(0.5774, 4)
    expect(pushEdgeForCollisionSize(0.05)).toBeCloseTo(0.3086, 4)
    expect(pushEdgeForCollisionSize(COLLISION_RADIUS_FACTOR)).toBeCloseTo(pushEdges().fallsInBelow, 12)
    expect(() => pushEdgeForCollisionSize(0)).toThrow(RangeError)
    expect(() => pushEdgeForCollisionSize(1)).toThrow(RangeError)
  })

  it('Part 1: a very weak push falls in, a very strong one flies away, and the middle one orbits', () => {
    expect(PART_ONE_PUSHES).toEqual({ weak: 0.2, strong: 2, inBetween: 1 })
    const real = partOneOutcomes()
    expect(real.weak).toBe('falls-in')
    expect(real.strong).toBe('escapes')
    expect(real.inBetween).toBe('orbits')
    expect(real.somethingDifferentInBetween).toBe(true)
  })

  it('guess markers follow every guess and never depend on the real results', () => {
    const outcomes: OrbitOutcome[] = ['falls-in', 'escapes', 'orbits']
    const answers: YesNo[] = ['yes', 'no']
    for (const weak of outcomes) {
      for (const strong of outcomes) {
        for (const middle of answers) {
          const marks = guessMarkers(weak, strong, middle)
          expect(marks.weak).toEqual({ pushFraction: 0.2, row: weak })
          expect(marks.strong).toEqual({ pushFraction: 2, row: strong })
          expect(marks.inBetween).toEqual({ pushFraction: 1, choice: middle })
        }
      }
    }
  })

  it('tutor marking checks each guess against the real result, in all combinations', () => {
    const outcomes: OrbitOutcome[] = ['falls-in', 'escapes', 'orbits']
    const answers: YesNo[] = ['yes', 'no']
    for (const weak of outcomes) {
      for (const strong of outcomes) {
        for (const middle of answers) {
          const marking = tutorMarking(weak, strong, middle)
          expect(marking.weak.actual).toBe('falls-in')
          expect(marking.weak.matches).toBe(weak === 'falls-in')
          expect(marking.strong.actual).toBe('escapes')
          expect(marking.strong.matches).toBe(strong === 'escapes')
          expect(marking.inBetween.actual).toBe('yes')
          expect(marking.inBetween.matches).toBe(middle === 'yes')
        }
      }
    }
  })

  it('pushSummary gathers one push in one record, for the results and captions', () => {
    const summary = pushSummary(0.6)
    expect(summary.outcome).toBe('orbits')
    expect(summary.closestApproach).toBeCloseTo(0.36 / 1.64, 9)
    expect(summary.farthestPoint).toBe(1)
    expect(pushSummary(2)).toMatchObject({ outcome: 'escapes', closestApproach: 1, farthestPoint: Infinity })
  })

  it('circular speed matches the closed form and invalid inputs throw', () => {
    expect(circularSpeedFor(1, 1)).toBe(1)
    expect(circularSpeedFor(4, 1)).toBe(2)
    expect(circularSpeedFor(1, 4)).toBeCloseTo(0.5, 12)
    expect(() => circularSpeedFor(0, 1)).toThrow(RangeError)
    expect(() => circularSpeedFor(1, 0)).toThrow(RangeError)
    expect(() => outcomeForPush(-0.1)).toThrow(RangeError)
    expect(() => outcomeForPush(Number.NaN)).toThrow(RangeError)
    expect(() => outcomeSweep(0)).toThrow(RangeError)
    expect(() => closestApproachFraction(-1)).toThrow(RangeError)
    expect(() => farthestPointFraction(-1)).toThrow(RangeError)
  })

  it('away from the edges, the outcome does not depend on the mass\'s pull or the start distance, only on the push as a fraction of circular speed', () => {
    // The closed forms for the edges contain no pull and no distance. The stepping uses one fixed time step, so right at an edge it
    // can differ by a point or so when the pull is 4 (faster motion, coarser steps); the checks therefore stay a few points away.
    for (const gm of [0.5, 1, 4]) {
      for (const distance of [1, 3]) {
        const circular = circularSpeedFor(gm, distance)
        const outcomeAt = (fraction: number) => runOrbitExperiment(gm, distance, fraction * circular).outcome
        expect(outcomeAt(0.38)).toBe('falls-in')
        expect(outcomeAt(0.45)).toBe('orbits')
        expect(outcomeAt(1.38)).toBe('orbits')
        expect(outcomeAt(1.46)).toBe('escapes')
      }
    }
    expect(circularSpeedFor(4, 1)).toBe(2)
  })

  it('is deterministic across repeated calls', () => {
    expect(outcomeSweep(0.1)).toEqual(outcomeSweep(0.1))
    expect(edgeCheck()).toEqual(edgeCheck())
  })
})
