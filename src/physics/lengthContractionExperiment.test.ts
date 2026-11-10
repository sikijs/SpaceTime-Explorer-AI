import { describe, it, expect } from 'vitest'
import {
  runLengthContractionExperiment,
  lengthContractionStateAt,
  lengthBarsScaleEnd,
  guessPositionOnLengthBars,
  choiceMarker,
  markGuess,
  roundTripForLength,
  lengthForTick,
  lengthBarRows,
  REST_LENGTH,
} from './lengthContractionExperiment'
import { runLightClockExperiment, REST_TICK_DURATION } from './lightClockExperiment'
import { runMovingClockExperiment } from './movingClockExperiment'

const SPEEDS = [0.01, 0.1, 0.3, 0.5, 0.6, 0.8, 0.9, 0.99]

describe('Length Contraction Experiment Physics', () => {
  it('at v = 0 both versions equal the rest clock', () => {
    const r = runLengthContractionExperiment(0)
    ;[r.sameLength, r.shorterLength].forEach((version) => {
      expect(version.lengthInLab).toBe(REST_LENGTH)
      expect(version.lengthRatio).toBe(1)
      expect(version.forwardLegDuration).toBe(0.5)
      expect(version.returnLegDuration).toBe(0.5)
      expect(version.tickDuration).toBe(1)
      expect(version.differenceFromTimeDilationTick).toBe(0)
      expect(version.sidewaysDistancePerTick).toBe(0)
    })
    expect(r.restTickDuration).toBe(1)
    expect(r.timeDilationTick).toBe(1)
  })

  it('the rest clock has length 0.5 light-second and a 1 second tick', () => {
    const r = runLengthContractionExperiment(0.5)
    expect(r.restLength).toBe(0.5)
    expect(r.restTickDuration).toBe(REST_TICK_DURATION)
    expect(r.restTickDuration).toBe(1)
  })

  it('leg durations follow L/(1 - v) and L/(1 + v) and add up to the tick', () => {
    SPEEDS.forEach((v) => {
      const r = runLengthContractionExperiment(v)
      ;[r.sameLength, r.shorterLength].forEach((version) => {
        expect(version.forwardLegDuration).toBeCloseTo(version.lengthInLab / (1 - v), 12)
        expect(version.returnLegDuration).toBeCloseTo(version.lengthInLab / (1 + v), 12)
        expect(version.tickDuration).toBeCloseTo(
          version.forwardLegDuration + version.returnLegDuration,
          12
        )
        expect(version.forwardLegDuration).toBeGreaterThan(version.returnLegDuration)
      })
    })
  })

  it('light travels at c on both legs for both versions at every speed', () => {
    SPEEDS.forEach((v) => {
      const r = runLengthContractionExperiment(v)
      ;[r.sameLength, r.shorterLength].forEach((version) => {
        expect(version.lightSpeedForward).toBeCloseTo(1, 12)
        expect(version.lightSpeedReturn).toBeCloseTo(1, 12)
      })
    })
  })

  it('same length: the tick is 1 / (1 - v^2) and is longer than the time dilation tick', () => {
    SPEEDS.forEach((v) => {
      const r = runLengthContractionExperiment(v)
      expect(r.sameLength.lengthInLab).toBe(REST_LENGTH)
      expect(r.sameLength.tickDuration).toBeCloseTo(1 / (1 - v * v), 10)
      expect(r.sameLength.tickDuration).toBeGreaterThan(r.timeDilationTick)
      expect(r.sameLength.differenceFromTimeDilationTick).toBeGreaterThan(0)
    })
  })

  it('shorter length: the length is L0 x sqrt(1 - v^2) and the tick matches the Experiment 4 tick', () => {
    SPEEDS.forEach((v) => {
      const r = runLengthContractionExperiment(v)
      expect(r.shorterLength.lengthInLab).toBeCloseTo(REST_LENGTH * Math.sqrt(1 - v * v), 12)
      expect(r.shorterLength.lengthInLab).toBeLessThan(REST_LENGTH)
      expect(r.shorterLength.tickDuration).toBeCloseTo(
        runLightClockExperiment(v).movingTickDuration,
        10
      )
      expect(r.timeDilationTick).toBe(runLightClockExperiment(v).movingTickDuration)
      expect(Math.abs(r.shorterLength.differenceFromTimeDilationTick)).toBeLessThan(1e-10)
    })
  })

  it("the shorter length ratio equals Experiment 3's time dilation factor", () => {
    SPEEDS.forEach((v) => {
      const r = runLengthContractionExperiment(v)
      const factor = runMovingClockExperiment(10, v).timeDilationFactor
      expect(r.shorterLength.lengthRatio).toBeCloseTo(factor, 12)
      expect(r.timeDilationFactor).toBeCloseTo(factor, 12)
    })
  })

  it('matches the preset values in the specification table', () => {
    const table: Array<[number, number, number, number, number]> = [
      // v, time dilation tick, same length tick, shorter length, shorter tick
      [0.1, 1.005, 1.01, 0.497, 1.005],
      [0.3, 1.048, 1.099, 0.477, 1.048],
      [0.5, 1.155, 1.333, 0.433, 1.155],
      [0.6, 1.25, 1.563, 0.4, 1.25],
      [0.8, 1.667, 2.778, 0.3, 1.667],
      [0.9, 2.294, 5.263, 0.218, 2.294],
    ]
    table.forEach(([v, dilated, sameTick, shortLength, shortTick]) => {
      const r = runLengthContractionExperiment(v)
      expect(r.timeDilationTick).toBeCloseTo(dilated, 3)
      expect(r.sameLength.tickDuration).toBeCloseTo(sameTick, 3)
      expect(r.shorterLength.lengthInLab).toBeCloseTo(shortLength, 3)
      expect(r.shorterLength.tickDuration).toBeCloseTo(shortTick, 3)
    })
  })

  it('matches the worked check at 0.6c', () => {
    const r = runLengthContractionExperiment(0.6)
    expect(r.sameLength.forwardLegDuration).toBeCloseTo(1.25, 12)
    expect(r.sameLength.returnLegDuration).toBeCloseTo(0.3125, 12)
    expect(r.sameLength.tickDuration).toBeCloseTo(1.5625, 12)
    expect(r.shorterLength.lengthInLab).toBeCloseTo(0.4, 12)
    expect(r.shorterLength.forwardLegDuration).toBeCloseTo(1.0, 12)
    expect(r.shorterLength.returnLegDuration).toBeCloseTo(0.25, 12)
    expect(r.shorterLength.tickDuration).toBeCloseTo(1.25, 12)
  })

  it('the same-length tick grows faster than linearly and its gap to the time dilation tick grows', () => {
    const excess = (v: number) => runLengthContractionExperiment(v).sameLength.tickDuration - 1
    expect(excess(0.8)).toBeGreaterThan(2 * excess(0.4))
    expect(excess(0.4)).toBeGreaterThan(2 * excess(0.2))
    const gap = (v: number) =>
      runLengthContractionExperiment(v).sameLength.differenceFromTimeDilationTick
    ;[0.1, 0.3, 0.5, 0.8, 0.9].reduce((previous, v) => {
      expect(gap(v)).toBeGreaterThan(previous)
      return gap(v)
    }, 0)
  })

  it('the pulse paths are c times the legs and the clock moves v times the tick', () => {
    SPEEDS.forEach((v) => {
      const r = runLengthContractionExperiment(v)
      ;[r.sameLength, r.shorterLength].forEach((version) => {
        expect(version.forwardLegPath).toBeCloseTo(version.forwardLegDuration, 12)
        expect(version.returnLegPath).toBeCloseTo(version.returnLegDuration, 12)
        expect(version.sidewaysDistancePerTick).toBeCloseTo(v * version.tickDuration, 12)
      })
    })
  })

  it('rejects velocity outside 0 <= v < c', () => {
    expect(() => runLengthContractionExperiment(-0.1)).toThrow(RangeError)
    expect(() => runLengthContractionExperiment(1)).toThrow(RangeError)
    expect(() => runLengthContractionExperiment(1.5)).toThrow(RangeError)
    expect(() => runLengthContractionExperiment(NaN)).toThrow(RangeError)
  })

  it('is deterministic across repeated runs', () => {
    expect(runLengthContractionExperiment(0.6)).toEqual(runLengthContractionExperiment(0.6))
  })

  it('satisfies every relationship at every speed in 0.01 steps from 0.01c to 0.99c', () => {
    for (let i = 1; i <= 99; i++) {
      const v = i / 100
      const r = runLengthContractionExperiment(v)
      expect(r.sameLength.tickDuration).toBeGreaterThan(r.timeDilationTick)
      expect(r.shorterLength.tickDuration).toBeCloseTo(r.timeDilationTick, 8)
      expect(r.shorterLength.lengthRatio).toBeCloseTo(Math.sqrt(1 - v * v), 12)
      expect(r.sameLength.lightSpeedForward).toBeCloseTo(1, 10)
      expect(r.shorterLength.lightSpeedReturn).toBeCloseTo(1, 10)
    }
  })
})

