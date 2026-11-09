import { describe, it, expect } from 'vitest'
import {
  runLightClockExperiment,
  lightClockStateAt,
  MIRROR_SEPARATION,
  REST_TICK_DURATION,
  tickBarsScaleEnd,
  guessPositionOnTickBars,
  halfTripNumbers,
  triangleSquares,
  trialTickCheck,
  restClockAtRunEnd,
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

describe('Light Clock tick bars: the learner\'s guess (audit update)', () => {
  it('the scales end at twice the rest tick and twice the moving tick', () => {
    expect(tickBarsScaleEnd(runLightClockExperiment(0.5), 'rest')).toBe(2)
    expect(tickBarsScaleEnd(runLightClockExperiment(0.5), 'moving')).toBeCloseTo(2 / Math.sqrt(0.75), 12)
    expect(tickBarsScaleEnd(runLightClockExperiment(0.8), 'moving')).toBeCloseTo(10 / 3, 12)
    for (const v of SPEEDS) {
      const e = runLightClockExperiment(v)
      expect(tickBarsScaleEnd(e, 'rest')).toBe(2)
      expect(tickBarsScaleEnd(e, 'moving')).toBeCloseTo(2 * e.movingTickDuration, 12)
    }
  })

  it('places a guess as a fraction of the scale: 0 at 0, 0.5 at the rest tick, 1 at twice the rest tick', () => {
    const e = runLightClockExperiment(0.5)
    expect(guessPositionOnTickBars(e, 0).fraction).toBe(0)
    expect(guessPositionOnTickBars(e, 1).fraction).toBe(0.5)
    expect(guessPositionOnTickBars(e, 2).fraction).toBe(1)
    expect(guessPositionOnTickBars(e, 2).offEdge).toBeNull()
  })

  it('clamps a guess beyond the scale and flags the edge', () => {
    const e = runLightClockExperiment(0.5)
    const high = guessPositionOnTickBars(e, 5)
    expect(high.fraction).toBe(1)
    expect(high.offEdge).toBe('right')
    const low = guessPositionOnTickBars(e, -0.5)
    expect(low.fraction).toBe(0)
    expect(low.offEdge).toBe('left')
  })

  it('gives the difference from each clock\'s real tick (0.5c, guess 1.3)', () => {
    const g = guessPositionOnTickBars(runLightClockExperiment(0.5), 1.3)
    expect(g.differenceFromMoving).toBeCloseTo(1.3 - 1.1547005, 6)
    expect(g.differenceFromRest).toBeCloseTo(0.3, 12)
  })

  it('the real result is the same for any guess', () => {
    const e = runLightClockExperiment(0.5)
    const before = { ...e }
    guessPositionOnTickBars(e, 0.2)
    guessPositionOnTickBars(e, 99)
    expect(e).toEqual(before)
    expect(runLightClockExperiment(0.5)).toEqual(before)
  })

  it('refuses a guess that is not finite', () => {
    const e = runLightClockExperiment(0.5)
    expect(() => guessPositionOnTickBars(e, NaN)).toThrow()
    expect(() => guessPositionOnTickBars(e, Infinity)).toThrow()
  })
})

describe('Light Clock half-trip numbers (the tutor\'s "Working out the diagonal")', () => {
  it('at 0.5c: rise 0.5, sideways half 0.289, diagonal 0.577, round trip 1.155', () => {
    const n = halfTripNumbers(runLightClockExperiment(0.5))
    expect(n.rise).toBe(0.5)
    expect(n.sidewaysHalf).toBeCloseTo(0.2887, 4)
    expect(n.diagonal).toBeCloseTo(0.5774, 4)
    expect(n.roundTrip).toBeCloseTo(1.1547, 4)
  })

  it('the diagonal squared equals the rise squared plus the sideways half squared, at every speed', () => {
    for (const v of SPEEDS) {
      const n = halfTripNumbers(runLightClockExperiment(v))
      expect(n.diagonal ** 2).toBeCloseTo(n.rise ** 2 + n.sidewaysHalf ** 2, 12)
    }
  })

  it('the round trip is twice the diagonal and equals the module\'s moving light path', () => {
    for (const v of SPEEDS) {
      const e = runLightClockExperiment(v)
      const n = halfTripNumbers(e)
      expect(n.roundTrip).toBeCloseTo(2 * n.diagonal, 12)
      expect(n.roundTrip).toBe(e.movingLightPath)
    }
  })
})

describe('Light Clock introduction worked example at 0.6c (the 3-4-5 triangle)', () => {
  const e = runLightClockExperiment(0.6)

  it('the tick is 1.25 s, the clock slides 0.75 light-seconds, and the factor is 0.8', () => {
    expect(e.movingTickDuration).toBeCloseTo(1.25, 12)
    expect(e.sidewaysDistancePerTick).toBeCloseTo(0.75, 12)
    expect(e.timeDilationFactor).toBeCloseTo(0.8, 12)
  })

  it('the half-trip numbers are 0.5, 0.375 and 0.625: a 3-4-5 triangle scaled by 0.125', () => {
    const n = halfTripNumbers(e)
    expect(n.rise).toBe(0.5)
    expect(n.sidewaysHalf).toBeCloseTo(0.375, 12)
    expect(n.diagonal).toBeCloseTo(0.625, 12)
    expect(n.sidewaysHalf / 0.125).toBeCloseTo(3, 10)
    expect(n.rise / 0.125).toBeCloseTo(4, 10)
    expect(n.diagonal / 0.125).toBeCloseTo(5, 10)
  })

  it('the squares are 0.25, 0.140625 and 0.390625, and the sum equals the diagonal squared', () => {
    const q = triangleSquares(e)
    expect(q.riseSquared).toBeCloseTo(0.25, 12)
    expect(q.sidewaysHalfSquared).toBeCloseTo(0.140625, 12)
    expect(q.sum).toBeCloseTo(0.390625, 12)
    expect(q.diagonalSquared).toBeCloseTo(0.390625, 12)
  })

  it('the squares agree at every speed (the right-triangle rule holds for the real tick)', () => {
    for (const v of SPEEDS) {
      const q = triangleSquares(runLightClockExperiment(v))
      expect(q.sum).toBeCloseTo(q.diagonalSquared, 12)
    }
  })

  it('a trial tick of 1.0 s is too short: the flash covers 0.5 but the mirror is about 0.583 away', () => {
    const t = trialTickCheck(0.6, 1.0)
    expect(t.flashHalfPath).toBeCloseTo(0.5, 12)
    expect(t.sidewaysHalf).toBeCloseTo(0.3, 12)
    expect(t.triangleHalfPath).toBeCloseTo(0.5831, 4)
    expect(t.verdict).toBe('too-short')
  })

  it('a trial tick of 1.5 s is too long: the flash covers 0.75 but the mirror is only about 0.673 away', () => {
    const t = trialTickCheck(0.6, 1.5)
    expect(t.flashHalfPath).toBeCloseTo(0.75, 12)
    expect(t.sidewaysHalf).toBeCloseTo(0.45, 12)
    expect(t.triangleHalfPath).toBeCloseTo(0.6727, 4)
    expect(t.verdict).toBe('too-long')
  })

  it('a trial tick of 1.25 s fits exactly, and only the real tick fits, at every speed', () => {
    const fit = trialTickCheck(0.6, 1.25)
    expect(fit.flashHalfPath).toBeCloseTo(0.625, 12)
    expect(fit.sidewaysHalf).toBeCloseTo(0.375, 12)
    expect(fit.verdict).toBe('fits')
    for (const v of SPEEDS) {
      const real = runLightClockExperiment(v).movingTickDuration
      expect(trialTickCheck(v, real).verdict).toBe('fits')
      expect(trialTickCheck(v, real * 0.9).verdict).toBe('too-short')
      expect(trialTickCheck(v, real * 1.1).verdict).toBe('too-long')
    }
  })

  it('refuses a speed outside 0 <= v < c and a tick that is not a positive finite number', () => {
    expect(() => trialTickCheck(1, 1)).toThrow(RangeError)
    expect(() => trialTickCheck(-0.1, 1)).toThrow(RangeError)
    expect(() => trialTickCheck(0.6, 0)).toThrow(RangeError)
    expect(() => trialTickCheck(0.6, NaN)).toThrow(RangeError)
    expect(() => trialTickCheck(0.6, Infinity)).toThrow(RangeError)
  })
})

describe('Light Clock: the rest clock when the run stops (the introduction of the clocks-and-bars box)', () => {
  it('at 0.5c the rest clock reads the lab time 1.155 s: one whole tick and 0.155 s of the next', () => {
    const r = restClockAtRunEnd(runLightClockExperiment(0.5))
    expect(r.reading).toBeCloseTo(1.1547, 4)
    expect(r.wholeTicks).toBe(1)
    expect(r.partialTick).toBeCloseTo(0.1547, 4)
  })

  it('at 0.8c: 1.667 s, one whole tick and 0.667 s; at 0.99c: 7.089 s, seven whole ticks and 0.089 s', () => {
    const a = restClockAtRunEnd(runLightClockExperiment(0.8))
    expect(a.wholeTicks).toBe(1)
    expect(a.partialTick).toBeCloseTo(0.6667, 4)
    const b = restClockAtRunEnd(runLightClockExperiment(0.99))
    expect(b.reading).toBeCloseTo(7.0888, 4)
    expect(b.wholeTicks).toBe(7)
    expect(b.partialTick).toBeCloseTo(0.0888, 4)
  })

  it('the whole ticks plus the part-tick always add up to the reading, which equals the lab time and the moving tick', () => {
    for (const v of SPEEDS) {
      const e = runLightClockExperiment(v)
      const r = restClockAtRunEnd(e)
      expect(r.wholeTicks * e.restTickDuration + r.partialTick).toBeCloseTo(r.reading, 12)
      expect(r.reading).toBe(e.movingTickDuration)
      expect(r.partialTick).toBeGreaterThanOrEqual(0)
      expect(r.partialTick).toBeLessThan(e.restTickDuration)
      expect(lightClockStateAt(e, e.movingTickDuration).restClockReading).toBeCloseTo(r.reading, 12)
    }
  })
})
