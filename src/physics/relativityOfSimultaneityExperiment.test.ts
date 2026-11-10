import { describe, it, expect } from 'vitest'
import {
  runSimultaneityExperiment,
  labViewStateAt,
  rodViewStateAt,
  actualOrderFor,
  agreementMarkerTarget,
  eventStripPositions,
  markGuesses,
  orderMarkerTarget,
  PART1_STRIP_SCALE_END,
  PART2_STRIP_SCALE_END,
} from './relativityOfSimultaneityExperiment'
import type { OrderChoice } from './relativityOfSimultaneityExperiment'
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

describe('the strip of event times and the guesses (audit update)', () => {
  const choices: OrderChoice[] = ['same', 'back', 'front']

  it('the strip positions are the module\'s own event times divided by the scale', () => {
    const r = runSimultaneityExperiment(0.5)
    const p = eventStripPositions(r, PART1_STRIP_SCALE_END)
    expect(p.labBack).toBeCloseTo(r.backEventLabTime / 0.5, 12)
    expect(p.labFront).toBeCloseTo(r.frontEventLabTime / 0.5, 12)
    expect(p.rod).toBeCloseTo(r.rodFrameEventTime / 0.5, 12)
    expect(p.labGap).toBeCloseTo(0.28868, 5)
    // The worked numbers of the caption at 0.5c: 0.144 s, 0.433 s, 0.250 s.
    expect(r.backEventLabTime).toBeCloseTo(0.14434, 5)
    expect(r.frontEventLabTime).toBeCloseTo(0.43301, 5)
    expect(r.rodFrameEventTime).toBeCloseTo(0.25, 12)
  })

  it('at 0c the two lab dots sit on top of each other and on the rod\'s dot, and the gap is 0', () => {
    const p = eventStripPositions(runSimultaneityExperiment(0), PART2_STRIP_SCALE_END)
    expect(p.labBack).toBeCloseTo(p.labFront, 12)
    expect(p.labBack).toBeCloseTo(p.rod, 12)
    expect(p.labGap).toBe(0)
  })

  it('the rod row does not move with the speed, and the lab gap grows with it (the Part 2 values)', () => {
    const speeds = [0, 0.1, 0.3, 0.5, 0.8, 0.9]
    const gaps = speeds.map((v) => eventStripPositions(runSimultaneityExperiment(v), PART2_STRIP_SCALE_END))
    for (const g of gaps) expect(g.rod).toBeCloseTo(0.25 / 1.2, 12)
    for (let i = 1; i < gaps.length; i++) expect(gaps[i].labGap).toBeGreaterThan(gaps[i - 1].labGap)
    expect(gaps.map((g) => g.labGap.toFixed(3))).toEqual(['0.000', '0.050', '0.157', '0.289', '0.667', '1.032'])
  })

  it('every speed up to 0.9c fits the Part 2 scale, and a 0.9c run does not fit Part 1\'s scale', () => {
    for (let v = 0; v <= 0.9 + 1e-9; v += 0.01) {
      expect(() => eventStripPositions(runSimultaneityExperiment(v), PART2_STRIP_SCALE_END)).not.toThrow()
    }
    expect(() => eventStripPositions(runSimultaneityExperiment(0.9), PART1_STRIP_SCALE_END)).toThrow(RangeError)
    expect(() => eventStripPositions(runSimultaneityExperiment(0.5), 0)).toThrow(RangeError)
    expect(() => eventStripPositions(runSimultaneityExperiment(0.5), NaN)).toThrow(RangeError)
  })

  it('the order marker points at the guessed end, or joins both dots for "at the same time"', () => {
    const r = runSimultaneityExperiment(0.5)
    const p = eventStripPositions(r, PART1_STRIP_SCALE_END)
    expect(orderMarkerTarget(r, 'back', PART1_STRIP_SCALE_END)).toEqual({ pointsAt: 'backDot', fractions: [p.labBack] })
    expect(orderMarkerTarget(r, 'front', PART1_STRIP_SCALE_END)).toEqual({ pointsAt: 'frontDot', fractions: [p.labFront] })
    expect(orderMarkerTarget(r, 'same', PART1_STRIP_SCALE_END)).toEqual({ pointsAt: 'bothDots', fractions: [p.labBack, p.labFront] })
  })

  it('the agreement marker joins both rows and has no size', () => {
    expect(agreementMarkerTarget('agree')).toEqual({ joins: 'bothRows', choice: 'agree' })
    expect(agreementMarkerTarget('disagree')).toEqual({ joins: 'bothRows', choice: 'disagree' })
  })

  it('a guess never changes a real value: the result is identical before and after every marker is built', () => {
    for (const v of [0, 0.5, 0.9]) {
      const before = runSimultaneityExperiment(v)
      const copy = JSON.parse(JSON.stringify(before))
      for (const c of choices) orderMarkerTarget(before, c, PART2_STRIP_SCALE_END)
      for (const a of ['agree', 'disagree'] as const) {
        agreementMarkerTarget(a)
        markGuesses(before, 'back', a)
      }
      expect(before).toEqual(copy)
      expect(runSimultaneityExperiment(v)).toEqual(copy)
    }
  })

  it('the actual order is "at the same time" only at 0c, and the back end first at every speed above 0', () => {
    expect(actualOrderFor(runSimultaneityExperiment(0))).toBe('same')
    for (const v of [0.01, 0.1, 0.5, 0.9]) expect(actualOrderFor(runSimultaneityExperiment(v))).toBe('back')
  })

  it('the marking says which choice was made and what the run showed, with no score', () => {
    const r = runSimultaneityExperiment(0.5)
    const m = markGuesses(r, 'same', 'agree')
    expect(m.orderChoice).toBe('same')
    expect(m.actualOrder).toBe('back')
    expect(m.labGap).toBeCloseTo(0.28868, 5)
    expect(m.rodGap).toBe(0)
    expect(m.agreementChoice).toBe('agree')
    expect(m.rowsAgree).toBe(false)
    expect(Object.keys(m).some((k) => /score|right|wrong|correct/i.test(k))).toBe(false)
    // At 0c both rows put the two arrivals together.
    expect(markGuesses(runSimultaneityExperiment(0), 'same', 'agree').rowsAgree).toBe(true)
  })
})
