import { describe, expect, it } from 'vitest'
import { evaluateBlackHole, SPEED_OF_LIGHT } from './blackHoleExperiment'
import { runLightBendingExperiment } from './lightBendingExperiment'

describe('runLightBendingExperiment', () => {
  it('matches the closed-form Newtonian deflection formula', () => {
    const cases: [number, number][] = [
      [1, 2],
      [1, 4],
      [2, 4],
      [4, 8],
    ]
    for (const [gm, aimDistance] of cases) {
      const result = runLightBendingExperiment(gm, aimDistance)
      expect(result.newtonianDeflectionAngle).toBeCloseTo(
        (2 * gm) / (SPEED_OF_LIGHT ** 2 * aimDistance),
        9
      )
    }
  })

  it('has a general-relativistic angle exactly double the Newtonian one', () => {
    const cases: [number, number][] = [
      [1, 2],
      [1, 4],
      [2, 4],
      [4, 8],
    ]
    for (const [gm, aimDistance] of cases) {
      const result = runLightBendingExperiment(gm, aimDistance)
      expect(result.generalRelativisticDeflectionAngle).toBeCloseTo(
        2 * result.newtonianDeflectionAngle,
        12
      )
    }
  })

  it('decreases the Newtonian deflection angle as aim distance increases, gm fixed', () => {
    const values = [1, 2, 4, 8, 16].map(
      (aimDistance) => runLightBendingExperiment(1, aimDistance).newtonianDeflectionAngle
    )
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeLessThan(values[i - 1])
    }
  })

  it('increases the Newtonian deflection angle as gravitationalParameter increases, aim distance fixed', () => {
    const values = [0.5, 1, 2, 4, 8].map(
      (gm) => runLightBendingExperiment(gm, 4).newtonianDeflectionAngle
    )
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1])
    }
  })

  it('agrees with the Newtonian formula within tolerance at aim distances well outside the horizon', () => {
    const gm = 1
    const horizon = evaluateBlackHole(gm, 1).eventHorizonRadius
    for (const aimDistance of [4, 6, 8]) {
      expect(aimDistance).toBeGreaterThan(horizon * 5)
      const result = runLightBendingExperiment(gm, aimDistance)
      expect(result.outcome).toBe('deflects')
      expect(result.simulatedDeflectionAngle).not.toBeNull()
      expect(result.simulatedDeflectionAngle!).toBeCloseTo(result.newtonianDeflectionAngle, 1)
    }
  })

  it('falls in for a small enough aim distance, and deflects for a large enough one', () => {
    // The true falls-in/deflects boundary is somewhat larger than the event horizon radius
    // itself — gravity bends the path enough that its closest approach is smaller than the aim
    // distance (gravitational focusing) — so this only checks well-separated cases, not an exact
    // cutoff at the horizon.
    const gm = 1
    const horizon = evaluateBlackHole(gm, 1).eventHorizonRadius

    const fallsIn = runLightBendingExperiment(gm, horizon * 0.5)
    expect(fallsIn.outcome).toBe('falls-in')

    const deflects = runLightBendingExperiment(gm, horizon * 10)
    expect(deflects.outcome).toBe('deflects')
  })

  it('has a null simulatedDeflectionAngle in the falls-in case', () => {
    const gm = 1
    const horizon = evaluateBlackHole(gm, 1).eventHorizonRadius
    const result = runLightBendingExperiment(gm, horizon * 0.5)

    expect(result.outcome).toBe('falls-in')
    expect(result.simulatedDeflectionAngle).toBeNull()
  })

  it('has a monotonically increasing x once far past the mass in the deflects case', () => {
    const result = runLightBendingExperiment(1, 4)
    expect(result.outcome).toBe('deflects')

    const trajectory = result.trajectory
    const last = trajectory.length - 1
    for (let i = last - 20; i < last; i++) {
      expect(trajectory[i + 1].x).toBeGreaterThan(trajectory[i].x)
    }
  })

  it('is deterministic across repeated calls for the same inputs', () => {
    const a = runLightBendingExperiment(1, 4)
    const b = runLightBendingExperiment(1, 4)

    expect(a.outcome).toBe(b.outcome)
    expect(a.trajectory.length).toBe(b.trajectory.length)
    for (let i = 0; i < a.trajectory.length; i++) {
      expect(a.trajectory[i]).toEqual(b.trajectory[i])
    }
  })

  it('throws for invalid inputs', () => {
    expect(() => runLightBendingExperiment(0, 1)).toThrow(RangeError)
    expect(() => runLightBendingExperiment(-1, 1)).toThrow(RangeError)
    expect(() => runLightBendingExperiment(1, 0)).toThrow(RangeError)
    expect(() => runLightBendingExperiment(1, -1)).toThrow(RangeError)
  })
})
