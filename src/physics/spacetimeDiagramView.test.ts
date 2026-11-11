import { describe, it, expect } from 'vitest'
import { EXAMPLE_LEAN, actualShapeFor, levelLineSketchFor, levelReferenceLineFor, markShapeGuess, sameMomentLeanFor, sameMomentLineExtended, shapeMarkerFor, actualOrderFor, blockSketchFor, diagramTicksFor, flashSketchFor, guessMarkerFor, markOrderGuess, spacetimeDiagramFor, sameMomentLineFor, rodTimeAxisFor, rodSpaceAxisFor } from './spacetimeDiagramView'
import { runSimultaneityExperiment } from './relativityOfSimultaneityExperiment'
import { SPEED_OF_LIGHT } from './movingClockExperiment'

const SPEEDS = [0.01, 0.1, 0.3, 0.5, 0.6, 0.8, 0.9]

describe('Spacetime Diagram View', () => {
  it('at v = 0 both worldlines are vertical and both events occur at equal height', () => {
    const result = runSimultaneityExperiment(0)
    const diagram = spacetimeDiagramFor(result)

    expect(diagram.backWorldline[0].position).toBeCloseTo(diagram.backWorldline[1].position, 12)
    expect(diagram.frontWorldline[0].position).toBeCloseTo(diagram.frontWorldline[1].position, 12)
    expect(diagram.backEvent.time).toBeCloseTo(diagram.frontEvent.time, 12)
  })

  it("the back and front worldlines' slope equals the rod's velocity", () => {
    SPEEDS.forEach((v) => {
      const result = runSimultaneityExperiment(v)
      const diagram = spacetimeDiagramFor(result)

      const backSlope =
        (diagram.backWorldline[1].position - diagram.backWorldline[0].position) /
        (diagram.backWorldline[1].time - diagram.backWorldline[0].time)
      const frontSlope =
        (diagram.frontWorldline[1].position - diagram.frontWorldline[0].position) /
        (diagram.frontWorldline[1].time - diagram.frontWorldline[0].time)

      expect(backSlope).toBeCloseTo(v, 12)
      expect(frontSlope).toBeCloseTo(v, 12)
    })
  })

  it('both light worldlines have slope exactly c (1) in their respective directions', () => {
    SPEEDS.forEach((v) => {
      const result = runSimultaneityExperiment(v)
      const diagram = spacetimeDiagramFor(result)

      const leftSlope =
        (diagram.leftLightWorldline[1].position - diagram.leftLightWorldline[0].position) /
        (diagram.leftLightWorldline[1].time - diagram.leftLightWorldline[0].time)
      const rightSlope =
        (diagram.rightLightWorldline[1].position - diagram.rightLightWorldline[0].position) /
        (diagram.rightLightWorldline[1].time - diagram.rightLightWorldline[0].time)

      expect(leftSlope).toBeCloseTo(-SPEED_OF_LIGHT, 12)
      expect(rightSlope).toBeCloseTo(SPEED_OF_LIGHT, 12)
    })
  })

  it('the marked events match the times from runSimultaneityExperiment at every tested speed', () => {
    SPEEDS.forEach((v) => {
      const result = runSimultaneityExperiment(v)
      const diagram = spacetimeDiagramFor(result)

      expect(diagram.backEvent.time).toBeCloseTo(result.backEventLabTime, 12)
      expect(diagram.frontEvent.time).toBeCloseTo(result.frontEventLabTime, 12)
    })
  })

  it('the marked events lie on both the rod worldline and the light worldline that meet there', () => {
    SPEEDS.forEach((v) => {
      const result = runSimultaneityExperiment(v)
      const diagram = spacetimeDiagramFor(result)

      // Back event: on the back worldline (position = -halfLength + v * t) ...
      const halfLength = result.labLength / 2
      expect(diagram.backEvent.position).toBeCloseTo(-halfLength + v * result.backEventLabTime, 12)
      // ... and on the left light worldline (position = -c * t).
      expect(diagram.backEvent.position).toBeCloseTo(-SPEED_OF_LIGHT * result.backEventLabTime, 12)

      expect(diagram.frontEvent.position).toBeCloseTo(halfLength + v * result.frontEventLabTime, 12)
      expect(diagram.frontEvent.position).toBeCloseTo(SPEED_OF_LIGHT * result.frontEventLabTime, 12)
    })
  })

  it('is deterministic and independent of any UI or animation state', () => {
    for (let v = 0.01; v < 0.99; v += 0.01) {
      const result = runSimultaneityExperiment(v)
      const a = spacetimeDiagramFor(result)
      const b = spacetimeDiagramFor(result)
      expect(a).toEqual(b)
    }
  })
})

