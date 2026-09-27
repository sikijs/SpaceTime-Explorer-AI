import { describe, expect, it } from 'vitest'
import {
  evaluateBlackHole,
  runRadialLightSpeedLaunch,
  SPEED_OF_LIGHT,
} from './blackHoleExperiment'

describe('evaluateBlackHole', () => {
  it('has escapeSpeedFractionOfC of 1 exactly at the threshold mass, and toggles isInsideHorizon around it', () => {
    const distance = 1
    const thresholdGm = (SPEED_OF_LIGHT ** 2 * distance) / 2

    const atThreshold = evaluateBlackHole(thresholdGm, distance)
    expect(atThreshold.escapeSpeedFractionOfC).toBeCloseTo(1, 9)

    const below = evaluateBlackHole(thresholdGm * 0.9, distance)
    expect(below.isInsideHorizon).toBe(false)

    const above = evaluateBlackHole(thresholdGm * 1.1, distance)
    expect(above.isInsideHorizon).toBe(true)
  })

  it('increases escapeSpeedFractionOfC as gravitationalParameter increases, distance fixed', () => {
    const distance = 1
    const values = [0.5, 1, 2, 4, 8].map(
      (gm) => evaluateBlackHole(gm, distance).escapeSpeedFractionOfC
    )
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1])
    }
  })

  it('increases eventHorizonRadius as gravitationalParameter increases', () => {
    const values = [0.5, 1, 2, 4, 8].map((gm) => evaluateBlackHole(gm, 1).eventHorizonRadius)
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1])
    }
  })

  it('matches the closed-form event horizon formula', () => {
    for (const gm of [0.5, 1, 2, 4, 8]) {
      const result = evaluateBlackHole(gm, 1)
      expect(result.eventHorizonRadius).toBeCloseTo((2 * gm) / SPEED_OF_LIGHT ** 2, 9)
    }
  })

  it('matches Experiment 6\'s escape speed formula', () => {
    const cases: [number, number][] = [
      [1, 1],
      [4, 1],
      [1, 2],
      [9, 3],
    ]
    for (const [gm, distance] of cases) {
      const result = evaluateBlackHole(gm, distance)
      expect(result.escapeSpeed).toBeCloseTo(Math.sqrt((2 * gm) / distance), 9)
    }
  })

  it('is inside the horizon exactly when distance <= eventHorizonRadius', () => {
    const cases: [number, number][] = [
      [0.5, 1],
      [1, 1],
      [2, 1],
      [1, 5],
      [10, 0.5],
    ]
    for (const [gm, distance] of cases) {
      const result = evaluateBlackHole(gm, distance)
      expect(result.isInsideHorizon).toBe(distance <= result.eventHorizonRadius)
      expect(result.isInsideHorizon).toBe(result.escapeSpeedFractionOfC >= 1)
    }
  })

  it('throws for invalid inputs', () => {
    expect(() => evaluateBlackHole(0, 1)).toThrow(RangeError)
    expect(() => evaluateBlackHole(-1, 1)).toThrow(RangeError)
    expect(() => evaluateBlackHole(1, 0)).toThrow(RangeError)
    expect(() => evaluateBlackHole(1, -1)).toThrow(RangeError)
  })
})

describe('runRadialLightSpeedLaunch', () => {
  it('agrees with evaluateBlackHole\'s isInsideHorizon for several cases', () => {
    const distance = 1
    const cases = [0.1, 0.5, 1, 5, 10]
    for (const gm of cases) {
      const evaluation = evaluateBlackHole(gm, distance)
      const launch = runRadialLightSpeedLaunch(gm, distance)
      expect(launch.outcome).toBe(evaluation.isInsideHorizon ? 'falls-back' : 'escapes')
    }
  })

  it('rises then falls back to the start distance in the falls-back case', () => {
    const distance = 1
    const gm = (SPEED_OF_LIGHT ** 2 * distance) / 2 / 0.5 // well inside the horizon
    const result = runRadialLightSpeedLaunch(gm, distance)

    expect(result.outcome).toBe('falls-back')

    let maxDistance = -Infinity
    let maxIndex = -1
    result.trajectory.forEach((point, index) => {
      if (point.distance > maxDistance) {
        maxDistance = point.distance
        maxIndex = index
      }
    })

    expect(maxDistance).toBeGreaterThan(distance)
    expect(maxIndex).toBeGreaterThan(0)
    expect(maxIndex).toBeLessThan(result.trajectory.length - 1)

    // Strictly rising before the peak, strictly falling after it.
    for (let i = 1; i <= maxIndex; i++) {
      expect(result.trajectory[i].distance).toBeGreaterThan(result.trajectory[i - 1].distance)
    }
    for (let i = maxIndex + 1; i < result.trajectory.length; i++) {
      expect(result.trajectory[i].distance).toBeLessThan(result.trajectory[i - 1].distance)
    }

    const last = result.trajectory[result.trajectory.length - 1]
    expect(last.distance).toBeLessThanOrEqual(distance)
  })

  it('is still increasing at the last recorded point in the escapes case', () => {
    const distance = 1
    const gm = (SPEED_OF_LIGHT ** 2 * distance) / 2 / 2 // well outside the horizon
    const result = runRadialLightSpeedLaunch(gm, distance)

    expect(result.outcome).toBe('escapes')
    const last = result.trajectory[result.trajectory.length - 1]
    const secondLast = result.trajectory[result.trajectory.length - 2]
    expect(last.distance).toBeGreaterThan(secondLast.distance)
  })

  it('is deterministic across repeated calls for the same inputs', () => {
    const a = runRadialLightSpeedLaunch(1, 1)
    const b = runRadialLightSpeedLaunch(1, 1)

    expect(a.outcome).toBe(b.outcome)
    expect(a.trajectory.length).toBe(b.trajectory.length)
    for (let i = 0; i < a.trajectory.length; i++) {
      expect(a.trajectory[i]).toEqual(b.trajectory[i])
    }
  })

  it('throws for invalid inputs', () => {
    expect(() => runRadialLightSpeedLaunch(0, 1)).toThrow(RangeError)
    expect(() => runRadialLightSpeedLaunch(-1, 1)).toThrow(RangeError)
    expect(() => runRadialLightSpeedLaunch(1, 0)).toThrow(RangeError)
    expect(() => runRadialLightSpeedLaunch(1, -1)).toThrow(RangeError)
  })
})
