import { describe, it, expect } from 'vitest'
import {
  runMovingClockExperiment,
  movingClockStateAt,
  movingClockStripScaleEnd,
  guessPositionOnBars,
  classifyMovingClockGuess,
  timeDilationWorkedNumbers,
} from './movingClockExperiment'

describe('Moving Clock Experiment Physics', () => {
  it('observer elapsed time equals the lab duration', () => {
    const result = runMovingClockExperiment(10, 0.5)
    expect(result.labTimeDuration).toBe(10)
    expect(result.observerElapsedTime).toBe(10)
  })

  it('at v = 0 the moving clock matches the observer (consistent with Experiment 2)', () => {
    const result = runMovingClockExperiment(10, 0)
    expect(result.movingClockElapsedTime).toBe(result.observerElapsedTime)
    expect(result.timeDilationFactor).toBe(1)
    expect(result.timeDifferential).toBe(0)
  })

  it('at 0.6c the moving clock reads 0.8 of the lab time', () => {
    const result = runMovingClockExperiment(10, 0.6)
    expect(result.timeDilationFactor).toBeCloseTo(0.8, 10)
    expect(result.movingClockElapsedTime).toBeCloseTo(8, 10)
    expect(result.timeDifferential).toBeCloseTo(2, 10)
  })

  it('at 0.8c the moving clock reads 0.6 of the lab time', () => {
    const result = runMovingClockExperiment(10, 0.8)
    expect(result.timeDilationFactor).toBeCloseTo(0.6, 10)
    expect(result.movingClockElapsedTime).toBeCloseTo(6, 10)
  })

  it('for any v > 0 the moving clock measures less than the observer', () => {
    ;[0.01, 0.1, 0.3, 0.5, 0.8, 0.99].forEach((v) => {
      const result = runMovingClockExperiment(10, v)
      expect(result.movingClockElapsedTime).toBeLessThan(result.observerElapsedTime)
      expect(result.timeDifferential).toBeGreaterThan(0)
    })
  })

  it('a faster clock shows greater time dilation', () => {
    const slow = runMovingClockExperiment(10, 0.3)
    const fast = runMovingClockExperiment(10, 0.7)
    expect(fast.movingClockElapsedTime).toBeLessThan(slow.movingClockElapsedTime)
  })

  it('the effect is non-linear: doubling v more than doubles the time lost', () => {
    const half = runMovingClockExperiment(10, 0.4)
    const double = runMovingClockExperiment(10, 0.8)
    expect(double.timeDifferential).toBeGreaterThan(2 * half.timeDifferential)
  })

  it('moving clock time approaches 0 as v approaches c', () => {
    const result = runMovingClockExperiment(10, 0.99)
    expect(result.movingClockElapsedTime).toBeLessThan(1.5)
    expect(result.movingClockElapsedTime).toBeGreaterThan(0)
  })

  it('moving clock time scales proportionally with lab duration at fixed v', () => {
    const short = runMovingClockExperiment(10, 0.6)
    const long = runMovingClockExperiment(30, 0.6)
    expect(long.movingClockElapsedTime).toBeCloseTo(3 * short.movingClockElapsedTime, 10)
  })

  it('is deterministic across repeated runs', () => {
    expect(runMovingClockExperiment(20, 0.5)).toEqual(runMovingClockExperiment(20, 0.5))
  })

  it('rejects velocities at or above the speed of light, or negative', () => {
    expect(() => runMovingClockExperiment(10, 1)).toThrow(RangeError)
    expect(() => runMovingClockExperiment(10, 1.2)).toThrow(RangeError)
    expect(() => runMovingClockExperiment(10, -0.1)).toThrow(RangeError)
    expect(() => runMovingClockExperiment(10, NaN)).toThrow(RangeError)
  })

  it('rejects non-positive durations', () => {
    expect(() => runMovingClockExperiment(0, 0.5)).toThrow(RangeError)
    expect(() => runMovingClockExperiment(-5, 0.5)).toThrow(RangeError)
  })

  it('handles the longest duration the interface allows (120 s)', () => {
    const result = runMovingClockExperiment(120, 0.6)
    expect(result.observerElapsedTime).toBe(120)
    expect(result.movingClockElapsedTime).toBeCloseTo(96, 10)
    expect(result.distanceTravelled).toBeCloseTo(72, 10)
  })

  it('the distance travelled is speed × lab time, in light-seconds', () => {
    expect(runMovingClockExperiment(10, 0.5).distanceTravelled).toBeCloseTo(5, 12)
    expect(runMovingClockExperiment(30, 0.8).distanceTravelled).toBeCloseTo(24, 12)
    expect(runMovingClockExperiment(10, 0).distanceTravelled).toBe(0)
  })
})