describe('Same Moment Line (Experiment 9)', () => {
  it('passes exactly through the already-known backEvent and frontEvent, at every tested speed', () => {
    SPEEDS.forEach((v) => {
      const result = runSimultaneityExperiment(v)
      const diagram = spacetimeDiagramFor(result)
      const [start, end] = sameMomentLineFor(diagram)

      expect(start).toEqual(diagram.backEvent)
      expect(end).toEqual(diagram.frontEvent)
    })
  })

  it('is flat (constant time) at v = 0', () => {
    const result = runSimultaneityExperiment(0)
    const diagram = spacetimeDiagramFor(result)
    const [start, end] = sameMomentLineFor(diagram)

    expect(start.time).toBeCloseTo(end.time, 12)
  })

  it("has a time-over-position slope exactly equal to the rod's velocity, for every tested speed", () => {
    // Unlike a worldline (where position/time = velocity), this line is a line of simultaneity,
    // not the path of a moving object — its natural slope is time/position, and that ratio is
    // exactly v (in units where c = 1), the standard relativity-of-simultaneity result. Verified
    // here algebraically against Experiment 7's own tb = halfLength/(c+v), tf = halfLength/(c-v).
    SPEEDS.forEach((v) => {
      const result = runSimultaneityExperiment(v)
      const diagram = spacetimeDiagramFor(result)
      const [start, end] = sameMomentLineFor(diagram)

      const timeOverPositionSlope = (end.time - start.time) / (end.position - start.position)
      expect(timeOverPositionSlope).toBeCloseTo(v, 12)
    })
  })

  it('is deterministic and independent of any UI or animation state', () => {
    for (let v = 0.01; v < 0.99; v += 0.01) {
      const result = runSimultaneityExperiment(v)
      const diagram = spacetimeDiagramFor(result)
      const a = sameMomentLineFor(diagram)
      const b = sameMomentLineFor(diagram)
      expect(a).toEqual(b)
    }
  })
})

describe("Rod's Own Axes (Experiment 11)", () => {
  it('both axes pass through the origin, including at v = 0', () => {
    ;[0, ...SPEEDS].forEach((v) => {
      const result = runSimultaneityExperiment(v)
      const diagram = spacetimeDiagramFor(result)

      const [timeStart] = rodTimeAxisFor(diagram)
      expect(timeStart).toEqual({ position: 0, time: 0 })

      const [spaceStart, spaceEnd] = rodSpaceAxisFor(diagram)
      // The origin lies on the line through spaceStart/spaceEnd exactly when v = 0 (a flat line
      // through time 0) or, in general, when interpolating to position 0 gives time 0.
      const slope = (spaceEnd.time - spaceStart.time) / (spaceEnd.position - spaceStart.position)
      const timeAtOrigin = spaceStart.time - slope * spaceStart.position
      expect(timeAtOrigin).toBeCloseTo(0, 12)
    })
  })

  it("rodTimeAxisFor's slope (position-over-time) equals the rod's own velocity exactly", () => {
    SPEEDS.forEach((v) => {
      const result = runSimultaneityExperiment(v)
      const diagram = spacetimeDiagramFor(result)
      const [start, end] = rodTimeAxisFor(diagram)

      const slope = (end.position - start.position) / (end.time - start.time)
      expect(slope).toBeCloseTo(v, 12)
    })
  })

  it("rodSpaceAxisFor's slope (time-over-position) equals v exactly, matching sameMomentLineFor's slope", () => {
    SPEEDS.forEach((v) => {
      const result = runSimultaneityExperiment(v)
      const diagram = spacetimeDiagramFor(result)

      const [spaceStart, spaceEnd] = rodSpaceAxisFor(diagram)
      const spaceSlope = (spaceEnd.time - spaceStart.time) / (spaceEnd.position - spaceStart.position)

      const [sameMomentStart, sameMomentEnd] = sameMomentLineFor(diagram)
      const sameMomentSlope =
        (sameMomentEnd.time - sameMomentStart.time) / (sameMomentEnd.position - sameMomentStart.position)

      expect(spaceSlope).toBeCloseTo(v, 12)
      expect(spaceSlope).toBeCloseTo(sameMomentSlope, 12)
    })
  })

  it('is deterministic and independent of any UI or animation state', () => {
    for (let v = 0.01; v < 0.99; v += 0.01) {
      const result = runSimultaneityExperiment(v)
      const diagram = spacetimeDiagramFor(result)

      expect(rodTimeAxisFor(diagram)).toEqual(rodTimeAxisFor(diagram))
      expect(rodSpaceAxisFor(diagram)).toEqual(rodSpaceAxisFor(diagram))
    }
  })
})

