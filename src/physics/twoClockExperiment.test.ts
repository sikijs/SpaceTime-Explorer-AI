import { describe, it, expect } from 'vitest'
import { runTwoClockExperiment } from './twoClockExperiment'

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
