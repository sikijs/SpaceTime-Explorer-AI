import { describe, it, expect } from 'vitest'
import {
  runLightClockExperiment,
  lightClockStateAt,
  MIRROR_SEPARATION,
  REST_TICK_DURATION,
} from './lightClockExperiment'
import { runMovingClockExperiment, SPEED_OF_LIGHT } from './movingClockExperiment'

const SPEEDS = [0.01, 0.1, 0.3, 0.5, 0.6, 0.8, 0.99]

describe('Light Clock Experiment Physics', () => {
  it('rest clock ticks once per second over a path of 2L', () => {
    const result = runLightClockExperiment(0.5)
    expect(result.mirrorSeparation).toBe(MIRROR_SEPARATION)
    expect(result.restLightPath).toBe(1)
    expect(result.restTickDuration).toBe(1)
  })

  it('at v = 0 the moving clock matches the rest clock', () => {
    const result = runLightClockExperiment(0)
    expect(result.movingTickDuration).toBe(result.restTickDuration)
    expect(result.movingLightPath).toBeCloseTo(result.restLightPath, 12)
    expect(result.sidewaysDistancePerTick).toBe(0)
    expect(result.timeDilationFactor).toBe(1)
  })

  it('gives the expected tick durations at known speeds', () => {
    expect(runLightClockExperiment(0.6).movingTickDuration).toBeCloseTo(1.25, 10)
    expect(runLightClockExperiment(0.8).movingTickDuration).toBeCloseTo(5 / 3, 10)
    expect(runLightClockExperiment(0.5).movingTickDuration).toBeCloseTo(1 / Math.sqrt(0.75), 10)
  })

  it('matches the preset values in the specification table', () => {
    const table: Array<[number, number, number]> = [
      [0.1, 1.005, 0.101],
      [0.3, 1.048, 0.314],
      [0.5, 1.155, 0.577],
      [0.8, 1.667, 1.333],
    ]
    table.forEach(([v, tick, sideways]) => {
      const result = runLightClockExperiment(v)
      expect(result.movingTickDuration).toBeCloseTo(tick, 3)
      expect(result.movingLightPath).toBeCloseTo(tick, 3)
      expect(result.sidewaysDistancePerTick).toBeCloseTo(sideways, 3)
    })
  })

  it('the moving light path is longer than the rest path for any v > 0', () => {
    SPEEDS.forEach((v) => {
      const result = runLightClockExperiment(v)
      expect(result.movingLightPath).toBeGreaterThan(result.restLightPath)
    })
  })

  it('light travels at c for both clocks at every speed', () => {
    SPEEDS.forEach((v) => {
      const result = runLightClockExperiment(v)
      expect(result.lightSpeedRest).toBeCloseTo(SPEED_OF_LIGHT, 10)
      expect(result.lightSpeedMoving).toBeCloseTo(SPEED_OF_LIGHT, 10)
    })
  })

  it('satisfies the right-triangle relation (c*dt/2)^2 = L^2 + (v*dt/2)^2', () => {
    SPEEDS.forEach((v) => {
      const { movingTickDuration: dt, mirrorSeparation: L } = runLightClockExperiment(v)
      const lhs = (SPEED_OF_LIGHT * dt / 2) ** 2
      const rhs = L ** 2 + (v * dt / 2) ** 2
      expect(lhs).toBeCloseTo(rhs, 10)
    })
  })

  it('agrees with the time dilation factor from Experiment 3', () => {
    SPEEDS.forEach((v) => {
      const light = runLightClockExperiment(v)
      const moving = runMovingClockExperiment(10, v)
      expect(light.timeDilationFactor).toBeCloseTo(moving.timeDilationFactor, 12)
    })
  })

  it('a faster clock has a longer tick, and the increase is non-linear in v', () => {
    const slow = runLightClockExperiment(0.3)
    const fast = runLightClockExperiment(0.7)
    expect(fast.movingTickDuration).toBeGreaterThan(slow.movingTickDuration)

    const increase = (v: number) => runLightClockExperiment(v).movingTickDuration - 1
    expect(increase(0.8)).toBeGreaterThan(2 * increase(0.4))
  })

  it('is deterministic across repeated runs', () => {
    expect(runLightClockExperiment(0.5)).toEqual(runLightClockExperiment(0.5))
  })

  it('rejects velocities outside 0 <= v < c', () => {
    expect(() => runLightClockExperiment(1)).toThrow(RangeError)
    expect(() => runLightClockExperiment(1.5)).toThrow(RangeError)
    expect(() => runLightClockExperiment(-0.1)).toThrow(RangeError)
    expect(() => runLightClockExperiment(NaN)).toThrow(RangeError)
  })

  it('exposes the rest tick duration as 1 second', () => {
    expect(REST_TICK_DURATION).toBe(1)
    expect(runLightClockExperiment(0.5).restTickDuration).toBe(REST_TICK_DURATION)
  })
})

