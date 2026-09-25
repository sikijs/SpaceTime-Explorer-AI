import { describe, it, expect } from 'vitest'
import {
  runEquivalencePrincipleExperiment,
  ballHeightAboveFloorAt,
  EARTH_GRAVITY,
} from './equivalencePrincipleExperiment'

describe('Equivalence Principle Experiment Physics', () => {
  it('reports the acceleration in both units', () => {
    const result = runEquivalencePrincipleExperiment(EARTH_GRAVITY, 2)
    expect(result.accelerationMetersPerSecondSquared).toBe(EARTH_GRAVITY)
    expect(result.accelerationInG).toBeCloseTo(1, 10)
  })

  it('accelerationInG scales with the chosen multiple of g', () => {
    expect(runEquivalencePrincipleExperiment(0.5 * EARTH_GRAVITY, 2).accelerationInG).toBeCloseTo(0.5, 10)
    expect(runEquivalencePrincipleExperiment(2 * EARTH_GRAVITY, 2).accelerationInG).toBeCloseTo(2, 10)
  })

  it('timeToFloorSeconds matches sqrt(2 * initialHeight / acceleration)', () => {
    const result = runEquivalencePrincipleExperiment(EARTH_GRAVITY, 2)
    expect(result.timeToFloorSeconds).toBeCloseTo(Math.sqrt((2 * 2) / EARTH_GRAVITY), 12)
  })

  it('a stronger acceleration reaches the floor sooner', () => {
    const weak = runEquivalencePrincipleExperiment(0.5 * EARTH_GRAVITY, 2)
    const strong = runEquivalencePrincipleExperiment(2 * EARTH_GRAVITY, 2)
    expect(strong.timeToFloorSeconds).toBeLessThan(weak.timeToFloorSeconds)
  })

  it('a greater starting height takes longer to reach the floor, at fixed acceleration', () => {
    const low = runEquivalencePrincipleExperiment(EARTH_GRAVITY, 1)
    const high = runEquivalencePrincipleExperiment(EARTH_GRAVITY, 4)
    expect(high.timeToFloorSeconds).toBeGreaterThan(low.timeToFloorSeconds)
  })

  it('is deterministic across repeated runs', () => {
    expect(runEquivalencePrincipleExperiment(EARTH_GRAVITY, 2)).toEqual(
      runEquivalencePrincipleExperiment(EARTH_GRAVITY, 2)
    )
  })

  it('rejects non-positive acceleration', () => {
    expect(() => runEquivalencePrincipleExperiment(0, 2)).toThrow(RangeError)
    expect(() => runEquivalencePrincipleExperiment(-1, 2)).toThrow(RangeError)
    expect(() => runEquivalencePrincipleExperiment(NaN, 2)).toThrow(RangeError)
  })

  it('rejects non-positive initial height', () => {
    expect(() => runEquivalencePrincipleExperiment(EARTH_GRAVITY, 0)).toThrow(RangeError)
    expect(() => runEquivalencePrincipleExperiment(EARTH_GRAVITY, -1)).toThrow(RangeError)
    expect(() => runEquivalencePrincipleExperiment(EARTH_GRAVITY, NaN)).toThrow(RangeError)
  })
})

describe('Ball Height Above Floor Over Time', () => {
  // Two "scenes" that a real UI would frame differently (gravity vs. an accelerating
  // cabin), but which must use this exact same calculation — that identity is the point.
  const sceneA = runEquivalencePrincipleExperiment(EARTH_GRAVITY, 2)
  const sceneB = runEquivalencePrincipleExperiment(EARTH_GRAVITY, 2)

  it('starts at the initial height', () => {
    expect(ballHeightAboveFloorAt(sceneA, 0)).toBe(2)
  })

  it('reaches (approximately) zero exactly at timeToFloorSeconds', () => {
    expect(ballHeightAboveFloorAt(sceneA, sceneA.timeToFloorSeconds)).toBeCloseTo(0, 10)
  })

  it('matches the same-acceleration formula: y0 - 0.5 * a * t^2', () => {
    ;[0.1, 0.2, 0.3].forEach((t) => {
      expect(ballHeightAboveFloorAt(sceneA, t)).toBeCloseTo(2 - 0.5 * EARTH_GRAVITY * t * t, 12)
    })
  })

  it('produces identical curves for two scenes given the same acceleration and height', () => {
    ;[0, 0.1, 0.2, 0.3, sceneA.timeToFloorSeconds].forEach((t) => {
      expect(ballHeightAboveFloorAt(sceneA, t)).toBeCloseTo(ballHeightAboveFloorAt(sceneB, t), 12)
    })
  })

  it('a stronger acceleration produces a lower height at the same elapsed time', () => {
    const weak = runEquivalencePrincipleExperiment(0.5 * EARTH_GRAVITY, 2)
    const strong = runEquivalencePrincipleExperiment(2 * EARTH_GRAVITY, 2)
    expect(ballHeightAboveFloorAt(strong, 0.2)).toBeLessThan(ballHeightAboveFloorAt(weak, 0.2))
  })

  it('height decreases monotonically over the run', () => {
    const times = [0, 0.05, 0.1, 0.15, 0.2]
    const heights = times.map((t) => ballHeightAboveFloorAt(sceneA, t))
    for (let i = 1; i < heights.length; i++) {
      expect(heights[i]).toBeLessThan(heights[i - 1])
    }
  })

  it('rejects elapsed times outside the run', () => {
    expect(() => ballHeightAboveFloorAt(sceneA, -0.1)).toThrow(RangeError)
    expect(() => ballHeightAboveFloorAt(sceneA, sceneA.timeToFloorSeconds + 0.1)).toThrow(RangeError)
    expect(() => ballHeightAboveFloorAt(sceneA, NaN)).toThrow(RangeError)
  })

  it('is deterministic', () => {
    expect(ballHeightAboveFloorAt(sceneA, 0.15)).toEqual(ballHeightAboveFloorAt(sceneA, 0.15))
  })
})
