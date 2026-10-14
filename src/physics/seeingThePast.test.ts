import { describe, it, expect } from 'vitest'
import { classifyEventPair } from './lightCones'
import { RUN_DISTANCE, lookingRange, runSeeingExperiment, seenAt } from './seeingThePast'
import type { Direction } from './seeingThePast'

const DIRECTIONS: Direction[] = ['approaching', 'receding']
const SPREAD = [0.01, 0.1, 0.3, 0.4, 0.5, 0.6, 0.7, 0.9, 0.99]
const PRESETS = [0.3, 0.5, 0.6, 0.9]

describe('Seeing the past physics (Spacetime Geometry, Experiment 4)', () => {
  it('matches the hand-worked examples at 0.6c', () => {
    const approaching = runSeeingExperiment('approaching', 0.6)
    expect(approaching.firstLooking).toBeCloseTo(5, 10)
    expect(approaching.lastLooking).toBeCloseTo(7 + 2 / 3, 10) // 4 ÷ 0.6 + 1 = 7.67
    expect(approaching.measuredDuration).toBeCloseTo(4 / 0.6, 10)
    expect(approaching.imageDuration).toBeCloseTo(8 / 3, 10) // 2.67
    expect(approaching.imageSpeed).toBeCloseTo(1.5, 10)

    const receding = runSeeingExperiment('receding', 0.6)
    expect(receding.firstLooking).toBeCloseTo(1, 10)
    expect(receding.lastLooking).toBeCloseTo(11 + 2 / 3, 10) // 6.67 + 5 = 11.67
    expect(receding.imageDuration).toBeCloseTo(32 / 3, 10) // 10.67
    expect(receding.imageSpeed).toBeCloseTo(0.375, 10)

    // The first and last images are the ship's start and end positions.
    const first = seenAt('approaching', 0.6, 5)
    expect(first.emissionTime).toBeCloseTo(0, 10)
    expect(first.seenPosition).toBeCloseTo(5, 10)
    const last = seenAt('approaching', 0.6, 7 + 2 / 3)
    expect(last.emissionTime).toBeCloseTo(4 / 0.6, 10)
    expect(last.seenPosition).toBeCloseTo(1, 10)
  })

  it('every seen event is linked to its looking event by light, and is earlier', () => {
    for (const direction of DIRECTIONS) {
      for (const speed of SPREAD) {
        for (const s of runSeeingExperiment(direction, speed).samples) {
          const seen = { time: s.emissionTime, position: s.seenPosition }
          const looking = { time: s.lookingTime, position: 0 }
          expect(classifyEventPair(seen, looking)).toBe('light-only')
          expect(s.emissionTime).toBeLessThan(s.lookingTime)
        }
      }
    }
  })

  it('the measured speed from the samples is the chosen speed', () => {
    for (const direction of DIRECTIONS) {
      for (const speed of SPREAD) {
        const { samples } = runSeeingExperiment(direction, speed)
        const a = samples[0]
        const b = samples[samples.length - 1]
        const found = Math.abs(b.measuredPosition - a.measuredPosition) / (b.lookingTime - a.lookingTime)
        expect(found).toBeCloseTo(speed, 10)
      }
    }
  })

  it('the image speed matches the closed forms v ÷ (1 − v) and v ÷ (1 + v)', () => {
    for (const speed of SPREAD) {
      expect(runSeeingExperiment('approaching', speed).imageSpeed).toBeCloseTo(speed / (1 - speed), 8)
      expect(runSeeingExperiment('receding', speed).imageSpeed).toBeCloseTo(speed / (1 + speed), 8)
    }
  })

  it('reproduces the specification table for the four presets', () => {
    // The table in the specification is rounded to two decimals (0.375 is shown as 0.38), so allow half a unit
    // in the last place plus a little for the exact-half case.
    const approaching = [0.43, 1.0, 1.5, 9.0]
    const receding = [0.23, 0.33, 0.38, 0.47]
    PRESETS.forEach((speed, i) => {
      expect(Math.abs(runSeeingExperiment('approaching', speed).imageSpeed - approaching[i])).toBeLessThan(0.006)
      expect(Math.abs(runSeeingExperiment('receding', speed).imageSpeed - receding[i])).toBeLessThan(0.006)
    })
  })

  it('an approaching image is faster than the ship and a receding image is slower', () => {
    for (const speed of SPREAD) {
      expect(runSeeingExperiment('approaching', speed).imageSpeed).toBeGreaterThan(speed)
      expect(runSeeingExperiment('receding', speed).imageSpeed).toBeLessThan(speed)
    }
  })

  it('the approaching image is faster than light exactly when v > 0.5; the receding image stays below 0.5', () => {
    for (const speed of SPREAD) {
      const approaching = runSeeingExperiment('approaching', speed).imageSpeed
      if (speed > 0.5) expect(approaching).toBeGreaterThan(1)
      else if (speed < 0.5) expect(approaching).toBeLessThan(1)
      else expect(approaching).toBeCloseTo(1, 10)
      expect(runSeeingExperiment('receding', speed).imageSpeed).toBeLessThan(0.5)
    }
    expect(runSeeingExperiment('receding', 0.999).imageSpeed).toBeGreaterThan(0.49)
  })

  it('the seen ship is the earlier ship: farther from the lab when approaching, nearer when receding', () => {
    for (const speed of SPREAD) {
      for (const s of runSeeingExperiment('approaching', speed).samples) {
        expect(s.seenPosition).toBeGreaterThanOrEqual(s.measuredPosition - 1e-12)
      }
      for (const s of runSeeingExperiment('receding', speed).samples) {
        expect(s.seenPosition).toBeLessThanOrEqual(s.measuredPosition + 1e-12)
      }
    }
  })

  it('a later emission time always gives a later looking time', () => {
    for (const direction of DIRECTIONS) {
      for (const speed of SPREAD) {
        const { samples } = runSeeingExperiment(direction, speed)
        for (let i = 1; i < samples.length; i++) {
          expect(samples[i].emissionTime).toBeGreaterThan(samples[i - 1].emissionTime)
          expect(samples[i].lookingTime).toBeGreaterThan(samples[i - 1].lookingTime)
        }
      }
    }
  })

  it('as v shrinks, the image speed approaches the ship speed', () => {
    for (const direction of DIRECTIONS) {
      const gaps = [0.1, 0.01, 0.001].map(
        (speed) => Math.abs(runSeeingExperiment(direction, speed).imageSpeed - speed),
      )
      expect(gaps[1]).toBeLessThan(gaps[0])
      expect(gaps[2]).toBeLessThan(gaps[1])
      expect(gaps[2]).toBeLessThan(0.001)
    }
  })

  it('the ship covers 4 light-seconds, both as measured and as seen', () => {
    for (const direction of DIRECTIONS) {
      for (const speed of SPREAD) {
        const run = runSeeingExperiment(direction, speed)
        expect(run.distanceCovered).toBeCloseTo(RUN_DISTANCE, 10)
        expect(run.measuredSpeed * run.measuredDuration).toBeCloseTo(RUN_DISTANCE, 10)
      }
    }
  })

  it('throws RangeError for out-of-range inputs', () => {
    for (const direction of DIRECTIONS) {
      for (const bad of [0, -0.5, 1, 1.5, NaN]) {
        expect(() => runSeeingExperiment(direction, bad)).toThrow(RangeError)
        expect(() => seenAt(direction, bad, 5)).toThrow(RangeError)
      }
      const { first, last } = lookingRange(direction, 0.6)
      expect(() => seenAt(direction, 0.6, first - 0.01)).toThrow(RangeError)
      expect(() => seenAt(direction, 0.6, last + 0.01)).toThrow(RangeError)
      expect(() => seenAt(direction, 0.6, NaN)).toThrow(RangeError)
    }
  })

  it('is a pure function of (direction, speed)', () => {
    for (const direction of DIRECTIONS) {
      expect(runSeeingExperiment(direction, 0.6)).toEqual(runSeeingExperiment(direction, 0.6))
    }
  })
})
