import { describe, it, expect } from 'vitest'
import { clockReadingsAt, guessPositionsOnStrip, runTwoClockExperiment, twoClockStripScaleEnd } from './twoClockExperiment'

describe('Two Clock Experiment Physics', () => {
  it('both clocks start at zero', () => {
    const result = runTwoClockExperiment(10)
    expect(result.startEvent.clockReadingA).toBe(0)
    expect(result.startEvent.clockReadingB).toBe(0)
  })

  it('both clocks measure the same elapsed time', () => {
    const duration = 10
    const result = runTwoClockExperiment(duration)
    expect(result.elapsedTimeA).toBe(duration)
    expect(result.elapsedTimeB).toBe(duration)
    expect(result.elapsedTimeA).toBe(result.elapsedTimeB)
  })

  it('difference between clock readings is zero', () => {
    const result = runTwoClockExperiment(10)
    expect(result.difference).toBe(0)
  })

  it('both clocks show same final reading', () => {
    const duration = 20
    const result = runTwoClockExperiment(duration)
    expect(result.endEvent.clockReadingA).toBe(duration)
    expect(result.endEvent.clockReadingB).toBe(duration)
  })

  it('handles various durations correctly', () => {
    const durations = [5, 10, 20, 30, 45, 60]
    durations.forEach((duration) => {
      const result = runTwoClockExperiment(duration)
      expect(result.elapsedTimeA).toBe(duration)
      expect(result.elapsedTimeB).toBe(duration)
      expect(result.difference).toBe(0)
    })
  })

  it('maintains synchronization at any time point', () => {
    const result = runTwoClockExperiment(15)
    // At the end event, both clocks should read the same
    expect(result.endEvent.clockReadingA).toBe(result.endEvent.clockReadingB)
  })

  it('stores experiment duration correctly', () => {
    const duration = 25
    const result = runTwoClockExperiment(duration)
    expect(result.experimentDuration).toBe(duration)
  })

  it('records start event with zero simulation time', () => {
    const result = runTwoClockExperiment(10)
    expect(result.startEvent.simulationTime).toBe(0)
  })

  it('records end event with correct simulation time', () => {
    const duration = 10
    const result = runTwoClockExperiment(duration)
    expect(result.endEvent.simulationTime).toBe(duration)
  })
})

describe('clockReadingsAt', () => {
  it('reads both clocks at 0, halfway and at the duration', () => {
    expect(clockReadingsAt(10, 0)).toEqual({ clockReadingA: 0, clockReadingB: 0 })
    expect(clockReadingsAt(10, 5)).toEqual({ clockReadingA: 5, clockReadingB: 5 })
    expect(clockReadingsAt(10, 10)).toEqual({ clockReadingA: 10, clockReadingB: 10 })
  })

  it('keeps the two clocks equal at every sampled time, for each duration', () => {
    for (const duration of [5, 10, 20, 30, 60]) {
      for (let i = 0; i <= 20; i++) {
        const readings = clockReadingsAt(duration, (i / 20) * duration)
        expect(readings.clockReadingA).toBe(readings.clockReadingB)
        expect(readings.clockReadingA).toBeCloseTo((i / 20) * duration, 10)
      }
    }
  })

  it('stays within 0 and the duration for a time outside the run', () => {
    expect(clockReadingsAt(10, -3).clockReadingA).toBe(0)
    expect(clockReadingsAt(10, 99).clockReadingB).toBe(10)
  })
})

describe('guessPositionsOnStrip', () => {
  it('ends the strip scale at twice the duration', () => {
    expect(twoClockStripScaleEnd(5)).toBe(10)
    expect(twoClockStripScaleEnd(10)).toBe(20)
    expect(twoClockStripScaleEnd(30)).toBe(60)
    expect(guessPositionsOnStrip(10, 0, 0).scaleEnd).toBe(20)
  })

  it('places each clock\'s guess on its own: the duration halfway, 0 at the start, twice the duration at the end', () => {
    const middle = guessPositionsOnStrip(10, 10, 10)
    expect(middle.clockA.fraction).toBe(0.5)
    expect(middle.clockB.fraction).toBe(0.5)
    const ends = guessPositionsOnStrip(10, 0, 20)
    expect(ends.clockA.fraction).toBe(0)
    expect(ends.clockB.fraction).toBe(1)
    const mixed = guessPositionsOnStrip(10, 7, 12)
    expect(mixed.clockA.fraction).toBeCloseTo(0.35, 10)
    expect(mixed.clockB.fraction).toBeCloseTo(0.6, 10)
    expect(mixed.clockA.offEdge).toBeNull()
    expect(mixed.clockB.offEdge).toBeNull()
  })

  it('clamps a guess beyond the scale and flags the edge, for each clock separately', () => {
    const result = guessPositionsOnStrip(10, 500, -4)
    expect(result.clockA.fraction).toBe(1)
    expect(result.clockA.offEdge).toBe('right')
    expect(result.clockB.fraction).toBe(0)
    expect(result.clockB.offEdge).toBe('left')
  })

  it('gives each guess minus that clock\'s real elapsed time', () => {
    const result = guessPositionsOnStrip(10, 7, 12)
    expect(result.clockA.differenceFromReal).toBe(-3)
    expect(result.clockB.differenceFromReal).toBe(2)
  })

  it('does not change the real result whatever the guesses', () => {
    const before = runTwoClockExperiment(10)
    guessPositionsOnStrip(10, 7, 12)
    guessPositionsOnStrip(10, 500, -4)
    expect(runTwoClockExperiment(10)).toEqual(before)
  })

  it('refuses a guess that is not a finite number', () => {
    expect(() => guessPositionsOnStrip(10, NaN, 10)).toThrow()
    expect(() => guessPositionsOnStrip(10, 10, Infinity)).toThrow()
  })
})