describe('Own display of the moving clocks after one tick', () => {
  it('the shorter-length clock shows exactly one rest tick and the same-length clock shows more', () => {
    ;[0.1, 0.3, 0.5, 0.6, 0.8, 0.9].forEach((v) => {
      const r = runLengthContractionExperiment(v)
      expect(r.shorterLength.ownClockReadingAtEnd).toBeCloseTo(r.restTickDuration, 10)
      expect(r.sameLength.ownClockReadingAtEnd).toBeGreaterThan(r.restTickDuration)
      // The same-length clock's own display reads the time dilation factor 1 / sqrt(1 - v^2) too much.
      expect(r.sameLength.ownClockReadingAtEnd).toBeCloseTo(1 / Math.sqrt(1 - v * v), 10)
    })
    expect(runLengthContractionExperiment(0.6).sameLength.ownClockReadingAtEnd).toBeCloseTo(1.25, 12)
  })

  it('matches the playback state at the end of each tick and equals the rest tick at v = 0', () => {
    const r = runLengthContractionExperiment(0.8)
    ;(['sameLength', 'shorterLength'] as const).forEach((key) => {
      const end = lengthContractionStateAt(r, r[key].tickDuration)[key]
      expect(end.clockReading).toBeCloseTo(r[key].ownClockReadingAtEnd, 12)
    })
    const rest = runLengthContractionExperiment(0)
    expect(rest.sameLength.ownClockReadingAtEnd).toBe(1)
    expect(rest.shorterLength.ownClockReadingAtEnd).toBe(1)
  })
})

