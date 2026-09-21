import { describe, it, expect } from 'vitest'
import {
  runLengthContractionExperiment,
  lengthContractionStateAt,
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
