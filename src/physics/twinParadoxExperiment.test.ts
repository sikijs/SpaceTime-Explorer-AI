import { describe, it, expect } from 'vitest'
import { runTwinParadoxExperiment } from './twinParadoxExperiment'
import { runMovingClockExperiment } from './movingClockExperiment'

const SPEEDS = [0.01, 0.1, 0.3, 0.5, 0.6, 0.8, 0.9]
const DISTANCE = 2

describe('Twin Paradox Experiment Physics', () => {
  it('never recomputes a relativistic value: travelerElapsedTime matches runMovingClockExperiment exactly', () => {
    SPEEDS.forEach((v) => {
      const result = runTwinParadoxExperiment(DISTANCE, v)
      const directLabTime = (2 * DISTANCE) / v
      const expected = runMovingClockExperiment(directLabTime, v)

      expect(result.travelerElapsedTime).toBe(expected.movingClockElapsedTime)
      expect(result.timeDilationFactor).toBe(expected.timeDilationFactor)
    })
  })

  it('labElapsedTime equals 2 * distance / velocity exactly', () => {
    SPEEDS.forEach((v) => {
      const result = runTwinParadoxExperiment(DISTANCE, v)
      expect(result.labElapsedTime).toBeCloseTo((2 * DISTANCE) / v, 12)
    })
  })

  it('the traveling twin is always younger for v > 0, and the gap grows with speed', () => {
    let previousAgeDifference = -Infinity
    SPEEDS.forEach((v) => {
      const result = runTwinParadoxExperiment(DISTANCE, v)
      expect(result.ageDifference).toBeGreaterThan(0)
      expect(result.travelerElapsedTime).toBeLessThan(result.labElapsedTime)
      expect(result.ageDifference).toBeGreaterThan(previousAgeDifference)
      previousAgeDifference = result.ageDifference
    })
  })

  it('rejects a distance that is not greater than 0', () => {
    expect(() => runTwinParadoxExperiment(0, 0.5)).toThrow(RangeError)
    expect(() => runTwinParadoxExperiment(-1, 0.5)).toThrow(RangeError)
  })

  it('rejects velocities outside 0 < v < c, including exactly 0', () => {
    expect(() => runTwinParadoxExperiment(DISTANCE, 0)).toThrow(RangeError)
    expect(() => runTwinParadoxExperiment(DISTANCE, 1)).toThrow(RangeError)
    expect(() => runTwinParadoxExperiment(DISTANCE, -0.1)).toThrow(RangeError)
  })

  it('is deterministic and independent of any UI or animation state', () => {
    for (let v = 0.01; v < 0.99; v += 0.01) {
      const a = runTwinParadoxExperiment(DISTANCE, v)
      const b = runTwinParadoxExperiment(DISTANCE, v)
      expect(a).toEqual(b)
    }
  })
})