describe('Length Contraction playback state', () => {
  it('starts with the pulse at the back mirror and every clock at zero', () => {
    const r = runLengthContractionExperiment(0.6)
    const s = lengthContractionStateAt(r, 0)
    expect(s.restClock.clockReading).toBe(0)
    expect(s.restClock.pulsePosition).toBe(0)
    ;[s.sameLength, s.shorterLength].forEach((clock) => {
      expect(clock.clockReading).toBe(0)
      expect(clock.leg).toBe('forward')
      expect(clock.pulsePosition).toBe(0)
      expect(clock.backMirrorPosition).toBe(0)
      expect(clock.tickProgress).toBe(0)
    })
    expect(s.sameLength.frontMirrorPosition).toBe(REST_LENGTH)
    expect(s.shorterLength.frontMirrorPosition).toBeCloseTo(r.shorterLength.lengthInLab, 12)
  })

  it('the pulse is at the front mirror at the end of the forward leg', () => {
    SPEEDS.forEach((v) => {
      const r = runLengthContractionExperiment(v)
      ;(['sameLength', 'shorterLength'] as const).forEach((key) => {
        const t = r[key].forwardLegDuration
        const clock = lengthContractionStateAt(r, t)[key]
        expect(clock.pulsePosition).toBeCloseTo(clock.frontMirrorPosition, 10)
        expect(clock.leg).toBe('forward')
      })
    })
  })

  it('the pulse is back at the back mirror at the end of the tick and the clock is then held', () => {
    SPEEDS.forEach((v) => {
      const r = runLengthContractionExperiment(v)
      ;(['sameLength', 'shorterLength'] as const).forEach((key) => {
        const version = r[key]
        const end = lengthContractionStateAt(r, version.tickDuration)[key]
        expect(end.leg).toBe('finished')
        expect(end.tickProgress).toBe(1)
        expect(end.pulsePosition).toBeCloseTo(end.backMirrorPosition, 10)
        expect(end.backMirrorPosition).toBeCloseTo(version.sidewaysDistancePerTick, 12)
        const later = lengthContractionStateAt(r, version.tickDuration + 3)[key]
        expect(later).toEqual(end)
      })
    })
  })

  it('the mirrors move together at v and the pulse moves at c during each leg', () => {
    const r = runLengthContractionExperiment(0.6)
    const dt = 0.1
    ;(['sameLength', 'shorterLength'] as const).forEach((key) => {
      const a = lengthContractionStateAt(r, 0.2)[key]
      const b = lengthContractionStateAt(r, 0.2 + dt)[key]
      expect((b.backMirrorPosition - a.backMirrorPosition) / dt).toBeCloseTo(0.6, 10)
      expect((b.frontMirrorPosition - a.frontMirrorPosition) / dt).toBeCloseTo(0.6, 10)
      expect((b.frontMirrorPosition - b.backMirrorPosition)).toBeCloseTo(r[key].lengthInLab, 12)
      expect((b.pulsePosition - a.pulsePosition) / dt).toBeCloseTo(1, 10)
    })
    // On the return leg the pulse moves backward at c.
    const t = r.sameLength.forwardLegDuration + 0.05
    const c1 = lengthContractionStateAt(r, t).sameLength
    const c2 = lengthContractionStateAt(r, t + 0.05).sameLength
    expect(c1.leg).toBe('return')
    expect((c2.pulsePosition - c1.pulsePosition) / 0.05).toBeCloseTo(-1, 10)
  })

  it("the moving clocks' own readings show one tick as 1 second at the end of a shorter-length tick", () => {
    const r = runLengthContractionExperiment(0.6)
    const end = lengthContractionStateAt(r, r.shorterLength.tickDuration)
    expect(end.shorterLength.clockReading).toBeCloseTo(1, 12)
    // The same-length clock would read more than one second for the same one tick.
    const sameEnd = lengthContractionStateAt(r, r.sameLength.tickDuration)
    expect(sameEnd.sameLength.clockReading).toBeCloseTo(1.25, 12)
    expect(end.restClock.clockReading).toBeCloseTo(1.25, 12)
  })

  it('the rest clock keeps ticking with the pulse between its mirrors', () => {
    const r = runLengthContractionExperiment(0.6)
    ;[0, 0.25, 0.5, 0.75, 1, 1.4, 2.6].forEach((t) => {
      const s = lengthContractionStateAt(r, t).restClock
      expect(s.pulsePosition).toBeGreaterThanOrEqual(0)
      expect(s.pulsePosition).toBeLessThanOrEqual(REST_LENGTH + 1e-12)
      expect(s.clockReading).toBe(t)
    })
    expect(lengthContractionStateAt(r, 0.5).restClock.pulsePosition).toBeCloseTo(REST_LENGTH, 12)
    expect(lengthContractionStateAt(r, 1).restClock.pulsePosition).toBeCloseTo(0, 12)
  })

  it('rejects negative or non-finite lab time', () => {
    const r = runLengthContractionExperiment(0.5)
    expect(() => lengthContractionStateAt(r, -1)).toThrow(RangeError)
    expect(() => lengthContractionStateAt(r, Infinity)).toThrow(RangeError)
  })
})