describe('Light Clock State Over Lab Time', () => {
  const at = (v: number, t: number) => lightClockStateAt(runLightClockExperiment(v), t)

  it('starts with both clocks at zero and both pulses on the bottom mirror', () => {
    const s = at(0.6, 0)
    expect(s.restClockReading).toBe(0)
    expect(s.movingClockReading).toBe(0)
    expect(s.restPulseHeight).toBe(0)
    expect(s.movingPulseHeight).toBe(0)
    expect(s.movingSidewaysOffset).toBe(0)
  })

  it('the rest clock reads lab time and keeps running past its first tick', () => {
    expect(at(0.8, 0.5).restClockReading).toBe(0.5)
    expect(at(0.8, 1.6).restClockReading).toBe(1.6)
  })

  it('the rest pulse reaches the top at half a tick, returns after one tick, then repeats', () => {
    const L = MIRROR_SEPARATION
    expect(at(0.8, 0.5).restPulseHeight).toBeCloseTo(L, 12)
    expect(at(0.8, 1).restPulseHeight).toBeCloseTo(0, 12)
    expect(at(0.8, 1.5).restPulseHeight).toBeCloseTo(L, 12)
  })

  it('the moving clock reads lab time × the time dilation factor', () => {
    ;[0.1, 0.5, 0.8].forEach((v) => {
      const experiment = runLightClockExperiment(v)
      ;[0.2, 0.5, 0.9].forEach((fraction) => {
        const t = fraction * experiment.movingTickDuration
        expect(lightClockStateAt(experiment, t).movingClockReading).toBeCloseTo(
          t * experiment.timeDilationFactor,
          12
        )
      })
    })
  })

  it('at the end of its tick the moving clock reads exactly one rest tick', () => {
    SPEEDS.forEach((v) => {
      const experiment = runLightClockExperiment(v)
      const s = lightClockStateAt(experiment, experiment.movingTickDuration)
      expect(s.movingClockReading).toBeCloseTo(REST_TICK_DURATION, 12)
      expect(s.movingPhase).toBe(1)
      expect(s.movingPulseHeight).toBeCloseTo(0, 12)
      expect(s.movingSidewaysOffset).toBeCloseTo(experiment.sidewaysDistancePerTick, 12)
    })
  })

  it('the moving pulse reaches the top at half of its own lab-time tick', () => {
    const experiment = runLightClockExperiment(0.8)
    const s = lightClockStateAt(experiment, experiment.movingTickDuration / 2)
    expect(s.movingPulseHeight).toBeCloseTo(experiment.mirrorSeparation, 12)
    expect(s.movingSidewaysOffset).toBeCloseTo(experiment.sidewaysDistancePerTick / 2, 12)
  })

  it('holds the moving clock after its tick while the rest clock keeps running', () => {
    const experiment = runLightClockExperiment(0.5)
    const end = lightClockStateAt(experiment, experiment.movingTickDuration)
    const later = lightClockStateAt(experiment, experiment.movingTickDuration + 0.4)
    expect(later.movingClockReading).toBe(end.movingClockReading)
    expect(later.movingSidewaysOffset).toBe(end.movingSidewaysOffset)
    expect(later.restClockReading).toBeGreaterThan(end.restClockReading)
  })

  it('the pulse moves at speed c through space for both clocks (inside one leg of a tick)', () => {
    const dt = 1e-6
    ;[0.1, 0.5, 0.8].forEach((v) => {
      const experiment = runLightClockExperiment(v)
      const t = experiment.movingTickDuration * 0.2
      const a = lightClockStateAt(experiment, t)
      const b = lightClockStateAt(experiment, t + dt)

      const movingSpeed = Math.hypot(
        b.movingSidewaysOffset - a.movingSidewaysOffset,
        b.movingPulseHeight - a.movingPulseHeight
      ) / dt
      expect(movingSpeed).toBeCloseTo(SPEED_OF_LIGHT, 4)

      const restSpeed = Math.abs(b.restPulseHeight - a.restPulseHeight) / dt
      expect(restSpeed).toBeCloseTo(SPEED_OF_LIGHT, 4)
    })
  })

  it('the ratio of moving to rest clock readings equals the time dilation factor', () => {
    const experiment = runLightClockExperiment(0.6)
    const s = lightClockStateAt(experiment, 1)
    expect(s.movingClockReading / s.restClockReading).toBeCloseTo(experiment.timeDilationFactor, 12)
  })

  it('rejects negative or non-finite lab times', () => {
    const experiment = runLightClockExperiment(0.5)
    expect(() => lightClockStateAt(experiment, -0.1)).toThrow(RangeError)
    expect(() => lightClockStateAt(experiment, NaN)).toThrow(RangeError)
    expect(() => lightClockStateAt(experiment, Infinity)).toThrow(RangeError)
  })

  it('is deterministic', () => {
    expect(at(0.5, 0.7)).toEqual(at(0.5, 0.7))
  })
})