describe('Moving Clock State Over Lab Time', () => {
  const experiment = runMovingClockExperiment(10, 0.6)

  it('starts with both clocks at zero and the moving clock at the lab clock', () => {
    const s = movingClockStateAt(experiment, 0)
    expect(s.labClockReading).toBe(0)
    expect(s.movingClockReading).toBe(0)
    expect(s.distanceTravelled).toBe(0)
  })

  it('at the end of the run it matches the experiment result', () => {
    const s = movingClockStateAt(experiment, experiment.labTimeDuration)
    expect(s.labClockReading).toBe(experiment.observerElapsedTime)
    expect(s.movingClockReading).toBeCloseTo(experiment.movingClockElapsedTime, 12)
    expect(s.distanceTravelled).toBeCloseTo(experiment.distanceTravelled, 12)
  })

  it('the moving clock reads lab time × the time dilation factor throughout', () => {
    ;[1, 2.5, 5, 7.5, 10].forEach((t) => {
      const s = movingClockStateAt(experiment, t)
      expect(s.movingClockReading).toBeCloseTo(t * experiment.timeDilationFactor, 12)
      expect(s.movingClockReading / s.labClockReading).toBeCloseTo(experiment.timeDilationFactor, 12)
    })
  })

  it('the clock moves at a constant speed: distance grows in proportion to lab time', () => {
    const a = movingClockStateAt(experiment, 2)
    const b = movingClockStateAt(experiment, 6)
    expect(b.distanceTravelled / a.distanceTravelled).toBeCloseTo(3, 12)
    expect(a.distanceTravelled / a.labClockReading).toBeCloseTo(0.6, 12)
  })

  it('a clock at speed 0 stays put and reads the same as the lab clock', () => {
    const rest = runMovingClockExperiment(10, 0)
    const s = movingClockStateAt(rest, 4)
    expect(s.distanceTravelled).toBe(0)
    expect(s.movingClockReading).toBe(s.labClockReading)
  })

  it('rejects lab times outside the run', () => {
    expect(() => movingClockStateAt(experiment, -0.1)).toThrow(RangeError)
    expect(() => movingClockStateAt(experiment, 10.5)).toThrow(RangeError)
    expect(() => movingClockStateAt(experiment, NaN)).toThrow(RangeError)
  })

  it('is deterministic', () => {
    expect(movingClockStateAt(experiment, 3.3)).toEqual(movingClockStateAt(experiment, 3.3))
  })
})

describe('Moving Clock bars: the learner\'s guess (audit update)', () => {
  it('the scale ends at twice the lab duration', () => {
    for (const d of [5, 10, 20, 30, 120]) {
      expect(movingClockStripScaleEnd(runMovingClockExperiment(d, 0.5))).toBe(2 * d)
    }
  })

  it('places a guess as a fraction of the scale: 0 at 0, 0.5 at the duration, 1 at twice the duration', () => {
    const e = runMovingClockExperiment(10, 0.5)
    expect(guessPositionOnBars(e, 0).fraction).toBe(0)
    expect(guessPositionOnBars(e, 10).fraction).toBe(0.5)
    expect(guessPositionOnBars(e, 20).fraction).toBe(1)
    expect(guessPositionOnBars(e, 20).offEdge).toBeNull()
  })

  it('clamps a guess beyond the scale and flags the edge', () => {
    const e = runMovingClockExperiment(10, 0.5)
    const high = guessPositionOnBars(e, 25)
    expect(high.fraction).toBe(1)
    expect(high.offEdge).toBe('right')
    const low = guessPositionOnBars(e, -3)
    expect(low.fraction).toBe(0)
    expect(low.offEdge).toBe('left')
  })

  it('gives the difference from each clock\'s real elapsed time (10 s at 0.5c, guess 9)', () => {
    const e = runMovingClockExperiment(10, 0.5)
    const g = guessPositionOnBars(e, 9)
    expect(g.differenceFromMoving).toBeCloseTo(9 - 8.660254, 5)
    expect(g.differenceFromLab).toBe(-1)
  })

  it('the real result does not depend on the guess', () => {
    const e = runMovingClockExperiment(10, 0.5)
    const before = { ...e }
    guessPositionOnBars(e, 3)
    guessPositionOnBars(e, 99)
    expect(e).toEqual(before)
    expect(runMovingClockExperiment(10, 0.5)).toEqual(before)
  })

  it('refuses a guess that is not finite', () => {
    const e = runMovingClockExperiment(10, 0.5)
    expect(() => guessPositionOnBars(e, NaN)).toThrow()
    expect(() => guessPositionOnBars(e, Infinity)).toThrow()
    expect(() => classifyMovingClockGuess(e, NaN)).toThrow()
  })
})