describe('Length Contraction over the speeds the interface allows', () => {
  // The interface allows 0.01c to 0.9c in steps of 0.01c.
  const allowedSpeeds = Array.from({ length: 90 }, (_, i) => (i + 1) / 100)

  it('a full playback ends with both moving clocks finished and the pulse back at the back mirror', () => {
    allowedSpeeds.forEach((v) => {
      const r = runLengthContractionExperiment(v)
      const runDuration = Math.max(r.sameLength.tickDuration, r.shorterLength.tickDuration)
      const end = lengthContractionStateAt(r, runDuration)
      ;(['sameLength', 'shorterLength'] as const).forEach((key) => {
        expect(end[key].leg).toBe('finished')
        expect(end[key].pulsePosition).toBeCloseTo(end[key].backMirrorPosition, 9)
        expect(end[key].frontMirrorPosition - end[key].backMirrorPosition).toBeCloseTo(
          r[key].lengthInLab,
          12
        )
      })
      // The shorter-length clock reads exactly one rest tick on its own display at the end of its tick.
      expect(end.shorterLength.clockReading).toBeCloseTo(r.restTickDuration, 9)
    })
  })

  it('no run is longer than the playback limit at the fastest allowed speed', () => {
    // Playback is 2 real seconds per lab second, so the slowest run at 0.9c must stay under 15 seconds.
    const r = runLengthContractionExperiment(0.9)
    expect(r.sameLength.tickDuration * 2).toBeLessThan(15)
  })
})

