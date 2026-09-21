import { describe, it, expect } from 'vitest'
import {
  runInvariantLightSpeedExperiment,
  invariantLightSpeedStateAt,
} from './invariantLightSpeedExperiment'
import { lightClockStateAt, runLightClockExperiment } from './lightClockExperiment'
import { runMovingClockExperiment } from './movingClockExperiment'

const SPEEDS = [0.01, 0.1, 0.3, 0.5, 0.6, 0.8, 0.99]

describe('Invariant Light Speed Experiment Physics', () => {
  it('at v = 0 both rules match the rest clock', () => {
    const r = runInvariantLightSpeedExperiment(0)
    ;[r.everydayRule, r.actualRule].forEach((rule) => {
      expect(rule.movingTickDuration).toBe(1)
      expect(rule.lightSpeedInLab).toBeCloseTo(1, 12)
      expect(rule.timeDilationFactor).toBe(1)
      expect(rule.lightPath).toBeCloseTo(r.restLightPath, 12)
    })
  })

  it('rest clock ticks once per second at light speed c', () => {
    const r = runInvariantLightSpeedExperiment(0.5)
    expect(r.restTickDuration).toBe(1)
    expect(r.restLightPath).toBe(1)
    expect(r.lightSpeedRest).toBeCloseTo(1, 12)
  })

  it('everyday rule: the moving tick equals the rest tick at every speed', () => {
    SPEEDS.forEach((v) => {
      const r = runInvariantLightSpeedExperiment(v)
      expect(r.everydayRule.movingTickDuration).toBe(r.restTickDuration)
      expect(r.everydayRule.timeDilationFactor).toBe(1)
    })
  })

  it('everyday rule: light speed and path are sqrt(1 + v^2), above c for v > 0', () => {
    SPEEDS.forEach((v) => {
      const r = runInvariantLightSpeedExperiment(v)
      expect(r.everydayRule.lightSpeedInLab).toBeCloseTo(Math.sqrt(1 + v * v), 10)
      expect(r.everydayRule.lightPath).toBeCloseTo(Math.sqrt(1 + v * v), 10)
      expect(r.everydayRule.lightSpeedInLab).toBeGreaterThan(1)
    })
  })

  it('actual rule: light speed in the lab is exactly c at every speed', () => {
    SPEEDS.forEach((v) => {
      expect(runInvariantLightSpeedExperiment(v).actualRule.lightSpeedInLab).toBeCloseTo(1, 10)
    })
  })

  it('actual rule matches the Experiment 4 light clock', () => {
    SPEEDS.forEach((v) => {
      const r = runInvariantLightSpeedExperiment(v)
      const e4 = runLightClockExperiment(v)
      expect(r.actualRule.movingTickDuration).toBe(e4.movingTickDuration)
      expect(r.actualRule.lightPath).toBe(e4.movingLightPath)
      expect(r.actualRule.timeDilationFactor).toBe(e4.timeDilationFactor)
      expect(r.sidewaysDistancePerTick.actualRule).toBe(e4.sidewaysDistancePerTick)
    })
  })

  it("actual rule's factor equals the Experiment 3 time dilation factor", () => {
    SPEEDS.forEach((v) => {
      const r = runInvariantLightSpeedExperiment(v)
      expect(r.actualRule.timeDilationFactor).toBeCloseTo(
        runMovingClockExperiment(10, v).timeDilationFactor,
        12
      )
    })
  })

  it('matches the preset values in the specification table', () => {
    const table: Array<[number, number, number, number]> = [
      [0.1, 1.005, 1.005, 1.0],
      [0.3, 1.044, 1.048, 1.0],
      [0.5, 1.118, 1.155, 1.0],
      [0.8, 1.281, 1.667, 1.0],
    ]
    table.forEach(([v, everydaySpeed, actualTick, actualSpeed]) => {
      const r = runInvariantLightSpeedExperiment(v)
      expect(r.everydayRule.movingTickDuration).toBe(1)
      expect(r.everydayRule.lightSpeedInLab).toBeCloseTo(everydaySpeed, 3)
      expect(r.actualRule.movingTickDuration).toBeCloseTo(actualTick, 3)
      expect(r.actualRule.lightSpeedInLab).toBeCloseTo(actualSpeed, 3)
    })
  })

  it('for v > 0 the actual-rule tick is longer than the everyday-rule tick, non-linearly in v', () => {
    SPEEDS.forEach((v) => {
      const r = runInvariantLightSpeedExperiment(v)
      expect(r.actualRule.movingTickDuration).toBeGreaterThan(r.everydayRule.movingTickDuration)
    })
    const gap = (v: number) => {
      const r = runInvariantLightSpeedExperiment(v)
      return r.actualRule.movingTickDuration - r.everydayRule.movingTickDuration
    }
    expect(gap(0.3)).toBeGreaterThan(gap(0.1))
    expect(gap(0.8)).toBeGreaterThan(gap(0.4))
    // Non-linear: doubling the speed more than doubles the gap.
    expect(gap(0.8)).toBeGreaterThan(2 * gap(0.4))
  })

  it('the right-triangle relation holds under each rule with its own tick', () => {
    SPEEDS.forEach((v) => {
      const r = runInvariantLightSpeedExperiment(v)
      ;(['everydayRule', 'actualRule'] as const).forEach((key) => {
        const rule = r[key]
        const sideways = r.sidewaysDistancePerTick[key]
        expect(sideways).toBeCloseTo(v * rule.movingTickDuration, 12)
        expect((rule.lightPath / 2) ** 2).toBeCloseTo(
          r.mirrorSeparation ** 2 + (v * rule.movingTickDuration / 2) ** 2,
          10
        )
      })
    })
  })

  it('rejects velocity outside 0 <= v < c', () => {
    expect(() => runInvariantLightSpeedExperiment(-0.1)).toThrow(RangeError)
    expect(() => runInvariantLightSpeedExperiment(1)).toThrow(RangeError)
    expect(() => runInvariantLightSpeedExperiment(1.5)).toThrow(RangeError)
    expect(() => runInvariantLightSpeedExperiment(NaN)).toThrow(RangeError)
  })

  it('is deterministic across repeated runs', () => {
    expect(runInvariantLightSpeedExperiment(0.6)).toEqual(runInvariantLightSpeedExperiment(0.6))
  })
})