describe('Experiment 8 introduction sketch (block drawn at several moments)', () => {
  const photos = blockSketchFor(0.5, 4, 0.2)

  it('has the requested number of photos, 0.2 s apart, the first at time 0', () => {
    expect(photos.map((p) => p.time)).toEqual([0, 0.2, 0.4, 0.6000000000000001])
  })

  it('the block starts centred on position 0, with the length seen from the lab (Experiment 6 and 7)', () => {
    const labLength = runSimultaneityExperiment(0.5).labLength
    expect(photos[0].backPosition).toBeCloseTo(-labLength / 2, 12)
    expect(photos[0].frontPosition).toBeCloseTo(labLength / 2, 12)
  })

  it('at 0.5c each end moves 0.1 light-second to the right per 0.2 s photo, both ends by the same amount', () => {
    for (let i = 1; i < photos.length; i++) {
      expect(photos[i].backPosition - photos[i - 1].backPosition).toBeCloseTo(0.1, 12)
      expect(photos[i].frontPosition - photos[i - 1].frontPosition).toBeCloseTo(0.1, 12)
    }
  })

  it('the gap between the ends (the length in the lab) is the same in every photo, so the two lines are parallel', () => {
    const gap0 = photos[0].frontPosition - photos[0].backPosition
    for (const p of photos) expect(p.frontPosition - p.backPosition).toBeCloseTo(gap0, 12)
  })

  it('at 0c the ends do not move and the lines are vertical; the block then has its rest length', () => {
    const rest = blockSketchFor(0, 3, 0.2)
    for (const p of rest) {
      expect(p.backPosition).toBeCloseTo(-0.25, 12)
      expect(p.frontPosition).toBeCloseTo(0.25, 12)
    }
  })

  it('rejects a photo count below 1 or a time step that is not positive', () => {
    expect(() => blockSketchFor(0.5, 0, 0.2)).toThrow(RangeError)
    expect(() => blockSketchFor(0.5, 2.5, 0.2)).toThrow(RangeError)
    expect(() => blockSketchFor(0.5, 3, 0)).toThrow(RangeError)
  })
})

describe('Experiment 8 introduction sketch (the flash at several moments)', () => {
  const photos = flashSketchFor(4, 0.2)

  it('starts with both parts at the release point at time 0', () => {
    expect(photos[0]).toEqual({ time: 0, leftPosition: -0, rightPosition: 0 })
  })

  it('each part is c times the elapsed time from the release point, one to the left and one to the right', () => {
    for (const p of photos) {
      expect(p.rightPosition).toBeCloseTo(SPEED_OF_LIGHT * p.time, 12)
      expect(p.leftPosition).toBeCloseTo(-SPEED_OF_LIGHT * p.time, 12)
    }
  })

  it('at the 0.4 s photo each part is 0.4 light-second away, and the lean is 0.2 light-second per 0.2 s step', () => {
    expect(photos[2].rightPosition).toBeCloseTo(0.4, 12)
    expect(photos[2].leftPosition).toBeCloseTo(-0.4, 12)
    for (let i = 1; i < photos.length; i++) {
      expect(photos[i].rightPosition - photos[i - 1].rightPosition).toBeCloseTo(0.2, 12)
    }
  })

  it('the lean is twice the block sketch lean at 0.5c (1 light-second per second against 0.5), and does not depend on any block', () => {
    const block = blockSketchFor(0.5, 4, 0.2)
    const blockStep = block[1].frontPosition - block[0].frontPosition
    const flashStep = photos[1].rightPosition - photos[0].rightPosition
    expect(flashStep / blockStep).toBeCloseTo(2, 12)
  })

  it('rejects a photo count below 1 or a time step that is not positive', () => {
    expect(() => flashSketchFor(0, 0.2)).toThrow(RangeError)
    expect(() => flashSketchFor(3, 0)).toThrow(RangeError)
  })
})