describe('The learner\'s guess drawn beside the real result', () => {
  const at = (v: number) => runLengthContractionExperiment(v)

  it('the gap bars always run to twice the rest gap, 1 light-second, at every speed', () => {
    for (const v of SPEEDS) {
      expect(lengthBarsScaleEnd(at(v))).toBeCloseTo(2 * REST_LENGTH, 12)
      expect(lengthBarsScaleEnd(at(v))).toBeCloseTo(1, 12)
    }
  })

  it('no real gap is longer than half the scale, so the real bars always fit', () => {
    for (const v of SPEEDS) {
      const e = at(v)
      expect(e.sameLength.lengthInLab).toBeLessThanOrEqual(lengthBarsScaleEnd(e) / 2 + 1e-12)
      expect(e.shorterLength.lengthInLab).toBeLessThanOrEqual(lengthBarsScaleEnd(e) / 2 + 1e-12)
    }
  })

  it('a guess of 0.5 sits at 0.5 on the scale, 0 at 0 and 1 at 1 light-second', () => {
    const e = at(0.5)
    expect(guessPositionOnLengthBars(e, 0.5).fraction).toBeCloseTo(0.5, 12)
    expect(guessPositionOnLengthBars(e, 0).fraction).toBe(0)
    expect(guessPositionOnLengthBars(e, 1).fraction).toBe(1)
    expect(guessPositionOnLengthBars(e, 0.5).offEdge).toBeNull()
  })

  it('a guess beyond the scale is clamped to 1 and flagged right; a negative guess is clamped to 0 and flagged left', () => {
    const e = at(0.5)
    expect(guessPositionOnLengthBars(e, 3)).toMatchObject({ fraction: 1, offEdge: 'right' })
    expect(guessPositionOnLengthBars(e, -0.2)).toMatchObject({ fraction: 0, offEdge: 'left' })
  })

  it('the differences from the real gap are exact: at 0.5c, 0.45 gives +0.017 and 0.4 gives -0.033', () => {
    const e = at(0.5)
    expect(guessPositionOnLengthBars(e, 0.45).differenceFromReal).toBeCloseTo(0.45 - 0.4330127, 6)
    expect(guessPositionOnLengthBars(e, 0.4).differenceFromReal).toBeCloseTo(-0.0330127, 6)
    expect(guessPositionOnLengthBars(e, 0.45).differenceFromReal).toBeCloseTo(0.017, 3)
    expect(guessPositionOnLengthBars(e, 0.4).differenceFromReal).toBeCloseTo(-0.033, 3)
  })

  it('the real results are the same for any guess', () => {
    const before = JSON.stringify(at(0.5))
    guessPositionOnLengthBars(at(0.5), 0.1)
    markGuess(at(0.5), 7)
    choiceMarker(at(0.5), 'longer')
    expect(JSON.stringify(at(0.5))).toBe(before)
  })

  it('a guess that is not a finite number is refused', () => {
    const e = at(0.5)
    expect(() => guessPositionOnLengthBars(e, NaN)).toThrow()
    expect(() => guessPositionOnLengthBars(e, Infinity)).toThrow()
    expect(() => markGuess(e, NaN)).toThrow()
  })

  it('the marker points at the bar the learner chose; time dilation requires the closer-together clock at every speed', () => {
    for (const v of SPEEDS) {
      const e = at(v)
      expect(choiceMarker(e, 'same')).toEqual({ pointsAt: 'sameBar', requiredChoice: 'shorter' })
      expect(choiceMarker(e, 'shorter')).toEqual({ pointsAt: 'shorterBar', requiredChoice: 'shorter' })
      expect(choiceMarker(e, 'longer')).toEqual({ pointsAt: 'pastRestBar', requiredChoice: 'shorter' })
    }
  })

  it('markGuess at 0.5c: 0.433 is the same, 0.4 is less, 0.5 is more, with the differences the page shows', () => {
    const e = at(0.5)
    expect(markGuess(e, 0.433)).toEqual({ comparison: 'the same', difference: 0 })
    expect(markGuess(e, 0.4)).toEqual({ comparison: 'less', difference: 0.033 })
    expect(markGuess(e, 0.5)).toEqual({ comparison: 'more', difference: 0.067 })
  })

  it('the numbers drafted for the captions and the tutor match the module', () => {
    const e5 = at(0.5)
    expect(e5.sameLength.forwardLegDuration).toBeCloseTo(1, 12)
    expect(e5.sameLength.returnLegDuration).toBeCloseTo(1 / 3, 12)
    expect(e5.sameLength.tickDuration).toBeCloseTo(1.3333, 4)
    expect(e5.shorterLength.forwardLegDuration).toBeCloseTo(0.866, 3)
    expect(e5.shorterLength.returnLegDuration).toBeCloseTo(0.289, 3)
    expect(e5.timeDilationTick).toBeCloseTo(1.155, 3)
    expect(e5.sameLength.differenceFromTimeDilationTick).toBeCloseTo(0.179, 3)
    expect(at(0.8).shorterLength.lengthInLab).toBeCloseTo(0.3, 12)
    expect(at(0.8).sameLength.tickDuration).toBeCloseTo(2.778, 3)
    expect(at(0.1).shorterLength.lengthInLab).toBeCloseTo(0.4975, 4)
    expect(at(0.1).sameLength.tickDuration).toBeCloseTo(1.010, 3)
    expect(at(0.9).shorterLength.lengthInLab).toBeCloseTo(0.218, 3)
    expect(at(0.9).sameLength.tickDuration).toBeCloseTo(5.263, 3)
  })
})

