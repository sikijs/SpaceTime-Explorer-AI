import { describe, it, expect } from 'vitest'
import {
  AXES_SKETCH_EXTENT,
  AXES_SKETCH_LEAN,
  EXAMPLE_TICK_GAP,
  PART1_CLOCKS_SCALE_END,
  PART2_CLOCKS_SCALE_END,
  axesSketchFor,
  blockFrameEventsFor,
  checkUpRowsFor,
  clockRowsFor,
  lorentzTransform,
  lorentzWorkedNumbers,
  markTimeGuess,
  timeGuessMarkerFor,
} from './lorentzTransform'
import { spacetimeDiagramFor } from './spacetimeDiagramView'
import { runSimultaneityExperiment } from './relativityOfSimultaneityExperiment'
import { REST_LENGTH } from './lengthContractionExperiment'

const SPEEDS = [0.01, 0.1, 0.3, 0.5, 0.6, 0.8, 0.9]
const TEST_EVENTS = [
  { position: 0, time: 0 },
  { position: 1.5, time: 2 },
  { position: -0.7, time: 3.2 },
  { position: 2.4, time: 0.1 },
]

describe('Lorentz Transform Physics (Experiment 11)', () => {
  it('is the identity at v = 0, for arbitrary events', () => {
    TEST_EVENTS.forEach((event) => {
      const transformed = lorentzTransform(event, 0)
      expect(transformed.time).toBeCloseTo(event.time, 12)
      expect(transformed.position).toBeCloseTo(event.position, 12)
    })
  })

  it('preserves the invariant interval (time^2 - position^2) for arbitrary events and speeds', () => {
    TEST_EVENTS.forEach((event) => {
      SPEEDS.forEach((v) => {
        const transformed = lorentzTransform(event, v)
        const originalInterval = event.time * event.time - event.position * event.position
        const transformedInterval = transformed.time * transformed.time - transformed.position * transformed.position
        expect(transformedInterval).toBeCloseTo(originalInterval, 10)
      })
    })
  })

  it("matches Experiment 7's own rodFrameEventTime for both back and front events, at every tested speed", () => {
    SPEEDS.forEach((v) => {
      const result = runSimultaneityExperiment(v)
      const diagram = spacetimeDiagramFor(result)

      const transformedBack = lorentzTransform(diagram.backEvent, v)
      const transformedFront = lorentzTransform(diagram.frontEvent, v)

      expect(transformedBack.time).toBeCloseTo(result.rodFrameEventTime, 10)
      expect(transformedFront.time).toBeCloseTo(result.rodFrameEventTime, 10)
      expect(transformedBack.time).toBeCloseTo(transformedFront.time, 10)
    })
  })

  it("gives a constant rod-frame position for the rod's own worldline endpoints, matching its rest length", () => {
    SPEEDS.forEach((v) => {
      const result = runSimultaneityExperiment(v)
      const diagram = spacetimeDiagramFor(result)

      const backStart = lorentzTransform(diagram.backWorldline[0], v)
      const backEnd = lorentzTransform(diagram.backWorldline[1], v)
      const frontStart = lorentzTransform(diagram.frontWorldline[0], v)
      const frontEnd = lorentzTransform(diagram.frontWorldline[1], v)

      expect(backStart.position).toBeCloseTo(-REST_LENGTH / 2, 10)
      expect(backEnd.position).toBeCloseTo(-REST_LENGTH / 2, 10)
      expect(frontStart.position).toBeCloseTo(REST_LENGTH / 2, 10)
      expect(frontEnd.position).toBeCloseTo(REST_LENGTH / 2, 10)
    })
  })

  it('is deterministic across repeated calls', () => {
    TEST_EVENTS.forEach((event) => {
      SPEEDS.forEach((v) => {
        const a = lorentzTransform(event, v)
        const b = lorentzTransform(event, v)
        expect(a).toEqual(b)
      })
    })
  })
})

