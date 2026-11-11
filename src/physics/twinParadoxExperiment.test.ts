import { describe, it, expect } from 'vitest'
import {
  runTwinParadoxExperiment,
  olderTwin,
  twinClocksAt,
  twinBarScaleEnd,
  guessMarkerFor,
  markTwinGuess,
  twinWorkedNumbers,
} from './twinParadoxExperiment'
import type { TwinOutcome } from './twinParadoxExperiment'
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

describe('Twin Paradox: pieces for the picture, the marker and the tutor', () => {
  const GUESSES: TwinOutcome[] = ['sameAge', 'earthOlder', 'travelerOlder']

  it('olderTwin is earthOlder at every speed, never sameAge, as the physics gives', () => {
    SPEEDS.forEach((v) => {
      const result = runTwinParadoxExperiment(DISTANCE, v)
      expect(result.travelerElapsedTime).toBeLessThan(result.labElapsedTime)
      expect(olderTwin(result)).toBe('earthOlder')
    })
  })

  it('olderTwin follows the sign of the gap (sameAge only at a gap of 0)', () => {
    const base = runTwinParadoxExperiment(DISTANCE, 0.5)
    expect(olderTwin({ ...base, ageDifference: 0 })).toBe('sameAge')
    expect(olderTwin({ ...base, ageDifference: -1 })).toBe('travelerOlder')
  })

  it('both clocks start at 0 and end at the run totals', () => {
    SPEEDS.forEach((v) => {
      const result = runTwinParadoxExperiment(DISTANCE, v)
      const start = twinClocksAt(result, 0)
      const end = twinClocksAt(result, 1)
      expect(start.earthClockReading).toBe(0)
      expect(start.travelerClockReading).toBe(0)
      expect(end.earthClockReading).toBe(result.labElapsedTime)
      expect(end.travelerClockReading).toBe(result.travelerElapsedTime)
      expect(end.gap).toBeCloseTo(result.ageDifference, 12)
    })
  })

  it('the traveling clock never reads more than the Earth clock, and the gap only grows', () => {
    const result = runTwinParadoxExperiment(DISTANCE, 0.5)
    let previousGap = -1
    for (let i = 0; i <= 10; i++) {
      const state = twinClocksAt(result, i / 10)
      expect(state.travelerClockReading).toBeLessThanOrEqual(state.earthClockReading)
      expect(state.gap).toBeGreaterThanOrEqual(previousGap)
      previousGap = state.gap
    }
  })

  it('rejects a fraction outside 0 to 1', () => {
    const result = runTwinParadoxExperiment(DISTANCE, 0.5)
    expect(() => twinClocksAt(result, -0.1)).toThrow(RangeError)
    expect(() => twinClocksAt(result, 1.1)).toThrow(RangeError)
  })

  it('the bars share one scale that fits the longer (Earth) bar', () => {
    SPEEDS.forEach((v) => {
      const result = runTwinParadoxExperiment(DISTANCE, v)
      expect(twinBarScaleEnd(result)).toBe(result.labElapsedTime)
      expect(twinBarScaleEnd(result)).toBeGreaterThan(result.travelerElapsedTime)
    })
  })

  it('the guess marker points by choice and changes no real value', () => {
    expect(guessMarkerFor('sameAge')).toBe('level')
    expect(guessMarkerFor('earthOlder')).toBe('toEarthBar')
    expect(guessMarkerFor('travelerOlder')).toBe('toTravelerBar')
    const before = runTwinParadoxExperiment(DISTANCE, 0.5)
    GUESSES.forEach((g) => guessMarkerFor(g))
    expect(runTwinParadoxExperiment(DISTANCE, 0.5)).toEqual(before)
  })

  it('the tutor marking compares the guess with the run, for every guess', () => {
    const result = runTwinParadoxExperiment(DISTANCE, 0.5)
    expect(markTwinGuess('earthOlder', result)).toEqual({
      guessed: 'earthOlder',
      actual: 'earthOlder',
      guessedActual: true,
    })
    expect(markTwinGuess('sameAge', result).guessedActual).toBe(false)
    expect(markTwinGuess('travelerOlder', result).guessedActual).toBe(false)
    expect(markTwinGuess('travelerOlder', result).actual).toBe('earthOlder')
  })

  it('the worked numbers reproduce the page figures at 0.5c and 0.8c', () => {
    const half = twinWorkedNumbers(DISTANCE, 0.5)
    expect(half.oneWayLabTime).toBeCloseTo(4, 12)
    expect(half.roundTripLabTime).toBeCloseTo(8, 12)
    expect(half.factor).toBeCloseTo(0.866, 3)
    expect(half.travelerElapsedTime).toBeCloseTo(6.928, 3)
    expect(half.gap).toBeCloseTo(1.072, 3)

    const fast = twinWorkedNumbers(DISTANCE, 0.8)
    expect(fast.oneWayLabTime).toBeCloseTo(2.5, 12)
    expect(fast.roundTripLabTime).toBeCloseTo(5, 12)
    expect(fast.oneMinusVSquared).toBeCloseTo(0.36, 12)
    expect(fast.factor).toBeCloseTo(0.6, 12)
    expect(fast.travelerElapsedTime).toBeCloseTo(3, 12)
    expect(fast.gap).toBeCloseTo(2, 12)
  })

  it('the gaps quoted for the preset speeds match the module', () => {
    const gaps: Array<[number, number, number, number]> = [
      [0.1, 40, 39.799, 0.201],
      [0.3, 13.333, 12.719, 0.614],
    ]
    gaps.forEach(([v, lab, traveler, gap]) => {
      const r = runTwinParadoxExperiment(DISTANCE, v)
      expect(r.labElapsedTime).toBeCloseTo(lab, 3)
      expect(r.travelerElapsedTime).toBeCloseTo(traveler, 3)
      expect(r.ageDifference).toBeCloseTo(gap, 3)
    })
  })

  it('is deterministic: the same call gives the same numbers', () => {
    const result = runTwinParadoxExperiment(DISTANCE, 0.5)
    expect(twinClocksAt(result, 0.37)).toEqual(twinClocksAt(result, 0.37))
    expect(twinWorkedNumbers(DISTANCE, 0.5)).toEqual(twinWorkedNumbers(DISTANCE, 0.5))
  })
})