describe('How the travel of light gives a length (the length-first wording)', () => {
  const at = (v: number) => runLengthContractionExperiment(v)

  it('a pulse crossing the clock standing still in 0.5 s means a length of 0.5 light-second (distance = speed x time)', () => {
    const rows = lengthBarRows(at(0.5))
    expect(rows[0].key).toBe('rest')
    expect(rows[0].forwardLegDuration * 1).toBeCloseTo(0.5, 12)
    expect(rows[0].lengthInLab).toBeCloseTo(rows[0].forwardLegDuration * 1, 12)
    expect(rows[0].tickDuration).toBeCloseTo(1, 12)
  })

  it('the two possible lengths drafted for the introduction table give the drafted trips at 0.5c', () => {
    const half = roundTripForLength(0.5, 0.5)
    expect(half.forwardLegDuration).toBeCloseTo(1, 12)
    expect(half.returnLegDuration).toBeCloseTo(1 / 3, 12)
    expect(half.tickDuration).toBeCloseTo(1.333, 3)
    const four = roundTripForLength(0.4, 0.5)
    expect(four.forwardLegDuration).toBeCloseTo(0.8, 12)
    expect(four.returnLegDuration).toBeCloseTo(0.2667, 4)
    expect(four.tickDuration).toBeCloseTo(1.067, 3)
  })

  it('each length gives its own tick: a longer clock always has a longer tick at the same speed', () => {
    for (const v of SPEEDS) {
      let last = -1
      for (const length of [0.1, 0.2, 0.3, 0.433, 0.5, 0.7]) {
        const tick = roundTripForLength(length, v).tickDuration
        expect(tick).toBeGreaterThan(last)
        last = tick
      }
    }
  })

  it('reading the tick back gives the length: lengthForTick undoes roundTripForLength at every speed', () => {
    for (const v of SPEEDS) {
      for (const length of [0.1, 0.3, 0.5]) {
        expect(lengthForTick(roundTripForLength(length, v).tickDuration, v)).toBeCloseTo(length, 10)
      }
    }
  })

  it('the length whose tick is the time dilation tick is the shorter clock\'s length, at every speed', () => {
    for (const v of SPEEDS) {
      const e = at(v)
      expect(lengthForTick(e.timeDilationTick, v)).toBeCloseTo(e.shorterLength.lengthInLab, 10)
    }
  })

  it('at 0.5c the length that fits is 0.433 and the rest length does not fit', () => {
    const e = at(0.5)
    expect(lengthForTick(e.timeDilationTick, 0.5)).toBeCloseTo(0.433, 3)
    expect(lengthForTick(e.timeDilationTick, 0.5)).toBeLessThan(e.restLength)
  })

  it('the length strip rows carry exactly the module\'s lengths and trips, and the trips add up to the tick', () => {
    for (const v of SPEEDS) {
      const e = at(v)
      const rows = lengthBarRows(e)
      expect(rows.map((r) => r.key)).toEqual(['rest', 'same', 'shorter'])
      expect(rows[0].lengthInLab).toBe(e.restLength)
      expect(rows[1].lengthInLab).toBe(e.sameLength.lengthInLab)
      expect(rows[2].lengthInLab).toBe(e.shorterLength.lengthInLab)
      expect(rows[1].forwardLegDuration).toBe(e.sameLength.forwardLegDuration)
      expect(rows[2].returnLegDuration).toBe(e.shorterLength.returnLegDuration)
      for (const r of rows.slice(1)) {
        expect(r.forwardLegDuration + (r.returnLegDuration ?? 0)).toBeCloseTo(r.tickDuration, 12)
      }
    }
  })

  it('refuses a length or tick that is not finite and non-negative, and a speed outside 0 <= v < c', () => {
    expect(() => roundTripForLength(NaN, 0.5)).toThrow()
    expect(() => roundTripForLength(-1, 0.5)).toThrow()
    expect(() => roundTripForLength(0.5, 1)).toThrow()
    expect(() => roundTripForLength(0.5, -0.1)).toThrow()
    expect(() => lengthForTick(Infinity, 0.5)).toThrow()
    expect(() => lengthForTick(1, 1)).toThrow()
  })

  it('the choice names are same, shorter and longer, and time dilation requires shorter at every speed above 0', () => {
    for (const v of SPEEDS) {
      const e = at(v)
      expect(choiceMarker(e, 'shorter')).toEqual({ pointsAt: 'shorterBar', requiredChoice: 'shorter' })
      expect(choiceMarker(e, 'longer').requiredChoice).toBe('shorter')
    }
    expect(choiceMarker(at(0), 'same').requiredChoice).toBe('same')
  })
})