describe('Experiment 11, audit update: the panel, the marker, the check-up and the worked numbers', () => {
  const ALL = [0, ...SPEEDS]

  it('the block-frame times agree at every speed, and equal Experiment 7 (read from the numbers, not fixed)', () => {
    ALL.forEach((v) => {
      const result = runSimultaneityExperiment(v)
      const events = blockFrameEventsFor(result)
      expect(events.timesAgree).toBe(true)
      expect(events.block.back.time).toBeCloseTo(result.rodFrameEventTime, 10)
      expect(events.block.front.time).toBeCloseTo(result.rodFrameEventTime, 10)
    })
  })

  it('timesAgree is read from the transformed times: it is true only when they match', () => {
    const result = runSimultaneityExperiment(0.5)
    const events = blockFrameEventsFor(result)
    expect(events.timesAgree).toBe(Math.abs(events.block.back.time - events.block.front.time) <= 1e-9)
    const lab = events.lab
    expect(lab.back.time).toBeLessThan(lab.front.time)
  })

  it('the block-frame positions are minus and plus half the rest length', () => {
    ALL.forEach((v) => {
      const result = runSimultaneityExperiment(v)
      const events = blockFrameEventsFor(result)
      expect(events.block.back.position).toBeCloseTo(-REST_LENGTH / 2, 10)
      expect(events.block.front.position).toBeCloseTo(REST_LENGTH / 2, 10)
    })
  })

  it('the panel rows give the quoted numbers at 0.5c and fit the Part 1 scale', () => {
    const rows = clockRowsFor(runSimultaneityExperiment(0.5), PART1_CLOCKS_SCALE_END)
    expect(rows.lab.back.time).toBeCloseTo(0.144, 3)
    expect(rows.lab.front.time).toBeCloseTo(0.433, 3)
    expect(rows.block.back.time).toBeCloseTo(0.25, 10)
    expect(rows.block.front.time).toBeCloseTo(0.25, 10)
    expect(rows.block.back.fraction).toBeCloseTo(0.5, 10)
    expect(rows.fits).toBe(true)
  })

  it('every Part 2 speed fits the Part 2 scale, and a too-short scale is reported, not hidden', () => {
    ;[0, 0.1, 0.3, 0.5, 0.8, 0.9].forEach((v) => {
      expect(clockRowsFor(runSimultaneityExperiment(v), PART2_CLOCKS_SCALE_END).fits).toBe(true)
    })
    expect(clockRowsFor(runSimultaneityExperiment(0.9), PART1_CLOCKS_SCALE_END).fits).toBe(false)
    expect(() => clockRowsFor(runSimultaneityExperiment(0.5), 0)).toThrow(RangeError)
  })

  it('the lab times are spread apart and the block times are not, at 0.8c and 0.9c', () => {
    ;[0.8, 0.9].forEach((v) => {
      const rows = clockRowsFor(runSimultaneityExperiment(v), PART2_CLOCKS_SCALE_END)
      expect(rows.lab.front.time - rows.lab.back.time).toBeGreaterThan(0.5)
      expect(rows.block.front.time - rows.block.back.time).toBeCloseTo(0, 10)
    })
    const at0 = clockRowsFor(runSimultaneityExperiment(0), PART2_CLOCKS_SCALE_END)
    expect(at0.lab.back.time).toBeCloseTo(at0.lab.front.time, 10)
  })

  it('the guess marker points by choice and changes no real value', () => {
    expect(timeGuessMarkerFor('same')).toEqual({ kind: 'level', gap: 0 })
    expect(timeGuessMarkerFor('different')).toEqual({ kind: 'apart', gap: EXAMPLE_TICK_GAP })
    const before = blockFrameEventsFor(runSimultaneityExperiment(0.5))
    timeGuessMarkerFor('same')
    timeGuessMarkerFor('different')
    expect(blockFrameEventsFor(runSimultaneityExperiment(0.5))).toEqual(before)
  })

  it('the tutor marking compares the guess with the block clocks, for both guesses, with the numbers behind it', () => {
    const result = runSimultaneityExperiment(0.5)
    const same = markTimeGuess('same', result)
    expect(same.actual).toBe('same')
    expect(same.chosen).toBe('same')
    expect(same.blockBackTime).toBeCloseTo(0.25, 10)
    expect(same.labFrontTime).toBeCloseTo(0.433, 3)
    expect(markTimeGuess('different', result).actual).toBe('same')
    expect(markTimeGuess('different', result).chosen).toBe('different')
  })

  it('the check-up rows read "the same" against Experiment 7 and the rest length, at every speed', () => {
    ALL.forEach((v) => {
      const rows = checkUpRowsFor(runSimultaneityExperiment(v))
      expect(rows).toHaveLength(4)
      rows.forEach((row) => expect(row.reading).toBe('the same'))
      expect(rows[0].expected).toBeCloseTo(0.25, 10)
      expect(rows[2].expected).toBeCloseTo(-0.25, 10)
      expect(rows[3].expected).toBeCloseTo(0.25, 10)
    })
  })

  it('the check-up says "more" or "less" when a found number is off', () => {
    const result = runSimultaneityExperiment(0.5)
    const off = { ...result, rodFrameEventTime: 0.2 }
    expect(checkUpRowsFor(off)[0].reading).toBe('more')
    const off2 = { ...result, rodFrameEventTime: 0.3 }
    expect(checkUpRowsFor(off2)[0].reading).toBe('less')
  })

  it('the worked numbers reproduce the figures quoted on the page', () => {
    const result = runSimultaneityExperiment(0.5)
    const events = blockFrameEventsFor(result)
    const back = lorentzWorkedNumbers(events.lab.back, 0.5)
    expect(back.inverseFactor).toBeCloseTo(1.155, 3)
    expect(back.timeTerm).toBeCloseTo(0.2165, 3)
    expect(back.blockTime).toBeCloseTo(0.25, 10)
    const front = lorentzWorkedNumbers(events.lab.front, 0.5)
    expect(front.timeTerm).toBeCloseTo(0.2165, 3)
    expect(front.blockTime).toBeCloseTo(0.25, 10)

    const fast = runSimultaneityExperiment(0.8)
    const fastEvents = blockFrameEventsFor(fast)
    const fb = lorentzWorkedNumbers(fastEvents.lab.back, 0.8)
    expect(fb.inverseFactor).toBeCloseTo(1.6667, 4)
    expect(fb.blockTime).toBeCloseTo(0.25, 10)

    const example = lorentzWorkedNumbers({ position: 0.2, time: 0.5 }, 0.6)
    expect(example.factor).toBeCloseTo(0.8, 12)
    expect(example.inverseFactor).toBeCloseTo(1.25, 12)
    expect(example.blockTime).toBeCloseTo(0.475, 12)
    expect(example.blockPosition).toBeCloseTo(-0.125, 12)
  })

  it('the worked numbers agree with lorentzTransform itself', () => {
    TEST_EVENTS.forEach((event) => {
      SPEEDS.forEach((v) => {
        const w = lorentzWorkedNumbers(event, v)
        const t = lorentzTransform(event, v)
        expect(w.blockTime).toBeCloseTo(t.time, 12)
        expect(w.blockPosition).toBeCloseTo(t.position, 12)
      })
    })
  })

  it('the axes sketch has the lab pair upright and level and the moving pair leaning by 0.25 each', () => {
    const sketch = axesSketchFor()
    expect(sketch.lean).toBe(AXES_SKETCH_LEAN)
    expect(sketch.labTimeAxis[1].position).toBe(0)
    expect(sketch.labSpaceAxis[1].time).toBe(0)
    const [tStart, tEnd] = sketch.movingTimeAxis
    const [sStart, sEnd] = sketch.movingSpaceAxis
    expect((tEnd.position - tStart.position) / (tEnd.time - tStart.time)).toBeCloseTo(0.25, 12)
    expect((sEnd.time - sStart.time) / (sEnd.position - sStart.position)).toBeCloseTo(0.25, 12)
    expect(tEnd.time).toBe(AXES_SKETCH_EXTENT)
    expect(sEnd.position).toBe(AXES_SKETCH_EXTENT)
  })
})