describe('Invariant Light Speed playback state', () => {
  it('starts with every clock at zero, pulses at the bottom mirror, no sideways offset', () => {
    const s = invariantLightSpeedStateAt(runInvariantLightSpeedExperiment(0.5), 0)
    expect(s.restClock.clockReading).toBe(0)
    expect(s.everydayRule).toEqual({ clockReading: 0, pulseHeight: 0, phase: 0, sidewaysOffset: 0 })
    expect(s.actualRule).toEqual({ clockReading: 0, pulseHeight: 0, phase: 0, sidewaysOffset: 0 })
  })

  it('the everyday-rule clock finishes its tick at the rest tick and then holds', () => {
    const r = runInvariantLightSpeedExperiment(0.6)
    const done = invariantLightSpeedStateAt(r, r.everydayRule.movingTickDuration)
    const later = invariantLightSpeedStateAt(r, r.actualRule.movingTickDuration)
    expect(done.everydayRule.phase).toBe(1)
    expect(done.everydayRule.clockReading).toBeCloseTo(1, 12)
    expect(done.everydayRule.sidewaysOffset).toBeCloseTo(r.sidewaysDistancePerTick.everydayRule, 12)
    expect(later.everydayRule).toEqual(done.everydayRule)
  })

  it('at the end of the run the actual-rule clock has completed one tick and reads one rest tick', () => {
    const r = runInvariantLightSpeedExperiment(0.6)
    const end = invariantLightSpeedStateAt(r, r.actualRule.movingTickDuration)
    expect(end.actualRule.phase).toBe(1)
    expect(end.actualRule.pulseHeight).toBeCloseTo(0, 12)
    expect(end.actualRule.clockReading).toBeCloseTo(r.restTickDuration, 12)
    expect(end.actualRule.sidewaysOffset).toBeCloseTo(r.sidewaysDistancePerTick.actualRule, 12)
    expect(end.restClock.clockReading).toBeCloseTo(1.25, 12)
  })

  it('the pulse is at the top mirror at half of each rule tick', () => {
    const r = runInvariantLightSpeedExperiment(0.5)
    const e = invariantLightSpeedStateAt(r, r.everydayRule.movingTickDuration / 2)
    const a = invariantLightSpeedStateAt(r, r.actualRule.movingTickDuration / 2)
    expect(e.everydayRule.pulseHeight).toBeCloseTo(r.mirrorSeparation, 12)
    expect(a.actualRule.pulseHeight).toBeCloseTo(r.mirrorSeparation, 12)
  })

  it('the rest clock and the actual rule match the Experiment 4 playback state', () => {
    const r = runInvariantLightSpeedExperiment(0.8)
    ;[0, 0.3, 0.9, 1.4, 1.667].forEach((t) => {
      const s = invariantLightSpeedStateAt(r, t)
      const e4 = lightClockStateAt(runLightClockExperiment(0.8), t)
      expect(s.restClock.clockReading).toBe(e4.restClockReading)
      expect(s.restClock.pulseHeight).toBeCloseTo(e4.restPulseHeight, 12)
      expect(s.actualRule.clockReading).toBeCloseTo(e4.movingClockReading, 12)
      expect(s.actualRule.pulseHeight).toBeCloseTo(e4.movingPulseHeight, 12)
      expect(s.actualRule.sidewaysOffset).toBeCloseTo(e4.movingSidewaysOffset, 12)
    })
  })

  it('at v = 0 the two rules move identically', () => {
    const r = runInvariantLightSpeedExperiment(0)
    const s = invariantLightSpeedStateAt(r, 0.37)
    expect(s.everydayRule).toEqual(s.actualRule)
  })

  it('rejects negative or non-finite lab time', () => {
    const r = runInvariantLightSpeedExperiment(0.5)
    expect(() => invariantLightSpeedStateAt(r, -1)).toThrow(RangeError)
    expect(() => invariantLightSpeedStateAt(r, Infinity)).toThrow(RangeError)
  })
})

