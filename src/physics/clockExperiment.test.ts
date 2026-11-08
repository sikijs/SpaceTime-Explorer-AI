import { describe, expect, it } from 'vitest'
import { guessPositionOnStrip, runClockExperiment, stripScaleEnd } from './clockExperiment'

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

describe('guessPositionOnStrip', () => {
  it('ends the strip scale at twice the duration', () => {
    expect(stripScaleEnd(5)).toBe(10)
    expect(stripScaleEnd(10)).toBe(20)
    expect(stripScaleEnd(30)).toBe(60)
    expect(guessPositionOnStrip(10, 0).scaleEnd).toBe(20)
  })

  it('places a guess equal to the duration halfway, 0 at the start and twice the duration at the end', () => {
    expect(guessPositionOnStrip(10, 10).fraction).toBe(0.5)
    expect(guessPositionOnStrip(10, 0).fraction).toBe(0)
    expect(guessPositionOnStrip(10, 20).fraction).toBe(1)
    expect(guessPositionOnStrip(10, 7).fraction).toBeCloseTo(0.35, 10)
    expect(guessPositionOnStrip(10, 10).offEdge).toBeNull()
  })

  it('clamps a guess beyond the scale and flags the edge it is off', () => {
    const high = guessPositionOnStrip(10, 500)
    expect(high.fraction).toBe(1)
    expect(high.offEdge).toBe('right')
    const low = guessPositionOnStrip(10, -4)
    expect(low.fraction).toBe(0)
    expect(low.offEdge).toBe('left')
  })

  it('gives the guess minus the real elapsed time', () => {
    expect(guessPositionOnStrip(10, 7).differenceFromReal).toBe(-3)
    expect(guessPositionOnStrip(10, 10).differenceFromReal).toBe(0)
    expect(guessPositionOnStrip(20, 25).differenceFromReal).toBe(5)
  })

  it('does not change the real result whatever the guess', () => {
    const before = runClockExperiment(10)
    guessPositionOnStrip(10, 7)
    guessPositionOnStrip(10, 500)
    expect(runClockExperiment(10)).toEqual(before)
  })

  it('refuses a guess that is not a finite number', () => {
    expect(() => guessPositionOnStrip(10, NaN)).toThrow()
    expect(() => guessPositionOnStrip(10, Infinity)).toThrow()
  })
})
