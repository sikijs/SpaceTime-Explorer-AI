import { describe, it, expect } from 'vitest'
import {
  intervalSquared,
  runIntervalExperiment,
  guessMarkerOnScale,
  intervalFractionOnScale,
  checkUpRows,
  INTERVAL_SCALE_END,
} from './spacetimeInterval'
import type { IntervalGuess } from './spacetimeInterval'
import { timeDilationFactorFor } from './movingClockExperiment'
import { runMovingClockExperiment } from './movingClockExperiment'

const CLOCK_SPEEDS = [0, 0.01, 0.3, 0.5, 0.6, 0.9, 0.99, 0.999]
const PASSING_SPEEDS = [-0.99, -0.8, -0.5, 0, 0.3, 0.5, 0.8, 0.99]

describe('Spacetime interval physics (Spacetime Geometry, Experiment 1)', () => {
  it('intervalSquared is time² − distance² for hand-calculated events', () => {
    expect(intervalSquared({ position: 0, time: 0 }, { position: 0.75, time: 1.25 })).toBeCloseTo(1, 12)
    expect(intervalSquared({ position: 0, time: 0 }, { position: 3, time: 5 })).toBe(16)
    expect(intervalSquared({ position: 1, time: 2 }, { position: 1, time: 5 })).toBe(9)
  })

  it('matches the worked example at 0.6c: 1.25 s, 0.75 light-seconds, 1.5625 − 0.5625 = 1', () => {
    const result = runIntervalExperiment(0.6, 0)
    expect(result.lab.timeBetween).toBeCloseTo(1.25, 12)
    expect(result.lab.distanceBetween).toBeCloseTo(0.75, 12)
    expect(result.lab.timeBetween ** 2).toBeCloseTo(1.5625, 12)
    expect(result.lab.distanceBetween ** 2).toBeCloseTo(0.5625, 12)
    expect(result.lab.intervalSquared).toBeCloseTo(1, 12)
  })

  it('at v = 0 the lab and the clock frame agree on everything, and the interval squared is 1', () => {
    const result = runIntervalExperiment(0, 0.5)
    expect(result.lab.timeBetween).toBeCloseTo(1, 12)
    expect(result.lab.distanceBetween).toBeCloseTo(0, 12)
    expect(result.clockFrame.timeBetween).toBeCloseTo(result.lab.timeBetween, 12)
    expect(result.clockFrame.distanceBetween).toBeCloseTo(result.lab.distanceBetween, 12)
    expect(result.lab.intervalSquared).toBeCloseTo(1, 12)
  })

  it('gives interval squared = 1 for the lab, the clock frame and the passing observer at every tested speed', () => {
    CLOCK_SPEEDS.forEach((v) => {
      PASSING_SPEEDS.forEach((u) => {
        const result = runIntervalExperiment(v, u)
        expect(result.lab.intervalSquared).toBeCloseTo(1, 9)
        expect(result.clockFrame.intervalSquared).toBeCloseTo(1, 9)
        expect(result.passing.intervalSquared).toBeCloseTo(1, 9)
      })
    })
  })

  it('when the passing observer moves with the clock (u = v), the two readings are identical', () => {
    CLOCK_SPEEDS.forEach((v) => {
      const result = runIntervalExperiment(v, v)
      expect(result.passing.timeBetween).toBeCloseTo(result.clockFrame.timeBetween, 12)
      expect(result.passing.distanceBetween).toBeCloseTo(result.clockFrame.distanceBetween, 12)
    })
  })

  it('the lab numbers agree with Experiment 3: lab time = 1 ÷ factor, distance = v × lab time', () => {
    CLOCK_SPEEDS.forEach((v) => {
      const result = runIntervalExperiment(v, 0)
      expect(result.lab.timeBetween).toBeCloseTo(1 / timeDilationFactorFor(v), 12)
      expect(result.lab.distanceBetween).toBeCloseTo(v * result.lab.timeBetween, 12)
      // Experiment 3's own run: a lab duration of this length gives a moving-clock time of 1 second.
      const exp3 = runMovingClockExperiment(result.lab.timeBetween, v)
      expect(exp3.movingClockElapsedTime).toBeCloseTo(1, 12)
    })
  })

  it("the clock frame's reading is time 1, distance 0", () => {
    CLOCK_SPEEDS.forEach((v) => {
      const result = runIntervalExperiment(v, 0.5)
      expect(result.clockFrame.timeBetween).toBeCloseTo(1, 9)
      expect(result.clockFrame.distanceBetween).toBeCloseTo(0, 9)
    })
  })

  it('time and distance differ between observers whose speeds differ (the test fails if all were equal)', () => {
    const result = runIntervalExperiment(0.6, 0.8)
    const times = [result.lab.timeBetween, result.clockFrame.timeBetween, result.passing.timeBetween]
    const distances = [result.lab.distanceBetween, result.clockFrame.distanceBetween, result.passing.distanceBetween]
    expect(new Set(times.map((t) => t.toFixed(6))).size).toBe(3)
    expect(new Set(distances.map((d) => d.toFixed(6))).size).toBe(3)
  })

  it('throws RangeError for speeds out of range', () => {
    expect(() => runIntervalExperiment(-0.1, 0)).toThrow(RangeError)
    expect(() => runIntervalExperiment(1, 0)).toThrow(RangeError)
    expect(() => runIntervalExperiment(1.2, 0)).toThrow(RangeError)
    expect(() => runIntervalExperiment(NaN, 0)).toThrow(RangeError)
    expect(() => runIntervalExperiment(0.5, 1)).toThrow(RangeError)
    expect(() => runIntervalExperiment(0.5, -1)).toThrow(RangeError)
    expect(() => runIntervalExperiment(0.5, NaN)).toThrow(RangeError)
  })

  it('is a pure function of (v, u): repeated runs give identical results', () => {
    expect(runIntervalExperiment(0.9, -0.5)).toEqual(runIntervalExperiment(0.9, -0.5))
  })
})