describe('Invariant Light Speed over the whole learner range', () => {
  // Every speed the interface allows (0.01c to 0.99c in steps of 0.01c), checked end to end.
  const allSpeeds = Array.from({ length: 99 }, (_, i) => (i + 1) / 100)

  it('keeps every relationship the specification requires at every allowed speed', () => {
    allSpeeds.forEach((v) => {
      const r = runInvariantLightSpeedExperiment(v)
      expect(r.everydayRule.movingTickDuration).toBe(r.restTickDuration)
      expect(r.everydayRule.lightSpeedInLab).toBeGreaterThan(1)
      expect(r.actualRule.lightSpeedInLab).toBeCloseTo(1, 10)
      expect(r.actualRule.movingTickDuration).toBeGreaterThan(r.everydayRule.movingTickDuration)
      expect(r.actualRule.timeDilationFactor).toBeCloseTo(Math.sqrt(1 - v * v), 12)
      expect(r.actualRule.lightPath).toBeGreaterThan(r.everydayRule.lightPath)
    })
  })

  it('a full playback ends with both moving clocks at one tick and the run finished', () => {
    allSpeeds.forEach((v) => {
      const r = runInvariantLightSpeedExperiment(v)
      const end = invariantLightSpeedStateAt(r, r.actualRule.movingTickDuration)
      expect(end.everydayRule.phase).toBe(1)
      expect(end.actualRule.phase).toBe(1)
      expect(end.everydayRule.clockReading).toBeCloseTo(r.restTickDuration, 10)
      expect(end.actualRule.clockReading).toBeCloseTo(r.restTickDuration, 10)
    })
  })
})
