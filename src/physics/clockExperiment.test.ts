import { describe, expect, it } from 'vitest'
import { runClockExperiment } from './clockExperiment'

describe('runClockExperiment', () => {
  it('produces zero elapsed clock time for a zero-duration experiment', () => {
    const result = runClockExperiment(0)
    expect(result.elapsedTime).toBe(0)
  })

  it('produces 5 seconds of elapsed clock time for a 5-second experiment', () => {
    const result = runClockExperiment(5)
    expect(result.elapsedTime).toBe(5)
  })

  it('produces 10 seconds of elapsed clock time for a 10-second experiment', () => {
    const result = runClockExperiment(10)
    expect(result.elapsedTime).toBe(10)
  })

  it('produces 30 seconds of elapsed clock time for a 30-second experiment', () => {
    const result = runClockExperiment(30)
    expect(result.elapsedTime).toBe(30)
  })

  it('starts every experiment with an initial clock reading of zero', () => {
    const result = runClockExperiment(10)
    expect(result.initialClockReading).toBe(0)
    expect(result.startEvent.clockReading).toBe(0)
  })

  it('sets the final clock reading to the initial reading plus elapsed time', () => {
    const result = runClockExperiment(20)
    expect(result.finalClockReading).toBe(result.initialClockReading + result.elapsedTime)
    expect(result.endEvent.clockReading).toBe(result.finalClockReading)
  })

  it('gives repeated experiments a fresh clock state, independent of prior runs', () => {
    const first = runClockExperiment(30)
    const second = runClockExperiment(5)

    expect(first.finalClockReading).toBe(30)
    expect(second.initialClockReading).toBe(0)
    expect(second.finalClockReading).toBe(5)
  })
})