describe('Experiment 8 audit update: guess marker, tick marks and the tutor marking', () => {
  const at = (v: number) => runSimultaneityExperiment(v)

  it('the order is back first for every moving block and "same" only at rest', () => {
    expect(actualOrderFor(at(0))).toBe('same')
    for (const v of SPEEDS) expect(actualOrderFor(at(v))).toBe('back')
  })

  it('the guess marker points at the real dots: the back dot, the front dot, or both, and never a joining line', () => {
    const d = spacetimeDiagramFor(at(0.5))
    expect(guessMarkerFor(d, 'back')).toEqual({ pointsAt: 'backDot', points: [d.backEvent] })
    expect(guessMarkerFor(d, 'front')).toEqual({ pointsAt: 'frontDot', points: [d.frontEvent] })
    expect(guessMarkerFor(d, 'same')).toEqual({ pointsAt: 'bothDots', points: [d.backEvent, d.frontEvent] })
  })

  it('the marker never changes the diagram: the same diagram comes back whatever is guessed', () => {
    const d = spacetimeDiagramFor(at(0.5))
    const copy = JSON.parse(JSON.stringify(d))
    for (const c of ['same', 'back', 'front'] as const) guessMarkerFor(d, c)
    expect(d).toEqual(copy)
  })

  it('ticks at 0.5c run from -0.3 to 0.5 across and 0 to 0.5 up, in steps of 0.1', () => {
    const t = diagramTicksFor(spacetimeDiagramFor(at(0.5)))
    expect(t.positionMin).toBeCloseTo(-0.3, 9)
    expect(t.positionMax).toBeCloseTo(0.5, 9)
    expect(t.timeMax).toBeCloseTo(0.5, 9)
    expect(t.positions).toEqual([-0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3, 0.4, 0.5])
    expect(t.times).toEqual([0, 0.1, 0.2, 0.3, 0.4, 0.5])
  })

  it('the ticks cover every point of the diagram at every speed, include the origin, and rise in equal steps', () => {
    for (const v of [0, ...SPEEDS]) {
      const d = spacetimeDiagramFor(at(v))
      const t = diagramTicksFor(d)
      const points = [...d.backWorldline, ...d.frontWorldline, ...d.leftLightWorldline, ...d.rightLightWorldline]
      for (const p of points) {
        expect(p.position).toBeGreaterThanOrEqual(t.positionMin - 1e-9)
        expect(p.position).toBeLessThanOrEqual(t.positionMax + 1e-9)
        expect(p.time).toBeLessThanOrEqual(t.timeMax + 1e-9)
      }
      expect(t.positions).toContain(0)
      expect(t.times[0]).toBe(0)
      for (let i = 1; i < t.positions.length; i++) expect(t.positions[i] - t.positions[i - 1]).toBeCloseTo(0.1, 9)
    }
  })

  it('ticks for several diagrams cover all of them: the block at rest (to -0.25) and the fastest run (to 1.09)', () => {
    const t = diagramTicksFor([spacetimeDiagramFor(at(0)), spacetimeDiagramFor(at(0.9))])
    expect(t.positionMin).toBeCloseTo(-0.3, 9)
    expect(t.positionMax).toBeCloseTo(1.1, 9)
    expect(t.timeMax).toBeCloseTo(1.1, 9)
  })

  it('ticks reject a step that is not positive', () => {
    expect(() => diagramTicksFor(spacetimeDiagramFor(at(0.5)), 0)).toThrow(RangeError)
  })

  it('the tutor marking carries the chosen order, the real order and the module\'s times', () => {
    const r = at(0.5)
    const m = markOrderGuess('front', r)
    expect(m.chosen).toBe('front')
    expect(m.actual).toBe('back')
    expect(m.backTime).toBeCloseTo(0.1443, 4)
    expect(m.frontTime).toBeCloseTo(0.4330, 4)
    expect(m.gap).toBeCloseTo(0.2887, 4)
    expect(markOrderGuess('same', at(0)).actual).toBe('same')
    expect(markOrderGuess('same', at(0)).gap).toBe(0)
  })
})

