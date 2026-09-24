import { describe, it, expect } from 'vitest'
import { spacetimeDiagramFor, sameMomentLineFor, rodTimeAxisFor, rodSpaceAxisFor } from './spacetimeDiagramView'
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
