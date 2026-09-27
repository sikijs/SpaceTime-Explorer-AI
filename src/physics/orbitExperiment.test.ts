import { describe, expect, it } from 'vitest'
import { runOrbitExperiment } from './orbitExperiment'

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