describe('Moving Clock guess classification (the tutor\'s reaction lines)', () => {
  const e = runMovingClockExperiment(10, 0.5)

  it('a guess equal to the moving clock\'s reading is close to the actual', () => {
    expect(classifyMovingClockGuess(e, e.movingClockElapsedTime)).toBe('close-to-actual')
  })

  it('a guess equal to the lab clock\'s reading is close to the lab', () => {
    expect(classifyMovingClockGuess(e, 10)).toBe('close-to-lab')
  })

  it('a guess far from both is other', () => {
    expect(classifyMovingClockGuess(e, 3)).toBe('other')
    expect(classifyMovingClockGuess(e, 15)).toBe('other')
  })

  it('uses half the size of the effect as the margin', () => {
    // 0.5c, 10 s: effect 1.340, margin 0.670
    expect(classifyMovingClockGuess(e, 8.660254 + 0.66)).toBe('close-to-actual')
    // 9.34 is inside the lab clock's margin instead (the two margins meet at 9.33), so it is close to the lab
    expect(classifyMovingClockGuess(e, 8.660254 + 0.68)).toBe('close-to-lab')
    expect(classifyMovingClockGuess(e, 8.660254 - 0.68)).toBe('other')
  })

  it('at 0c the margin is 0, so only an exact 10 is close to the actual', () => {
    const rest = runMovingClockExperiment(10, 0)
    expect(classifyMovingClockGuess(rest, 10)).toBe('close-to-actual')
    expect(classifyMovingClockGuess(rest, 9.9)).toBe('other')
  })
})

describe('Moving Clock worked numbers (the tutor\'s "Your numbers")', () => {
  it('at 0.5c: v squared 0.25, 1 - v squared 0.75, factor 0.866', () => {
    const n = timeDilationWorkedNumbers(0.5)
    expect(n.vSquared).toBeCloseTo(0.25, 12)
    expect(n.oneMinusVSquared).toBeCloseTo(0.75, 12)
    expect(n.factor).toBeCloseTo(0.866, 3)
  })

  it('at 0c: 0, 1, 1', () => {
    expect(timeDilationWorkedNumbers(0)).toEqual({ vSquared: 0, oneMinusVSquared: 1, factor: 1 })
  })

  it('at 0.8c: 0.64, 0.36, 0.6', () => {
    const n = timeDilationWorkedNumbers(0.8)
    expect(n.vSquared).toBeCloseTo(0.64, 12)
    expect(n.oneMinusVSquared).toBeCloseTo(0.36, 12)
    expect(n.factor).toBeCloseTo(0.6, 12)
  })

  it('the factor agrees with the experiment\'s own factor', () => {
    expect(timeDilationWorkedNumbers(0.3).factor).toBe(runMovingClockExperiment(10, 0.3).timeDilationFactor)
  })

  it('rejects speeds outside 0 <= v < c', () => {
    expect(() => timeDilationWorkedNumbers(1)).toThrow(RangeError)
    expect(() => timeDilationWorkedNumbers(-0.1)).toThrow(RangeError)
  })
})