describe('Guess mark and check-up numbers (Spacetime Geometry 1, audit update)', () => {
  const part1 = runIntervalExperiment(0.6, 0.5)

  it('the side scale ends at 2, so a real value of 1.00 sits at half the scale', () => {
    expect(INTERVAL_SCALE_END).toBe(2)
    expect(intervalFractionOnScale(part1.clockFrame.intervalSquared)).toBeCloseTo(0.5, 12)
  })

  it('the marker for "same" lands on the clock-frame value, "bigger" above it and "smaller" below it', () => {
    const same = guessMarkerOnScale(part1, 'same')
    const bigger = guessMarkerOnScale(part1, 'bigger')
    const smaller = guessMarkerOnScale(part1, 'smaller')
    expect(same.markerValue).toBeCloseTo(part1.clockFrame.intervalSquared, 12)
    expect(bigger.markerValue).toBeCloseTo(1.5, 12)
    expect(smaller.markerValue).toBeCloseTo(0.5, 12)
    expect(bigger.markerValue).toBeGreaterThan(same.markerValue)
    expect(smaller.markerValue).toBeLessThan(same.markerValue)
  })

  it('the marker positions are 0.75, 0.5 and 0.25 of the scale for bigger, same and smaller', () => {
    expect(guessMarkerOnScale(part1, 'bigger').markerFraction).toBeCloseTo(0.75, 12)
    expect(guessMarkerOnScale(part1, 'same').markerFraction).toBeCloseTo(0.5, 12)
    expect(guessMarkerOnScale(part1, 'smaller').markerFraction).toBeCloseTo(0.25, 12)
  })

  it('the real values do not depend on the guess', () => {
    const guesses: IntervalGuess[] = ['bigger', 'same', 'smaller']
    guesses.forEach((g) => {
      const marker = guessMarkerOnScale(part1, g)
      expect(marker.labValue).toBeCloseTo(1, 12)
      expect(marker.clockFrameValue).toBeCloseTo(1, 12)
    })
    expect(runIntervalExperiment(0.6, 0.5)).toEqual(part1)
    expect(part1.lab.timeBetween).toBeCloseTo(1.25, 12)
    expect(part1.lab.distanceBetween).toBeCloseTo(0.75, 12)
    expect(part1.passing.intervalSquared).toBeCloseTo(1, 12)
  })

  it('the check-up expects 1 (the clock face time squared) and finds the same for all three observers at many speeds', () => {
    CLOCK_SPEEDS.forEach((v) => {
      PASSING_SPEEDS.forEach((u) => {
        const rows = checkUpRows(runIntervalExperiment(v, u))
        expect(rows.map((r) => r.observer)).toEqual(['lab', 'clockFrame', 'passing'])
        rows.forEach((r) => {
          expect(r.expected).toBe(1)
          expect(r.found).toBeCloseTo(1, 9)
          expect(r.reading).toBe('the same')
        })
      })
    })
  })

  it('the check-up reads "different" when a found value really differs from the expected one', () => {
    const tampered = { ...part1, lab: { ...part1.lab, intervalSquared: 1.5 } }
    expect(checkUpRows(tampered)[0].reading).toBe('different')
    expect(checkUpRows(tampered)[1].reading).toBe('the same')
  })

  it('refuses an unknown guess', () => {
    expect(() => guessMarkerOnScale(part1, 'larger' as IntervalGuess)).toThrow(RangeError)
  })
})
