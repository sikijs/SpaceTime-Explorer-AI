import { describe, it, expect } from 'vitest'
import {
  runSimultaneityExperiment,
  labViewStateAt,
  rodViewStateAt,
} from './relativityOfSimultaneityExperiment'
import { runLengthContractionExperiment, REST_LENGTH } from './lengthContractionExperiment'

const SPEEDS = [0.01, 0.1, 0.3, 0.5, 0.6, 0.8, 0.9]

describe('Relativity of Simultaneity Experiment Physics', () => {
  it('at v = 0 both events occur at the same lab time and the same rod-frame time', () => {
    const r = runSimultaneityExperiment(0)
    expect(r.backEventLabTime).toBeCloseTo(REST_LENGTH / 2, 12)
    expect(r.frontEventLabTime).toBeCloseTo(REST_LENGTH / 2, 12)
    expect(r.labTimeGap).toBeCloseTo(0, 12)
    expect(r.rodFrameEventTime).toBeCloseTo(REST_LENGTH / 2, 12)
  })

  it('the back event happens before the front event for every tested v > 0', () => {
    SPEEDS.forEach((v) => {
      const r = runSimultaneityExperiment(v)
      expect(r.backEventLabTime).toBeLessThan(r.frontEventLabTime)
    })
  })

  it('event times follow (L/2)/(1+v) and (L/2)/(1-v), using the contracted lab length', () => {
    SPEEDS.forEach((v) => {
      const r = runSimultaneityExperiment(v)
      const halfLength = r.labLength / 2
      expect(r.backEventLabTime).toBeCloseTo(halfLength / (1 + v), 12)
      expect(r.frontEventLabTime).toBeCloseTo(halfLength / (1 - v), 12)
    })
  })

  it('the rod-frame event time is independent of v and equal for both events', () => {
    SPEEDS.forEach((v) => {
      const r = runSimultaneityExperiment(v)
      expect(r.rodFrameEventTime).toBeCloseTo(REST_LENGTH / 2, 12)
    })
    // Same value at every speed, including 0.
    const values = [0, ...SPEEDS].map((v) => runSimultaneityExperiment(v).rodFrameEventTime)
    values.forEach((value) => expect(value).toBeCloseTo(values[0], 12))
  })

  it('the lab-frame time gap is strictly increasing with speed', () => {
    const gaps = [0, ...SPEEDS].map((v) => runSimultaneityExperiment(v).labTimeGap)
    for (let i = 1; i < gaps.length; i++) {
      expect(gaps[i]).toBeGreaterThan(gaps[i - 1])
    }
  })

  it('reuses Experiment 6 length contraction for the lab-frame rod length', () => {
    SPEEDS.forEach((v) => {
      const r = runSimultaneityExperiment(v)
      const contraction = runLengthContractionExperiment(v)
      expect(r.labLength).toBe(contraction.shorterLength.lengthInLab)
    })
  })

  it('matches the worked preset table', () => {
    const cases: Array<[number, number, number, number, number]> = [
      // v, labLength, backEventLabTime, frontEventLabTime, labTimeGap
      [0, 0.5, 0.25, 0.25, 0],
      [0.1, 0.497494, 0.226134, 0.276385, 0.050252],
      [0.3, 0.47697, 0.18345, 0.340693, 0.157243],
      [0.5, 0.433013, 0.144338, 0.433013, 0.288675],
      [0.8, 0.3, 0.083333, 0.75, 0.666667],
      [0.9, 0.217945, 0.057354, 1.089725, 1.032371],
    ]
    cases.forEach(([v, labLength, backTime, frontTime, gap]) => {
      const r = runSimultaneityExperiment(v)
      expect(r.labLength).toBeCloseTo(labLength, 5)
      expect(r.backEventLabTime).toBeCloseTo(backTime, 5)
      expect(r.frontEventLabTime).toBeCloseTo(frontTime, 5)
      expect(r.labTimeGap).toBeCloseTo(gap, 5)
    })
  })

  it('rejects velocities outside 0 <= v < c', () => {
    expect(() => runSimultaneityExperiment(-0.1)).toThrow()
    expect(() => runSimultaneityExperiment(1)).toThrow()
    expect(() => runSimultaneityExperiment(1.5)).toThrow()
  })

  it('is deterministic and independent of any UI or animation state', () => {
    for (let v = 0.01; v < 0.99; v += 0.01) {
      const a = runSimultaneityExperiment(v)
      const b = runSimultaneityExperiment(v)
      expect(a).toEqual(b)
    }
  })

  describe('lab view playback state', () => {
    it('starts at the emission point with both mirrors at their initial positions', () => {
      const r = runSimultaneityExperiment(0.5)
      const s = labViewStateAt(r, 0)
      expect(s.leftPulsePosition).toBeCloseTo(0, 12)
      expect(s.rightPulsePosition).toBeCloseTo(0, 12)
      expect(s.backMirrorPosition).toBeCloseTo(-r.labLength / 2, 12)
      expect(s.frontMirrorPosition).toBeCloseTo(r.labLength / 2, 12)
      expect(s.backEventFired).toBe(false)
      expect(s.frontEventFired).toBe(false)
    })

    it('fires the back event before the front event and holds each pulse where it met its mirror', () => {
      const r = runSimultaneityExperiment(0.5)
      const midway = labViewStateAt(r, (r.backEventLabTime + r.frontEventLabTime) / 2)
      expect(midway.backEventFired).toBe(true)
      expect(midway.frontEventFired).toBe(false)
      // The pulse freezes where it met the back mirror; the mirror itself keeps moving afterward.
      expect(midway.leftPulsePosition).toBeCloseTo(
        -r.labLength / 2 + r.velocity * r.backEventLabTime,
        12
      )

      const end = labViewStateAt(r, r.frontEventLabTime)
      expect(end.backEventFired).toBe(true)
      expect(end.frontEventFired).toBe(true)
      expect(end.leftPulsePosition).toBeCloseTo(
        -r.labLength / 2 + r.velocity * r.backEventLabTime,
        12
      )
      expect(end.rightPulsePosition).toBeCloseTo(end.frontMirrorPosition, 12)
    })

    it('rejects a negative or non-finite lab time', () => {
      const r = runSimultaneityExperiment(0.5)
      expect(() => labViewStateAt(r, -1)).toThrow()
      expect(() => labViewStateAt(r, NaN)).toThrow()
    })
  })

  describe('rod view playback state', () => {
    it('the rod does not move and both events fire together', () => {
      const r = runSimultaneityExperiment(0.5)
      const before = rodViewStateAt(r, r.rodFrameEventTime / 2)
      expect(before.backMirrorPosition).toBe(-r.restLength / 2)
      expect(before.frontMirrorPosition).toBe(r.restLength / 2)
      expect(before.backEventFired).toBe(false)
      expect(before.frontEventFired).toBe(false)

      const after = rodViewStateAt(r, r.rodFrameEventTime)
      expect(after.backEventFired).toBe(true)
      expect(after.frontEventFired).toBe(true)
      expect(after.leftPulsePosition).toBe(-r.restLength / 2)
      expect(after.rightPulsePosition).toBe(r.restLength / 2)
    })

    it('rejects a negative or non-finite own time', () => {
      const r = runSimultaneityExperiment(0.5)
      expect(() => rodViewStateAt(r, -1)).toThrow()
      expect(() => rodViewStateAt(r, NaN)).toThrow()
    })
  })
})