describe('Experiment 9 audit update: lean, extended line, level line, marker and sketch', () => {
  const at = (v: number) => runSimultaneityExperiment(v)
  const PRESETS = [0.1, 0.3, 0.5, 0.8, 0.9]

  it('the lean of the line through the two events equals the block\'s speed, and is 0 at rest', () => {
    for (const v of PRESETS) expect(sameMomentLeanFor(spacetimeDiagramFor(at(v)))).toBeCloseTo(v, 9)
    expect(sameMomentLeanFor(spacetimeDiagramFor(at(0)))).toBe(0)
  })

  it('at 0.5c the line rises 0.289 s over 0.577 light-second across, a lean of 0.500', () => {
    const d = spacetimeDiagramFor(at(0.5))
    const [a, b] = sameMomentLineFor(d)
    expect(b.time - a.time).toBeCloseTo(0.2887, 4)
    expect(b.position - a.position).toBeCloseTo(0.5774, 4)
    expect(sameMomentLeanFor(d)).toBeCloseTo(0.5, 9)
  })

  it('the shape is flat only at rest', () => {
    expect(actualShapeFor(at(0))).toBe('flat')
    for (const v of PRESETS) expect(actualShapeFor(at(v))).toBe('tilted')
  })

  it('the extended line passes through both real events and stays inside the drawn area at every speed', () => {
    for (const v of [0, 0.01, ...PRESETS]) {
      const d = spacetimeDiagramFor(at(v))
      const ticks = diagramTicksFor([spacetimeDiagramFor(at(0)), spacetimeDiagramFor(at(0.9))])
      const [from, to] = sameMomentLineExtended(d, ticks.positionMin, ticks.positionMax, ticks.timeMax)
      const lean = sameMomentLeanFor(d)
      for (const e of [d.backEvent, d.frontEvent]) {
        expect(from.time + lean * (e.position - from.position)).toBeCloseTo(e.time, 9)
        expect(e.position).toBeGreaterThanOrEqual(from.position - 1e-9)
        expect(e.position).toBeLessThanOrEqual(to.position + 1e-9)
      }
      for (const p of [from, to]) {
        expect(p.position).toBeGreaterThanOrEqual(ticks.positionMin - 1e-9)
        expect(p.position).toBeLessThanOrEqual(ticks.positionMax + 1e-9)
        expect(p.time).toBeGreaterThanOrEqual(-1e-9)
        expect(p.time).toBeLessThanOrEqual(ticks.timeMax + 1e-9)
      }
    }
  })

  it('the lab\'s level line is level, passes through the lower event and spans the picture', () => {
    const d = spacetimeDiagramFor(at(0.5))
    const [a, b] = levelReferenceLineFor(d, -0.3, 0.5)
    expect(a.time).toBe(b.time)
    expect(a.time).toBeCloseTo(d.backEvent.time, 12)
    expect(a.position).toBe(-0.3)
    expect(b.position).toBe(0.5)
  })

  it('at rest the extended line lies on the level line', () => {
    const d = spacetimeDiagramFor(at(0))
    const [from, to] = sameMomentLineExtended(d, -0.3, 0.3, 0.3)
    const [la, lb] = levelReferenceLineFor(d, -0.3, 0.3)
    expect(from.time).toBeCloseTo(la.time, 12)
    expect(to.time).toBeCloseTo(lb.time, 12)
  })

  it('the guess marker is a level bar for "flat" and a bar at the example lean for "tilted", and the example is never a real lean', () => {
    expect(shapeMarkerFor('flat')).toEqual({ kind: 'level', lean: 0 })
    expect(shapeMarkerFor('tilted')).toEqual({ kind: 'leaning', lean: EXAMPLE_LEAN })
    for (const v of [0, ...PRESETS]) expect(Math.abs(sameMomentLeanFor(spacetimeDiagramFor(at(v))) - EXAMPLE_LEAN)).toBeGreaterThan(0.01)
  })

  it('the tutor marking carries the chosen shape, the real shape and the module\'s lean', () => {
    const m = markShapeGuess('flat', at(0.5))
    expect(m).toEqual({ chosen: 'flat', actual: 'tilted', lean: expect.closeTo(0.5, 9) })
    expect(markShapeGuess('flat', at(0)).actual).toBe('flat')
    expect(markShapeGuess('flat', at(0)).lean).toBe(0)
  })

  it('the sketch has a level line (lean 0) and a leaning line (lean 0.25) between the same two positions', () => {
    const s = levelLineSketchFor()
    expect(s.level.lean).toBe(0)
    expect(s.leaning.lean).toBeCloseTo(0.25, 12)
    expect(s.level.points[0].position).toBe(s.leaning.points[0].position)
    expect(s.level.points[1].position).toBe(s.leaning.points[1].position)
  })
})
